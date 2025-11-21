export const parseAdvancedTxtFile = async (file: File): Promise<any> => {
  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    const blocks: any[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      if (line === "") {
        i++;
        continue;
      }

      if (isTableRow(line)) {
        const tableResult = parseTable(lines, i);
        if (tableResult.table) {
          blocks.push(tableResult.table);
          i = tableResult.nextIndex;
          continue;
        }
      }

      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (isUnderline(nextLine, line.length)) {
          const level = nextLine.startsWith("=") ? 1 : 2;
          blocks.push({
            type: "header",
            data: {
              text: line,
              level: level,
            },
          });
          i += 2;
          continue;
        }
      }

      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        blocks.push({
          type: "header",
          data: {
            text: headerMatch[2],
            level: headerMatch[1].length,
          },
        });
        i++;
        continue;
      }

      const listResult = parseList(lines, i);
      if (listResult.list) {
        blocks.push(listResult.list);
        i = listResult.nextIndex;
        continue;
      }

      if (line.startsWith("```") || line.startsWith("~~~")) {
        const codeResult = parseCodeBlock(lines, i);
        if (codeResult.code) {
          blocks.push(codeResult.code);
          i = codeResult.nextIndex;
          continue;
        }
      }

      const paragraphResult = parseParagraph(lines, i);
      blocks.push(paragraphResult.paragraph);
      i = paragraphResult.nextIndex;
    }

    return {
      headers: [],
      main: blocks,
      footers: [],
    };
  } catch (error) {
    console.error("Error parsing advanced TXT file:", error);
    throw new Error("Failed to parse TXT file");
  }
};

const isTableRow = (line: string): boolean => {
  return line.includes("|") || line.includes("\t") || /\s{3,}/.test(line);
};

const parseTable = (
  lines: string[],
  startIndex: number
): { table: any | null; nextIndex: number } => {
  const tableLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") break;
    if (!isTableRow(line)) break;
    tableLines.push(line);
    i++;
  }

  if (tableLines.length < 2) {
    return { table: null, nextIndex: startIndex + 1 };
  }

  const content: string[][] = [];
  const separator = tableLines[0].includes("|") ? "|" : "\t";

  for (const line of tableLines) {
    if (line.match(/^[\s|\-+=]+$/)) continue;

    const cells = line
      .split(separator)
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");
    if (cells.length > 1) {
      content.push(cells);
    }
  }

  if (content.length === 0) {
    return { table: null, nextIndex: startIndex + 1 };
  }

  return {
    table: {
      type: "table",
      data: {
        content: content,
        withHeading: true,
      },
    },
    nextIndex: i,
  };
};

const isUnderline = (line: string, expectedLength: number): boolean => {
  if (line.length === 0) return false;
  const char = line[0];
  return (
    (char === "=" || char === "-") &&
    line.split("").every((c) => c === char || c === " ") &&
    line.replace(/\s/g, "").length >= Math.min(3, expectedLength * 0.5)
  );
};

const parseList = (
  lines: string[],
  startIndex: number
): { list: any | null; nextIndex: number } => {
  const listItems: any[] = [];
  let i = startIndex;
  let listStyle: "ordered" | "unordered" | null = null;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") {
      i++;
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*+•]|\d+[.)])\s+(.+)$/);
    if (!listMatch) break;

    const indent = listMatch[1].length;
    const marker = listMatch[2];
    const content = listMatch[3];
    const isOrdered = /\d+[.)]/.test(marker);

    if (listStyle === null) {
      listStyle = isOrdered ? "ordered" : "unordered";
    } else if ((listStyle === "ordered") !== isOrdered) {
      break;
    }

    listItems.push({
      content: content,
      level: Math.floor(indent / 2),
      items: [],
    });

    i++;
  }

  if (listItems.length === 0) {
    return { list: null, nextIndex: startIndex + 1 };
  }

  return {
    list: {
      type: "list",
      data: {
        style: listStyle,
        items: listItems,
      },
    },
    nextIndex: i,
  };
};

const parseCodeBlock = (
  lines: string[],
  startIndex: number
): { code: any | null; nextIndex: number } => {
  const startLine = lines[startIndex].trim();
  const delimiter = startLine.startsWith("```") ? "```" : "~~~";
  const language = startLine.substring(3).trim();

  let i = startIndex + 1;
  const codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith(delimiter)) {
      i++;
      break;
    }
    codeLines.push(line);
    i++;
  }

  return {
    code: {
      type: "code",
      data: {
        code: codeLines.join("\n"),
        language: language || "text",
      },
    },
    nextIndex: i,
  };
};

const parseParagraph = (
  lines: string[],
  startIndex: number
): { paragraph: any; nextIndex: number } => {
  let text = "";
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") break;

    if (
      line.match(/^#{1,6}\s+/) ||
      line.match(/^(\s*)([-*+•]|\d+[.)])\s+/) ||
      line.startsWith("```") ||
      line.startsWith("~~~") ||
      isTableRow(line)
    ) {
      // Table
      break;
    }

    if (text) {
      text += " " + line;
    } else {
      text = line;
    }
    i++;
  }

  return {
    paragraph: {
      type: "paragraph",
      data: {
        text: text || lines[startIndex].trim(),
      },
    },
    nextIndex: Math.max(i, startIndex + 1),
  };
};
