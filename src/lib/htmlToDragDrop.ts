export function htmlToBlocks(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const body = doc.body;

  // Helper to generate unique IDs
  function generateId(prefix = "block") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Extract styles from element
  function extractStyles(element) {
    const styles = {};

    // Always extract inline styles first
    const inlineStyle = element.getAttribute("style");
    if (inlineStyle) {
      inlineStyle.split(";").forEach((style) => {
        const [prop, value] = style.split(":").map((s) => s.trim());
        if (prop && value) {
          const camelProp = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          styles[camelProp] = value;
        }
      });
    }

    // Common style properties to extract
    const styleProps = [
      "fontSize",
      "fontWeight",
      "color",
      "backgroundColor",
      "margin",
      "padding",
      "textAlign",
      "lineHeight",
      "borderRadius",
      "display",
      "width",
      "height",
      "maxWidth",
      "objectFit",
      "border",
      "boxSizing",
      "verticalAlign",
      "outline",
      "textDecoration",
      "borderTop", // For hr elements
      "borderBottom", // For hr elements
      "borderColor", // For hr elements
    ];

    // Try to get computed styles (only works in browser)
    try {
      if (typeof window !== "undefined" && window.getComputedStyle) {
        const computedStyle = getComputedStyle(element);
        styleProps.forEach((prop) => {
          const value = computedStyle[prop];
          if (
            value &&
            value !== "undefined" &&
            value !== "inherit" &&
            value !== "initial"
          ) {
            // Don't override inline styles
            const camelProp = prop.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase()
            );
            if (!styles[camelProp]) {
              styles[camelProp] = value;
            }
          }
        });
      }
    } catch (e) {
      // Fallback to element style
      styleProps.forEach((prop) => {
        const value = element.style[prop];
        if (value && value !== "undefined") {
          const camelProp = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          if (!styles[camelProp]) {
            styles[camelProp] = value;
          }
        }
      });
    }

    return styles;
  }

  // Process text content
  function processTextContent(text) {
    return text.trim().replace(/\s+/g, " ");
  }

  // Process heading element
  function processHeading(element) {
    const level = parseInt(element.tagName[1]) || 1;
    return {
      id: generateId("heading"),
      type: "heading",
      content: processTextContent(element.textContent),
      level: level,
      styles: extractStyles(element),
    };
  }

  // Process paragraph element
  function processParagraph(element) {
    return {
      id: generateId("paragraph"),
      type: "paragraph",
      content: processTextContent(element.textContent),
      styles: extractStyles(element),
    };
  }

  // Process button element
  function processButton(element) {
    return {
      id: generateId("button"),
      type: "button",
      content: processTextContent(element.textContent),
      href: element.getAttribute("href") || "",
      target: element.getAttribute("target") || "",
      styles: extractStyles(element),
    };
  }

  // Process image element
  function processImage(element) {
    return {
      id: generateId("image"),
      type: "image",
      content: element.getAttribute("src") || "",
      alt: element.getAttribute("alt") || "",
      styles: extractStyles(element),
    };
  }

  // Process list element
  function processList(element) {
    const items = Array.from(element.querySelectorAll("li")).map((li) =>
      processTextContent(li.textContent)
    );

    return {
      id: generateId("list"),
      type: "list",
      items: items,
      styles: extractStyles(element),
    };
  }

  // Process divider element - FIXED VERSION
  function processDivider(element) {
    const styles = extractStyles(element);

    // Special handling for <hr> elements
    if (element.tagName.toLowerCase() === "hr") {
      // Extract common hr styles
      if (element.style.height) {
        styles.height = element.style.height;
      }
      if (element.style.backgroundColor) {
        styles.backgroundColor = element.style.backgroundColor;
      }
      if (element.style.border) {
        styles.border = element.style.border;
      }
      if (element.style.borderTop) {
        styles.borderTop = element.style.borderTop;
      }
      if (element.style.borderBottom) {
        styles.borderBottom = element.style.borderBottom;
      }

      // Default hr styles if none specified
      if (!styles.height && !styles.border && !styles.borderTop) {
        styles.height = "1px";
        styles.backgroundColor = "#e2e8f0";
      }
    }

    // For divs styled as dividers
    const bgColor =
      element.style.backgroundColor ||
      element.getAttribute("style")?.match(/background-color:\s*([^;]+)/)?.[1];
    const height =
      element.style.height ||
      element.getAttribute("style")?.match(/height:\s*([^;]+)/)?.[1];
    const border =
      element.style.border ||
      element.getAttribute("style")?.match(/border:\s*([^;]+)/)?.[1];
    const borderTop =
      element.style.borderTop ||
      element.getAttribute("style")?.match(/border-top:\s*([^;]+)/)?.[1];

    if (
      height === "1px" ||
      (border === "none" && borderTop && borderTop.includes("1px")) ||
      (bgColor && (height === "1px" || height === "2px"))
    ) {
      if (!styles.height && height) styles.height = height;
      if (!styles.backgroundColor && bgColor) styles.backgroundColor = bgColor;
      if (!styles.border && border) styles.border = border;
      if (!styles.borderTop && borderTop) styles.borderTop = borderTop;

      // Ensure we have minimum divider styling
      if (!styles.height) styles.height = "1px";
      if (!styles.backgroundColor && !styles.border && !styles.borderTop) {
        styles.backgroundColor = "#e2e8f0";
      }
    }

    return {
      id: generateId("divider"),
      type: "divider",
      styles: styles,
    };
  }

  // Process spacer element
  function processSpacer(element) {
    const styles = extractStyles(element);

    // If it's a div with specific height or padding that creates space
    const height =
      element.style.height ||
      element.getAttribute("style")?.match(/height:\s*([^;]+)/)?.[1];
    const padding =
      element.style.padding ||
      element.getAttribute("style")?.match(/padding:\s*([^;]+)/)?.[1];

    if (
      height &&
      (parseInt(height) > 8 || (height.includes("px") && parseInt(height) > 8))
    ) {
      if (!styles.height) styles.height = height;
    } else if (padding && padding.includes("px")) {
      const paddingValues = padding
        .split(" ")
        .map((v) => parseInt(v.replace("px", "")));
      const maxPadding = Math.max(...paddingValues.filter((v) => !isNaN(v)));
      if (maxPadding > 16) {
        if (!styles.height) styles.height = `${maxPadding}px`;
      }
    } else {
      // Default spacer
      if (!styles.height) styles.height = "32px";
    }

    return {
      id: generateId("spacer"),
      type: "spacer",
      styles: styles,
    };
  }

  // Check if elements are side by side (for columns)
  function areElementsSideBySide(element1, element2) {
    try {
      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();

      return (
        Math.abs(rect1.top - rect2.top) < 10 && // Roughly same vertical position
        rect1.right <= rect2.left && // Element1 is left of element2
        Math.abs(rect1.height - rect2.height) < 20 // Similar height
      );
    } catch (e) {
      return false;
    }
  }

  // Process table for column detection
  function processTableForColumns(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    const columns = [];

    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td, th"));
      cells.forEach((cell, index) => {
        if (!columns[index]) columns[index] = [];

        const cellBlocks = processElementChildren(cell);
        if (cellBlocks.length > 0) {
          columns[index].push(...cellBlocks);
        }
      });
    });

    return {
      id: generateId("columns"),
      type: "columns",
      columns: columns.filter((col) => col.length > 0),
      styles: extractStyles(table),
      columnGap: "16px",
      columnAlign: "stretch",
    };
  }

  // Check if element is a divider
  function isDividerElement(element) {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "hr") {
      return true;
    }

    if (tagName === "div") {
      const style = element.getAttribute("style") || "";
      const height =
        element.style.height || style.match(/height:\s*([^;]+)/)?.[1];
      const border =
        element.style.border || style.match(/border:\s*([^;]+)/)?.[1];
      const borderTop =
        element.style.borderTop || style.match(/border-top:\s*([^;]+)/)?.[1];
      const bgColor =
        element.style.backgroundColor ||
        style.match(/background-color:\s*([^;]+)/)?.[1];

      // Check for divider patterns
      if (height === "1px" || height === "2px") {
        return true;
      }

      if (border === "none" && borderTop && borderTop.includes("1px")) {
        return true;
      }

      if (bgColor && (height === "1px" || height === "2px")) {
        return true;
      }

      // Check if it contains only an hr
      if (
        element.children.length === 1 &&
        element.children[0].tagName.toLowerCase() === "hr"
      ) {
        return true;
      }

      // Check if it's a spacer/empty div with specific styling
      if (
        (!element.textContent.trim() &&
          height &&
          parseInt(height) > 0 &&
          parseInt(height) <= 5) ||
        (borderTop && borderTop.includes("1px"))
      ) {
        return true;
      }
    }

    return false;
  }

  // Check if element is a spacer
  function isSpacerElement(element) {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "br") {
      return true;
    }

    if (tagName === "div") {
      const style = element.getAttribute("style") || "";
      const height =
        element.style.height || style.match(/height:\s*([^;]+)/)?.[1];
      const padding =
        element.style.padding || style.match(/padding:\s*([^;]+)/)?.[1];

      // Empty div with significant height
      if (
        !element.textContent.trim() &&
        element.children.length === 0 &&
        height &&
        parseInt(height) > 8
      ) {
        return true;
      }

      // Div with only padding
      if (
        !element.textContent.trim() &&
        element.children.length === 0 &&
        padding &&
        padding.includes("px")
      ) {
        const paddingValues = padding
          .split(" ")
          .map((v) => parseInt(v.replace("px", "")));
        const maxPadding = Math.max(...paddingValues.filter((v) => !isNaN(v)));
        if (maxPadding > 16) {
          return true;
        }
      }
    }

    return false;
  }

  // Process container element
  function processContainer(element) {
    const children = processElementChildren(element);

    if (children.length === 0) return null;

    const styles = extractStyles(element);

    // Always create a div container if it has multiple children
    if (children.length > 1) {
      return {
        id: generateId("div"),
        type: "div",
        children: children,
        styles: styles,
      };
    }

    // Only flatten if it has single child AND is a true wrapper (no meaningful styling)
    const hasMeaningfulStyling = hasMeaningfulStylingFunc(styles);

    // If it has meaningful styling, keep it even with one child
    if (hasMeaningfulStyling) {
      return {
        id: generateId("div"),
        type: "div",
        children: children,
        styles: styles,
      };
    }

    // Only flatten true wrappers (single child, no styling)
    if (children.length === 1) {
      // Merge styles from wrapper into child if child is a div
      if (children[0].type === "div") {
        children[0].styles = {
          ...styles,
          ...children[0].styles,
        };
      } else if (children[0].styles) {
        // Merge styles into non-div children too
        children[0].styles = {
          ...styles,
          ...children[0].styles,
        };
      }
      return children[0];
    }

    return {
      id: generateId("div"),
      type: "div",
      children: children,
      styles: styles,
    };
  }

  // Process all children of an element
  function processElementChildren(element) {
    const blocks = [];
    const children = Array.from(element.childNodes);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Skip text nodes that only contain whitespace
      if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) {
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        // First check for special elements (divider, spacer)
        if (isDividerElement(child)) {
          blocks.push(processDivider(child));
          continue;
        }

        if (isSpacerElement(child)) {
          blocks.push(processSpacer(child));
          continue;
        }

        // Check for side-by-side elements (columns)
        const nextChild = children[i + 1];
        if (
          nextChild &&
          nextChild.nodeType === Node.ELEMENT_NODE &&
          areElementsSideBySide(child, nextChild)
        ) {
          const columnBlocks = [
            processElementChildren(child),
            processElementChildren(nextChild),
          ].filter((col) => col.length > 0);

          if (columnBlocks.length > 0) {
            blocks.push({
              id: generateId("columns"),
              type: "columns",
              columns: columnBlocks,
              styles: {},
              columnGap: "16px",
              columnAlign: "stretch",
            });
            i++; // Skip next child since we processed it
            continue;
          }
        }

        // Process individual elements
        const block = processElement(child);
        if (block) {
          blocks.push(block);
        }
      }
    }

    return blocks;
  }

  // Main element processor
  function processElement(element) {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return processHeading(element);

      case "p":
        if (element.textContent.trim() && !element.querySelector("*")) {
          return processParagraph(element);
        }
        return processContainer(element);

      case "div":
        // Check if it's a divider or spacer first
        if (isDividerElement(element)) {
          return processDivider(element);
        }
        if (isSpacerElement(element)) {
          return processSpacer(element);
        }
        if (element.textContent.trim() && !element.querySelector("*")) {
          return processParagraph(element);
        }
        return processContainer(element);

      case "a":
        if (
          element.style.display === "inline-block" ||
          element.style.backgroundColor ||
          element.getAttribute("style")?.includes("background-color") ||
          element.getAttribute("style")?.includes("padding:")
        ) {
          return processButton(element);
        }
        return processContainer(element);

      case "button":
        return processButton(element);

      case "img":
        return processImage(element);

      case "ul":
      case "ol":
        return processList(element);

      case "hr":
        return processDivider(element);

      case "table":
        return processTableForColumns(element);

      case "br":
        return processSpacer(element);

      default:
        if (element.childNodes.length > 0) {
          return processContainer(element);
        }
        return null;
    }
  }

  // Helper to check if styles are meaningful
  function hasMeaningfulStylingFunc(styles) {
    if (!styles) return false;

    const bgColor = styles.backgroundColor;
    const hasBg =
      bgColor &&
      bgColor !== "transparent" &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "rgb(0, 0, 0, 0)" &&
      !bgColor.includes("inherit");

    const padding = styles.padding;
    let hasPadding = false;
    if (padding) {
      const paddingStr = String(padding);
      const firstValue = parseInt(paddingStr.replace("px", "").split(" ")[0]);
      hasPadding = !isNaN(firstValue) && firstValue > 8;
    }

    const margin = styles.margin;
    let hasMargin = false;
    if (margin) {
      const marginStr = String(margin);
      const firstValue = parseInt(marginStr.replace("px", "").split(" ")[0]);
      hasMargin = !isNaN(firstValue) && firstValue > 8;
    }

    const border = styles.border;
    const hasBorder =
      border &&
      border !== "none" &&
      border !== "0px" &&
      !border.includes("inherit");

    const borderRadius = styles.borderRadius;
    let hasBorderRadius = false;
    if (borderRadius) {
      const borderRadiusStr = String(borderRadius);
      const value = parseInt(borderRadiusStr.replace("px", ""));
      hasBorderRadius = !isNaN(value) && value > 0;
    }

    return hasBg || hasPadding || hasMargin || hasBorder || hasBorderRadius;
  }

  // Flatten nested wrapper divs recursively
  function flattenWrappers(blocks) {
    if (!Array.isArray(blocks)) return blocks;

    return blocks
      .map((block) => {
        if (
          block &&
          block.type === "div" &&
          block.children &&
          Array.isArray(block.children)
        ) {
          // Flatten children first
          const flattenedChildren = flattenWrappers(block.children);

          // If div has no children after flattening, return null (will be filtered)
          if (flattenedChildren.length === 0) {
            return null;
          }

          // Always keep divs with multiple children, regardless of styling
          if (flattenedChildren.length > 1) {
            return {
              ...block,
              children: flattenedChildren,
            };
          }

          // Only flatten divs with single child AND no meaningful styling
          if (
            !hasMeaningfulStylingFunc(block.styles) &&
            flattenedChildren.length === 1
          ) {
            // Merge styles from wrapper into child
            const child = flattenedChildren[0];
            if (child && child.type === "div") {
              child.styles = {
                ...(block.styles || {}),
                ...(child.styles || {}),
              };
              return child;
            } else if (child && child.styles) {
              // Merge styles into non-div children too
              child.styles = {
                ...(block.styles || {}),
                ...child.styles,
              };
              return child;
            }
          }

          // Keep the div if it has meaningful styling or if we couldn't flatten
          return {
            ...block,
            children: flattenedChildren,
          };
        }
        return block;
      })
      .filter((block) => block !== null);
  }

  // Start processing from the main container
  let mainContainer = body;

  // Look for the main content area
  const contentTable = body.querySelector('table[width="100%"]');
  if (contentTable) {
    // Find the innermost table cell or div that contains the actual content
    const tbody = contentTable.querySelector("tbody") || contentTable;
    const firstRow = tbody.querySelector("tr");
    if (firstRow) {
      const firstCell = firstRow.querySelector("td");
      if (firstCell) {
        mainContainer = firstCell;
      }
    }
  } else {
    // Find the main content div
    const mainDiv =
      body.querySelector('div[style*="width"], div[style*="max-width"]') ||
      body.querySelector("div") ||
      body;
    mainContainer = mainDiv;
  }

  const blocks = processElementChildren(mainContainer);

  // Flatten unnecessary wrapper divs
  const flattenedBlocks = flattenWrappers(blocks);

  // Don't wrap in a main div - return the blocks directly
  if (
    flattenedBlocks.length === 1 &&
    flattenedBlocks[0] &&
    flattenedBlocks[0].type === "div"
  ) {
    const singleDiv = flattenedBlocks[0];
    // If the div has no meaningful styling and has children, unwrap it
    if (
      !hasMeaningfulStylingFunc(singleDiv.styles) &&
      singleDiv.children &&
      singleDiv.children.length > 0
    ) {
      return singleDiv.children;
    }
  }

  // Filter out any null blocks
  return flattenedBlocks.filter(
    (block) => block !== null && block !== undefined
  );
}
