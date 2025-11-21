export const convertHtmlToBlocks = (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const blocks: any[] = [];
  const extractStyles = (element: Element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      color: computedStyle.color || undefined,
      backgroundColor: computedStyle.backgroundColor || undefined,
    };
  };

  doc.body.childNodes.forEach((node: any) => {
    const styles = extractStyles(node);

    switch (node.nodeName) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        blocks.push({
          type: "header",
          data: {
            text: node.textContent,
            level: parseInt(node.nodeName.substring(1)),
            color: styles.color,
            backgroundColor: styles.backgroundColor,
          },
        });
        break;

      case "UL":
      case "OL":
        const listItems = Array.from(node.querySelectorAll("li")).map(
          (li: any) => li.textContent
        );
        blocks.push({
          type: "list",
          data: {
            style: node.nodeName === "UL" ? "unordered" : "ordered",
            items: listItems,
          },
        });
        break;

      case "IMG":
        blocks.push({
          type: "image",
          data: {
            url: node.getAttribute("src"),
            caption: node.getAttribute("alt") || "",
            stretched: false,
            withBorder: true,
            withBackground: false,
          },
        });
        break;

      case "BLOCKQUOTE":
        blocks.push({
          type: "quote",
          data: {
            text: node.textContent,
            caption: "",
          },
        });
        break;

      case "P":
        blocks.push({
          type: "paragraph",
          data: {
            text: node.innerHTML,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
          },
        });
        break;
      case "TABLE": {
        // Extract rows from the table
        const tableRows: string[][] = [];
        const rows = node.querySelectorAll("tr");

        rows.forEach((row: HTMLTableRowElement) => {
          const rowData: string[] = [];
          const cells = row.querySelectorAll("th, td");

          cells.forEach((cell: any) => {
            rowData.push(cell.textContent?.trim() || "");
          });

          if (rowData.length > 0) {
            tableRows.push(rowData);
          }
        });

        if (tableRows.length > 0) {
          blocks.push({
            type: "table",
            data: {
              withHeadings: node.querySelector("th") !== null,
              content: tableRows,
            },
          });
        }
        break;
      }
      default:
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          blocks.push({
            type: "paragraph",
            data: {
              text: node.textContent,
              color: styles.color,
              backgroundColor: styles.backgroundColor,
            },
          });
        }
    }
  });

  return blocks;
};
