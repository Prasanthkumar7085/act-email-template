/**
 * Converts HTML to EditorJS blocks format
 * High-level extraction: tables → columns, divs → containers
 */

interface EditorJSBlock {
  id: string;
  type: string;
  data: any;
  tunes?: {
    alignment?: { alignment: string };
  };
}

interface EditorJSData {
  time: number;
  blocks: EditorJSBlock[];
  version: string;
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

  return styles;
}

/**
 * Extract computed styles (for better style preservation)
 */
function getComputedStyles(element: Element): Record<string, string> {
  const styles: Record<string, string> = {};

  // Try to get computed styles if in browser environment
  if (typeof window !== "undefined" && element instanceof HTMLElement) {
    const computed = window.getComputedStyle(element);
    const importantProps = [
      "color",
      "backgroundColor",
      "fontSize",
      "fontWeight",
      "fontFamily",
      "textAlign",
      "padding",
      "margin",
      "border",
      "borderRadius",
      "width",
      "height",
      "lineHeight",
    ];

    importantProps.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== "normal" && value !== "none" && value !== "0px") {
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelProp] = value;
      }
    });
  }

  return { ...styles, ...extractStyles(element) };
}

/**
 * Convert HTML element to EditorJS block
 */
function elementToBlock(
  element: Element,
  blockId: string
): EditorJSBlock | null {
  const tagName = element.tagName.toLowerCase();
  const styles = getComputedStyles(element);
  const textContent = element.textContent?.trim() || "";
  const innerHTML = element.innerHTML;

  switch (tagName) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return {
        id: blockId,
        type: "header",
        data: {
          text: innerHTML || textContent,
          level: parseInt(tagName.substring(1)),
        },
        tunes: styles.textAlign
          ? {
              alignment: { alignment: styles.textAlign },
            }
          : undefined,
      };

    case "p":
      return {
        id: blockId,
        type: "paragraph",
        data: {
          text: innerHTML || textContent,
        },
        tunes: styles.textAlign
          ? {
              alignment: { alignment: styles.textAlign },
            }
          : undefined,
      };

    case "img":
      return {
        id: blockId,
        type: "image",
        data: {
          url: element.getAttribute("src") || "",
          caption: element.getAttribute("alt") || "",
          stretched: false,
          withBorder: true,
          withBackground: false,
        },
      };

    case "ul":
    case "ol":
      const listItems: string[] = [];
      element.querySelectorAll("li").forEach((li) => {
        listItems.push(li.innerHTML || li.textContent || "");
      });
      return {
        id: blockId,
        type: "list",
        data: {
          style: tagName === "ul" ? "unordered" : "ordered",
          items: listItems,
        },
      };

    case "blockquote":
      return {
        id: blockId,
        type: "quote",
        data: {
          text: innerHTML || textContent,
          caption: "",
        },
      };

    case "hr":
      return {
        id: blockId,
        type: "delimiter",
        data: {},
      };

    case "button":
    case "a":
      const isButton =
        tagName === "button" ||
        element.classList.contains("button") ||
        element.getAttribute("role") === "button";

      if (isButton) {
        return {
          id: blockId,
          type: "button",
          data: {
            text: textContent,
            url:
              element.getAttribute("href") ||
              element.getAttribute("onclick") ||
              "#",
            alignment: styles.textAlign || "center",
            style: "primary",
            backgroundColor: styles.backgroundColor || "#06b6d4",
            textColor: styles.color || "#ffffff",
            padding: styles.padding || "12px 24px",
            borderRadius: styles.borderRadius || "8px",
          },
        };
      }
      // Fall through for regular links
      return {
        id: blockId,
        type: "paragraph",
        data: {
          text: innerHTML || textContent,
        },
      };

    default:
      // For unknown elements, try to extract as paragraph
      if (textContent) {
        return {
          id: blockId,
          type: "paragraph",
          data: {
            text: innerHTML || textContent,
          },
        };
      }
      return null;
  }
}

/**
 * Check if a div should be treated as a container
 */
function isContainerDiv(element: Element): boolean {
  if (element.tagName.toLowerCase() !== "div") return false;

  // Check if it has multiple direct children or specific container-like classes
  const directChildren = Array.from(element.children);
  const hasMultipleChildren = directChildren.length > 1;
  const hasContainerClass =
    element.classList.contains("container") ||
    element.classList.contains("wrapper") ||
    element.classList.contains("section") ||
    (element.getAttribute("class")?.includes("container") ?? false);

  // Check if div has styling that suggests it's a container
  const styles = getComputedStyles(element);
  const hasBgColor = !!(
    styles.backgroundColor &&
    styles.backgroundColor !== "transparent" &&
    styles.backgroundColor !== "rgba(0, 0, 0, 0)"
  );
  const hasPadding = !!(
    styles.padding &&
    parseInt(styles.padding.replace("px", "").split(" ")[0]) > 16
  );
  const hasContainerStyling = hasBgColor || hasPadding;

  return hasMultipleChildren || hasContainerClass || hasContainerStyling;
}

/**
 * Check if a table is used for layout (should become columns) vs data display
 */
function isLayoutTable(table: HTMLTableElement): boolean {
  // If table has role="presentation", it's definitely for layout
  if (table.getAttribute("role") === "presentation") return true;

  // If table has nested tables, it's likely for layout
  if (table.querySelector("table")) return true;

  // If table has few rows (1-3) and multiple columns, likely layout
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length <= 3 && rows.length > 0) {
    const avgCols =
      rows.reduce(
        (sum, row) => sum + row.querySelectorAll("td, th").length,
        0
      ) / rows.length;
    if (avgCols >= 2) return true;
  }

  return false;
}

/**
 * Convert table to columns layout
 */
function tableToColumns(
  table: HTMLTableElement,
  blockId: string
): EditorJSBlock {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) {
    // Empty table, return empty paragraph
    return {
      id: blockId,
      type: "paragraph",
      data: { text: "" },
    };
  }

  const maxCols = Math.max(
    ...rows.map((row) => row.querySelectorAll("td, th").length),
    1
  );

  // For single-row tables, create columns from cells
  // For multi-row tables, merge cells vertically by column
  const cols: Array<{ blocks: any[] }> = Array.from(
    { length: maxCols },
    () => ({ blocks: [] })
  );

  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    cells.forEach((cell, colIndex) => {
      if (colIndex < cols.length) {
        // Convert cell content to blocks
        const cellBlocks = convertElementChildren(
          cell,
          `${blockId}-row${rowIndex}-col${colIndex}`
        );
        if (cellBlocks.length > 0) {
          cols[colIndex].blocks.push(...cellBlocks);
        }
      }
    });
  });

  // Extract table styles
  const tableStyles = getComputedStyles(table);

  // Parse numeric values safely
  const borderRadius = tableStyles.borderRadius
    ? parseInt(tableStyles.borderRadius.replace("px", "")) || 8
    : 8;
  const padding = tableStyles.padding
    ? parseInt(tableStyles.padding.replace("px", "").split(" ")[0]) || 15
    : 15;

  // Get cell spacing for gap
  const cellSpacing = parseInt(table.getAttribute("cellspacing") || "0");
  const gap = cellSpacing > 0 ? cellSpacing : 20;

  return {
    id: blockId,
    type: "columns",
    data: {
      cols: cols,
      numberOfColumns: maxCols,
      layout: {
        gap: gap,
        backgroundColor: tableStyles.backgroundColor || "transparent",
        columnBackgroundColor: "#fafafa",
        borderColor: tableStyles.borderColor || "#e8e8eb",
        borderRadius: borderRadius,
        padding: padding,
        customCSS: "",
      },
    },
  };
}

/**
 * Convert div container to nested blocks
 */
function divToContainer(div: Element, blockId: string): EditorJSBlock[] {
  const children = Array.from(div.children);

  // If it's a simple container, just process children
  if (children.length === 0) {
    const textContent = div.textContent?.trim();
    if (textContent) {
      return [
        {
          id: blockId,
          type: "paragraph",
          data: { text: textContent },
        },
      ];
    }
    return [];
  }

  // Process children - for EditorJS, we process children directly
  // The container div's styles will be preserved in child elements where possible
  const childBlocks: EditorJSBlock[] = [];
  children.forEach((child, index) => {
    const childBlocksResult = convertElementToBlocks(
      child,
      `${blockId}-child${index}`
    );
    childBlocks.push(...childBlocksResult);
  });

  return childBlocks;
}

/**
 * Convert element's children to blocks
 */
function convertElementChildren(
  element: Element,
  parentId: string
): EditorJSBlock[] {
  const blocks: EditorJSBlock[] = [];
  let blockIndex = 0;

  // Process direct children first
  const directChildren = Array.from(element.children);

  if (directChildren.length > 0) {
    directChildren.forEach((child) => {
      const childId = `${parentId}-${blockIndex++}`;
      const childBlocks = convertElementToBlocks(child, childId);
      blocks.push(...childBlocks);
    });
  } else {
    // No children, process as text node
    const textContent = element.textContent?.trim();
    if (
      textContent &&
      element.tagName.toLowerCase() !== "script" &&
      element.tagName.toLowerCase() !== "style"
    ) {
      const block = elementToBlock(element, `${parentId}-${blockIndex++}`);
      if (block) blocks.push(block);
    }
  }

  return blocks;
}

/**
 * Convert a single element to blocks (handles high-level structures)
 */
function convertElementToBlocks(
  element: Element,
  blockId: string
): EditorJSBlock[] {
  const tagName = element.tagName.toLowerCase();

  // Handle tables - convert to columns if it's a layout table
  if (tagName === "table") {
    const table = element as HTMLTableElement;
    // Check if this is a layout table or should be converted to columns
    if (isLayoutTable(table)) {
      return [tableToColumns(table, blockId)];
    } else {
      // For data tables, process as regular content
      return convertElementChildren(element, blockId);
    }
  }

  // Handle container divs
  if (isContainerDiv(element)) {
    return divToContainer(element, blockId);
  }

  // Handle tbody, thead, tfoot - just process children
  if (tagName === "tbody" || tagName === "thead" || tagName === "tfoot") {
    return convertElementChildren(element, blockId);
  }

  // Handle td and th - process children (these are handled by parent table)
  if (tagName === "td" || tagName === "th") {
    return convertElementChildren(element, blockId);
  }

  // Handle regular elements
  const block = elementToBlock(element, blockId);
  if (block) {
    return [block];
  }

  // If element has children, process them
  return convertElementChildren(element, blockId);
}

/**
 * Main function to convert HTML string to EditorJS format
 */
export function htmlToEditorJS(htmlString: string): EditorJSData {
  const parser = new DOMParser();

  // Wrap in a container if needed
  const wrappedHtml = htmlString.trim().startsWith("<")
    ? htmlString
    : `<div>${htmlString}</div>`;

  const doc = parser.parseFromString(wrappedHtml, "text/html");

  // Get body content
  const body = doc.body;

  // Find the main content - skip wrapper divs/tables that are just containers
  let rootElements: Element[] = [];

  // If body has a single child div/table, process its children instead
  if (body.children.length === 1) {
    const singleChild = body.children[0];
    const childTag = singleChild.tagName.toLowerCase();

    // If it's a wrapper div or table, process its children
    if (childTag === "div" || childTag === "table") {
      rootElements = Array.from(singleChild.children);
    } else {
      rootElements = [singleChild];
    }
  } else {
    rootElements = Array.from(body.children);
  }

  const blocks: EditorJSBlock[] = [];
  let blockIndex = 0;

  // Process all root elements
  rootElements.forEach((element) => {
    const elementBlocks = convertElementToBlocks(
      element,
      `block-${blockIndex++}`
    );
    blocks.push(...elementBlocks);
  });

  // If no blocks were created, try to extract text content
  if (blocks.length === 0) {
    const textContent = body.textContent?.trim();
    if (textContent) {
      blocks.push({
        id: "block-0",
        type: "paragraph",
        data: {
          text: textContent,
        },
      });
    }
  }

  return {
    time: Date.now(),
    blocks: blocks,
    version: "2.30.8",
  };
}
