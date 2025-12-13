/**
 * Converts HTML to EditorJS blocks format
 * High-level extraction with proper block type detection
 */

interface EditorJSBlock {
  id: string;
  type: string;
  data: any;
  tunes?: {
    alignment?: { alignment: string };
    indentTune?: { indentLevel: number };
  };
}

interface EditorJSData {
  time: number;
  blocks: EditorJSBlock[];
  version: string;
}

/**
 * Generate unique ID for blocks
 */
function generateBlockId(prefix = "block"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Extract inline styles from an element
 */
function extractStyles(element: Element): Record<string, string> {
  const styles: Record<string, string> = {};
  const styleAttr = element.getAttribute("style");

  if (styleAttr) {
    styleAttr.split(";").forEach((rule) => {
      const [property, value] = rule.split(":").map((s) => s.trim());
      if (property && value) {
        // Convert CSS property names to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        styles[camelProperty] = value;
      }
    });
  }

  // Also extract common attributes as styles
  const bgColor = element.getAttribute("bgcolor");
  if (bgColor) styles.backgroundColor = bgColor;

  const align = element.getAttribute("align");
  if (align) styles.textAlign = align;

  const width = element.getAttribute("width");
  if (width) styles.width = width;

  const height = element.getAttribute("height");
  if (height) styles.height = height;

  const border = element.getAttribute("border");
  if (border) styles.border = border;

  return styles;
}

/**
 * Clean HTML content - preserve basic formatting
 */
function cleanHtmlContent(html: string): string {
  if (!html) return "";

  // Decode HTML entities
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  let cleaned = textarea.value;

  // Preserve line breaks
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");

  // Preserve basic formatting
  cleaned = cleaned.replace(/<strong>(.*?)<\/strong>/gi, "<strong>$1</strong>");
  cleaned = cleaned.replace(/<b>(.*?)<\/b>/gi, "<strong>$1</strong>");
  cleaned = cleaned.replace(/<em>(.*?)<\/em>/gi, "<em>$1</em>");
  cleaned = cleaned.replace(/<i>(.*?)<\/i>/gi, "<em>$1</em>");
  cleaned = cleaned.replace(/<u>(.*?)<\/u>/gi, "<u>$1</u>");
  cleaned = cleaned.replace(
    /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1(?:[^>]*?)>(.*?)<\/a>/gi,
    '<a href="$2">$3</a>'
  );

  // Remove other tags but keep content
  cleaned = cleaned.replace(/<[^>]+>/g, (match) => {
    const tag = match.toLowerCase();
    if (
      tag.startsWith("<br") ||
      tag.startsWith("<strong") ||
      tag.startsWith("<em") ||
      tag.startsWith("<u") ||
      tag.startsWith("<a ") ||
      tag.startsWith("</a>") ||
      tag.startsWith("</strong>") ||
      tag.startsWith("</em>") ||
      tag.startsWith("</u>")
    ) {
      return match;
    }
    return "";
  });

  // Normalize whitespace but preserve newlines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

  return cleaned.trim();
}

/**
 * Check if element is a button
 */
function isButton(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "button") return true;

  if (tagName === "a") {
    const styles = extractStyles(element);
    const hasButtonStyle =
      styles.backgroundColor ||
      (styles.padding && parseInt(styles.padding) > 8) ||
      styles.borderRadius ||
      styles.display === "inline-block" ||
      (styles.display === "block" && styles.textAlign === "center");

    const hasButtonClass =
      element.className.includes("button") ||
      element.className.includes("btn") ||
      element.getAttribute("role") === "button";

    return hasButtonStyle || hasButtonClass;
  }

  return false;
}

/**
 * Check if element is a divider/horizontal line
 */
function isDivider(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "hr") return true;

  if (tagName === "div") {
    const styles = extractStyles(element);
    const textContent = element.textContent?.trim() || "";
    const hasChildren = element.children.length > 0;

    // Check for common divider patterns
    const height = styles.height || "";
    const borderTop = styles.borderTop || "";
    const border = styles.border || "";
    const bgColor = styles.backgroundColor || "";

    // Empty div with specific styling that suggests divider
    if ((!textContent || textContent === "") && !hasChildren) {
      // Height-based divider (1px, 2px, etc.)
      const heightMatch = height.match(/(\d+)px/);
      if (heightMatch) {
        const heightValue = parseInt(heightMatch[1]);
        if (heightValue <= 5 && heightValue > 0) return true;
      }

      // Border-top divider
      if (borderTop.includes("1px") || borderTop.includes("2px")) return true;

      // Single border
      if (border === "none" && borderTop) {
        if (borderTop.includes("1px") || borderTop.includes("2px")) return true;
      }

      // Background color with small height
      if (bgColor && (height === "1px" || height === "2px")) return true;
    }

    // Check if div contains only an hr
    if (
      element.children.length === 1 &&
      element.children[0].tagName.toLowerCase() === "hr"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if element is a container with meaningful content
 */
function isContainer(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  if (tagName !== "div") return false;

  const styles = extractStyles(element);
  const hasMultipleChildren = element.children.length > 1;
  const hasTextContent = element.textContent?.trim().length > 0;

  // Check for container styling
  const hasContainerStyle =
    (styles.backgroundColor && styles.backgroundColor !== "transparent") ||
    (styles.padding && parseInt(styles.padding.replace("px", "")) > 16) ||
    (styles.margin && parseInt(styles.margin.replace("px", "")) > 16) ||
    (styles.border && styles.border !== "none") ||
    (styles.borderRadius &&
      parseInt(styles.borderRadius.replace("px", "")) > 0);

  return hasMultipleChildren || hasContainerStyle;
}

/**
 * Check if table is for layout (should be converted to separate blocks, not columns)
 */
function isLayoutTable(table: HTMLTableElement): boolean {
  if (table.getAttribute("role") === "presentation") return true;

  const rows = Array.from(table.rows);
  if (rows.length === 0) return false;

  // Single row with multiple cells often indicates layout
  if (rows.length === 1) {
    const cells = Array.from(rows[0].cells);
    return cells.length >= 2;
  }

  // Check for nested tables
  if (table.querySelector("table")) return true;

  // Simple heuristic: if most cells contain text/paragraphs rather than complex content
  let textCellCount = 0;
  let totalCells = 0;

  rows.forEach((row) => {
    Array.from(row.cells).forEach((cell) => {
      totalCells++;
      const hasComplexContent =
        cell.querySelector("table") ||
        cell.querySelector("ul") ||
        cell.querySelector("ol") ||
        cell.children.length > 3;

      if (!hasComplexContent && cell.textContent?.trim()) {
        textCellCount++;
      }
    });
  });

  return textCellCount > totalCells * 0.6;
}

/**
 * Process heading element
 */
function processHeadingElement(
  element: Element,
  blockId: string
): EditorJSBlock {
  const levelMatch = element.tagName.match(/h(\d)/i);
  const level = levelMatch
    ? Math.min(Math.max(parseInt(levelMatch[1]), 1), 6)
    : 2;
  const styles = extractStyles(element);

  return {
    id: blockId,
    type: "header",
    data: {
      text: cleanHtmlContent(element.innerHTML || element.textContent || ""),
      level: level,
    },
    tunes: {
      alignment: {
        alignment: styles.textAlign || "left",
      },
      indentTune: {
        indentLevel: 0,
      },
    },
  };
}

/**
 * Process paragraph element
 */
function processParagraphElement(
  element: Element,
  blockId: string
): EditorJSBlock {
  const styles = extractStyles(element);

  return {
    id: blockId,
    type: "paragraph",
    data: {
      text: cleanHtmlContent(element.innerHTML || element.textContent || ""),
    },
    tunes: {
      alignment: {
        alignment: styles.textAlign || "left",
      },
      indentTune: {
        indentLevel: 0,
      },
    },
  };
}

/**
 * Process list element with proper nested structure
 */
function processListElement(element: Element, blockId: string): EditorJSBlock {
  const tagName = element.tagName.toLowerCase();
  const isOrdered = tagName === "ol";

  // Helper function to process list items recursively
  function processListItem(li: Element): any {
    // Get content (remove nested list items from this level's content)
    let content = li.innerHTML || "";

    // Extract nested lists
    const nestedItems: any[] = [];
    const childElements = Array.from(li.children);

    // Remove nested lists from content and process them
    childElements.forEach((child) => {
      const childTag = child.tagName.toLowerCase();
      if (childTag === "ul" || childTag === "ol") {
        // Remove this nested list from the content
        content = content.replace(child.outerHTML, "");

        // Process nested list items
        Array.from(child.querySelectorAll("li")).forEach((nestedLi) => {
          nestedItems.push(processListItem(nestedLi));
        });
      }
    });

    // Clean up the content
    content = cleanHtmlContent(content);

    return {
      content: content,
      meta: {},
      items: nestedItems,
    };
  }

  const items: any[] = [];
  Array.from(element.querySelectorAll("li")).forEach((li) => {
    items.push(processListItem(li));
  });

  return {
    id: blockId,
    type: "list",
    data: {
      style: isOrdered ? "ordered" : "unordered",
      meta: isOrdered ? { counterType: "numeric" } : {},
      items: items,
    },
    tunes: {
      alignment: {
        alignment: "left",
      },
    },
  };
}

/**
 * Process button element
 */
function processButtonElement(
  element: Element,
  blockId: string
): EditorJSBlock {
  const styles = extractStyles(element);
  const text = element.textContent?.trim() || "";
  const href = element.getAttribute("href") || "#";
  const target = element.getAttribute("target") || "_blank";

  // Determine button style
  let buttonStyle = "filled";
  if (styles.backgroundColor) {
    buttonStyle = "filled";
  } else if (styles.border && styles.border !== "none") {
    buttonStyle = "outlined";
  }

  // Determine button size based on padding
  let size = "medium";
  if (styles.padding) {
    const paddingMatch = styles.padding.match(/(\d+)px/);
    if (paddingMatch) {
      const paddingValue = parseInt(paddingMatch[1]);
      if (paddingValue < 8) size = "small";
      else if (paddingValue > 16) size = "large";
    }
  }

  return {
    id: blockId,
    type: "button",
    data: {
      text: text,
      url: href,
      style: buttonStyle,
      color: styles.color || "#ffffff",
      backgroundColor: styles.backgroundColor || "#3b82f6",
      align: styles.textAlign || "left",
      target: target,
      size: size,
    },
  };
}

/**
 * Process image element
 */
function processImageElement(element: Element, blockId: string): EditorJSBlock {
  const src = element.getAttribute("src") || "";
  const alt = element.getAttribute("alt") || "";
  const styles = extractStyles(element);

  let width = "auto";
  let height = "auto";

  if (styles.width) width = styles.width;
  if (styles.height) height = styles.height;

  return {
    id: blockId,
    type: "image",
    data: {
      file: {
        url: src,
      },
      caption: alt,
      dimensions: {
        width: width,
        height: height,
      },
      rotation: 0,
      aspectRatio: "free",
      flipX: false,
      flipY: false,
      zoom: 1,
    },
  };
}

/**
 * Process divider element - IMPORTANT: Fixed to match your format
 */
function processDividerElement(
  element: Element,
  blockId: string
): EditorJSBlock {
  const tagName = element.tagName.toLowerCase();
  const styles = extractStyles(element);

  let thickness = 2;
  let color = "#9e9e9e";
  let dividerStyle = "solid";

  if (tagName === "hr") {
    // Extract from HR element
    thickness = 2;
    color = styles.color || "#9e9e9e";
  } else if (tagName === "div") {
    // Extract from styled div
    const heightMatch = styles.height?.match(/(\d+)px/);
    if (heightMatch) {
      thickness = parseInt(heightMatch[1]);
    }

    // Check border-top for color
    if (styles.borderTop) {
      const borderMatch = styles.borderTop.match(
        /(\d+)px\s+(\w+)\s+(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|\w+)/
      );
      if (borderMatch) {
        thickness = parseInt(borderMatch[1]) || thickness;
        color = borderMatch[3] || color;
        if (borderMatch[2] === "dashed") dividerStyle = "dashed";
      }
    }

    // Check background color
    if (styles.backgroundColor) {
      color = styles.backgroundColor;
    }

    // Check border color
    if (styles.borderColor) {
      color = styles.borderColor;
    }
  }

  // Ensure valid values
  thickness = Math.max(1, Math.min(thickness, 10));

  return {
    id: blockId,
    type: "horizontalLine",
    data: {
      style: dividerStyle,
      thickness: thickness,
      color: color,
      alignment: "center",
      length: "full",
      indentLevel: 0,
    },
    tunes: {
      indentTune: {
        indentLevel: 0,
      },
    },
  };
}

/**
 * Process table element as separate blocks (not columns)
 */
function processTableAsBlocks(
  table: HTMLTableElement,
  parentId: string
): EditorJSBlock[] {
  const blocks: EditorJSBlock[] = [];
  const rows = Array.from(table.rows);

  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.cells);

    // Process each cell as separate content
    cells.forEach((cell, cellIndex) => {
      const cellBlocks = processElementToBlocks(
        cell,
        `${parentId}-row${rowIndex}-cell${cellIndex}`
      );
      blocks.push(...cellBlocks);
    });

    // Add empty paragraph between rows for spacing (except last row)
    if (rowIndex < rows.length - 1) {
      blocks.push({
        id: generateBlockId("spacer"),
        type: "paragraph",
        data: { text: "" },
        tunes: {
          alignment: { alignment: "left" },
          indentTune: { indentLevel: 0 },
        },
      });
    }
  });

  return blocks;
}

/**
 * Process data table for table block
 */
function processDataTable(
  table: HTMLTableElement,
  blockId: string
): EditorJSBlock {
  const rows = Array.from(table.rows);
  const content: string[][] = [];
  const cellStyles: any = {};

  rows.forEach((row, rowIndex) => {
    const rowContent: string[] = [];
    Array.from(row.cells).forEach((cell, cellIndex) => {
      const cellText = cleanHtmlContent(
        cell.innerHTML || cell.textContent || ""
      );
      rowContent.push(cellText);

      // Extract cell styles
      const styles = extractStyles(cell);
      if (Object.keys(styles).length > 0) {
        if (!cellStyles[rowIndex]) cellStyles[rowIndex] = {};
        cellStyles[rowIndex][cellIndex] = {
          borderColor: styles.borderColor || "rgb(209, 213, 219)",
          borderWidth: styles.borderWidth || "1px",
          borderStyle: styles.borderStyle || "solid",
          ...styles,
        };
      }
    });
    content.push(rowContent);
  });

  const hasHeader = table.querySelector("th") !== null;
  const tableStyles = extractStyles(table);

  return {
    id: blockId,
    type: "table",
    data: {
      id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      content: content,
      withHeading: hasHeader,
      headerRows: hasHeader ? [0] : [],
      styles: {
        table: {
          width: tableStyles.width || "100%",
          height: tableStyles.height || "auto",
          backgroundColor: tableStyles.backgroundColor || "#ffffff",
          borderColor: tableStyles.borderColor || "#d1d5db",
          borderWidth: tableStyles.borderWidth || "1px",
          borderStyle: tableStyles.borderStyle || "solid",
          position: "relative",
          tableLayout: "fixed",
          ...tableStyles,
        },
        rows: {},
        cells: cellStyles,
      },
    },
  };
}

/**
 * Process container div - treat as separate blocks, not columns
 */
function processContainerDiv(
  element: Element,
  parentId: string
): EditorJSBlock[] {
  const blocks: EditorJSBlock[] = [];
  const children = Array.from(element.children);

  if (children.length === 0) {
    // Empty container
    const textContent = element.textContent?.trim();
    if (textContent) {
      blocks.push(
        processParagraphElement(element, generateBlockId("paragraph"))
      );
    }
  } else {
    children.forEach((child, index) => {
      const childBlocks = processElementToBlocks(
        child,
        `${parentId}-child${index}`
      );
      blocks.push(...childBlocks);
    });
  }

  return blocks;
}

/**
 * Process element children
 */
function processElementChildren(
  element: Element,
  parentId: string
): EditorJSBlock[] {
  const blocks: EditorJSBlock[] = [];

  // Process direct children that are elements
  const childElements = Array.from(element.children);

  if (childElements.length === 0) {
    // No child elements, check for text content
    const textContent = element.textContent?.trim();
    if (
      textContent &&
      element.tagName.toLowerCase() !== "script" &&
      element.tagName.toLowerCase() !== "style"
    ) {
      // Check if this is an inline element
      const tagName = element.tagName.toLowerCase();
      const inlineElements = [
        "span",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "a",
        "code",
      ];

      if (inlineElements.includes(tagName)) {
        // Wrap inline content in paragraph
        blocks.push({
          id: generateBlockId("paragraph"),
          type: "paragraph",
          data: {
            text: cleanHtmlContent(element.outerHTML || textContent),
          },
          tunes: {
            alignment: { alignment: "left" },
            indentTune: { indentLevel: 0 },
          },
        });
      } else {
        blocks.push(
          processParagraphElement(element, generateBlockId("paragraph"))
        );
      }
    }
  } else {
    childElements.forEach((child, index) => {
      const childBlocks = processElementToBlocks(child, `${parentId}-${index}`);
      blocks.push(...childBlocks);
    });
  }

  return blocks;
}

/**
 * Convert element to EditorJS blocks
 */
function processElementToBlocks(
  element: Element,
  blockId: string
): EditorJSBlock[] {
  const tagName = element.tagName.toLowerCase();

  // Skip unwanted elements
  if (tagName === "script" || tagName === "style" || tagName === "noscript") {
    return [];
  }

  // Handle comments
  if (element.nodeType === 8) {
    // Comment node
    return [];
  }

  // Check for button first
  if (isButton(element)) {
    return [processButtonElement(element, blockId)];
  }

  // Check for divider
  if (isDivider(element)) {
    return [processDividerElement(element, blockId)];
  }

  // Check for container
  if (isContainer(element)) {
    return processContainerDiv(element, blockId);
  }

  // Handle specific element types
  switch (tagName) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return [processHeadingElement(element, blockId)];

    case "p":
      return [processParagraphElement(element, blockId)];

    case "ul":
    case "ol":
      return [processListElement(element, blockId)];

    case "img":
      return [processImageElement(element, blockId)];

    case "table":
      const table = element as HTMLTableElement;
      if (isLayoutTable(table)) {
        // For layout tables, process as separate blocks
        return processTableAsBlocks(table, blockId);
      } else {
        // For data tables, create table block
        return [processDataTable(table, blockId)];
      }

    case "br":
      // Add empty paragraph for line break
      return [
        {
          id: blockId,
          type: "paragraph",
          data: { text: "" },
          tunes: {
            alignment: { alignment: "left" },
            indentTune: { indentLevel: 0 },
          },
        },
      ];

    case "hr":
      return [processDividerElement(element, blockId)];

    case "div":
      // Regular div with content
      if (element.textContent?.trim() && element.children.length === 0) {
        return [processParagraphElement(element, blockId)];
      }
      // Div with children - process them
      return processElementChildren(element, blockId);

    case "span":
    case "strong":
    case "b":
    case "em":
    case "i":
    case "u":
    case "a":
      // Inline elements - wrap in paragraph
      const text = cleanHtmlContent(
        element.outerHTML || element.textContent || ""
      );
      if (text.trim()) {
        return [
          {
            id: blockId,
            type: "paragraph",
            data: { text: text },
            tunes: {
              alignment: { alignment: "left" },
              indentTune: { indentLevel: 0 },
            },
          },
        ];
      }
      return [];

    default:
      // For other elements, process children
      return processElementChildren(element, blockId);
  }
}

/**
 * Main function to convert HTML to EditorJS blocks
 */
export function htmlToEditorJS(htmlString: string): EditorJSData {
  const parser = new DOMParser();

  // Clean HTML - remove comments and normalize
  const cleanedHtml = htmlString
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const doc = parser.parseFromString(cleanedHtml, "text/html");
  const body = doc.body;

  // Get root elements from body
  const rootElements = Array.from(body.children);
  const blocks: EditorJSBlock[] = [];

  // Handle case where body has direct text
  if (rootElements.length === 0 && body.textContent?.trim()) {
    blocks.push({
      id: generateBlockId("paragraph"),
      type: "paragraph",
      data: {
        text: cleanHtmlContent(body.textContent),
      },
      tunes: {
        alignment: { alignment: "left" },
        indentTune: { indentLevel: 0 },
      },
    });
  } else {
    // Process each root element
    rootElements.forEach((element, index) => {
      const elementBlocks = processElementToBlocks(
        element,
        generateBlockId(`root-${index}`)
      );
      blocks.push(...elementBlocks);
    });
  }

  // Filter out completely empty blocks
  const filteredBlocks = blocks.filter((block) => {
    if (block.type === "paragraph" || block.type === "header") {
      const text = block.data?.text || "";
      return (
        text.trim().length > 0 ||
        (block.type === "paragraph" && text.includes("\n"))
      );
    }
    return true;
  });

  // Add empty paragraph if no blocks (to match EditorJS format)
  if (filteredBlocks.length === 0) {
    filteredBlocks.push({
      id: generateBlockId("empty"),
      type: "paragraph",
      data: { text: "" },
      tunes: {
        alignment: { alignment: "left" },
        indentTune: { indentLevel: 0 },
      },
    });
  }

  return {
    time: Date.now(),
    blocks: filteredBlocks,
    version: "2.31.0",
  };
}
