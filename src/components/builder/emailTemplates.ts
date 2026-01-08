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
  return html;
};

/**
 * Normalize camelCase style keys to kebab-case for inline CSS.
 */
const camelToKebab = (str: string): string =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * Get style object (for easier manipulation)
 */
const getStyleObject = (block: EditorJSBlock): Record<string, string> => {
  const styles: Record<string, string> = {};

  const alignment = block.tunes?.alignment?.alignment;
  if (alignment && alignment !== "left") {
    styles["text-align"] = alignment;
  }

  const indentLevel = block.tunes?.indentTune?.indentLevel;
  if (indentLevel && indentLevel > 0) {
    styles["margin-left"] = `${indentLevel * 40}px`;
  }

  return styles;
};

/**
 * Convert style object to string
 */
const styleObjectToString = (styles: Record<string, string>): string => {
  const styleStr = Object.entries(styles)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join("; ");
  return styleStr ? ` style="${styleStr}"` : "";
};

/**
 * Merge default styles with block-level alignment/indent styles.
 */
const mergeBlockStyles = (
  block: EditorJSBlock,
  baseStyles: Record<string, string> = {}
): string => {
  return styleObjectToString({
    ...baseStyles,
    ...getStyleObject(block),
  });
};

/**
 * Convert paragraph block to HTML
 */
const convertParagraph = (block: EditorJSBlock): string => {
  const text = sanitizeHTML(block.data.text || "");
  const paragraphStyles = mergeBlockStyles(block, {
    margin: "0 0 16px",
    "line-height": "1.6",
    color: "#0f172a",
    "font-size": "16px",
  });
  return `<p${paragraphStyles}>${text}</p>`;
};

/**
 * Convert header block to HTML
 */
const convertHeader = (block: EditorJSBlock): string => {
  const level = block.data.level || 2;
  const text = sanitizeHTML(block.data.text || "");
  const sizeMap: Record<number, string> = {
    1: "32px",
    2: "28px",
    3: "24px",
    4: "20px",
    5: "18px",
    6: "16px",
  };
  const headerStyles = mergeBlockStyles(block, {
    margin: "0 0 12px",
    "line-height": "1.3",
    "font-weight": "700",
    color: "#0f172a",
    "font-size": sizeMap[level] || "24px",
  });
  return `<h${level}${headerStyles}>${text}</h${level}>`;
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

  const styleStr = mergeBlockStyles(block, {
    margin: "0 0 16px",
    "padding-left": "28px",
    "line-height": "1.6",
    color: "#0f172a",
    "font-size": "16px",
  });

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

  return `<${listTag}${listAttrs}${styleStr}>${renderItems(items)}</${listTag}>`;
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

  // Merge block styles with table styles and sensible defaults
  const mergedTableStyles = {
    width: "100%",
    "border-collapse": "collapse",
    margin: "24px 0",
    "font-size": "16px",
    color: "#0f172a",
    ...getStyleObject(block),
    ...tableStyles,
  };
  const tableStyleStr = styleObjectToString(mergedTableStyles);

  let html = `<table${tableStyleStr}>`;

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

  const rowStyle = rowStyles[rowIndex] || {};
  const rowStyleAttr = styleObjectToString({
    "background-color": isHeader ? "#f8fafc" : undefined,
    ...rowStyle,
  });

  let html = `<tr${rowStyleAttr}>`;

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
        const cssKey = camelToKebab(key);
        cellStyleParts.push(`${cssKey}: ${value}`);
      }
    });

    const cellStyle =
      cellStyleParts.length > 0
        ? ` style="${cellStyleParts.join("; ")}"`
        : ` style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;"`;

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

  const imgStyles: string[] = [
    "display: block",
    "max-width: 100%",
    "height: auto",
  ];

  if (dimensions.width) {
    imgStyles.push(`width: ${dimensions.width}`);
  }
  if (dimensions.height) {
    imgStyles.push(`height: ${dimensions.height}`);
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
    imgStyles.push(`transform: ${transforms.join(" ")}`);
  }

  const imgStyleAttr =
    imgStyles.length > 0 ? ` style="${imgStyles.join("; ")}"` : "";

  // Get figure styles (alignment and indent)
  const figureStyles = mergeBlockStyles(block, {
    margin: "16px 0",
    "text-align": block.tunes?.alignment?.alignment || "left",
  });

  let html = `<figure${figureStyles}>`;
  html += `<img src="${file.url}" alt="${caption}"${imgStyleAttr} />`;

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
  const blockStyles = mergeBlockStyles(block, {
    margin: "20px 0",
    padding: "12px 16px",
    "border-left": "4px solid #e5e7eb",
    "border-radius": "10px",
    "background-color": "#f8fafc",
    color: "#4b5563",
    "font-style": "italic",
    "line-height": "1.6",
  });

  return `<blockquote${blockStyles}><p>${text}</p>${caption}</blockquote>`;
};

/**
 * Convert code block to HTML
 */
const convertCode = (block: EditorJSBlock): string => {
  const code = block.data.code || "";

  // Escape HTML in code blocks
  const escapedCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const blockStyles = mergeBlockStyles(block, {
    margin: "20px 0",
    padding: "16px",
    "background-color": "#0f172a",
    color: "#e2e8f0",
    "border-radius": "10px",
    "font-family":
      "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    "font-size": "14px",
    "line-height": "1.6",
    "white-space": "pre-wrap",
    "word-break": "break-word",
    "overflow-x": "auto",
  });

  return `<pre${blockStyles}><code>${escapedCode}</code></pre>`;
};

/**
 * Convert delimiter block to HTML (shows *** like in editor)
 */
const convertDelimiter = (block: EditorJSBlock): string => {
  const styleObj = getStyleObject(block);

  // Apply alignment from block tunes
  if (block.tunes?.alignment?.alignment) {
    styleObj["text-align"] = block.tunes.alignment.alignment;
  }

  styleObj["margin"] = "32px 0";
  styleObj["font-size"] = "30px";
  styleObj["line-height"] = "1";
  styleObj["letter-spacing"] = "0.2em";
  styleObj["color"] = "#374151";

  const styleStr = styleObjectToString(styleObj);
  return `<div${styleStr}>* * *</div>`;
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

  const blockStyles = mergeBlockStyles(block, {
    margin: "24px 0",
    "text-align": "center",
  });

  let html = `<figure${blockStyles}>`;
  html += `<iframe src="${embed}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  if (caption) {
    html += `<figcaption>${sanitizeHTML(caption)}</figcaption>`;
  }

  html += "</figure>";
  return html;
};

/**
 * Convert horizontal line block to HTML
 */
const convertHorizontalLine = (block: EditorJSBlock): string => {
  const {
    style = "solid",
    thickness = 2,
    color = "#000000",
    alignment = "center",
  } = block.data;

  const styleObj = getStyleObject(block);

  styleObj["border"] = "none";
  styleObj["border-top"] = `${thickness}px ${style} ${color}`;
  styleObj["margin"] = "20px 0";
  styleObj["width"] = "100%";

  if (alignment === "center") {
    styleObj["margin-left"] = "auto";
    styleObj["margin-right"] = "auto";
  } else if (alignment === "left") {
    styleObj["margin-right"] = "auto";
    styleObj["margin-left"] = styleObj["margin-left"] || "0";
  } else if (alignment === "right") {
    styleObj["margin-left"] = "auto";
    styleObj["margin-right"] = "0";
  }

  const styleStr = styleObjectToString(styleObj);
  return `<hr${styleStr} />`;
};

/**
 * Convert button block to HTML with alignment support
 */
const convertButton = (block: EditorJSBlock): string => {
  const {
    text = "Button",
    url = "#",
    style = "filled",
    color = "#ffffff",
    backgroundColor = "#3b82f6",
    align = "left",
    target = "_blank",
    size = "medium",
  } = block.data;

  // Get block-level alignment and indent from tunes
  const blockStyleObj = getStyleObject(block);

  // Use alignment from tunes if available, otherwise from button data
  const finalAlignment = block.tunes?.alignment?.alignment || align;

  // Button size mapping
  const sizeStyles: Record<string, string> = {
    small: "padding: 8px 16px; font-size: 12px;",
    medium: "padding: 12px 24px; font-size: 14px;",
    large: "padding: 16px 32px; font-size: 16px;",
  };

  // Button style mapping
  const variantStyles: Record<string, string> = {
    filled: `background-color: ${backgroundColor}; color: ${color}; border: none;`,
    outline: `background-color: transparent; color: ${backgroundColor}; border: 2px solid ${backgroundColor};`,
    text: `background-color: transparent; color: ${backgroundColor}; border: none;`,
  };

  const buttonStyle = [
    variantStyles[style] || variantStyles.filled,
    sizeStyles[size] || sizeStyles.medium,
    "border-radius: 6px",
    "text-decoration: none",
    "display: inline-block",
    "font-weight: 500",
    "transition: all 0.2s",
    "cursor: pointer",
    "text-align: center",
  ].join("; ");

  // Container with proper alignment and indent
  const containerStyles = {
    "text-align": finalAlignment,
    margin: "20px 0",
    ...blockStyleObj,
  };

  const containerStyleStr = styleObjectToString(containerStyles);

  return `<div${containerStyleStr}><a href="${url}" target="${target}" style="${buttonStyle}">${sanitizeHTML(text)}</a></div>`;
};

/**
 * Convert social media block to HTML
 */
const convertSocial = (block: EditorJSBlock): string => {
  const { service, url, embed, caption = "" } = block.data;

  if (!url || !service) {
    return "";
  }

  const styleObj = getStyleObject(block);
  styleObj["margin"] = "20px 0";
  const containerStyle = styleObjectToString(styleObj);

  let html = `<div${containerStyle}>`;

  // Service badge
  const serviceIcons: Record<string, string> = {
    youtube: "▶️",
    twitter: "🐦",
    instagram: "📷",
    facebook: "👥",
    tiktok: "🎵",
    linkedin: "💼",
    pinterest: "📌",
    reddit: "🔴",
    vimeo: "🎬",
  };

  const icon = serviceIcons[service] || "🔗";

  html += `<div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #3b82f6; color: white; border-radius: 6px; font-size: 12px; font-weight: 500; margin-bottom: 12px; text-transform: capitalize;">`;
  html += `${icon} ${service}`;
  html += `</div>`;

  // Embed container
  if (service === "youtube" || service === "vimeo") {
    html += `<div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000; border-radius: 8px; overflow: hidden;">`;
    html += `<iframe src="${embed}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>`;
    html += `</div>`;
  } else {
    // Link card
    html += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; text-align: center;">`;
    html += `<div style="font-size: 48px; margin-bottom: 12px;">${icon}</div>`;
    html += `<div style="font-size: 18px; font-weight: 600; text-transform: capitalize; margin-bottom: 8px;">View on ${service}</div>`;
    html += `<div style="font-size: 12px; opacity: 0.8; word-break: break-all;">${url}</div>`;
    html += `</a>`;
  }

  // Caption
  if (caption) {
    html += `<div style="font-size: 14px; color: #4b5563; text-align: center; font-style: italic; margin-top: 12px;">${sanitizeHTML(caption)}</div>`;
  }

  html += `</div>`;
  return html;
};

/**
 * Convert columns block to HTML with all settings
 */
/**
 * Convert columns block to HTML with all settings
 */
const convertColumns = (block: EditorJSBlock): string => {
  const { cols = [], numberOfColumns = 2, layout = {} } = block.data;

  if (!cols || cols.length === 0) {
    return "";
  }

  // Get block-level alignment and indent
  const blockStyleObj = getStyleObject(block);

  // Layout styles for the TABLE container
  const layoutStyles: Record<string, string> = {
    width: "100%",
    "table-layout": "fixed",
    "border-collapse": "collapse",
    "box-sizing": "border-box",
    margin: "20px 0",
    ...blockStyleObj,
  };

  // Apply background color if specified
  if (layout.backgroundColor && layout.backgroundColor !== "transparent") {
    layoutStyles.background = layout.backgroundColor;
  }

  // Apply border radius (works on table in some clients, or wrapper div)
  if (layout.borderRadius && layout.borderRadius > 0) {
    layoutStyles["border-radius"] = `${layout.borderRadius}px`;
  }

  // Custom CSS (override)
  if (layout.customCSS) {
    const customStyles = layout.customCSS
      .split(";")
      .reduce((acc: Record<string, string>, style: string) => {
        const [key, value] = style.split(":").map((s: string) => s.trim());
        if (key && value) {
          const camelCaseKey = key.replace(/-([a-z])/g, (g: string) =>
            g[1].toUpperCase()
          );
          acc[camelCaseKey] = value;
        }
        return acc;
      }, {});
    Object.assign(layoutStyles, customStyles);
  }

  const containerStyle = styleObjectToString(layoutStyles);

  // Use class "custom-columns-tool" for responsive media query targeting
  let html = `<table class="custom-columns-tool"${containerStyle} border="0" cellpadding="0" cellspacing="0" width="100%">`;

  // Single row
  html += `<tbody><tr>`;

  const gap = layout.gap || 20;

  // Process each column
  for (let i = 0; i < numberOfColumns; i++) {
    const columnData = cols[i];
    const columnBlocks = columnData?.blocks || [];

    // Calculate gap padding for TD
    let paddingLeft = 0;
    let paddingRight = 0;

    // Simulate gap using padding
    if (i === 0) {
      paddingRight = gap / 2;
    } else if (i === numberOfColumns - 1) {
      paddingLeft = gap / 2;
    } else {
      paddingLeft = gap / 2;
      paddingRight = gap / 2;
    }

    // TD Styles
    const tdStyles: Record<string, string> = {
      width: `${100 / numberOfColumns}%`,
      "vertical-align": "top",
      "box-sizing": "border-box",
      "padding-left": `${paddingLeft}px`,
      "padding-right": `${paddingRight}px`,
      "padding-top": "0",
      "padding-bottom": "0",
    };

    const tdStyleStr = styleObjectToString(tdStyles);

    // Inner DIV Styles (actual column box)
    const innerStyles: Record<string, string> = {
      display: "block",
      width: "100%",
      "box-sizing": "border-box",
      "min-height": "50px",
    };

    if (
      layout.columnBackgroundColor &&
      layout.columnBackgroundColor !== "transparent"
    ) {
      innerStyles.background = layout.columnBackgroundColor;
    }
    if (layout.borderRadius && layout.borderRadius > 0) {
      innerStyles["border-radius"] = `${layout.borderRadius}px`;
    }
    if (layout.padding && layout.padding > 0) {
      innerStyles.padding = `${layout.padding}px`;
    }
    if (layout.borderColor && layout.borderColor !== "transparent") {
      innerStyles.border = `1px solid ${layout.borderColor}`;
    }

    const innerStyleStr = styleObjectToString(innerStyles);

    // Use class "custom-column" for responsive media query targeting
    html += `<td class="custom-column"${tdStyleStr} valign="top">`;
    html += `<div${innerStyleStr}>`;

    // Convert blocks inside column
    columnBlocks.forEach((colBlock: EditorJSBlock) => {
      try {
        const blockHtml = convertBlockToHTML(colBlock);
        if (blockHtml) {
          html += blockHtml;
        }
      } catch (error) {
        console.error(`Error converting block in column:`, error);
      }
    });

    html += `</div></td>`;
  }

  html += `</tr></tbody></table>`;
  return html;
};

/**
 * Convert a single block to HTML (used for recursion in columns)
 */
const convertBlockToHTML = (block: EditorJSBlock): string => {
  switch (block.type) {
    case "paragraph":
      return convertParagraph(block);
    case "header":
      return convertHeader(block);
    case "list":
      return convertList(block);
    case "table":
      return convertTable(block);
    case "image":
      return convertImage(block);
    case "quote":
      return convertQuote(block);
    case "code":
      return convertCode(block);
    case "delimiter":
      return convertDelimiter(block);
    case "raw":
      return convertRaw(block);
    case "embed":
      return convertEmbed(block);
    case "horizontalLine":
      return convertHorizontalLine(block);
    case "button":
      return convertButton(block);
    case "social":
      return convertSocial(block);
    case "columns":
      return convertColumns(block);
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return "";
  }
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
      const html = convertBlockToHTML(block);
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
  border-collapse: collapse;
  width: 100%;
}

.${wrapperClass} th, .${wrapperClass} td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #e0e0e0;
}

.${wrapperClass} th {
  background-color: #f5f5f5;
  font-weight: 600;
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
  opacity: 0.8;
}

/* Button styles */
.${wrapperClass} a[style*="padding: 12px 24px"] {
  transition: opacity 0.2s;
}

.${wrapperClass} a[style*="padding: 12px 24px"]:hover {
  opacity: 0.9;
}

/* Social media embeds */
.${wrapperClass} iframe {
  max-width: 100%;
}

/* Columns responsive */
@media (max-width: 768px) {
  .${wrapperClass} [style*="display: flex"] {
    flex-direction: column !important;
    gap: 10px !important;
  }
  
  .${wrapperClass} [style*="display: flex"] > div {
    flex: 1 1 100% !important;
  }
}

/* Delimiter styles */
.${wrapperClass} div[style*="font-size: 30px"] {
  text-align: center;
  color: #374151;
}

/* Button container alignment */
.${wrapperClass} div[style*="text-align"] {
  margin: 20px 0;
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
