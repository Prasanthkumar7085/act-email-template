"use client";

export class DocxStyleParser {
  private data: Uint8Array;
  private ole2Parser: OLE2Parser;
  private wordDocument: Uint8Array;
  private tableStream: Uint8Array | null = null;
  private dataStream: Uint8Array | null = null;
  private images: { [key: string]: string } = {};
  private fontTable: Map<number, string> = new Map();
  private styleSheet: Map<number, any> = new Map();
  private relationships: { [key: string]: string } = {};

  constructor(data: Uint8Array) {
    this.data = data;
    this.ole2Parser = new OLE2Parser(data);
    this.wordDocument = new Uint8Array();
  }

  public async parseDocument(): Promise<any> {
    try {
      const header = this.ole2Parser.parseHeader();
      this.ole2Parser.readSectors();
      const fat = this.ole2Parser.parseFAT(header);
      const directory = this.ole2Parser.parseDirectory(header, fat);

      await this.extractStreams(directory, fat);

      const fib = this.parseFIB();
      const text = this.extractAndDecodeText(fib);

      const characterRuns = this.parseCharacterRuns(fib);
      const paragraphs = this.parseParagraphs(fib);
      const listData = this.parseListStructure(fib);
      const tables = this.parseTables(fib);

      const blocks = this.buildEditorJSBlocks(
        text,
        characterRuns,
        paragraphs,
        listData,
        tables,
        fib
      );

      const processedBlocks = this.processLists(blocks);
      const blocksWithImages = this.appendImageBlocks(processedBlocks);
      const finalBlocks = this.mergeTableRows(blocksWithImages);

      return {
        headers: [],
        main: finalBlocks,
        footers: [],
        metadata: {
          streams: directory.map((entry) => ({
            name: entry.name,
            size: entry.size,
          })),
          fibInfo: fib,
          images: Object.keys(this.images).length,
        },
      };
    } catch (error) {
      console.error("Error parsing DOC file:", error);
      throw error;
    }
  }

  private async extractStreams(
    directory: DirectoryEntry[],
    fat: number[]
  ): Promise<void> {
    const wordDocEntry = directory.find(
      (entry) => entry.name.toLowerCase() === "worddocument"
    );
    if (!wordDocEntry) throw new Error("WordDocument stream not found");
    this.wordDocument = this.ole2Parser.readStream(wordDocEntry, fat);

    const tableEntry = directory.find(
      (entry) =>
        entry.name.toLowerCase() === "0table" ||
        entry.name.toLowerCase() === "1table"
    );
    if (tableEntry) {
      this.tableStream = this.ole2Parser.readStream(tableEntry, fat);
    }

    const dataEntry = directory.find(
      (entry) => entry.name.toLowerCase() === "data"
    );
    if (dataEntry) {
      this.dataStream = this.ole2Parser.readStream(dataEntry, fat);
    }

    await this.extractImages(directory, fat);
    this.parseFontTable(directory, fat);
    this.parseStyleSheet(directory, fat);
  }

  private parseFIB(): FIBExtended {
    const fib: FIBExtended = {
      wIdent: this.readUInt16LE(0),
      nFib: this.readUInt16LE(2),
      fcMin: this.readUInt32LE(24),
      fcMac: this.readUInt32LE(28),
      fcClx: this.readUInt32LE(110),
      lcbClx: this.readUInt32LE(114),
      fcPlcfBteChpx: this.readUInt32LE(114),
      lcbPlcfBteChpx: this.readUInt32LE(118),
      fcPlcfBtePapx: this.readUInt32LE(122),
      lcbPlcfBtePapx: this.readUInt32LE(126),
      fcPlcfBteLvc: this.readUInt32LE(130) || 0,
      lcbPlcfBteLvc: this.readUInt32LE(134) || 0,
      fcPlcfLst: this.readUInt32LE(200),
      lcbPlcfLst: this.readUInt32LE(204),
      fcPlfLfo: this.readUInt32LE(208),
      lcbPlfLfo: this.readUInt32LE(212),
      fcPlcfSed: this.readUInt32LE(216),
      lcbPlcfSed: this.readUInt32LE(220),
      flags: this.readUInt16LE(10),
    };

    return fib;
  }

  private extractAndDecodeText(fib: FIBExtended): string {
    const textStart = fib.fcMin;
    const textEnd = fib.fcMac;

    if (textEnd <= textStart || textStart >= this.wordDocument.length) {
      return "";
    }

    const textData = this.wordDocument.slice(
      textStart,
      Math.min(textEnd, this.wordDocument.length)
    );

    let text = "";
    for (let i = 0; i < textData.length; i++) {
      const byte = textData[i];

      if (byte === 0x00) continue;
      if (byte === 0x0d) text += "\n";
      else if (byte === 0x0c) continue;
      else if (byte === 0x07) text += "\x07";
      else if (byte === 0x14) text += "\x14";
      else if (byte === 0x13 || byte === 0x15) continue;
      else if ((byte >= 32 && byte <= 126) || byte >= 128) {
        text += String.fromCharCode(byte);
      }
    }

    return text;
  }

  private parseCharacterRuns(fib: FIBExtended): Map<number, CharacterRun> {
    const runs = new Map<number, CharacterRun>();

    if (!this.tableStream || fib.lcbPlcfBteChpx === 0) {
      return runs;
    }

    try {
      const offset = fib.fcPlcfBteChpx;
      const length = fib.lcbPlcfBteChpx;

      if (offset + length > this.tableStream.length) {
        return runs;
      }

      const chpxTable = this.tableStream.slice(offset, offset + length);
      let pos = 0;
      const cps: number[] = [];

      while (pos + 4 <= chpxTable.length) {
        const cp = this.readUInt32LEFromBuffer(chpxTable, pos);
        cps.push(cp);
        pos += 4;
      }

      pos = (cps.length + 1) * 4;

      for (let i = 0; i < cps.length; i++) {
        if (pos + 2 > chpxTable.length) break;

        const chpxOffset = this.readUInt16LEFromBuffer(chpxTable, pos);
        pos += 2;

        let grpChpx = new Uint8Array();
        if (this.tableStream && chpxOffset < this.tableStream.length) {
          const grpSize = this.tableStream[chpxOffset] || 0;
          grpChpx = this.tableStream.slice(
            chpxOffset + 1,
            Math.min(chpxOffset + 1 + grpSize, this.tableStream.length)
          );
        }

        const formatting = this.parseChpxData(grpChpx);
        runs.set(cps[i], formatting);
      }
    } catch (error) {
      console.warn("Error parsing character runs:", error);
    }

    return runs;
  }

  private parseChpxData(data: Uint8Array): CharacterRun {
    const run: CharacterRun = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      superscript: false,
      subscript: false,
      color: "#000000",
      highlight: null,
      fontSize: 12,
      fontName: "Arial",
      fontIndex: 0,
      allCaps: false,
      smallCaps: false,
      isHyperlink: false,
    };

    if (data.length < 2) return run;

    try {
      let pos = 0;

      while (pos < data.length) {
        const sprm = data[pos];
        const isLong = (sprm & 0x80) !== 0;
        const operandSize = isLong ? 2 : 1;

        if (pos + operandSize >= data.length) break;

        const operand = isLong
          ? this.readUInt16LEFromBuffer(data, pos + 1)
          : data[pos + 1];

        switch (sprm & 0x7f) {
          case 0x00:
            run.bold = operand !== 0;
            break;
          case 0x01:
            run.italic = operand !== 0;
            break;
          case 0x02:
            run.underline = operand !== 0;
            break;
          case 0x03:
            run.strikethrough = operand !== 0;
            break;
          case 0x04:
            run.fontSize = operand / 2;
            break;
          case 0x05:
            run.color = this.getColorFromIndex(operand);
            break;
          case 0x06:
            run.fontIndex = operand;
            run.fontName = this.fontTable.get(operand) || "Arial";
            break;
          case 0x07:
            run.highlight = this.getHighlightColor(operand);
            break;
          case 0x08:
            if (operand === 1) run.superscript = true;
            if (operand === 2) run.subscript = true;
            break;
          case 0x09:
            run.allCaps = operand !== 0;
            break;
          case 0x0a:
            run.smallCaps = operand !== 0;
            break;
        }

        pos += 1 + operandSize;
      }
    } catch (error) {
      console.warn("Error in parseChpxData:", error);
    }

    return run;
  }

  private parseParagraphs(fib: FIBExtended): Map<number, ParagraphInfo> {
    const paragraphs = new Map<number, ParagraphInfo>();

    if (!this.tableStream || fib.lcbPlcfBtePapx === 0) {
      return paragraphs;
    }

    try {
      const offset = fib.fcPlcfBtePapx;
      const length = fib.lcbPlcfBtePapx;

      if (offset + length > this.tableStream.length) {
        return paragraphs;
      }

      const papxTable = this.tableStream.slice(offset, offset + length);
      let pos = 0;
      const cps: number[] = [];

      while (pos + 4 <= papxTable.length) {
        const cp = this.readUInt32LEFromBuffer(papxTable, pos);
        cps.push(cp);
        pos += 4;
      }

      pos = (cps.length + 1) * 4;

      for (let i = 0; i < cps.length; i++) {
        if (pos + 2 > papxTable.length) break;

        const papxOffset = this.readUInt16LEFromBuffer(papxTable, pos);
        pos += 2;

        let grpPapx = new Uint8Array();
        if (this.tableStream && papxOffset < this.tableStream.length) {
          const grpSize = this.tableStream[papxOffset] || 0;
          grpPapx = this.tableStream.slice(
            papxOffset + 1,
            Math.min(papxOffset + 1 + grpSize, this.tableStream.length)
          );
        }

        const formatting = this.parsePapxData(grpPapx);
        paragraphs.set(cps[i], formatting);
      }
    } catch (error) {
      console.warn("Error parsing paragraphs:", error);
    }

    return paragraphs;
  }

  private parsePapxData(data: Uint8Array): ParagraphInfo {
    const para: ParagraphInfo = {
      alignment: "left",
      leftIndent: 0,
      rightIndent: 0,
      firstLineIndent: 0,
      spaceBefore: 0,
      spaceAfter: 0,
      lineSpacing: 1.5,
      styleId: 0,
      listId: 0,
      listLevel: 0,
      outlineLevel: 0,
      isTableRow: false,
      isHeader: false,
      backgroundColor: null,
      borders: null,
    };

    if (data.length < 4) return para;

    try {
      let pos = 0;

      while (pos < data.length) {
        const sprm = data[pos];
        const isLong = (sprm & 0x80) !== 0;
        const operandSize = isLong ? 2 : 1;

        if (pos + operandSize >= data.length) break;

        const operand = isLong
          ? this.readUInt16LEFromBuffer(data, pos + 1)
          : data[pos + 1];

        switch (sprm & 0x7f) {
          case 0x10:
            para.alignment =
              ["left", "center", "right", "justify"][operand & 0x03] || "left";
            break;
          case 0x11:
            para.leftIndent = operand;
            break;
          case 0x12:
            para.rightIndent = operand;
            break;
          case 0x13:
            para.firstLineIndent = operand;
            break;
          case 0x14:
            para.spaceBefore = operand;
            break;
          case 0x15:
            para.spaceAfter = operand;
            break;
          case 0x16:
            para.lineSpacing = operand > 0 ? operand / 20 : 1.5;
            break;
          case 0x17:
            para.styleId = operand;
            para.isHeader = operand >= 1 && operand <= 9;
            break;
          case 0x18:
            para.listId = operand;
            break;
          case 0x19:
            para.listLevel = operand & 0x0f;
            break;
          case 0x1a:
            para.backgroundColor = this.getColorFromIndex(operand);
            break;
          case 0x1b:
            para.isTableRow = operand !== 0;
            break;
          case 0x1c:
            para.outlineLevel = operand;
            break;
        }

        pos += 1 + operandSize;
      }
    } catch (error) {
      console.warn("Error in parsePapxData:", error);
    }

    return para;
  }

  private parseListStructure(fib: FIBExtended): Map<number, ListInfo> {
    const lists = new Map<number, ListInfo>();

    if (!this.tableStream || fib.lcbPlcfLst === 0) {
      return lists;
    }

    try {
      const offset = fib.fcPlcfLst;
      const length = fib.lcbPlcfLst;

      if (offset + length > this.tableStream.length) {
        return lists;
      }

      const listTable = this.tableStream.slice(offset, offset + length);
      let pos = 0;

      while (pos + 28 <= listTable.length) {
        const listId = this.readUInt32LEFromBuffer(listTable, pos);
        const flags = this.readUInt32LEFromBuffer(listTable, pos + 4);

        const listInfo: ListInfo = {
          listId: listId,
          isOrdered: (flags & 0x01) !== 0,
          levels: [],
        };

        for (let level = 0; level < 9; level++) {
          const levelOffset = pos + 8 + level * 20;
          if (levelOffset + 20 <= listTable.length) {
            const levelFlags = this.readUInt32LEFromBuffer(
              listTable,
              levelOffset
            );
            const numberFormat = this.readUInt8FromBuffer(
              listTable,
              levelOffset + 4
            );

            listInfo.levels.push({
              level: level,
              start: this.readUInt32LEFromBuffer(listTable, levelOffset + 8),
              alignment: (levelFlags & 0x01) !== 0 ? "left" : "left",
              numberFormat: numberFormat,
              text: this.readStringFromBuffer(listTable, levelOffset + 12, 8),
            });
          }
        }

        lists.set(listId, listInfo);
        pos += 28;
      }
    } catch (error) {
      console.warn("Error parsing list structure:", error);
    }

    return lists;
  }

  private parseTables(fib: FIBExtended): TableInfo[] {

    const tables: TableInfo[] = [];

    // Try SED table first
    if (this.tableStream && fib.lcbPlcfSed > 0) {
      try {
        const offset = fib.fcPlcfSed;
        const length = fib.lcbPlcfSed;
        const sedTable = this.tableStream.slice(offset, offset + length);
        let pos = 0;

        while (pos + 12 <= sedTable.length) {
          const start = this.readUInt32LEFromBuffer(sedTable, pos);
          const end = this.readUInt32LEFromBuffer(sedTable, pos + 4);
          if (start < end) {
            tables.push({
              start: start,
              end: end,
              rows: 1,
              cols: 1,
              type: "table",
            });
          }
          pos += 12;
        }
      } catch (error) {
        console.warn("SED table parse error:", error);
      }
    }

    // Fallback to advanced text detection with proper row splitting
    if (tables.length === 0) {
      tables.push(...this.detectMultiRowTablesFromText(fib));
    }

    return tables;
  }
  private detectMultiRowTablesFromText(fib: FIBExtended): TableInfo[] {
    const text = this.extractAndDecodeText(fib);
    const lines = text.split("\n");
    const tables: TableInfo[] = [];
    let currentTable: {
      start: number;
      rows: string[][];
      charPos: number;
    } | null = null;
    let charPos = 0;

    for (const line of lines) {
      const rawLine = line;
      const trimmedLine = rawLine.trim();
      const hasTableMarker = rawLine.includes("\x07");

      if (hasTableMarker || (currentTable && trimmedLine.length > 0)) {
        if (!currentTable) {
          currentTable = {
            start: charPos,
            rows: [],
            charPos: charPos,
          };
        }

        // Split by table cell markers and filter out empty cells
        const cells = rawLine
          .split("\x07")
          .map((cell) => this.stripControlChars(cell.trim(), false))
          .filter((cell) => cell.length > 0);

        if (cells.length > 0) {
          currentTable.rows.push(cells);
        }
      } else if (currentTable) {
        // End of table when no more table markers and non-empty line
        const tableInfo: TableInfo = {
          start: currentTable.start,
          end: charPos,
          rows: currentTable.rows.length,
          cols: Math.max(...currentTable.rows.map((row) => row.length), 1),
          type: "table",
        };
        tables.push(tableInfo);
        currentTable = null;
      }

      charPos += rawLine.length + 1;
    }

    // Handle table at end of file
    if (currentTable && currentTable.rows.length > 0) {
      tables.push({
        start: currentTable.start,
        end: charPos,
        rows: currentTable.rows.length,
        cols: Math.max(...currentTable.rows.map((row) => row.length), 1),
        type: "table",
      });
    }

    return tables;
  }

  private buildEditorJSBlocks(
    text: string,
    characterRuns: Map<number, CharacterRun>,
    paragraphs: Map<number, ParagraphInfo>,
    listData: Map<number, ListInfo>,
    tables: TableInfo[],
    fib: FIBExtended
  ): any[] {
    const blocks: any[] = [];
    const lines = text.split("\n");
    let charPos = 0;
    let currentList: {
      style: string;
      items: EditorJSListItem[];
      level: number;
    } | null = null;

    const flushList = () => {
      if (currentList && currentList.items.length > 0) {
        blocks.push({
          type: "list",
          data: {
            style: currentList.style,
            items: currentList.items,
          },
        });
      }
      currentList = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const paraInfo =
        this.findClosestParagraph(paragraphs, charPos) ||
        this.getDefaultParagraphInfo();
      const charRun =
        this.findClosestCharRun(characterRuns, charPos) ||
        this.getDefaultCharacterRun();

      let line = this.normalizeHyperlinks(rawLine);
      line = this.stripWordFields(line);
      line = this.stripControlChars(line, true).trim();

      // 🔥 NEW: Multi-line table detection in build phase
      if (this.isTableLine(rawLine)) {
        flushList();
        const tableBlock = this.processTableBlock(
          rawLine,
          charRun,
          lines,
          i,
          charPos
        );
        if (tableBlock) {
          blocks.push(tableBlock);
          // Skip processed lines
          i += tableBlock.data.content.length - 1;
        }
        charPos += rawLine.length + 1;
        continue;
      }

      if (line === "") {
        flushList();
        charPos += rawLine.length + 1;
        continue;
      }

      let formattedText = this.linkifyOutsideAnchors(line);
      formattedText = this.applyTextFormatting(formattedText, charRun);

      const headerLevel = this.detectHeaderLevel(line, paraInfo);
      if (headerLevel > 0) {
        flushList();
        blocks.push({
          type: "header",
          data: {
            text: formattedText,
            level: headerLevel,
          },
        });
        charPos += rawLine.length + 1;
        continue;
      }

      if (paraInfo.listId > 0) {
        const listInfo = listData.get(paraInfo.listId);
        const style = listInfo?.isOrdered ? "ordered" : "unordered";
        const level = paraInfo.listLevel || 0;

        if (!currentList || currentList.style !== style) {
          flushList();
          currentList = {
            style: style,
            items: [],
            level: level,
          };
        }

        this.createListItem(formattedText, level, currentList.items);
        charPos += rawLine.length + 1;
        continue;
      }

      flushList();
      const block: any = {
        type: "paragraph",
        data: {
          text: formattedText,
        },
      };

      const tunes: any = {};
      if (paraInfo.alignment !== "left") {
        tunes.alignment = { alignment: paraInfo.alignment };
      }
      if (paraInfo.leftIndent > 0) {
        tunes.indent = paraInfo.leftIndent / 1440;
      }
      if (paraInfo.backgroundColor) {
        tunes.backgroundColor = paraInfo.backgroundColor;
      }
      if (paraInfo.spaceBefore > 0) {
        tunes.marginTop = paraInfo.spaceBefore / 20;
      }
      if (paraInfo.spaceAfter > 0) {
        tunes.marginBottom = paraInfo.spaceAfter / 20;
      }
      if (Object.keys(tunes).length > 0) {
        block.tunes = tunes;
      }

      blocks.push(block);
      charPos += rawLine.length + 1;
    }

    flushList();
    return blocks;
  }

  // 🔥 NEW: Check if line starts a table
  private isTableLine(line: string): boolean {
    return (
      line.includes("\x07") &&
      line.split("\x07").filter((c) => c.trim()).length > 1
    );
  }

  private processTableBlock(
    firstLine: string,
    charRun: CharacterRun,
    allLines: string[],
    startIndex: number,
    startCharPos: number
  ): any {
    const tableRows: string[][] = [];
    let rowIndex = startIndex;

    // Collect all table rows until no more table markers
    while (rowIndex < allLines.length) {
      const line = allLines[rowIndex].trim();
      if (!line.includes("\x07") && tableRows.length > 0) break;

      const cells = line
        .split("\x07")
        .map((cell) => this.stripControlChars(cell.trim(), false))
        .filter((cell) => cell.length > 0)
        .map((cell) => {
          const formattedCell = this.linkifyOutsideAnchors(cell);
          return this.applyTextFormatting(formattedCell, charRun);
        });

      if (cells.length > 0) {
        tableRows.push(cells);
      }
      rowIndex++;
    }

    if (tableRows.length === 0) return null;

    // Determine max columns and pad rows
    const maxCols = Math.max(...tableRows.map((row) => row.length));
    const paddedRows = tableRows.map((row) =>
      row.length < maxCols
        ? [...row, ...Array(maxCols - row.length).fill("")]
        : row
    );

    // Detect header (first row with all uppercase or specific keywords)
    const isHeaderRow = (row: string[]) =>
      row.every((cell) => cell.toUpperCase() === cell) ||
      ["REV", "DATE", "BY", "WHAT"].some((keyword) =>
        row[0].toUpperCase().includes(keyword)
      );

    const headerRows = isHeaderRow(paddedRows[0]) ? [0] : [];

    // 🔥 EXACT MATCH TO YOUR EXAMPLE FORMAT with corrected rows
    return {
      id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "table",
      data: {
        id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: paddedRows,
        withHeading: headerRows.length > 0,
        styles: {
          table: {
            width: "100%",
            height: "auto",
            backgroundColor: "#ffffff",
            borderColor: "#d1d5db",
            borderWidth: "1px",
            borderStyle: "solid",
            position: "relative",
            tableLayout: "fixed",
          },
          rows: {},
          cells: this.generateCellStyles(paddedRows.length, maxCols),
        },
        headerRows: headerRows,
      },
    };
  }

  private generateCellStyles(rows: number, cols: number): any {
    const cells: any = {};
    for (let row = 0; row < rows; row++) {
      cells[row] = {};
      for (let col = 0; col < cols; col++) {
        cells[row][col] = {
          borderColor: "rgb(209, 213, 219)",
          borderWidth: "1px",
          borderStyle: "solid",
        };
      }
    }
    return cells;
  }

  private createListItem(
    content: string,
    level: number,
    items: EditorJSListItem[]
  ): EditorJSListItem {
    const newItem: EditorJSListItem = { content };

    if (level === 0) {
      items.push(newItem);
      return newItem;
    }

    let currentItems = items;
    for (let i = 0; i < level - 1; i++) {
      if (currentItems.length === 0) {
        const parentItem: EditorJSListItem = { content: "", items: [] };
        currentItems.push(parentItem);
        currentItems = parentItem.items!;
      } else {
        const lastItem = currentItems[currentItems.length - 1];
        if (!lastItem.items) {
          lastItem.items = [];
        }
        currentItems = lastItem.items;
      }
    }

    currentItems.push(newItem);
    return newItem;
  }

  // 🔥 UPDATED: No longer needed - tables are complete blocks now
  private mergeTableRows(blocks: any[]): any[] {
    return blocks; // Tables are already complete!
  }

  private applyTextFormatting(text: string, run: CharacterRun): string {
    if (!text || text.trim() === "") return text;

    const styles: string[] = [];
    const classes: string[] = [];

    if (run.bold) classes.push("bold");
    if (run.italic) classes.push("italic");
    if (run.underline) classes.push("underline");
    if (run.strikethrough) classes.push("strikethrough");

    if (run.superscript) styles.push("vertical-align: super; font-size: 0.8em");
    if (run.subscript) styles.push("vertical-align: sub; font-size: 0.8em");
    if (run.color && run.color !== "#000000")
      styles.push(`color: ${run.color}`);
    if (run.fontSize && run.fontSize !== 12)
      styles.push(`font-size: ${run.fontSize}pt`);
    if (run.fontName && run.fontName !== "Arial")
      styles.push(`font-family: "${run.fontName}"`);
    if (run.highlight) styles.push(`background-color: ${run.highlight}`);
    if (run.allCaps) styles.push("text-transform: uppercase");
    if (run.smallCaps) styles.push("font-variant: small-caps");

    const hasHtml = /<[^>]+>/.test(text);
    let formattedText = hasHtml ? text : this.escapeHtml(text);

    if (classes.length > 0) {
      formattedText = `<span class="${classes.join(" ")}">${formattedText}</span>`;
    }

    if (styles.length > 0) {
      formattedText = `<span style="${styles.join("; ")}">${formattedText}</span>`;
    }

    return formattedText;
  }

  private detectHeaderLevel(text: string, para: ParagraphInfo): number {
    if (para.isHeader && para.styleId >= 1 && para.styleId <= 9) {
      return Math.min(6, para.styleId);
    }

    if (text.length < 150) {
      const trimmed = text.trim();

      if (trimmed === trimmed.toUpperCase() && trimmed.length < 60) {
        return trimmed.length < 30 ? 1 : 2;
      }

      if (
        trimmed.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/) &&
        trimmed.length < 80
      ) {
        return 3;
      }

      if (trimmed.match(/^(?:[IVXLCDM]+|\d+)\.?\s+[A-Z]/)) {
        return 3;
      }
    }

    return 0;
  }

  private processLists(blocks: any[]): any[] {
    const processed: any[] = [];
    let currentList: any = null;

    for (const block of blocks) {
      if (block.type === "list") {
        if (!currentList || currentList.data.style !== block.data.style) {
          if (currentList) processed.push(currentList);
          currentList = block;
        } else {
          currentList.data.items = [
            ...currentList.data.items,
            ...block.data.items,
          ];
        }
      } else {
        if (currentList) {
          processed.push(currentList);
          currentList = null;
        }
        processed.push(block);
      }
    }

    if (currentList) {
      processed.push(currentList);
    }

    return processed;
  }

  // ... [ALL OTHER METHODS REMAIN THE SAME - getDefaultParagraphInfo, escapeHtml, etc.] ...

  private getDefaultParagraphInfo(): ParagraphInfo {
    return {
      alignment: "left",
      leftIndent: 0,
      rightIndent: 0,
      firstLineIndent: 0,
      spaceBefore: 0,
      spaceAfter: 0,
      lineSpacing: 1.5,
      styleId: 0,
      listId: 0,
      listLevel: 0,
      outlineLevel: 0,
      isTableRow: false,
      isHeader: false,
      backgroundColor: null,
      borders: null,
    };
  }

  private getDefaultCharacterRun(): CharacterRun {
    return {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      superscript: false,
      subscript: false,
      color: "#000000",
      highlight: null,
      fontSize: 12,
      fontName: "Arial",
      fontIndex: 0,
      allCaps: false,
      smallCaps: false,
      isHyperlink: false,
    };
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private findClosestParagraph(
    paragraphs: Map<number, ParagraphInfo>,
    cp: number
  ): ParagraphInfo | null {
    let closest: ParagraphInfo | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    for (const [key, value] of paragraphs) {
      const dist = Math.abs(key - cp);
      if (dist < closestDist) {
        closestDist = dist;
        closest = value;
      }
    }

    return closest;
  }

  private findClosestCharRun(
    runs: Map<number, CharacterRun>,
    cp: number
  ): CharacterRun | null {
    let closest: CharacterRun | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    for (const [key, value] of runs) {
      const dist = Math.abs(key - cp);
      if (dist < closestDist) {
        closestDist = dist;
        closest = value;
      }
    }

    return closest;
  }

  private getColorFromIndex(colorIndex: number): string {
    const colors = [
      "#000000",
      "#FFFFFF",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#800000",
      "#008000",
      "#000080",
      "#808000",
      "#800080",
      "#008080",
      "#C0C0C0",
      "#808080",
    ];
    return colors[colorIndex % colors.length] || "#000000";
  }

  private getHighlightColor(colorIndex: number): string | null {
    const highlights = [
      null,
      "#FFFF00",
      "#00FF00",
      "#00FFFF",
      "#FF00FF",
      "#0000FF",
      "#FF0000",
      "#000000",
      "#FFFFFF",
    ];
    return highlights[colorIndex % highlights.length] || null;
  }

  private async extractImages(
    directory: DirectoryEntry[],
    fat: number[]
  ): Promise<void> {
    for (const entry of directory) {
      if (
        entry.name.startsWith("ObjectPool") ||
        entry.name.includes("Image") ||
        entry.name.includes("Picture") ||
        entry.name.toLowerCase().includes("ole")
      ) {
        try {
          const imageData = this.ole2Parser.readStream(entry, fat);
          if (imageData.length > 100) {
            const base64Data = this.arrayBufferToBase64(imageData);
            const imageType = this.detectImageType(imageData);
            this.images[entry.name] =
              `data:image/${imageType};base64,${base64Data}`;
          }
        } catch (error) {
          console.warn(`Failed to extract image ${entry.name}:`, error);
        }
      }
    }
  }

  private detectImageType(data: Uint8Array): string {
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpeg";
    if (
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47
    )
      return "png";
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return "gif";
    if (data[0] === 0x42 && data[1] === 0x4d) return "bmp";
    return "png";
  }

  private parseFontTable(directory: DirectoryEntry[], fat: number[]): void {
    const fontEntry = directory.find(
      (entry) => entry.name.toLowerCase() === "fonttable"
    );
    if (!fontEntry) return;

    try {
      const fontData = this.ole2Parser.readStream(fontEntry, fat);
      let offset = 6;
      let fontIndex = 0;

      while (offset < fontData.length && fontIndex < 100) {
        if (fontData[offset] > 0) {
          const nameLength = fontData[offset];
          let fontName = "";
          for (let i = 1; i < nameLength && offset + i < fontData.length; i++) {
            const byte = fontData[offset + i];
            if (byte >= 32 && byte <= 126) {
              fontName += String.fromCharCode(byte);
            }
          }
          if (fontName) {
            this.fontTable.set(fontIndex, fontName);
          }
          offset += nameLength + 1;
          fontIndex++;
        } else {
          offset++;
        }
      }
    } catch (error) {
      console.warn("Error parsing font table:", error);
    }
  }

  private parseStyleSheet(directory: DirectoryEntry[], fat: number[]): void {
    const stylesEntry = directory.find(
      (entry) => entry.name.toLowerCase() === "styles"
    );
    if (!stylesEntry) return;

    try {
      const stylesData = this.ole2Parser.readStream(stylesEntry, fat);
      let offset = 0;
      while (offset < stylesData.length - 10) {
        const styleId = this.readUInt16LEFromBuffer(stylesData, offset);
        if (styleId > 0 && styleId < 1000) {
          this.styleSheet.set(styleId, {
            name: `Style${styleId}`,
            basedOn: 0,
            next: 0,
            type: styleId <= 9 ? "paragraph" : "character",
          });
        }
        offset += 20;
      }
    } catch (error) {
      console.warn("Error parsing style sheet:", error);
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private readUInt16LE(offset: number): number {
    if (offset + 1 >= this.wordDocument.length) return 0;
    return this.wordDocument[offset] | (this.wordDocument[offset + 1] << 8);
  }

  private readUInt32LE(offset: number): number {
    if (offset + 3 >= this.wordDocument.length) return 0;
    return (
      this.wordDocument[offset] |
      (this.wordDocument[offset + 1] << 8) |
      (this.wordDocument[offset + 2] << 16) |
      (this.wordDocument[offset + 3] << 24)
    );
  }

  private readUInt16LEFromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset + 1 >= buffer.length) return 0;
    return buffer[offset] | (buffer[offset + 1] << 8);
  }

  private readInt16LEFromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset + 1 >= buffer.length) return 0;
    const value = buffer[offset] | (buffer[offset + 1] << 8);
    return value > 32767 ? value - 65536 : value;
  }

  private readUInt32LEFromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset + 3 >= buffer.length) return 0;
    return (
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24)
    );
  }

  private readUInt8FromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset >= buffer.length) return 0;
    return buffer[offset];
  }

  private readStringFromBuffer(
    buffer: Uint8Array,
    offset: number,
    length: number
  ): string {
    if (!buffer || offset + length > buffer.length) return "";
    let result = "";
    for (let i = 0; i < length; i++) {
      const char = buffer[offset + i];
      if (char === 0) break;
      result += String.fromCharCode(char);
    }
    return result;
  }

  private normalizeHyperlinks(line: string): string {
    if (!line) return line;

    let s = line.replace(/\x13/g, "").replace(/\x15/g, "");

    s = s.replace(
      /HYPERLINK\s+"([^"]+)"(?:\s+\\\w+(?:\s+"[^"]*")?)*\s*\x14([^\x13\x15]+)/gi,
      (_m, href: string, display: string) => {
        const cleanHref = href.trim().replace(/\s+/g, "");
        const cleanDisplay = this.stripControlChars(display, false).trim();
        const aStyle =
          "color: #0563C1; text-decoration: underline; cursor: pointer";
        const text = cleanDisplay || cleanHref;
        return `<a href="${this.escapeHtml(cleanHref)}" style="${aStyle}">${this.escapeHtml(text)}</a>`;
      }
    );

    s = s.replace(
      /HYPERLINK\s+\\l\s+"([^"]+)"(?:\s+\\\w+(?:\s+"[^"]*")?)*\s*\x14([^\x13\x15]+)/gi,
      (_m, anchor: string, display: string) => {
        const target = `#${anchor.trim()}`;
        const cleanDisplay =
          this.stripControlChars(display, false).trim() || anchor.trim();
        const aStyle =
          "color: #0563C1; text-decoration: underline; cursor: pointer";
        return `<a href="${this.escapeHtml(target)}" style="${aStyle}">${this.escapeHtml(cleanDisplay)}</a>`;
      }
    );

    s = s.replace(/HYPERLINK\s+"([^"]+)"\s*/gi, (_m, href: string) => href);

    return s;
  }

  private stripWordFields(s: string): string {
    if (!s) return s;
    return s
      .replace(/PAGEREF\s+[^\s]+(?:\s+\\\w+)*(?:\s+\x14[^\x13\x15]+)?/gi, "")
      .replace(
        /TOC\s+\\[^ \t\r\n]+(?:\s+"[^"]*")?(?:\s+\\[^ \t\r\n]+(?:\s+"[^"]*")?)*/gi,
        ""
      )
      .replace(/\s\\h\b/gi, "");
  }

  private linkifyOutsideAnchors(input: string): string {
    const parts = input.split(/(<a\b[^>]*>.*?<\/a>)/gi);
    const urlPattern = /(https?:\/\/[^\s<>"']+)/g;
    const linkStyles =
      "color: #0563C1; text-decoration: underline; cursor: pointer";
    return parts
      .map((part) => {
        if (part.match(/^<a\b/i)) return part;
        return part.replace(urlPattern, (url) => {
          const safe = this.escapeHtml(url);
          return `<a href="${safe}" style="${linkStyles}">${safe}</a>`;
        });
      })
      .join("");
  }

  private appendImageBlocks(blocks: any[]): any[] {
    const imageNames = Object.keys(this.images);
    if (imageNames.length === 0) return blocks;

    const imageBlocks = imageNames.map((name) => ({
      type: "image",
      data: {
        url: this.images[name],
        caption: name
          .replace(/^ObjectPool\//, "")
          .replace(/\.(png|jpg|jpeg|gif|bmp)$/i, ""),
        withBorder: false,
        withBackground: false,
        stretched: false,
      },
    }));

    return [...blocks, ...imageBlocks];
  }

  private stripControlChars(s: string, keepTableMarker = false): string {
    if (!s) return s;
    let out = "";
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code === 0x0a) {
        out += s[i];
        continue;
      }
      if (keepTableMarker && code === 0x07) {
        out += s[i];
        continue;
      }
      if (code === 0x13 || code === 0x14 || code === 0x15) continue;
      if (code < 0x20) continue;
      out += s[i];
    }
    return out;
  }
}

// 🔥 OLE2Parser CLASS REMAINS EXACTLY THE SAME
export class OLE2Parser {
  private data: Uint8Array;
  private sectorSize = 512;
  private sectors: Uint8Array[] = [];

  constructor(data: Uint8Array) {
    this.data = data;
  }

  public parseHeader(): OLE2Header {
    if (this.data.length < 512) {
      throw new Error("File too small to be a valid .doc file");
    }

    const signature = Array.from(this.data.slice(0, 8));
    const expectedSignature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

    if (!signature.every((byte, index) => byte === expectedSignature[index])) {
      throw new Error("Invalid .doc file signature");
    }

    const header: OLE2Header = {
      signature: signature,
      minorVersion: this.readUInt16LE(24),
      majorVersion: this.readUInt16LE(26),
      byteOrder: this.readUInt16LE(28),
      sectorSize: Math.pow(2, this.readUInt16LE(30)),
      miniSectorSize: Math.pow(2, this.readUInt16LE(32)),
      directorySectorCount: this.readUInt32LE(44),
      fatSectorCount: this.readUInt32LE(46),
      directoryFirstSector: this.readUInt32LE(48),
      miniStreamCutoff: this.readUInt32LE(56),
      miniFatFirstSector: this.readUInt32LE(60),
      miniFatSectorCount: this.readUInt32LE(64),
      difatFirstSector: this.readUInt32LE(68),
      difatSectorCount: this.readUInt32LE(72),
    };

    this.sectorSize = header.sectorSize;
    return header;
  }

  public readSectors(): void {
    const headerSize = 512;
    const availableData = this.data.length - headerSize;
    const maxSectors = Math.floor(availableData / this.sectorSize);

    this.sectors = [];

    for (let i = 0; i < maxSectors; i++) {
      const start = headerSize + i * this.sectorSize;
      const end = start + this.sectorSize;

      if (end <= this.data.length) {
        this.sectors.push(this.data.slice(start, end));
      } else {
        const partialSector = new Uint8Array(this.sectorSize);
        const availableBytes = this.data.length - start;
        partialSector.set(this.data.slice(start, start + availableBytes));
        this.sectors.push(partialSector);
        break;
      }
    }
  }

  public parseFAT(header: OLE2Header): number[] {
    const fat: number[] = [];
    const difat: number[] = [];

    for (let i = 0; i < 109; i++) {
      const sectorIndex = this.readUInt32LE(76 + i * 4);
      if (sectorIndex !== 0xffffffff && sectorIndex < this.sectors.length) {
        difat.push(sectorIndex);
      }
    }

    for (const fatSectorIndex of difat) {
      if (fatSectorIndex >= this.sectors.length) continue;

      const sector = this.sectors[fatSectorIndex];
      if (!sector) continue;

      const entriesPerSector = this.sectorSize / 4;
      for (let i = 0; i < entriesPerSector; i++) {
        const offset = i * 4;
        if (offset + 3 < sector.length) {
          const fatEntry = this.readUInt32LEFromBuffer(sector, offset);
          fat.push(fatEntry);
        }
      }
    }

    return fat;
  }

  public parseDirectory(header: OLE2Header, fat: number[]): DirectoryEntry[] {
    const entries: DirectoryEntry[] = [];
    let currentSector = header.directoryFirstSector;
    let sectorCount = 0;
    const maxSectors = 100;

    while (
      currentSector !== 0xfffffffe &&
      currentSector !== 0xffffffff &&
      currentSector < this.sectors.length &&
      sectorCount < maxSectors
    ) {
      const sector = this.sectors[currentSector];
      if (!sector) break;

      const entriesPerSector = this.sectorSize / 128;
      for (let i = 0; i < entriesPerSector; i++) {
        const entryOffset = i * 128;
        if (entryOffset + 127 < sector.length) {
          const entryData = sector.slice(entryOffset, entryOffset + 128);
          const entry = this.parseDirectoryEntry(entryData);
          if (entry.name.length > 0) {
            entries.push(entry);
          }
        }
      }

      if (currentSector < fat.length) {
        currentSector = fat[currentSector];
      } else {
        break;
      }
      sectorCount++;
    }

    return entries;
  }

  private parseDirectoryEntry(data: Uint8Array): DirectoryEntry {
    let name = "";
    try {
      for (let i = 0; i < 64; i += 2) {
        if (i + 1 < data.length) {
          const char = this.readUInt16LEFromBuffer(data, i);
          if (char === 0) break;
          if (char < 0xd800 || char > 0xdfff) {
            name += String.fromCharCode(char);
          }
        }
      }
    } catch (error) {
      name = `Entry_${Math.random().toString(36).substr(2, 9)}`;
    }

    return {
      name: name.trim(),
      nameLength: data.length >= 66 ? this.readUInt16LEFromBuffer(data, 64) : 0,
      type: data.length >= 67 ? data[66] : 0,
      color: data.length >= 68 ? data[67] : 0,
      leftSibling:
        data.length >= 72 ? this.readUInt32LEFromBuffer(data, 68) : 0xffffffff,
      rightSibling:
        data.length >= 76 ? this.readUInt32LEFromBuffer(data, 72) : 0xffffffff,
      child:
        data.length >= 80 ? this.readUInt32LEFromBuffer(data, 76) : 0xffffffff,
      startSector:
        data.length >= 120 ? this.readUInt32LEFromBuffer(data, 116) : 0,
      size: data.length >= 124 ? this.readUInt32LEFromBuffer(data, 120) : 0,
    };
  }

  public readStream(entry: DirectoryEntry, fat: number[]): Uint8Array {
    if (entry.size === 0) return new Uint8Array(0);

    const streamData = new Uint8Array(entry.size);
    let currentSector = entry.startSector;
    let bytesRead = 0;
    let sectorCount = 0;
    const maxSectors = Math.ceil(entry.size / this.sectorSize) + 10;

    while (
      currentSector !== 0xfffffffe &&
      currentSector !== 0xffffffff &&
      bytesRead < entry.size &&
      sectorCount < maxSectors
    ) {
      if (currentSector >= this.sectors.length) break;

      const sector = this.sectors[currentSector];
      if (!sector) break;

      const bytesToRead = Math.min(this.sectorSize, entry.size - bytesRead);
      const sourceData = sector.slice(0, bytesToRead);

      if (bytesRead + sourceData.length <= streamData.length) {
        streamData.set(sourceData, bytesRead);
        bytesRead += sourceData.length;
      } else {
        const remainingSpace = streamData.length - bytesRead;
        streamData.set(sourceData.slice(0, remainingSpace), bytesRead);
        break;
      }

      if (currentSector < fat.length) {
        currentSector = fat[currentSector];
      } else {
        break;
      }
      sectorCount++;
    }

    return streamData.slice(0, bytesRead);
  }

  private readUInt16LE(offset: number): number {
    if (offset + 1 >= this.data.length) return 0;
    return this.data[offset] | (this.data[offset + 1] << 8);
  }

  private readUInt32LE(offset: number): number {
    if (offset + 3 >= this.data.length) return 0;
    return (
      this.data[offset] |
      (this.data[offset + 1] << 8) |
      (this.data[offset + 2] << 16) |
      (this.data[offset + 3] << 24)
    );
  }

  private readUInt16LEFromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset + 1 >= buffer.length) return 0;
    return buffer[offset] | (buffer[offset + 1] << 8);
  }

  private readUInt32LEFromBuffer(buffer: Uint8Array, offset: number): number {
    if (!buffer || offset + 3 >= buffer.length) return 0;
    return (
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24)
    );
  }
}

// INTERFACES (UNCHANGED)
export const parseDocFileWithFormatting = async (file: File): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const parser = new DocxStyleParser(data);
    return await parser.parseDocument();
  } catch (error) {
    console.error("Error parsing DOC file:", error);
    throw new Error("Failed to parse .doc file: " + (error as Error).message);
  }
};

// [ALL INTERFACES REMAIN EXACTLY THE SAME - EditorJSListItem, CharacterRun, etc.]
interface EditorJSListItem {
  content: string;
  items?: EditorJSListItem[];
}

interface CharacterRun {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  superscript: boolean;
  subscript: boolean;
  color: string;
  highlight: string | null;
  fontSize: number;
  fontName: string;
  fontIndex: number;
  allCaps: boolean;
  smallCaps: boolean;
  isHyperlink: boolean;
}

interface ParagraphInfo {
  alignment: string;
  leftIndent: number;
  rightIndent: number;
  firstLineIndent: number;
  spaceBefore: number;
  spaceAfter: number;
  lineSpacing: number;
  styleId: number;
  listId: number;
  listLevel: number;
  outlineLevel: number;
  isTableRow: boolean;
  isHeader: boolean;
  backgroundColor: string | null;
  borders: any;
}

interface ListInfo {
  listId: number;
  isOrdered: boolean;
  levels: ListLevel[];
}

interface ListLevel {
  level: number;
  start: number;
  alignment: string;
  numberFormat: number;
  text: string;
}

interface TableInfo {
  start: number;
  end: number;
  rows: number;
  cols: number;
  type: string;
}

interface FIBExtended {
  wIdent: number;
  nFib: number;
  fcMin: number;
  fcMac: number;
  fcClx: number;
  lcbClx: number;
  fcPlcfBteChpx: number;
  lcbPlcfBteChpx: number;
  fcPlcfBtePapx: number;
  lcbPlcfBtePapx: number;
  fcPlcfBteLvc: number;
  lcbPlcfBteLvc: number;
  fcPlcfLst: number;
  lcbPlcfLst: number;
  fcPlfLfo: number;
  lcbPlfLfo: number;
  fcPlcfSed: number;
  lcbPlcfSed: number;
  flags: number;
}

interface DirectoryEntry {
  name: string;
  nameLength: number;
  type: number;
  color: number;
  leftSibling: number;
  rightSibling: number;
  child: number;
  startSector: number;
  size: number;
}

interface OLE2Header {
  signature: number[];
  minorVersion: number;
  majorVersion: number;
  byteOrder: number;
  sectorSize: number;
  miniSectorSize: number;
  directorySectorCount: number;
  fatSectorCount: number;
  directoryFirstSector: number;
  miniStreamCutoff: number;
  miniFatFirstSector: number;
  miniFatSectorCount: number;
  difatFirstSector: number;
  difatSectorCount: number;
}
