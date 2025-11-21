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
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

const sanitizeHTML = (html: string): string => {
  // For production, consider using DOMPurify
  // This is a basic implementation
  return html;
};

/**
 * Get alignment CSS from block tunes
 */
const getAlignmentStyle = (block: EditorJSBlock): string => {
  const alignment = block.tunes?.alignment?.alignment;
  if (alignment && alignment !== "left") {
    return `text-align: ${alignment};`;
  }
  return "";
};

/**
 * Get indent CSS from block tunes
 */
const getIndentStyle = (block: EditorJSBlock): string => {
  const indentLevel = block.tunes?.indentTune?.indentLevel;
  if (indentLevel && indentLevel > 0) {
    return `margin-left: ${indentLevel * 40}px;`;
  }
  return "";
};

/**
 * Combine all block-level styles
 */
const getBlockStyles = (block: EditorJSBlock): string => {
  const styles = [getAlignmentStyle(block), getIndentStyle(block)].filter(
    Boolean
  );

  return styles.length > 0 ? ` style="${styles.join(" ")}"` : "";
};

/**
 * Convert paragraph block to HTML
 */
const convertParagraph = (block: EditorJSBlock): string => {
  const text = sanitizeHTML(block.data.text || "");
  const blockStyles = getBlockStyles(block);
  return `<p${blockStyles}>${text}</p>`;
};

/**
 * Convert header block to HTML
 */
const convertHeader = (block: EditorJSBlock): string => {
  const level = block.data.level || 2;
  const text = sanitizeHTML(block.data.text || "");
  const blockStyles = getBlockStyles(block);
  return `<h${level}${blockStyles}>${text}</h${level}>`;
};

/**
 * Convert list block to HTML with nested support
 */
const convertList = (block: EditorJSBlock): string => {
  const { style, items = [], meta = {} } = block.data;
  const listTag = style === "ordered" ? "ol" : "ul";

  // Handle counter type for ordered lists
  let listAttrs = "";
  if (style === "ordered" && meta.counterType) {
    const typeMap: Record<string, string> = {
      numeric: "1",
      "lower-alpha": "a",
      "upper-alpha": "A",
      "lower-roman": "i",
      "upper-roman": "I",
    };
    const type = typeMap[meta.counterType] || "1";
    listAttrs = ` type="${type}"`;
  }

  const blockStyles = getBlockStyles(block);

  // Recursively render list items
  const renderItems = (items: any[]): string => {
    return items
      .map((item) => {
        let html = `<li>${sanitizeHTML(item.content || "")}`;

        // Handle nested items
        if (item.items && item.items.length > 0) {
          const nestedStyle = item.meta?.style || style;
          const nestedTag = nestedStyle === "ordered" ? "ol" : "ul";
          html += `<${nestedTag}>${renderItems(item.items)}</${nestedTag}>`;
        }

        html += "</li>";
        return html;
      })
      .join("");
  };

  return `<${listTag}${listAttrs}${blockStyles}>${renderItems(items)}</${listTag}>`;
};

/**
 * Convert table block to HTML with full styling
 */
const convertTable = (block: EditorJSBlock): string => {
  const {
    content = [],
    withHeading = false,
    headerRows = [],
    styles = {},
  } = block.data;

  if (!content || content.length === 0) {
    return "";
  }

  // Extract table-level styles
  const tableStyles = styles.table || {};
  const cellStyles = styles.cells || {};
  const rowStyles = styles.rows || {};

  // Convert camelCase to kebab-case for CSS
  const camelToKebab = (str: string): string => {
    return str.replace(/([A-Z])/g, "-$1").toLowerCase();
  };

  // Build table style string
  const tableStyleStr = Object.entries(tableStyles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join("; ");

  let html = `<table${tableStyleStr ? ` style="${tableStyleStr}"` : ""}>`;

  // Process header rows if specified
  if (withHeading && headerRows.length > 0) {
    html += "<thead>";
    headerRows.forEach((rowIndex: number) => {
      if (content[rowIndex]) {
        html += processTableRow(
          content[rowIndex],
          rowIndex,
          true,
          cellStyles,
          rowStyles
        );
      }
    });
    html += "</thead>";
  }

  // Process body rows
  html += "<tbody>";
  content.forEach((row: any[], rowIndex: number) => {
    // Skip header rows
    if (withHeading && headerRows.includes(rowIndex)) {
      return;
    }
    html += processTableRow(row, rowIndex, false, cellStyles, rowStyles);
  });
  html += "</tbody>";

  html += "</table>";
  return html;
};

/**
 * Process a single table row
 */
const processTableRow = (
  row: any[],
  rowIndex: number,
  isHeader: boolean,
  cellStyles: any,
  rowStyles: any
): string => {
  const tag = isHeader ? "th" : "td";

  // Get row-specific styles
  const rowStyle = rowStyles[rowIndex];
  const rowStyleStr = rowStyle
    ? Object.entries(rowStyle)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
        .join("; ")
    : "";

  let html = `<tr${rowStyleStr ? ` style="${rowStyleStr}"` : ""}>`;

  // Process each cell
  row.forEach((cell: string, cellIndex: number) => {
    const cellStyleObj = cellStyles[rowIndex]?.[cellIndex] || {};
    const cellStyleParts: string[] = [];
    let colSpan = "";
    let rowSpan = "";

    // Extract cell properties
    Object.entries(cellStyleObj).forEach(([key, value]) => {
      if (key === "colSpan" && typeof value === "number" && value > 1) {
        colSpan = ` colspan="${value}"`;
      } else if (key === "rowSpan" && typeof value === "number" && value > 1) {
        rowSpan = ` rowspan="${value}"`;
      } else {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        cellStyleParts.push(`${cssKey}: ${value}`);
      }
    });

    const cellStyle =
      cellStyleParts.length > 0 ? ` style="${cellStyleParts.join("; ")}"` : "";

    html += `<${tag}${cellStyle}${colSpan}${rowSpan}>${sanitizeHTML(cell)}</${tag}>`;
  });

  html += "</tr>";
  return html;
};

/**
 * Convert image block to HTML
 */
const convertImage = (block: EditorJSBlock): string => {
  const {
    file,
    caption = "",
    dimensions = {},
    rotation = 0,
    flipX = false,
    flipY = false,
  } = block.data;

  if (!file || !file.url) {
    return "";
  }

  const styles: string[] = [];

  if (dimensions.width) {
    styles.push(`width: ${dimensions.width}`);
  }
  if (dimensions.height) {
    styles.push(`height: ${dimensions.height}`);
  }

  // Handle transformations
  const transforms: string[] = [];
  if (rotation) {
    transforms.push(`rotate(${rotation}deg)`);
  }
  if (flipX) {
    transforms.push("scaleX(-1)");
  }
  if (flipY) {
    transforms.push("scaleY(-1)");
  }

  if (transforms.length > 0) {
    styles.push(`transform: ${transforms.join(" ")}`);
  }

  const styleAttr = styles.length > 0 ? ` style="${styles.join("; ")}"` : "";
  const blockStyles = getBlockStyles(block);

  let html = `<figure${blockStyles}>`;
  html += `<img src="${file.url}" alt="${caption}"${styleAttr} />`;

  if (caption) {
    html += `<figcaption>${sanitizeHTML(caption)}</figcaption>`;
  }

  html += "</figure>";
  return html;
};

/**
 * Convert quote block to HTML
 */
const convertQuote = (block: EditorJSBlock): string => {
  const text = sanitizeHTML(block.data.text || "");
  const caption = block.data.caption
    ? `<cite>${sanitizeHTML(block.data.caption)}</cite>`
    : "";
  const blockStyles = getBlockStyles(block);

  return `<blockquote${blockStyles}><p>${text}</p>${caption}</blockquote>`;
};

/**
 * Convert code block to HTML
 */
const convertCode = (block: EditorJSBlock): string => {
  const code = block.data.code || "";
  const blockStyles = getBlockStyles(block);

  // Escape HTML in code blocks
  const escapedCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return `<pre${blockStyles}><code>${escapedCode}</code></pre>`;
};

/**
 * Convert delimiter block to HTML
 */
const convertDelimiter = (): string => {
  return "<hr />";
};

/**
 * Convert raw HTML block
 */
const convertRaw = (block: EditorJSBlock): string => {
  return block.data.html || "";
};

/**
 * Convert embed block to HTML
 */
const convertEmbed = (block: EditorJSBlock): string => {
  const { embed, width = 640, height = 360, caption = "" } = block.data;

  if (!embed) {
    return "";
  }

  const blockStyles = getBlockStyles(block);

  let html = `<figure${blockStyles}>`;
  html += `<iframe src="${embed}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  if (caption) {
    html += `<figcaption>${sanitizeHTML(caption)}</figcaption>`;
  }

  html += "</figure>";
  return html;
};

/**
 * Main converter: EditorJS blocks to HTML
 */
export const convertEditorJSToHTML = (data: any): string => {
  // Handle nested structure {"0": {blocks: []}} or direct {blocks: []}
  let editorData: EditorJSData;

  if (data?.["0"]) {
    editorData = data?.["0"];
  } else if (data?.blocks) {
    editorData = data;
  } else {
    console.error("Invalid EditorJS data structure");
    return "";
  }

  if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
    console.error("No blocks found in EditorJS data");
    return "";
  }

  const htmlBlocks: string[] = [];

  editorData.blocks.forEach((block: EditorJSBlock) => {
    try {
      let html = "";

      switch (block.type) {
        case "paragraph":
          html = convertParagraph(block);
          break;

        case "header":
          html = convertHeader(block);
          break;

        case "list":
          html = convertList(block);
          break;

        case "table":
          html = convertTable(block);
          break;

        case "image":
          html = convertImage(block);
          break;

        case "quote":
          html = convertQuote(block);
          break;

        case "code":
          html = convertCode(block);
          break;

        case "delimiter":
          html = convertDelimiter();
          break;

        case "raw":
          html = convertRaw(block);
          break;

        case "embed":
          html = convertEmbed(block);
          break;

        default:
          console.warn(`Unknown block type: ${block.type}`);
          html = "";
      }

      if (html) {
        htmlBlocks.push(html);
      }
    } catch (error) {
      console.error(`Error converting block ${block.id}:`, error);
    }
  });

  return htmlBlocks.join("\n");
};

/**
 * Convert with CSS wrapper
 */
export const convertEditorJSToHTMLWithStyles = (
  data: any,
  options: {
    wrapperClass?: string;
    includeCSS?: boolean;
    customCSS?: string;
  } = {}
): string => {
  const {
    wrapperClass = "editor-content",
    includeCSS = true,
    customCSS = "",
  } = options;

  const html = convertEditorJSToHTML(data);

  if (!includeCSS) {
    return `<div class="${wrapperClass}">${html}</div>`;
  }

  const defaultCSS = `
.${wrapperClass} {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
}

.${wrapperClass} p {
  margin: 1em 0;
}

.${wrapperClass} h1, .${wrapperClass} h2, .${wrapperClass} h3, 
.${wrapperClass} h4, .${wrapperClass} h5, .${wrapperClass} h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.${wrapperClass} table {
  margin: 1.5em 0;
  border-spacing: 0;
}

.${wrapperClass} th, .${wrapperClass} td {
  padding: 8px 12px;
  text-align: left;
}

.${wrapperClass} ul, .${wrapperClass} ol {
  padding-left: 30px;
  margin: 1em 0;
}

.${wrapperClass} li {
  margin: 0.5em 0;
}

.${wrapperClass} img {
  max-width: 100%;
  height: auto;
  display: block;
}

.${wrapperClass} figure {
  margin: 1.5em 0;
  text-align: center;
}

.${wrapperClass} figcaption {
  font-size: 0.9em;
  color: #666;
  margin-top: 0.5em;
}

.${wrapperClass} blockquote {
  border-left: 3px solid #ccc;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
  font-style: italic;
}

.${wrapperClass} pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.${wrapperClass} code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.${wrapperClass} hr {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 32px 0;
}

.${wrapperClass} a {
  color: #0066cc;
  text-decoration: none;
}

.${wrapperClass} a:hover {
  text-decoration: underline;
}
  `.trim();

  const finalCSS = `${defaultCSS}\n${customCSS}`.trim();

  return `<style>${finalCSS}</style>\n<div class="${wrapperClass}">${html}</div>`;
};

// Export both functions
export default {
  convertEditorJSToHTML,
  convertEditorJSToHTMLWithStyles,
};

/**
 * USAGE EXAMPLES:
 *
 * // Basic usage
 * import { convertEditorJSToHTML } from './editorjs-converter';
 * const html = convertEditorJSToHTML(editorData);
 *
 * // With CSS wrapper
 * import { convertEditorJSToHTMLWithStyles } from './editorjs-converter';
 * const styledHTML = convertEditorJSToHTMLWithStyles(editorData, {
 *   wrapperClass: 'pdf-content',
 *   includeCSS: true,
 *   customCSS: '.pdf-content { font-size: 14px; }'
 * });
 *
 * // In React component
 * const MyComponent = ({ pageBlocks }) => {
 *   const html = convertEditorJSToHTML(pageBlocks);
 *   return <div dangerouslySetInnerHTML={{ __html: html }} />;
 * };
 */
