import JSZip from "jszip";
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

const parseHeadersAndFooters = async (zip: JSZip) => {
  const headersAndFooters: any = {
    headers: [],
    footers: [],
  };

  for (const path in zip.files) {
    if (path.startsWith("word/header") && path.endsWith(".xml")) {
      const headerXml = await zip.file(path)?.async("text");
      if (headerXml) {
        const headerDoc = new DOMParser().parseFromString(
          headerXml,
          "text/xml"
        );
        headersAndFooters.headers.push(extractHeaderFooterText(headerDoc));
      }
    }
  }

  for (const path in zip.files) {
    if (path.startsWith("word/footer") && path.endsWith(".xml")) {
      const footerXml = await zip.file(path)?.async("text");
      if (footerXml) {
        const footerDoc = new DOMParser().parseFromString(
          footerXml,
          "text/xml"
        );
        headersAndFooters.footers.push(extractHeaderFooterText(footerDoc));
      }
    }
  }

  return headersAndFooters;
};

const extractHeaderFooterText = (headerFooterDoc: Document): string => {
  const textContent: string[] = [];

  const paragraphs = headerFooterDoc.getElementsByTagNameNS(WORD_NS, "p");
  for (const paragraph of paragraphs) {
    const text = processParagraph(paragraph, {}, {})?.data?.text || "";
    if (text) {
      textContent.push(text);
    }
  }

  return textContent.join(" ");
};
export const parseXMLContent = (xmlContent: string) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const body =
      xmlDoc.getElementsByTagNameNS(WORD_NS, "body")[0] ||
      xmlDoc.getElementsByTagName("w:body")[0];

    if (!body) {
      console.error("No body found in document");
      return [];
    }

    const blocks: any[] = [];
    const relationships: { [key: string]: string } = {};
    const images: { [key: string]: string } = {};

    for (const child of Array.from(body.children)) {
      const namespaceURI = child.namespaceURI || child.prefix;

      if (namespaceURI?.includes("word") || child.nodeName.startsWith("w:")) {
        if (child.localName === "p" || child.nodeName === "w:p") {
          const block = processParagraph(child, relationships, images);
          if (block) blocks.push(block);
        } else if (child.localName === "tbl" || child.nodeName === "w:tbl") {
          const block = processTable(child, relationships, images);
          if (block) blocks.push(block);
        }
      }
    }
    return processLists(blocks);
  } catch (error) {
    console.error("Error parsing XML:", error);
    return [];
  }
};
const getElementByTagNameNS = (
  element: Element,
  localName: string
): Element | null => {
  const nsElement = element.getElementsByTagNameNS(WORD_NS, localName)[0];
  if (nsElement) return nsElement;

  const oldElement = element.getElementsByTagName(`w:${localName}`)[0];
  return oldElement || null;
};

const getElementsByTagNameNS = (
  element: Element,
  localName: string
): Element[] => {
  const nsElements = Array.from(
    element.getElementsByTagNameNS(WORD_NS, localName)
  );
  if (nsElements.length > 0) return nsElements;

  return Array.from(element.getElementsByTagName(`w:${localName}`));
};
const processHyperlink = (hyperlink: Element): string => {
  try {
    let linkText = "";
    let pageRef = "";
    let isProcessingField = false;
    const anchor =
      hyperlink.getAttributeNS(WORD_NS, "anchor") ||
      hyperlink.getAttribute("w:anchor") ||
      "";
    for (const child of Array.from(hyperlink.children)) {
      if (child.localName === "r" || child.nodeName === "w:r") {
        const run = child;
        const rPr = getElementByTagNameNS(run, "rPr");
        const textElement = getElementByTagNameNS(run, "t");
        const fldChar = getElementByTagNameNS(run, "fldChar");
        const instrText = getElementByTagNameNS(run, "instrText");
        const isWebHidden = rPr && getElementByTagNameNS(rPr, "webHidden");

        if (fldChar) {
          const fieldType = fldChar.getAttributeNS(WORD_NS, "fldCharType");
          switch (fieldType) {
            case "begin":
              isProcessingField = true;
              break;
            case "end":
              isProcessingField = false;
              break;
            case "separate":
              break;
          }
          continue;
        }

        if (instrText && isProcessingField) {
          const instruction = instrText.textContent || "";
          if (instruction.includes("PAGEREF")) {
            const match = instruction.match(/PAGEREF\s+(\S+)/);
            if (match) {
              pageRef = match[1];
            }
          }
          continue;
        }

        if (textElement && !isWebHidden) {
          let text = textElement.textContent || "";

          if (textElement.getAttributeNS(WORD_NS, "space") === "preserve") {
            text = " " + text + " ";
          }

          const styles = getTextStyles(rPr);
          if (styles.length > 0) {
            text = `<span style="${styles.join(";")}">${text}</span>`;
          }

          linkText += text;
        }

        const tab = getElementByTagNameNS(run, "tab");
        if (tab && !isWebHidden) {
          linkText += " ";
        }
      }
    }

    const href = anchor ? `#${anchor}` : "#";
    const dataAttrs = [];
    if (anchor) dataAttrs.push(`data-anchor="${anchor}"`);
    if (pageRef) dataAttrs.push(`data-pageref="${pageRef}"`);

    const linkStyles = [
      "color: #0563C1",
      "text-decoration: underline",
      "cursor: pointer",
    ];

    return `<a href="${href}" ${dataAttrs.join(" ")} style="${linkStyles.join(
      ";"
    )}">${linkText}</a>`;
  } catch (error) {
    console.error("Error processing hyperlink:", error);
    return "";
  }
};

const processParagraph = (
  paragraph: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
) => {
  try {
    const pPr = getElementByTagNameNS(paragraph, "pPr");

    let text = "";
    let hasContent = false;
    for (const child of Array.from(paragraph.children)) {
      const namespaceURI = child.namespaceURI || child.prefix;
      if (namespaceURI?.includes("word") || child.nodeName.startsWith("w:")) {
        if (child.localName === "r" || child.nodeName === "w:r") {
          const run = child;
          const textElement = getElementByTagNameNS(run, "t");
          const drawingElement = getElementByTagNameNS(run, "drawing");

          if (textElement) {
            let runText = textElement.textContent || "";
            const preserveSpace =
              textElement.getAttributeNS(WORD_NS, "space") === "preserve" ||
              textElement.getAttribute("xml:space") === "preserve";

            if (preserveSpace) {
              runText = " " + runText + " ";
            }

            if (textElement.getAttributeNS(WORD_NS, "space") === "preserve") {
              runText = " " + runText + " ";
            }

            if (runText.trim()) {
              hasContent = true;
            }
            const rPr = getElementByTagNameNS(run, "rPr");
            const textStyles = getTextStyles(rPr);

            if (textStyles.length > 0) {
              runText = `<span style="${textStyles.join(
                ";"
              )}">${runText}</span>`;
            }

            text += runText;
          } else if (drawingElement) {
            const inline = drawingElement.getElementsByTagNameNS(
              "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
              "inline"
            )[0];
            if (inline) {
              const graphic = inline.getElementsByTagNameNS(
                "http://schemas.openxmlformats.org/drawingml/2006/main",
                "graphic"
              )[0];
              if (graphic) {
                const graphicData = graphic.getElementsByTagNameNS(
                  "http://schemas.openxmlformats.org/drawingml/2006/main",
                  "graphicData"
                )[0];
                if (graphicData) {
                  const pic = graphicData.getElementsByTagNameNS(
                    "http://schemas.openxmlformats.org/drawingml/2006/picture",
                    "pic"
                  )[0];
                  if (pic) {
                    const blipFill = pic.getElementsByTagNameNS(
                      "http://schemas.openxmlformats.org/drawingml/2006/picture",
                      "blipFill"
                    )[0];
                    if (blipFill) {
                      const blip = blipFill.getElementsByTagNameNS(
                        "http://schemas.openxmlformats.org/drawingml/2006/main",
                        "blip"
                      )[0];
                      if (blip) {
                        const imageId = blip.getAttributeNS(
                          RELATIONSHIP_NS,
                          "embed"
                        );
                        if (imageId && relationships[imageId]) {
                          const imagePath = `word/${relationships[imageId]}`;
                          const imageData = images[imagePath];
                          if (imageData) {
                            return {
                              type: "image",
                              data: {
                                file: {
                                  url: imageData,
                                },
                                withBorder: false,
                                withBackground: false,
                                stretched: false,
                              },
                            };
                          } else {
                            console.error(
                              "Image data not found for path:",
                              imagePath
                            );
                          }
                        } else {
                          console.error(
                            "Invalid or missing relationship ID:",
                            imageId
                          );
                        }
                      } else {
                        console.error("No 'blip' element found in blipFill.");
                      }
                    } else {
                      console.error("No 'blipFill' element found in pic.");
                    }
                  } else {
                    console.error("No 'pic' element found in graphicData.");
                  }
                } else {
                  console.error("No 'graphicData' element found in graphic.");
                }
              } else {
                console.error("No 'graphic' element found in inline.");
              }
            } else {
              console.error("No 'inline' element found in drawingElement.");
            }
          }
        } else if (
          child.localName === "hyperlink" ||
          child.nodeName === "w:hyperlink"
        ) {
          const linkText = processHyperlink(child);
          if (linkText) {
            hasContent = true;
            text += linkText;
          }
        }
      }
    }

    if (!hasContent) {
      return null;
    }

    const pStyle = pPr ? getElementByTagNameNS(pPr, "pStyle") : null;
    const styleVal =
      pStyle?.getAttributeNS(WORD_NS, "val") || pStyle?.getAttribute("w:val");
    if (styleVal?.startsWith("Heading")) {
      const level = Number.parseInt(styleVal.replace("Heading", "")) || 1;
      return {
        type: "header",
        data: {
          text,
          level,
        },
      };
    }

    const numPr = pPr ? getElementByTagNameNS(pPr, "numPr") : null;
    if (numPr) {
      const numId =
        getElementByTagNameNS(numPr, "numId")?.getAttributeNS(WORD_NS, "val") ||
        getElementByTagNameNS(numPr, "numId")?.getAttribute("w:val");
      const ilvl =
        getElementByTagNameNS(numPr, "ilvl")?.getAttributeNS(WORD_NS, "val") ||
        getElementByTagNameNS(numPr, "ilvl")?.getAttribute("w:val") ||
        "0";

      return {
        type: "list",
        data: {
          style: numId === "1" ? "unordered" : "ordered",
          items: [text],
          level: Number.parseInt(ilvl),
        },
      };
    }

    return {
      type: "paragraph",
      data: {
        text,
      },
    };
  } catch (error) {
    console.error("Error processing paragraph:", error);
    return null;
  }
};

const processLists = (blocks: any[]): any[] => {
  const processedBlocks: any[] = [];

  const convertToEditorJSFormat = (
    items: any[],
    level = 0
  ): EditorJSListItem[] => {
    const result: EditorJSListItem[] = [];
    let currentItem: EditorJSListItem | null = null;

    for (const item of items) {
      const itemLevel = item.level || 0;

      if (itemLevel === level) {
        if (currentItem) {
          result.push(currentItem);
        }
        currentItem = { content: item.content };
      } else if (itemLevel > level) {
        if (!currentItem) {
          continue;
        }
        if (!currentItem.items) {
          currentItem.items = [];
        }
        currentItem.items.push({ content: item.content });
      }
    }

    if (currentItem) {
      result.push(currentItem);
    }

    return result;
  };

  let currentListItems: any[] = [];
  let currentListStyle: string | null = null;

  for (const block of blocks) {
    if (block.type === "list") {
      if (currentListStyle && currentListStyle !== block.data.style) {
        if (currentListItems.length > 0) {
          processedBlocks.push({
            type: "list",
            data: {
              style: currentListStyle,
              items: convertToEditorJSFormat(currentListItems),
            },
          });
          currentListItems = [];
        }
      }

      currentListStyle = block.data.style;
      currentListItems.push({
        content: block.data.items[0],
        level: block.data.level || 0,
      });
    } else {
      if (currentListItems.length > 0) {
        processedBlocks.push({
          type: "list",
          data: {
            style: currentListStyle,
            items: convertToEditorJSFormat(currentListItems),
          },
        });
        currentListItems = [];
        currentListStyle = null;
      }
      processedBlocks.push(block);
    }
  }

  if (currentListItems.length > 0) {
    processedBlocks.push({
      type: "list",
      data: {
        style: currentListStyle,
        items: convertToEditorJSFormat(currentListItems),
      },
    });
  }
  return processedBlocks;
};

const stripHtmlTags = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const processTable = (
  table: Element,
  relationships: { [key: string]: string },
  images: { [key: string]: string }
) => {
  try {
    const rows = getElementsByTagNameNS(table, "tr");
    const content: any[][] = [];
    const rowStyles: string[][] = [];

    for (const row of rows) {
      const trPr = getElementByTagNameNS(row, "trPr");
      const rowStyle: string[] = [];

      const shd = trPr ? getElementByTagNameNS(trPr, "shd") : null;
      if (shd) {
        const fill =
          shd.getAttributeNS(WORD_NS, "fill") || shd.getAttribute("w:fill");
        if (fill && fill !== "auto") {
          rowStyle.push(`background-color: #${fill}`);
        }
      }

      const cells = getElementsByTagNameNS(row, "tc");
      const rowData: any[] = [];
      const cellStyles: string[] = [];

      for (const cell of cells) {
        const tcPr = getElementByTagNameNS(cell, "tcPr");
        const cellStyle: string[] = [];

        const cellShd = tcPr ? getElementByTagNameNS(tcPr, "shd") : null;
        if (cellShd) {
          const fill =
            cellShd.getAttributeNS(WORD_NS, "fill") ||
            cellShd.getAttribute("w:fill");
          if (fill && fill !== "auto") {
            cellStyle.push(`background-color: #${fill}`);
          }
        }

        const paragraphs = getElementsByTagNameNS(cell, "p");
        let cellContent = "";
        let cellContentStyles: string[] = [];

        for (const p of paragraphs) {
          const pPr = getElementByTagNameNS(p, "pPr");
          const paragraphStyles = getParagraphStyles(pPr);

          const pContent = processParagraph(p, relationships, images);
          if (pContent?.data?.text) {
            const strippedText = stripHtmlTags(pContent.data.text);
            cellContent += strippedText + " ";
          }

          const runElements = getElementsByTagNameNS(p, "r");
          runElements.forEach((run) => {
            const rPr = getElementByTagNameNS(run, "rPr");
            const textStyles = getTextStyles(rPr);
            cellContentStyles = [...cellContentStyles, ...textStyles];
          });

          cellStyle.push(...paragraphStyles);
        }

        rowData.push({
          text: cellContent.trim(),
          style: cellStyle.join("; "),
        });
        cellStyles.push(cellStyle.join("; "));
      }

      content.push(rowData);
      rowStyles.push(cellStyles);
    }

    if (content.length === 0) {
      return null;
    }

    return {
      type: "table",
      data: {
        content,
        rowStyles,
      },
    };
  } catch (error) {
    console.error("Error processing table:", error);
    return null;
  }
};

const getTextStyles = (rPr: Element | null) => {
  const styles: string[] = [];

  if (!rPr) return styles;
  const rFonts = getElementByTagNameNS(rPr, "rFonts");
  if (rFonts) {
    const themeFont =
      rFonts.getAttributeNS(WORD_NS, "asciiTheme") ||
      rFonts.getAttributeNS(WORD_NS, "hAnsiTheme") ||
      rFonts.getAttributeNS(WORD_NS, "cstheme") ||
      rFonts.getAttribute("w:asciiTheme") ||
      rFonts.getAttribute("w:hAnsiTheme") ||
      rFonts.getAttribute("w:cstheme");

    if (themeFont) {
      const fontFamily = mapThemeFont(themeFont);
      styles.push(`font-family: ${fontFamily}`);
    } else {
      const fontFamily =
        rFonts.getAttributeNS(WORD_NS, "ascii") ||
        rFonts.getAttributeNS(WORD_NS, "hAnsi") ||
        rFonts.getAttributeNS(WORD_NS, "cs") ||
        rFonts.getAttribute("w:ascii") ||
        rFonts.getAttribute("w:hAnsi") ||
        rFonts.getAttribute("w:cs");

      if (fontFamily) {
        styles.push(`font-family: "${fontFamily}, Arial, sans-serif"`);
      }
    }
  }

  const sz = getElementByTagNameNS(rPr, "sz");
  if (sz) {
    const size = sz.getAttributeNS(WORD_NS, "val") || sz.getAttribute("w:val");
    if (size) {
      styles.push(`font-size: ${Number.parseInt(size) / 2}pt`);
    }
  }

  const color = getElementByTagNameNS(rPr, "color");
  if (color) {
    const val =
      color.getAttributeNS(WORD_NS, "val") || color.getAttribute("w:val");
    if (val && val !== "auto") {
      styles.push(`color: #${val}`);
    }
  }

  const highlight = getElementByTagNameNS(rPr, "highlight");
  if (highlight) {
    const val =
      highlight.getAttributeNS(WORD_NS, "val") ||
      highlight.getAttribute("w:val");
    if (val) {
      const backgroundColor = getHighlightColor(val);
      styles.push(`background-color: ${backgroundColor}`);
    }
  }

  const shd = getElementByTagNameNS(rPr, "shd");
  if (shd) {
    const fill =
      shd.getAttributeNS(WORD_NS, "fill") || shd.getAttribute("w:fill");
    if (fill && fill !== "auto") {
      styles.push(`background-color: #${fill}`);
    }
  }

  const vertAlign = getElementByTagNameNS(rPr, "vertAlign");
  if (vertAlign) {
    const val =
      vertAlign.getAttributeNS(WORD_NS, "val") ||
      vertAlign.getAttribute("w:val");
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
    const val =
      u.getAttributeNS(WORD_NS, "val") || u.getAttribute("w:val") || "single";
    switch (val) {
      case "double":
        styles.push("text-decoration: underline double");
        break;
      case "wave":
        styles.push("text-decoration: underline wavy");
        break;
      default:
        styles.push("text-decoration: underline");
    }
  }

  return styles;
};

const getParagraphStyles = (pPr: Element | null) => {
  const styles: string[] = [];

  if (!pPr) return styles;

  const jc = getElementByTagNameNS(pPr, "jc");
  if (jc) {
    const alignment =
      jc.getAttributeNS(WORD_NS, "val") || jc.getAttribute("w:val");
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
  const ind = getElementByTagNameNS(pPr, "ind");
  if (ind) {
    const left =
      ind.getAttributeNS(WORD_NS, "left") || ind.getAttribute("w:left");
    const right =
      ind.getAttributeNS(WORD_NS, "right") || ind.getAttribute("w:right");
    const firstLine =
      ind.getAttributeNS(WORD_NS, "firstLine") ||
      ind.getAttribute("w:firstLine");
    const hanging =
      ind.getAttributeNS(WORD_NS, "hanging") || ind.getAttribute("w:hanging");

    if (left) styles.push(`margin-left: ${Number.parseInt(left) / 20}pt`);
    if (right) styles.push(`margin-right: ${Number.parseInt(right) / 20}pt`);
    if (firstLine)
      styles.push(`text-indent: ${Number.parseInt(firstLine) / 20}pt`);
    if (hanging)
      styles.push(`text-indent: -${Number.parseInt(hanging) / 20}pt`);
  }

  const spacing = getElementByTagNameNS(pPr, "spacing");
  if (spacing) {
    const before =
      spacing.getAttributeNS(WORD_NS, "before") ||
      spacing.getAttribute("w:before");
    const after =
      spacing.getAttributeNS(WORD_NS, "after") ||
      spacing.getAttribute("w:after");
    const line =
      spacing.getAttributeNS(WORD_NS, "line") || spacing.getAttribute("w:line");

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
