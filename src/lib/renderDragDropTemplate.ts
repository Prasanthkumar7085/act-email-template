import { EmailElement } from "../components/builder/DragDropBuilder";

interface PageLayout {
  background: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  width: number;
  maxWidth: number;
  borderRadius: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  height?: number;
}

function styleToString(styles: EmailElement["styles"]): string {
  if (!styles) return "";
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join("; ");
}

function renderElement(element: EmailElement): string {
  const styleAttr = styleToString(element.styles);

  switch (element.type) {
    case "heading":
      const level = element.level || 1;
      const HeadingTag = `h${level}`;
      const headingContent = element.content || "Heading";
      if (element.linkUrl) {
        const linkTarget = element.linkTarget || "_self";
        const linkRel =
          linkTarget === "_blank" ? ' rel="noopener noreferrer"' : "";
        return `<${HeadingTag} style="${styleAttr}"><a href="${element.linkUrl}" target="${linkTarget}"${linkRel} style="color: inherit; text-decoration: none;">${headingContent}</a></${HeadingTag}>`;
      }
      return `<${HeadingTag} style="${styleAttr}">${headingContent}</${HeadingTag}>`;

    case "paragraph":
      const paragraphContent = element.content || "Paragraph";
      if (element.linkUrl) {
        const linkTarget = element.linkTarget || "_self";
        const linkRel =
          linkTarget === "_blank" ? ' rel="noopener noreferrer"' : "";
        return `<p style="${styleAttr}"><a href="${element.linkUrl}" target="${linkTarget}"${linkRel} style="color: inherit; text-decoration: underline;">${paragraphContent}</a></p>`;
      }
      return `<p style="${styleAttr}">${paragraphContent}</p>`;

    case "list":
      const listStyle = element.listStyle || "unordered";
      const items = (element.items || [])
        .map((item) => `<li>${item}</li>`)
        .join("");
      if (listStyle === "ordered") {
        return `<ol style="${styleAttr}">${items}</ol>`;
      }
      return `<ul style="${styleAttr}">${items}</ul>`;

    case "div":
      const children = (element.children || [])
        .map((child) => renderElement(child))
        .join("");
      return `<div style="${styleAttr}">${children || "&nbsp;"}</div>`;

    case "columns":
      // Use table-based layout for email client compatibility
      const numColumns = element.columns?.length || 2;
      const columnWidth = Math.floor(100 / numColumns);
      const columnGap = element.columnGap || "16px";
      const gapPx = parseInt(columnGap) || 16;
      const columns = (element.columns || [])
        .map((column, idx) => {
          const columnContent = column
            .map((colElement) => renderElement(colElement))
            .join("");
          const isLast = idx === numColumns - 1;
          const columnColor = element.columnColors?.[idx];
          const columnPadding = element.columnPadding?.[idx] || "8px";
          const columnBgStyle = columnColor
            ? `background-color: ${columnColor};`
            : "";
          const verticalAlign =
            element.columnAlign === "start"
              ? "top"
              : element.columnAlign === "center"
                ? "middle"
                : element.columnAlign === "end"
                  ? "bottom"
                  : "top";
          return `
                    <td style="width: ${columnWidth}%; ${columnBgStyle} padding: ${columnPadding}; vertical-align: ${verticalAlign}; ${isLast ? "" : `padding-right: ${gapPx}px;`}">
                        ${columnContent || "&nbsp;"}
                    </td>
                `;
        })
        .join("");
      return `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${styleAttr}">
                    <tr>
                        ${columns}
                    </tr>
                </table>
            `;

    case "button":
      const buttonBgColor = element.styles?.backgroundColor || "#06b6d4";
      const buttonColor = element.styles?.color || "#ffffff";
      const buttonPadding = element.styles?.padding || "12px 24px";
      const buttonRadius = element.styles?.borderRadius || "8px";
      const buttonFontSize = element.styles?.fontSize || "16px";
      const buttonFontWeight = element.styles?.fontWeight || "600";
      const textAlign = element.styles?.textAlign || "center";
      const buttonUrl = element.url || "#";
      const buttonTarget = element.linkTarget || "_blank";
      const buttonRel =
        buttonTarget === "_blank" ? 'rel="noopener noreferrer"' : "";
      // Use table-based button for better email client support
      return `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${styleAttr}">
                    <tr>
                        <td align="${textAlign}" style="padding: 8px 0;">
                            <a href="${buttonUrl}" target="${buttonTarget}" ${buttonRel} style="background-color: ${buttonBgColor}; color: ${buttonColor}; padding: ${buttonPadding}; border-radius: ${buttonRadius}; font-size: ${buttonFontSize}; font-weight: ${buttonFontWeight}; text-decoration: none; display: inline-block; border: none;">
                                ${element.content || "Button"}
                            </a>
                        </td>
                    </tr>
                </table>
            `;

    case "image":
      const imageStyle = element.imageStyle || "default";
      let imgStyleAttr = styleAttr;
      if (imageStyle === "circle" || imageStyle === "avatar") {
        const radius = "50%";
        const width = element.styles?.width || "100px";
        const height = element.styles?.height || "100px";
        imgStyleAttr = `${styleAttr}; border-radius: ${radius}; width: ${width}; height: ${height}; object-fit: cover;`;
      } else if (imageStyle === "rounded") {
        const radius = element.styles?.borderRadius || "8px";
        imgStyleAttr = `${styleAttr}; border-radius: ${radius};`;
      }
      return `<img src="${element.content || "https://via.placeholder.com/600x300"}" 
                         alt="Email image" 
                         style="${imgStyleAttr}" />`;

    case "spacer":
      return `<div style="${styleAttr}"></div>`;

    case "divider":
      return `<hr style="${styleAttr}" />`;

    default:
      return `<div style="${styleAttr}">${element.content || ""}</div>`;
  }
}

export function buildEmailFromDragDrop(
  elements: EmailElement[],
  pageLayout: PageLayout,
  view: "desktop" | "mobile"
): string {
  // Desktop width: 600px (industry standard), Mobile width: 375px
  const maxWidth = view === "mobile" ? 375 : 600;
  const background = pageLayout?.background || "#ffffff";
  const padding = pageLayout?.padding || {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };

  // Convert padding to inline style string
  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  const content = elements.map((element) => renderElement(element)).join("\n");

  // Format content with proper indentation
  const formattedContent = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `              ${line}`)
    .join("\n");

  // Email-compatible HTML structure with inline styles only (no classes)
  return `<!doctype html>

<html>
  <body>
    <div
      style='background-color:#FFFFFF;color:#03124A;font-family:Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:${maxWidth}px;background-color:${background}"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td style="padding:${paddingStyle}">
${formattedContent}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}
