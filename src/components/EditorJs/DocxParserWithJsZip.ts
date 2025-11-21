import JSZip from "jszip";
import { TABLE_STYLES } from "~/lib/constants/formBuilderConstants";
interface EditorJSListItem {
  content: string;
  items?: EditorJSListItem[];
}

interface EditorJSList {
  type: "list";
  data: {
    style: "ordered" | "unordered";
    items: EditorJSListItem[];
  };
}

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const RELATIONSHIP_NS =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const DRAWING_NS =
  "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
const MAIN_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
const PICTURE_NS = "http://schemas.openxmlformats.org/drawingml/2006/picture";

const processRelationships = async (
  relsXml: string | undefined
): Promise<{ [key: string]: string }> => {
  const relationships: { [key: string]: string } = {};

  if (relsXml) {
    const relsDoc = new DOMParser().parseFromString(relsXml, "text/xml");
    const rels = relsDoc.getElementsByTagName("Relationship");
    for (const rel of Array.from(rels)) {
      const id = rel.getAttribute("Id");
      const target = rel.getAttribute("Target");
      if (id && target) {
        relationships[id] = target;
      }
    }
  }

  return relationships;
};
const parseHeadersAndFooters = async (
  zip: JSZip,
  images: { [key: string]: string }
) => {
  const headerBlocks: any[] = [];
  const footerBlocks: any[] = [];

  for (const path in zip.files) {
    if (path.startsWith("word/header") && path.endsWith(".xml")) {
      try {
        const headerXml = await zip.file(path)?.async("text");
        if (!headerXml) continue;

        const headerRelsPath = path.replace(/\.xml$/, ".xml.rels");
        const headerRelsXml = await zip.file(headerRelsPath)?.async("text");

        const relationships: { [key: string]: string } = {};
        if (headerRelsXml) {
          const relsDoc = new DOMParser().parseFromString(
            headerRelsXml,
            "text/xml"
          );
          const rels = relsDoc.getElementsByTagName("Relationship");
          for (const rel of Array.from(rels)) {
            const id = rel.getAttribute("Id");
            const target = rel.getAttribute("Target");
            if (id && target) {
              relationships[id] = target;
            }
          }
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(headerXml, "text/xml");

        const paragraphs = xmlDoc.getElementsByTagNameNS(WORD_NS, "p");
        const tables = xmlDoc.getElementsByTagNameNS(WORD_NS, "tbl");

        const blocks: any[] = [];

        for (const paragraph of Array.from(paragraphs)) {
          const block = await processParagraph(
            paragraph,
            relationships,
            images
          );
          if (block) blocks.push(block);
        }

        for (const table of Array.from(tables)) {
          const block = await processTable(table, relationships, images);
          if (block) blocks.push(block);
        }

        const processedBlocks = processLists(blocks);
        headerBlocks.push(...processedBlocks);
      } catch (error) {
        console.error(`Error processing header ${path}:`, error);
      }
    }
  }

  for (const path in zip.files) {
    if (path.startsWith("word/footer") && path.endsWith(".xml")) {
      try {
        const footerXml = await zip.file(path)?.async("text");
        if (!footerXml) continue;

        const footerRelsPath = path.replace(/\.xml$/, ".xml.rels");
        const footerRelsXml = await zip.file(footerRelsPath)?.async("text");

        const relationships: { [key: string]: string } = {};
        if (footerRelsXml) {
          const relsDoc = new DOMParser().parseFromString(
            footerRelsXml,
            "text/xml"
          );
          const rels = relsDoc.getElementsByTagName("Relationship");
          for (const rel of Array.from(rels)) {
            const id = rel.getAttribute("Id");
            const target = rel.getAttribute("Target");
            if (id && target) {
              relationships[id] = target;
            }
          }
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(footerXml, "text/xml");

        const paragraphs = xmlDoc.getElementsByTagNameNS(WORD_NS, "p");
        const tables = xmlDoc.getElementsByTagNameNS(WORD_NS, "tbl");

        const blocks: any[] = [];

        for (const paragraph of Array.from(paragraphs)) {
          const block = await processParagraph(
            paragraph,
            relationships,
            images
          );
          if (block) blocks.push(block);
        }

        for (const table of Array.from(tables)) {
          const block = await processTable(table, relationships, images);
          if (block) blocks.push(block);
        }

        const processedBlocks = processLists(blocks);
        footerBlocks.push(...processedBlocks);
      } catch (error) {
        console.error(`Error processing footer ${path}:`, error);
      }
    }
  }

  return { headerBlocks, footerBlocks };
};

const extractHeaderFooterBlocks = async (
  doc: Document,
  relationships: { [key: string]: string } = {},
  images: { [key: string]: string } = {}
): Promise<any[]> => {
  const blocks: any[] = [];
  const body =
    doc.getElementsByTagNameNS(WORD_NS, "body")[0] || doc.documentElement;

  for (const child of Array.from(body.children)) {
    if (child.namespaceURI === WORD_NS) {
      if (child.localName === "p") {
        const block = await processParagraph(child, relationships, images);
        if (block) blocks.push(block);
      } else if (child.localName === "tbl") {
        const block = await processTable(child, relationships, images);
        if (block) blocks.push(block);
      }
    }
  }

  return processLists(blocks);
};

export const parseDocxWithJSZip = async (file: File) => {
  try {
    const zip = await JSZip.loadAsync(file);
    const documentXml = await zip.file("word/document.xml")?.async("text");
    const relsXml = await zip
      .file("word/_rels/document.xml.rels")
      ?.async("text");
    if (!documentXml) {
      console.error("Could not read document.xml");
      return {};
    }
    const relationships: any = {};
    if (relsXml) {
      const relsDoc = new DOMParser().parseFromString(relsXml, "text/xml");
      const rels = relsDoc.getElementsByTagName("Relationship");
      for (const rel of Array.from(rels)) {
        const id = rel.getAttribute("Id");
        const target = rel.getAttribute("Target");
        if (id && target) {
          relationships[id] = target;
        }
      }
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");
    const body = xmlDoc.getElementsByTagNameNS(WORD_NS, "body")[0];
    if (!body) {
      console.error("No body found in document");
      return {};
    }

    const pages: {
      [key: number]: { headers: any[]; main: any[]; footers: any[] };
    } = {};
    let currentPageIndex = 0;
    let currentPageBlocks: any[] = [];

    const images: { [key: string]: string } = {};
    for (const [path, file] of Object.entries(zip.files)) {
      if (path.startsWith("word/media/") || path.startsWith("word/images/")) {
        try {
          const imageData = await file.async("base64");
          const imageType = path.split(".").pop()?.toLowerCase() || "";
          const mimeType = getMimeType(imageType);
          if (mimeType) {
            images[path] = `data:${mimeType};base64,${imageData}`;
          }
        } catch (error) {
          console.error(`Error loading image ${path}:`, error);
        }
      }
    }

    const { headerBlocks, footerBlocks } = await parseHeadersAndFooters(
      zip,
      images
    );

    for (const child of Array.from(body.children)) {
      if (child.namespaceURI === WORD_NS) {
        if (isPageBreak(child)) {
          if (currentPageBlocks.length > 0) {
            const processedBlocks = processLists(currentPageBlocks);
            pages[currentPageIndex] = {
              headers: headerBlocks || [],
              main: processedBlocks,
              footers: footerBlocks || [],
            };
            currentPageIndex++;
            currentPageBlocks = [];
          }
          continue;
        }

        if (child.localName === "p") {
          const block = await processParagraph(child, relationships, images);
          if (block) currentPageBlocks.push(block);
        } else if (child.localName === "tbl") {
          const block = await processTable(child, relationships, images);
          if (block) currentPageBlocks.push(block);
        } else if (child.localName === "sdt") {
          const tocBlocks = await processTOC(child, relationships, images);
          for (const block of tocBlocks) {
            currentPageBlocks.push(block);
          }
        }
      }
    }

    if (currentPageBlocks.length > 0) {
      const processedBlocks = processLists(currentPageBlocks);
      pages[currentPageIndex] = {
        headers: headerBlocks || [],
        main: processedBlocks,
        footers: footerBlocks || [],
      };
    }

    if (Object.keys(pages).length === 0) {
      const processedMainBlocks = processLists(currentPageBlocks);
      pages[0] = {
        headers: headerBlocks || [],
        main: processedMainBlocks,
        footers: footerBlocks || [],
      };
    }

    return pages;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    return {};
  }
};

async function processTOC(sdtNode: Element, relationships: any, images: any) {
  const galleryEls = sdtNode.getElementsByTagNameNS(WORD_NS, "docPartGallery");
  if (galleryEls.length > 0) {
    const galleryVal = galleryEls[0].getAttribute("w:val");
    if (galleryVal && galleryVal.toLowerCase().includes("table of contents")) {
      const tocEntries: any[] = [];
      const paragraphs = sdtNode.getElementsByTagNameNS(WORD_NS, "p");
      for (const p of Array.from(paragraphs)) {
        const block = await processParagraph(p, relationships, images);
        if (block) tocEntries.push(block);
      }
      return tocEntries;
    }
  }
  return null;
}

const isPageBreak = (element: Element): boolean => {
  if (element.localName !== "p") return false;

  const pPr = getElementByTagNameNS(element, "pPr");
  if (pPr) {
    const sectPr = getElementByTagNameNS(pPr, "sectPr");
    if (sectPr) {
      const type = getElementByTagNameNS(sectPr, "type");
      if (type) {
        const val = type.getAttributeNS(WORD_NS, "val");
        if (val === "nextPage" || val === "oddPage" || val === "evenPage") {
          return true;
        }
      }
    }

    const pageBreakBefore = getElementByTagNameNS(pPr, "pageBreakBefore");
    if (pageBreakBefore) {
      return true;
    }
  }

  const runs = getElementsByTagNameNS(element, "r");
  for (const run of runs) {
    const br = getElementByTagNameNS(run, "br");
    if (br) {
      const type = br.getAttributeNS(WORD_NS, "type");
      if (type === "page") {
        return true;
      }
    }
  }

  return false;
};

const getElementByTagNameNS = (
  element: Element,
  localName: string
): Element | null => {
  return element.getElementsByTagNameNS(WORD_NS, localName)[0] || null;
};

const getElementsByTagNameNS = (
  element: Element,
  localName: string
): Element[] => {
  return Array.from(element.getElementsByTagNameNS(WORD_NS, localName));
};

const processHyperlink = (hyperlink: Element, relationships: any): string => {
  try {
    let linkText = "";
    let href = "";

    const relId = hyperlink.getAttributeNS(RELATIONSHIP_NS, "id");
    if (relId && relationships[relId]) {
      href = relationships[relId];
    }

    const anchor = hyperlink.getAttributeNS(WORD_NS, "anchor") || "";
    if (anchor && !href) {
      href = `#${anchor}`;
    }

    const textRuns = getElementsByTagNameNS(hyperlink, "r");
    for (const run of textRuns) {
      const textElement = getElementByTagNameNS(run, "t");
      if (textElement) {
        let runText = textElement.textContent || "";

        if (textElement.getAttributeNS(WORD_NS, "space") === "preserve") {
          runText = " " + runText + " ";
        }

        const rPr = getElementByTagNameNS(run, "rPr");
        const textStyles = getTextStyles(rPr);
        if (textStyles.length > 0) {
          const safeStyles = textStyles
            .map((s) => s.replace(/"/g, "'"))
            .join("; ");

          runText = `<span style="${safeStyles}">${runText}</span>`;
        }

        linkText += runText;
      }
    }

    if (!href && linkText.trim()) {
      href = "#";
    }

    if (linkText.trim()) {
      const linkStyles = [
        "color: #0563C1",
        "text-decoration: underline",
        "cursor: pointer",
      ];

      return `<a href="${href}" style="${linkStyles.join(";")}">${linkText}</a>`;
    }

    return linkText;
  } catch (error) {
    console.error("Error processing hyperlink:", error);
    return "";
  }
};

const processDrawing = async (
  drawingElement: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
): Promise<any> => {
  try {
    let inline: Element | null = null;
    let anchor: Element | null = null;

    // Find wp:inline or wp:anchor
    for (const child of Array.from(drawingElement.children)) {
      if (child.localName === "inline") {
        inline = child;
        break;
      } else if (child.localName === "anchor") {
        anchor = child;
      }
    }

    const container = inline || anchor;
    if (!container) {
      console.warn(
        "No inline or anchor found in drawing:",
        drawingElement.outerHTML
      );
      return null;
    }

    const extent = container.getElementsByTagNameNS(DRAWING_NS, "extent")[0];

    const originalWidth = extent?.getAttribute("cx")
      ? Number.parseInt(extent.getAttribute("cx")!)
      : 0;
    const originalHeight = extent?.getAttribute("cy")
      ? Number.parseInt(extent.getAttribute("cy")!)
      : 0;

    const graphic = container.getElementsByTagNameNS(MAIN_NS, "graphic")[0];
    if (!graphic) return null;

    const graphicData = graphic.getElementsByTagNameNS(
      MAIN_NS,
      "graphicData"
    )[0];
    if (!graphicData) return null;

    const pic = graphicData.getElementsByTagNameNS(PICTURE_NS, "pic")[0];
    if (!pic) return null;

    const blipFill = pic.getElementsByTagNameNS(PICTURE_NS, "blipFill")[0];
    if (!blipFill) return null;

    const blip = blipFill.getElementsByTagNameNS(MAIN_NS, "blip")[0];
    if (!blip) return null;

    const imageId =
      blip.getAttributeNS(RELATIONSHIP_NS, "embed") ||
      blip.getAttributeNS(RELATIONSHIP_NS, "link");
    if (!imageId || !relationships[imageId]) return null;

    const imagePath = relationships[imageId].startsWith("/")
      ? `word${relationships[imageId]}`
      : `word/${relationships[imageId]}`;
    const imageData = images[imagePath];

    const img = new Image();
    const actualDimensions = await new Promise<{
      width: number;
      height: number;
    }>((resolve) => {
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = imageData;
    });

    return {
      type: "image",
      data: {
        url: imageData,
        float: inline ? "inline" : "left",
        dimensions: {
          width: originalWidth / 9525,
          height: originalHeight / 9525,
          actual: actualDimensions,
          current: actualDimensions,
        },
      },
    };
  } catch (error) {
    console.error("Error processing drawing:", error);
    return null;
  }
};

const DEFAULT_STYLES = {
  Title: {
    fontSize: "36px",
    color: "#17365D",
    marginBottom: "24px",
    lineHeight: "1.3",
    align: "center",
  },
  Heading1: {
    fontSize: "19px",
    color: "#365F91",
    fontWeight: "bold",
    marginBottom: "20px",
    lineHeight: "1.3",
  },
  Heading2: {
    fontSize: "17px",
    color: "#4F81BD",
    fontWeight: "bold",
    marginBottom: "16px",
    lineHeight: "1.3",
  },
  Heading3: {
    fontSize: "15px",
    color: "#4F81BD",
    fontWeight: "bold",
    marginBottom: "12px",
    lineHeight: "1.3",
  },
};

const getStyleString = (styleObj: Record<string, string>): string => {
  return Object.entries(styleObj)
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value}`
    )
    .join(";");
};

const processCustomParagraphs = async (
  paragraph: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
) => {};

const generatePlaceholder = (
  placeholderName: string,
  originalText: string,
  uniqueId: string = ""
): string => {
  const id =
    uniqueId ||
    `placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const underscoreCount = originalText.length;

  const width = Math.max(40, underscoreCount * 8);

  return `<span 
    data-placeholder-name="${placeholderName}" 
    data-unique-id="${id}" 
    style="display:inline-block; white-space:nowrap; border-bottom: 1px solid #000; width: ${width}px;"
  >&nbsp;</span>`;
};

const processUnderscorePlaceholders = (text: string): string => {
  const underscoreRegex = /_{3,}/g;

  return text.replace(underscoreRegex, (match) => {
    const placeholderName = `input_field_${match.length}`;
    return generatePlaceholder(placeholderName, match);
  });
};

const processParagraph = async (
  paragraph: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
) => {
  try {
    const pPr = getElementByTagNameNS(paragraph, "pPr");
    const paragraphStyles = getParagraphStyles(pPr);

    let text = "";
    let hasContent = false;
    let imageBlock = null;

    for (const child of Array.from(paragraph.children)) {
      if (child.namespaceURI === WORD_NS) {
        if (child.localName === "r") {
          const run = child;
          const textElement = getElementByTagNameNS(run, "t");
          const drawingElement = getElementByTagNameNS(run, "drawing");
          const brElement = getElementByTagNameNS(run, "br");

          if (brElement) {
            text += "<br>";
          }

          if (textElement) {
            let runText = textElement.textContent || "";

            runText = processUnderscorePlaceholders(runText);

            if (textElement.getAttributeNS(WORD_NS, "space") === "preserve") {
              runText = " " + runText + " ";
            }

            if (runText.trim()) {
              hasContent = true;
            }

            const rPr = getElementByTagNameNS(run, "rPr");
            const textStyles = getTextStyles(rPr);

            if (textStyles.length > 0) {
              const safeStyles = textStyles
                .map((s) => s.replace(/"/g, "'"))
                .join("; ");

              runText = `<span style="${safeStyles}">${runText}</span>`;
            }

            text += runText;
          } else if (drawingElement) {
            imageBlock = await processDrawing(
              drawingElement,
              relationships,
              images
            );
            return imageBlock;
          }
        } else if (child.localName === "hyperlink") {
          const linkText = processHyperlink(child, relationships);
          if (linkText) {
            hasContent = true;
            text += linkText;
          }
        } else if (child.localName === "br") {
          text += "<br>";
        }
      }
    }

    if (!hasContent && !text.includes("<br>")) {
      return null;
    }

    const pStyle = pPr ? getElementByTagNameNS(pPr, "pStyle") : null;
    const styleVal = pStyle?.getAttributeNS(WORD_NS, "val");

    const baseBlock = {
      tunes: {
        alignment: {
          alignment: getAlignmentFromPPr(pPr),
        },
        indentTune: {
          indentLevel: getIndentLevel(pPr),
        },
      },
    };

    if (
      styleVal === "Title" ||
      styleVal === "Heading1" ||
      styleVal === "Heading2" ||
      styleVal === "Heading3"
    ) {
      const styleObj = DEFAULT_STYLES[styleVal];
      const styleString = getStyleString(styleObj);

      return {
        type: "paragraph",
        data: {
          text: `<span style="${styleString}">${text}</span>`,
        },
        tunes: {
          alignment: {
            alignment:
              styleVal === "Title"
                ? "center"
                : styleVal === "Heading1"
                  ? "center"
                  : getAlignmentFromPPr(pPr),
          },
          indentTune: {
            indentLevel: getIndentLevel(pPr),
          },
        },
      };
    } else if (styleVal?.startsWith("Heading")) {
      const level = Number.parseInt(styleVal.replace("Heading", "")) || 1;
      return {
        type: "header",
        data: {
          text,
          level,
        },
        ...baseBlock,
      };
    }

    const numPr = pPr ? getElementByTagNameNS(pPr, "numPr") : null;
    if (numPr) {
      const numId = getElementByTagNameNS(numPr, "numId")?.getAttributeNS(
        WORD_NS,
        "val"
      );
      const ilvl =
        getElementByTagNameNS(numPr, "ilvl")?.getAttributeNS(WORD_NS, "val") ||
        "0";

      return {
        type: "list",
        data: {
          style: numId === "1" ? "unordered" : "ordered",
          items: [text],
          level: Number.parseInt(ilvl),
        },
        ...baseBlock,
      };
    }

    return {
      type: "paragraph",
      data: {
        text,
      },
      ...baseBlock,
    };
  } catch (error) {
    console.error("Error processing paragraph:", error);
    return null;
  }
};
const processLists = (blocks: any[]): any[] => {
  const processedBlocks: any[] = [];
  let currentList: EditorJSList | null = null;

  const createNewList = (block: any): EditorJSList => ({
    type: "list",
    data: {
      style: block.data.style,
      items: [],
    },
  });

  const addItemToList = (list: EditorJSList, item: any, level: number) => {
    const newItem: EditorJSListItem = {
      content: item.data.items[0],
      items: [],
    };

    if (level === 0) {
      list.data.items.push(newItem);
    } else {
      let currentLevel = list.data.items;
      for (let i = 0; i < level; i++) {
        if (!currentLevel[currentLevel.length - 1]) {
          currentLevel.push({ content: "", items: [] });
        }
        if (!currentLevel[currentLevel.length - 1].items) {
          currentLevel[currentLevel.length - 1].items = [];
        }
        currentLevel = currentLevel[currentLevel.length - 1].items!;
      }
      currentLevel.push(newItem);
    }
  };

  for (const block of blocks) {
    if (block.type === "list") {
      if (!currentList || currentList.data.style !== block.data.style) {
        if (currentList) {
          processedBlocks.push(currentList);
        }
        currentList = createNewList(block);
      }
      addItemToList(currentList, block, block.data.level || 0);
    } else {
      if (currentList) {
        processedBlocks.push(currentList);
        currentList = null;
      }
      processedBlocks.push(block);
    }
  }

  if (currentList) {
    processedBlocks.push(currentList);
  }

  return processedBlocks;
};

const getAlignmentFromPPr = (pPr: Element | null): string => {
  if (!pPr) return "left";
  const jc = getElementByTagNameNS(pPr, "jc");
  const val = jc?.getAttributeNS(WORD_NS, "val");

  const alignmentMap: { [key: string]: string } = {
    left: "left",
    right: "right",
    center: "center",
    both: "justify",
    justify: "justify",
  };

  return alignmentMap[val?.toLowerCase() || ""] || "left";
};

const getIndentLevel = (pPr: Element | null): number => {
  if (!pPr) return 0;
  const ind = getElementByTagNameNS(pPr, "ind");
  if (!ind) return 0;

  const leftInd =
    ind.getAttributeNS(WORD_NS, "left") ||
    ind.getAttributeNS(WORD_NS, "firstLine") ||
    "0";

  return Math.floor(parseInt(leftInd) / 720);
};

const processTable = async (
  table: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
): Promise<any> => {
  try {
    const rows = getElementsByTagNameNS(table, "tr");
    const tblPr = getElementByTagNameNS(table, "tblPr");
    const tblGrid = getElementByTagNameNS(table, "tblGrid");

    const gridCols = tblGrid
      ? Array.from(getElementsByTagNameNS(tblGrid, "gridCol"))
      : [];
    const totalGridCols = gridCols.length;

    const tblLook = tblPr ? getElementByTagNameNS(tblPr, "tblLook") : null;
    const tblStyle = tblPr ? getElementByTagNameNS(tblPr, "tblStyle") : null;
    const tblStyleVal: any = tblStyle
      ? tblStyle.getAttributeNS(WORD_NS, "val")
      : "";

    const tableStyleConfig =
      TABLE_STYLES[tblStyleVal] || TABLE_STYLES["TableNormal"];
    const conditionalFormatting = getTableConditionalFormatting(tblLook);

    if (tableStyleConfig.firstRow) {
      conditionalFormatting.firstRow = true;
    }

    const tableStyles = getTableStyles(tblPr);
    const customTableStyles = tableStyleConfig.table || {};
    const mergedTableStyles = { ...tableStyles, ...customTableStyles };

    const vMergeTracker: {
      [key: number]: { startRow: number; colspan: number };
    } = {};
    const cellsToSkip: Set<string> = new Set();

    const content: string[][] = [];
    const cellStyles: any = {};
    const rowStyles: any = {};
    const headerRows: number[] = [];

    for (const [rowIndex, row] of rows.entries()) {
      const cells = getElementsByTagNameNS(row, "tc");
      const rowData: string[] = [];

      const trPr = getElementByTagNameNS(row, "trPr");
      const rowStyleList = getRowStyles(trPr, rowIndex, conditionalFormatting);

      if (rowStyleList.length > 0) {
        const rowStyleObj: any = {};
        rowStyleList.forEach((style) => {
          const [prop, val] = style.split(": ");
          const camelProp = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          rowStyleObj[camelProp] = val;
        });
        rowStyles[rowIndex] = rowStyleObj;
      }

      if (rowIndex === 0 && conditionalFormatting.firstRow) {
        headerRows.push(rowIndex);
      }

      if (!cellStyles[rowIndex]) {
        cellStyles[rowIndex] = {};
      }

      let currentGridCol = 0;
      let visualColIndex = 0;

      for (const [cellIndex, cell] of cells.entries()) {
        while (cellsToSkip.has(`${rowIndex}-${currentGridCol}`)) {
          currentGridCol++;
        }

        const tcPr = getElementByTagNameNS(cell, "tcPr");

        const gridSpan = tcPr ? getElementByTagNameNS(tcPr, "gridSpan") : null;
        const colspan = gridSpan
          ? parseInt(gridSpan.getAttributeNS(WORD_NS, "val") || "1", 10)
          : 1;

        const vMerge = tcPr ? getElementByTagNameNS(tcPr, "vMerge") : null;
        let rowspan = 1;

        if (vMerge) {
          const val = vMerge.getAttributeNS(WORD_NS, "val");

          if (val === "restart" || val === null) {
            rowspan = 1;
            let checkRow = rowIndex + 1;

            while (checkRow < rows.length) {
              const nextRowCells = getElementsByTagNameNS(rows[checkRow], "tc");
              let nextGridCol = 0;
              let found = false;

              for (const nextCell of Array.from(nextRowCells)) {
                while (cellsToSkip.has(`${checkRow}-${nextGridCol}`)) {
                  nextGridCol++;
                }

                const nextTcPr = getElementByTagNameNS(nextCell, "tcPr");
                const nextGridSpan = nextTcPr
                  ? getElementByTagNameNS(nextTcPr, "gridSpan")
                  : null;
                const nextColspan = nextGridSpan
                  ? parseInt(
                      nextGridSpan.getAttributeNS(WORD_NS, "val") || "1",
                      10
                    )
                  : 1;

                if (nextGridCol === currentGridCol) {
                  const nextVMerge = nextTcPr
                    ? getElementByTagNameNS(nextTcPr, "vMerge")
                    : null;

                  if (
                    nextVMerge &&
                    !nextVMerge.getAttributeNS(WORD_NS, "val")
                  ) {
                    rowspan++;
                    for (
                      let skipCol = nextGridCol;
                      skipCol < nextGridCol + nextColspan;
                      skipCol++
                    ) {
                      cellsToSkip.add(`${checkRow}-${skipCol}`);
                    }
                    found = true;
                    break;
                  } else {
                    found = false;
                    break;
                  }
                }

                nextGridCol += nextColspan;
              }

              if (!found) break;
              checkRow++;
            }
          } else {
            currentGridCol += colspan;
            continue;
          }
        }

        let cellContent = await processCellContent(cell, relationships, images);

        rowData.push(cellContent);

        const cellStyleList = getCellStyles(
          tcPr,
          rowIndex,
          visualColIndex,
          conditionalFormatting,
          rowStyleList,
          tableStyleConfig
        );

        const cellStyleObj: any = {};

        cellStyleList.forEach((style) => {
          const [prop, val] = style.split(": ");
          const camelProp = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          cellStyleObj[camelProp] = val;
        });

        const bgColor = getCellBackgroundColor(tcPr);
        const textColor = getCellTextColor(tcPr);

        if (bgColor && !cellStyleObj.backgroundColor) {
          cellStyleObj.backgroundColor = `#${bgColor}`;
        }
        if (textColor && !cellStyleObj.color) {
          cellStyleObj.color = `#${textColor}`;
        }

        const vAlign = tcPr ? getElementByTagNameNS(tcPr, "vAlign") : null;
        if (vAlign) {
          const alignVal = vAlign.getAttributeNS(WORD_NS, "val");
          if (alignVal === "center") {
            cellStyleObj.verticalAlign = "middle";
          } else if (alignVal === "bottom") {
            cellStyleObj.verticalAlign = "bottom";
          } else if (alignVal === "top") {
            cellStyleObj.verticalAlign = "top";
          }
        }
        const paragraphs = getElementsByTagNameNS(cell, "p");
        if (paragraphs.length > 0) {
          const firstParagraph = paragraphs[0];
          const pPr = getElementByTagNameNS(firstParagraph, "pPr");
          if (pPr) {
            const jc = getElementByTagNameNS(pPr, "jc");
            if (jc) {
              const alignment = jc.getAttributeNS(WORD_NS, "val");
              if (alignment && !cellStyleObj.textAlign) {
                cellStyleObj.textAlign =
                  alignment === "both" ? "justify" : alignment;
              }
            }
          }
        }

        const tcMar = tcPr ? getElementByTagNameNS(tcPr, "tcMar") : null;
        if (tcMar) {
          const top = getElementByTagNameNS(tcMar, "top");
          const bottom = getElementByTagNameNS(tcMar, "bottom");
          const left = getElementByTagNameNS(tcMar, "left");
          const right = getElementByTagNameNS(tcMar, "right");

          if (top) {
            const val = top.getAttributeNS(WORD_NS, "w");
            if (val) cellStyleObj.paddingTop = `${parseInt(val) / 20}pt`;
          }
          if (bottom) {
            const val = bottom.getAttributeNS(WORD_NS, "w");
            if (val) cellStyleObj.paddingBottom = `${parseInt(val) / 20}pt`;
          }
          if (left) {
            const val = left.getAttributeNS(WORD_NS, "w");
            if (val) cellStyleObj.paddingLeft = `${parseInt(val) / 20}pt`;
          }
          if (right) {
            const val = right.getAttributeNS(WORD_NS, "w");
            if (val) cellStyleObj.paddingRight = `${parseInt(val) / 20}pt`;
          }
        }

        if (colspan > 1) {
          cellStyleObj.colSpan = colspan;
        }
        if (rowspan > 1) {
          cellStyleObj.rowSpan = rowspan;
        }

        if (Object.keys(cellStyleObj).length > 0) {
          cellStyles[rowIndex][visualColIndex] = cellStyleObj;
        }

        currentGridCol += colspan;
        visualColIndex++;
      }

      if (rowData.length > 0) {
        content.push(rowData);
      }
    }

    return {
      type: "table",
      data: {
        content,
        withHeading: headerRows.length > 0,
        headerRows,
        styles: {
          table: mergedTableStyles,
          rows: rowStyles,
          cells: cellStyles,
        },
      },
    };
  } catch (error) {
    console.error("Error processing table:", error);
    return null;
  }
};

const processCellContent = async (
  cell: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
): Promise<string> => {
  try {
    let cellContent = "";
    const paragraphs = getElementsByTagNameNS(cell, "p");

    for (const [paraIndex, paragraph] of paragraphs.entries()) {
      if (paraIndex > 0) cellContent += "\n";

      const pPr = getElementByTagNameNS(paragraph, "pPr");
      const paragraphStyles = getParagraphStyles(pPr);

      let paragraphContent = "";

      for (const child of Array.from(paragraph.children)) {
        if (child.namespaceURI !== WORD_NS) continue;

        if (child.localName === "r") {
          const run = child;
          const textElement = getElementByTagNameNS(run, "t");
          const brElement = getElementByTagNameNS(run, "br");
          const drawingElement = getElementByTagNameNS(run, "drawing");

          if (brElement) paragraphContent += "\n";

          if (textElement) {
            let runText = textElement.textContent || "";

            if (!runText.trim()) {
              runText = "&nbsp;";
            }

            runText = processUnderscorePlaceholders(runText);

            if (textElement.getAttributeNS(WORD_NS, "space") === "preserve") {
              runText = " " + runText + " ";
            }

            const rPr = getElementByTagNameNS(run, "rPr");
            const textStyles = getTextStyles(rPr);

            if (textStyles.length > 0) {
              const safeStyles = textStyles
                .map((s) => s.replace(/"/g, "'"))
                .join("; ");

              runText = `<span style="${safeStyles}">${runText}</span>`;
            }

            paragraphContent += runText;
          } else if (drawingElement) {
            const imageBlock = await processDrawing(
              drawingElement,
              relationships,
              images
            );
            if (imageBlock) {
              paragraphContent += `<img src="${imageBlock.data.url}" style="max-width: 100px; height: auto;" />`;
            }
          }
        } else if (child.localName === "hyperlink") {
          const linkText = processHyperlink(child, relationships);
          if (linkText) paragraphContent += linkText;
        } else if (child.localName === "br") {
          paragraphContent += "\n";
        }
      }

      if (paragraphStyles.length > 0) {
        const safePStyles = paragraphStyles
          .map((s) => s.replace(/"/g, "'"))
          .join("; ");

        paragraphContent = `<div style="${safePStyles}">${paragraphContent}</div>`;
      }

      cellContent += paragraphContent;
    }

    if (!cellContent.trim() && cell.textContent?.trim()) {
      cellContent = processUnderscorePlaceholders(cell.textContent);
    }

    return cellContent.trim() ? cellContent : "&nbsp;";
  } catch (error) {
    console.error("Error processing cell content:", error);
    return "&nbsp;";
  }
};

const getTextStyles = (rPr: Element | null): string[] => {
  const styles: string[] = [];

  if (!rPr) return styles;

  const rFonts = getElementByTagNameNS(rPr, "rFonts");
  if (rFonts) {
    const ascii = rFonts.getAttributeNS(WORD_NS, "ascii");
    const hAnsi = rFonts.getAttributeNS(WORD_NS, "hAnsi");
    const cs = rFonts.getAttributeNS(WORD_NS, "cs");
    const eastAsia = rFonts.getAttributeNS(WORD_NS, "eastAsia");

    const fontFamily = ascii || hAnsi || cs || eastAsia;
    if (fontFamily) {
      styles.push(`font-family: '${fontFamily}'`);
    }
  }

  const sz = getElementByTagNameNS(rPr, "sz");
  if (sz) {
    const size = sz.getAttributeNS(WORD_NS, "val");
    if (size) {
      styles.push(`font-size: ${parseInt(size) / 2}pt`);
    }
  }

  const color = getElementByTagNameNS(rPr, "color");
  if (color) {
    const val = color.getAttributeNS(WORD_NS, "val");
    if (val && val !== "auto") {
      styles.push(`color: #${val}`);
    }
  }

  const highlight = getElementByTagNameNS(rPr, "highlight");
  if (highlight) {
    const val = highlight.getAttributeNS(WORD_NS, "val");
    if (val) {
      const backgroundColor = getHighlightColor(val);
      styles.push(`background-color: ${backgroundColor}`);
    }
  }

  const shd = getElementByTagNameNS(rPr, "shd");
  if (shd) {
    const fill = shd.getAttributeNS(WORD_NS, "fill");
    if (fill && fill !== "auto") {
      styles.push(`background-color: #${fill}`);
    }
  }

  const vertAlign = getElementByTagNameNS(rPr, "vertAlign");
  if (vertAlign) {
    const val = vertAlign.getAttributeNS(WORD_NS, "val");
    switch (val) {
      case "superscript":
        styles.push("vertical-align: super");
        styles.push("font-size: smaller");
        break;
      case "subscript":
        styles.push("vertical-align: sub");
        styles.push("font-size: smaller");
        break;
    }
  }

  const strike = getElementByTagNameNS(rPr, "strike");
  const dstrike = getElementByTagNameNS(rPr, "dstrike");
  if (strike || dstrike) {
    styles.push("text-decoration: line-through");
  }

  if (getElementByTagNameNS(rPr, "b")) {
    styles.push("font-weight: bold");
  }

  if (getElementByTagNameNS(rPr, "i")) {
    styles.push("font-style: italic");
  }

  const u = getElementByTagNameNS(rPr, "u");
  if (u) {
    const val = u.getAttributeNS(WORD_NS, "val") || "single";
    const colorAttr = u.getAttributeNS(WORD_NS, "color");

    let underlineStyle = "underline";
    switch (val) {
      case "double":
        underlineStyle = "underline double";
        break;
      case "wave":
        underlineStyle = "underline wavy";
        break;
      default:
        underlineStyle = "underline";
    }

    if (colorAttr && colorAttr !== "auto") {
      styles.push(`text-decoration: ${underlineStyle} #${colorAttr}`);
    } else {
      styles.push(`text-decoration: ${underlineStyle}`);
    }
  }

  return styles;
};

const getCellBackgroundColor = (tcPr: Element | null): string | null => {
  if (tcPr) {
    const shd = getElementByTagNameNS(tcPr, "shd");
    if (shd) {
      return shd.getAttributeNS(WORD_NS, "fill") || null;
    }
  }
  return null;
};

const getCellTextColor = (tcPr: Element | null): string | null => {
  if (tcPr) {
    const color = getElementByTagNameNS(tcPr, "color");
    if (color) {
      return color.getAttributeNS(WORD_NS, "val") || null;
    }
  }
  return null;
};

const getRowStyles = (
  trPr: Element | null,
  rowIndex: number,
  conditionalFormatting: ReturnType<typeof getTableConditionalFormatting>
): string[] => {
  const styles: string[] = [];

  if (!trPr) return styles;

  // Row background color
  const shd = getElementByTagNameNS(trPr, "shd");
  if (shd) {
    const fill = shd.getAttributeNS(WORD_NS, "fill");
    if (fill && fill !== "auto") {
      styles.push(`background-color: #${fill}`);
    }
  }
  if (conditionalFormatting.firstRow && rowIndex === 0) {
    styles.push("font-weight: bold");
  }

  return styles;
};

const getDetailedBorders = (borders: Element): string[] => {
  const styles: string[] = [];
  const sides = ["top", "right", "bottom", "left"];

  sides.forEach((side) => {
    const border = getElementByTagNameNS(borders, side);
    if (border) {
      const val = border.getAttributeNS(WORD_NS, "val");
      const size = border.getAttributeNS(WORD_NS, "sz");
      const color = border.getAttributeNS(WORD_NS, "color");

      if (val && val !== "none") {
        const width = size
          ? `${Math.max(1, Number.parseInt(size) / 8)}px`
          : "1px";
        const borderColor = color && color !== "auto" ? `#${color}` : "#000000";
        styles.push(`border-${side}: ${width} solid ${borderColor}`);
      }
    }
  });

  return styles;
};

const getTableConditionalFormatting = (
  tblLook: Element | null
): {
  firstRow: boolean;
  lastRow: boolean;
  firstColumn: boolean;
  lastColumn: boolean;
  noHBand: boolean;
  noVBand: boolean;
} => {
  const defaultValue = {
    firstRow: false,
    lastRow: false,
    firstColumn: false,
    lastColumn: false,
    noHBand: false,
    noVBand: false,
  };

  if (!tblLook) return defaultValue;

  try {
    return {
      firstRow: tblLook.getAttributeNS(WORD_NS, "firstRow") === "1",
      lastRow: tblLook.getAttributeNS(WORD_NS, "lastRow") === "1",
      firstColumn: tblLook.getAttributeNS(WORD_NS, "firstColumn") === "1",
      lastColumn: tblLook.getAttributeNS(WORD_NS, "lastColumn") === "1",
      noHBand: tblLook.getAttributeNS(WORD_NS, "noHBand") === "1",
      noVBand: tblLook.getAttributeNS(WORD_NS, "noVBand") === "1",
    };
  } catch (error) {
    console.error("Error parsing table look:", error);
    return defaultValue;
  }
};

// const getTextStyles = (rPr: Element | null) => {
//   const styles: string[] = [];

//   if (!rPr) return styles;

//   // Font family
//   const rFonts = getElementByTagNameNS(rPr, "rFonts");
//   if (rFonts) {
//     const themeFont =
//       rFonts.getAttributeNS(WORD_NS, "asciiTheme") ||
//       rFonts.getAttributeNS(WORD_NS, "hAnsiTheme") ||
//       rFonts.getAttributeNS(WORD_NS, "cstheme");

//     if (themeFont) {
//       const fontFamily = mapThemeFont(themeFont);
//       styles.push(`font-family: ${fontFamily}`);
//     } else {
//       const fontFamily =
//         rFonts.getAttributeNS(WORD_NS, "ascii") ||
//         rFonts.getAttributeNS(WORD_NS, "hAnsi") ||
//         rFonts.getAttributeNS(WORD_NS, "cs");

//       if (fontFamily) {
//         styles.push(`font-family: "${fontFamily}, Arial, sans-serif"`);
//       }
//     }
//   }

//   // Font size
//   const sz = getElementByTagNameNS(rPr, "sz");
//   if (sz) {
//     const size = sz.getAttributeNS(WORD_NS, "val");
//     if (size) {
//       styles.push(`font-size: ${Number.parseInt(size) / 2}pt`);
//     }
//   }

//   // Text color
//   const color = getElementByTagNameNS(rPr, "color");
//   if (color) {
//     const val = color.getAttributeNS(WORD_NS, "val");
//     if (val && val !== "auto") {
//       styles.push(`color: #${val}`);
//     }
//   }

//   // Background color (highlight)
//   const highlight = getElementByTagNameNS(rPr, "highlight");
//   if (highlight) {
//     const val = highlight.getAttributeNS(WORD_NS, "val");
//     if (val) {
//       const backgroundColor = getHighlightColor(val);
//       styles.push(`background-color: ${backgroundColor}`);
//     }
//   }

//   // Background color (shading)
//   const shd = getElementByTagNameNS(rPr, "shd");
//   if (shd) {
//     const fill = shd.getAttributeNS(WORD_NS, "fill");
//     if (fill && fill !== "auto") {
//       styles.push(`background-color: #${fill}`);
//     }
//   }

//   // Vertical alignment (superscript/subscript)
//   const vertAlign = getElementByTagNameNS(rPr, "vertAlign");
//   if (vertAlign) {
//     const val = vertAlign.getAttributeNS(WORD_NS, "val");
//     switch (val) {
//       case "superscript":
//         styles.push("vertical-align: super");
//         styles.push("font-size: smaller");
//         break;
//       case "subscript":
//         styles.push("vertical-align: sub");
//         styles.push("font-size: smaller");
//         break;
//     }
//   }

//   // Strike through and double strike through
//   const strike = getElementByTagNameNS(rPr, "strike");
//   const dstrike = getElementByTagNameNS(rPr, "dstrike");
//   if (strike || dstrike) {
//     styles.push("text-decoration: line-through");
//   }

//   // Bold
//   if (getElementByTagNameNS(rPr, "b")) {
//     styles.push("font-weight: bold");
//   }

//   // Italic
//   if (getElementByTagNameNS(rPr, "i")) {
//     styles.push("font-style: italic");
//   }

//   // Underline
//   const u = getElementByTagNameNS(rPr, "u");
//   if (u) {
//     const val = u.getAttributeNS(WORD_NS, "val") || "single";
//     switch (val) {
//       case "double":
//         styles.push("text-decoration: underline double");
//         break;
//       case "wave":
//         styles.push("text-decoration: underline wavy");
//         break;
//       default:
//         styles.push("text-decoration: underline");
//     }
//   }

//   return styles;
// };

const getParagraphStyles = (pPr: any) => {
  const styles: string[] = [];

  if (!pPr) return styles;

  if (pPr.jc) {
    const alignment = pPr.jc["@_val"];
    switch (alignment?.toLowerCase()) {
      case "center":
        styles.push("text-align: center");
        styles.push("width: 100%");
        styles.push("display: block");
        break;
      case "right":
        styles.push("text-align: right");
        break;
      case "justify":
        styles.push("text-align: justify");
        break;
      default:
        styles.push("text-align: left");
    }
  }

  // Indentation
  if (pPr.ind) {
    const left = pPr.ind["@_left"];
    const right = pPr.ind["@_right"];
    const firstLine = pPr.ind["@_firstLine"];
    const hanging = pPr.ind["@_hanging"];

    if (left) styles.push(`margin-left: ${Number.parseInt(left) / 20}pt`);
    if (right) styles.push(`margin-right: ${Number.parseInt(right) / 20}pt`);
    if (firstLine)
      styles.push(`text-indent: ${Number.parseInt(firstLine) / 20}pt`);
    if (hanging)
      styles.push(`text-indent: -${Number.parseInt(hanging) / 20}pt`);
  }

  // Spacing
  if (pPr.spacing) {
    const before = pPr.spacing["@_before"];
    const after = pPr.spacing["@_after"];
    const line = pPr.spacing["@_line"];

    if (before) styles.push(`margin-top: ${Number.parseInt(before) / 20}pt`);
    if (after) styles.push(`margin-bottom: ${Number.parseInt(after) / 20}pt`);
    if (line) styles.push(`line-height: ${Number.parseInt(line) / 240}`);
  }

  return styles;
};

const getHighlightColor = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    yellow: "#FFFF00",
    green: "#00FF00",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    blue: "#0000FF",
    red: "#FF0000",
    darkBlue: "#000080",
    darkCyan: "#008080",
    darkGreen: "#008000",
    darkMagenta: "#800080",
    darkRed: "#800000",
    darkYellow: "#808000",
    darkGray: "#808080",
    lightGray: "#C0C0C0",
    black: "#000000",
  };
  return colorMap[color] || color;
};

const mapThemeFont = (themeFont: string): string => {
  const themeFontMap: { [key: string]: string } = {
    minorHAnsi: "Arial, sans-serif",
    minorBidi: "Arial, sans-serif",
    minorEastAsia: "Arial, sans-serif",
    majorHAnsi: "Times New Roman, serif",
    majorBidi: "Times New Roman, serif",
    majorEastAsia: "Times New Roman, serif",
  };
  return themeFontMap[themeFont] || "Arial, sans-serif";
};
const getMimeType = (extension: string): string | null => {
  const mimeTypes: { [key: string]: string } = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    webp: "image/webp",
    tiff: "image/tiff",
    tif: "image/tiff",
  };

  return mimeTypes[extension] || null;
};

const getTableStyles = (tblPr: Element | null): { [key: string]: string } => {
  const styles: { [key: string]: string } = {
    width: "100%",
    borderCollapse: "collapse",
  };

  if (!tblPr) return styles;

  const tblBorders = getElementByTagNameNS(tblPr, "tblBorders");
  if (tblBorders) {
    const borderStyles = getDetailedBorders(tblBorders);
    borderStyles.forEach((style) => {
      const [property, value] = style.split(": ");
      styles[property] = value;
    });
  }

  const tblW = getElementByTagNameNS(tblPr, "tblW");
  if (tblW) {
    const width = tblW.getAttributeNS(WORD_NS, "w");
    const type = tblW.getAttributeNS(WORD_NS, "type");
    if (width && type) {
      if (type === "pct") {
        styles.width = `${Number.parseInt(width) / 50}%`;
      } else if (type === "dxa") {
        styles.width = `${Number.parseInt(width) / 20}pt`;
      }
    }
  }

  return styles;
};
const getCellStyles = (
  tcPr: Element | null,
  rowIndex: number,
  cellIndex: number,
  conditionalFormatting: ReturnType<typeof getTableConditionalFormatting>,
  rowStyles: string[],
  tableStyleConfig: any = {}
): string[] => {
  const styles: string[] = [];

  if (tableStyleConfig) {
    if (rowIndex === 0 && tableStyleConfig.firstRow) {
      Object.entries(tableStyleConfig.firstRow).forEach(([key, value]) => {
        styles.push(
          `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`
        );
      });
    } else if (rowIndex % 2 === 0 && tableStyleConfig.evenRow) {
      Object.entries(tableStyleConfig.evenRow).forEach(([key, value]) => {
        styles.push(
          `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`
        );
      });
    } else if (rowIndex % 2 === 1 && tableStyleConfig.oddRow) {
      Object.entries(tableStyleConfig.oddRow).forEach(([key, value]) => {
        styles.push(
          `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`
        );
      });
    }

    if (tableStyleConfig.cell) {
      Object.entries(tableStyleConfig.cell).forEach(([key, value]) => {
        styles.push(
          `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`
        );
      });
    }
  }

  if (!tcPr) return styles;

  // Cell borders
  const tcBorders = getElementByTagNameNS(tcPr, "tcBorders");
  if (tcBorders) {
    const borderStyles = getDetailedBorders(tcBorders);
    styles.push(...borderStyles);
  }

  // Cell background color
  const shd = getElementByTagNameNS(tcPr, "shd");
  if (shd) {
    const fill = shd.getAttributeNS(WORD_NS, "fill");
    if (fill && fill !== "auto") {
      styles.push(`background-color: #${fill}`);
    }
  }

  const tcMar = getElementByTagNameNS(tcPr, "tcMar");
  if (tcMar) {
    const top = getElementByTagNameNS(tcMar, "top");
    const bottom = getElementByTagNameNS(tcMar, "bottom");
    const left = getElementByTagNameNS(tcMar, "left");
    const right = getElementByTagNameNS(tcMar, "right");

    if (top) {
      const val = top.getAttributeNS(WORD_NS, "w");
      if (val) styles.push(`padding-top: ${parseInt(val) / 20}pt`);
    }
    if (bottom) {
      const val = bottom.getAttributeNS(WORD_NS, "w");
      if (val) styles.push(`padding-bottom: ${parseInt(val) / 20}pt`);
    }
    if (left) {
      const val = left.getAttributeNS(WORD_NS, "w");
      if (val) styles.push(`padding-left: ${parseInt(val) / 20}pt`);
    }
    if (right) {
      const val = right.getAttributeNS(WORD_NS, "w");
      if (val) styles.push(`padding-right: ${parseInt(val) / 20}pt`);
    }
  }

  if (conditionalFormatting.firstColumn && cellIndex === 0) {
    styles.push("font-weight: bold");
  }

  return styles;
};

const processVerticalMerges = (content: string[][]) => {
  const rowCount = content.length;
  const colCount = content[0].length;

  for (let col = 0; col < colCount; col++) {
    let currentRowspan = 1;
    let startRow = 0;

    for (let row = 0; row < rowCount; row++) {
      const cell = content[row][col];
      if (cell && cell.includes('rowspan="1"')) {
        if (currentRowspan > 1) {
          content[startRow][col] = content[startRow][col].replace(
            'rowspan="1"',
            `rowspan="${currentRowspan}"`
          );
        }
        startRow = row;
        currentRowspan = 1;
      } else if (!cell) {
        currentRowspan++;
      }
    }

    if (currentRowspan > 1) {
      content[startRow][col] = content[startRow][col].replace(
        'rowspan="1"',
        `rowspan="${currentRowspan}"`
      );
    }
  }
};
