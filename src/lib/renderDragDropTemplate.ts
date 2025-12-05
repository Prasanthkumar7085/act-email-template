import { EmailElement } from '../components/builder/DragDropBuilder';

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

function styleToString(styles: EmailElement['styles']): string {
    if (!styles) return '';
    return Object.entries(styles)
        .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${kebabKey}: ${value}`;
        })
        .join('; ');
}

function renderElement(element: EmailElement): string {
    const styleAttr = styleToString(element.styles);

    switch (element.type) {
        case 'heading':
            const level = element.level || 1;
            const HeadingTag = `h${level}`;
            return `<${HeadingTag} style="${styleAttr}">${element.content || 'Heading'}</${HeadingTag}>`;

        case 'paragraph':
            return `<p style="${styleAttr}">${element.content || 'Paragraph'}</p>`;

        case 'list':
            const listStyle = element.listStyle || 'unordered';
            const items = (element.items || []).map(item => `<li>${item}</li>`).join('');
            if (listStyle === 'ordered') {
                return `<ol style="${styleAttr}">${items}</ol>`;
            }
            return `<ul style="${styleAttr}">${items}</ul>`;

        case 'div':
            const children = (element.children || [])
                .map(child => renderElement(child))
                .join('');
            return `<div style="${styleAttr}">${children || '&nbsp;'}</div>`;

        case 'columns':
            // Use table-based layout for email client compatibility
            const numColumns = element.columns?.length || 2;
            const columnWidth = Math.floor(100 / numColumns);
            const columnGap = element.columnGap || '16px';
            const gapPx = parseInt(columnGap) || 16;
            const columns = (element.columns || []).map((column, idx) => {
                const columnContent = column.map(colElement => renderElement(colElement)).join('');
                const isLast = idx === numColumns - 1;
                const columnColor = element.columnColors?.[idx];
                const columnPadding = element.columnPadding?.[idx] || '8px';
                const columnBgStyle = columnColor ? `background-color: ${columnColor};` : '';
                const verticalAlign = element.columnAlign === 'start' ? 'top' : 
                                    element.columnAlign === 'center' ? 'middle' : 
                                    element.columnAlign === 'end' ? 'bottom' : 'top';
                return `
                    <td style="width: ${columnWidth}%; ${columnBgStyle} padding: ${columnPadding}; vertical-align: ${verticalAlign}; ${isLast ? '' : `padding-right: ${gapPx}px;`}">
                        ${columnContent || '&nbsp;'}
                    </td>
                `;
            }).join('');
            return `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${styleAttr}">
                    <tr>
                        ${columns}
                    </tr>
                </table>
            `;

        case 'button':
            const buttonBgColor = element.styles?.backgroundColor || '#06b6d4';
            const buttonColor = element.styles?.color || '#ffffff';
            const buttonPadding = element.styles?.padding || '12px 24px';
            const buttonRadius = element.styles?.borderRadius || '8px';
            const buttonFontSize = element.styles?.fontSize || '16px';
            const buttonFontWeight = element.styles?.fontWeight || '600';
            const textAlign = element.styles?.textAlign || 'center';
            // Use table-based button for better email client support
            return `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${styleAttr}">
                    <tr>
                        <td align="${textAlign}" style="padding: 8px 0;">
                            <a href="#" style="background-color: ${buttonBgColor}; color: ${buttonColor}; padding: ${buttonPadding}; border-radius: ${buttonRadius}; font-size: ${buttonFontSize}; font-weight: ${buttonFontWeight}; text-decoration: none; display: inline-block; border: none;">
                                ${element.content || 'Button'}
                            </a>
                        </td>
                    </tr>
                </table>
            `;

        case 'image':
            const imageStyle = element.imageStyle || 'default';
            let imgStyleAttr = styleAttr;
            if (imageStyle === 'circle' || imageStyle === 'avatar') {
                const radius = '50%';
                const width = element.styles?.width || '100px';
                const height = element.styles?.height || '100px';
                imgStyleAttr = `${styleAttr}; border-radius: ${radius}; width: ${width}; height: ${height}; object-fit: cover;`;
            } else if (imageStyle === 'rounded') {
                const radius = element.styles?.borderRadius || '8px';
                imgStyleAttr = `${styleAttr}; border-radius: ${radius};`;
            }
            return `<img src="${element.content || 'https://via.placeholder.com/600x300'}" 
                         alt="Email image" 
                         style="${imgStyleAttr}" />`;

        case 'spacer':
            return `<div style="${styleAttr}"></div>`;

        case 'divider':
            return `<hr style="${styleAttr}" />`;

        default:
            return `<div style="${styleAttr}">${element.content || ''}</div>`;
    }
}

export function buildEmailFromDragDrop(
    elements: EmailElement[],
    pageLayout: PageLayout,
    view: 'desktop' | 'mobile'
): string {
    const width = view === 'mobile' ? 375 : (pageLayout?.width || 900);
    const maxWidth = view === 'mobile' ? 375 : (pageLayout?.maxWidth || 900);
    const background = pageLayout?.background || '#ffffff';
    const borderRadius = pageLayout?.borderRadius || 8;
    const padding = pageLayout?.padding || { top: 40, right: 40, bottom: 40, left: 40 };

    const bodyStyle = `
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f3f4f6;
    `.trim();

    const containerStyle = `
        width: ${width}px;
        max-width: ${maxWidth}px;
        margin: ${pageLayout?.margins?.top || 40}px auto;
        background-color: ${background};
        border-radius: ${borderRadius}px;
        padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px;
    `.trim();

    const content = elements.map(element => renderElement(element)).join('\n');

    // Email-compatible HTML structure
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Email Template</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        body {
            ${bodyStyle}
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
            }
            .email-container table {
                width: 100% !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: ${pageLayout?.margins?.top || 40}px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${width}" class="email-container" style="width: ${width}px; max-width: ${maxWidth}px; background-color: ${background}; border-radius: ${borderRadius}px; padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px;">
                    <tr>
                        <td>
                            ${content}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

