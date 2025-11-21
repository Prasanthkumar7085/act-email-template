import { fontConstants } from "@/lib/fontConstants";

interface FontConstant {
  value: string;
  label?: string;
}

interface TextColorToolAPI {
  // API interface for EditorJS
  [key: string]: any;
}

export class TextColorTool {
  static get isInline(): boolean {
    return true;
  }

  static get sanitize(): Record<string, Record<string, boolean>> {
    return {
      span: {
        style: true,
      },
    };
  }

  private api: TextColorToolAPI;
  private colorPicker: HTMLInputElement;
  private bgColorPicker: HTMLInputElement;
  private fontPicker: HTMLSelectElement;
  private fontSizePicker: HTMLSelectElement;
  private superscriptBtn: HTMLButtonElement;
  private subscriptBtn: HTMLButtonElement;

  constructor({ api }: { api: TextColorToolAPI }) {
    this.api = api;
    this.colorPicker = document.createElement("input");
    this.bgColorPicker = document.createElement("input");
    this.fontPicker = document.createElement("select");
    this.fontSizePicker = document.createElement("select");
    this.superscriptBtn = document.createElement("button");
    this.subscriptBtn = document.createElement("button");
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";
    wrapper.style.alignItems = "center";
    wrapper.style.padding = "8px";
    wrapper.style.backgroundColor = "#f5f5f5";
    wrapper.style.borderRadius = "4px";
    wrapper.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

    // Create color picker section with label
    const colorSection = this.createSection("Text:");
    this.colorPicker = document.createElement("input");
    this.colorPicker.type = "color";
    this.colorPicker.title = "Text Color";
    this.colorPicker.style.cursor = "pointer";
    this.colorPicker.style.width = "30px";
    this.colorPicker.style.height = "30px";
    this.colorPicker.style.border = "none";
    this.colorPicker.style.padding = "0";
    this.colorPicker.style.borderRadius = "3px";
    colorSection.appendChild(this.colorPicker);

    // Create background color picker section with label
    const bgColorSection = this.createSection("BG:");
    this.bgColorPicker = document.createElement("input");
    this.bgColorPicker.type = "color";
    this.bgColorPicker.title = "Background Color";
    this.bgColorPicker.style.cursor = "pointer";
    this.bgColorPicker.style.width = "30px";
    this.bgColorPicker.style.height = "30px";
    this.bgColorPicker.style.border = "none";
    this.bgColorPicker.style.padding = "0";
    this.bgColorPicker.style.borderRadius = "3px";
    bgColorSection.appendChild(this.bgColorPicker);

    // Create font family section without label
    this.fontPicker = document.createElement("select");
    this.fontPicker.title = "Font Family";
    this.fontPicker.style.padding = "4px";
    this.fontPicker.style.borderRadius = "3px";
    this.fontPicker.style.border = "1px solid #ccc";
    this.fontPicker.style.width = "80px";

    // Add Arial as default option
    const arialOption = document.createElement("option");
    arialOption.value = "Arial";
    arialOption.textContent = "Arial";
    arialOption.selected = true;
    arialOption.style.fontFamily = "Arial";
    this.fontPicker.appendChild(arialOption);

    // Add other font options
    fontConstants.forEach((font: FontConstant) => {
      const option = document.createElement("option");
      option.value = font.value;
      option.textContent = font.value;
      option.style.fontFamily = font.value;
      this.fontPicker.appendChild(option);
    });

    // Create font size section without label
    this.fontSizePicker = document.createElement("select");
    this.fontSizePicker.title = "Font Size";
    this.fontSizePicker.style.padding = "4px";
    this.fontSizePicker.style.borderRadius = "3px";
    this.fontSizePicker.style.border = "1px solid #ccc";
    this.fontSizePicker.style.width = "60px";

    ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"].forEach(
      (size: string) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        if (size === "16px") option.selected = true;
        this.fontSizePicker.appendChild(option);
      }
    );

    // Create superscript and subscript buttons
    const formattingSection = document.createElement("div");
    formattingSection.style.display = "flex";
    formattingSection.style.gap = "5px";

    this.superscriptBtn = this.createStyledButton("Superscript", "⁺");
    this.subscriptBtn = this.createStyledButton("Subscript", "₋");

    formattingSection.appendChild(this.superscriptBtn);
    formattingSection.appendChild(this.subscriptBtn);

    this.setDefaultStyles();

    this.colorPicker.addEventListener("input", () =>
      this.applyColor(this.colorPicker.value)
    );
    this.bgColorPicker.addEventListener("input", () =>
      this.applyBackgroundColor(this.bgColorPicker.value)
    );
    this.fontPicker.addEventListener("change", () =>
      this.applyFontFamily(this.fontPicker.value)
    );
    this.fontSizePicker.addEventListener("change", () =>
      this.applyFontSize(this.fontSizePicker.value)
    );
    this.superscriptBtn.addEventListener("click", () =>
      this.toggleSuperscript()
    );
    this.subscriptBtn.addEventListener("click", () => this.toggleSubscript());

    wrapper.appendChild(colorSection);
    wrapper.appendChild(bgColorSection);
    wrapper.appendChild(this.fontPicker);
    wrapper.appendChild(this.fontSizePicker);
    wrapper.appendChild(formattingSection);

    return wrapper;
  }

  createSection(labelText: string): HTMLDivElement {
    const section = document.createElement("div");
    section.style.display = "flex";
    section.style.alignItems = "center";
    section.style.gap = "5px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.fontSize = "12px";
    label.style.fontWeight = "500";
    label.style.color = "#555";

    section.appendChild(label);
    return section;
  }

  createStyledButton(tooltip: string, text: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.title = tooltip;
    button.style.border = "1px solid #ccc";
    button.style.borderRadius = "3px";
    button.style.padding = "4px 8px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "#fff";
    button.style.fontSize = "14px";
    button.style.transition = "all 0.2s";

    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#f0f0f0";
    });

    button.addEventListener("mouseout", () => {
      if (!button.classList.contains("active")) {
        button.style.backgroundColor = "#fff";
      }
    });

    return button;
  }

  toggleSuperscript(): void {
    this.toggleTextStyle("verticalAlign", "super");
    this.toggleButtonActive(this.superscriptBtn);
    if (this.superscriptBtn.classList.contains("active")) {
      this.subscriptBtn.classList.remove("active");
      this.updateButtonStyle(this.subscriptBtn, false);
    }
  }

  toggleSubscript(): void {
    this.toggleTextStyle("verticalAlign", "sub");
    this.toggleButtonActive(this.subscriptBtn);
    if (this.subscriptBtn.classList.contains("active")) {
      this.superscriptBtn.classList.remove("active");
      this.updateButtonStyle(this.superscriptBtn, false);
    }
  }

  toggleButtonActive(button: HTMLButtonElement): void {
    button.classList.toggle("active");
    this.updateButtonStyle(button, button.classList.contains("active"));
  }

  updateButtonStyle(button: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
      button.style.backgroundColor = "#ddd";
      button.style.border = "1px solid #888";
      button.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.1)";
    } else {
      button.style.backgroundColor = "#fff";
      button.style.border = "1px solid #ccc";
      button.style.boxShadow = "none";
    }
  }

  toggleTextStyle(property: string, value: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    if (!parentElement) return;

    const computedStyle = window.getComputedStyle(parentElement);
    const isAlreadyStyled =
      computedStyle[property as keyof CSSStyleDeclaration] === value;

    if (isAlreadyStyled) {
      this.applyStyle(property, "normal");
    } else {
      this.applyStyle(property, value);
    }
  }

  setDefaultStyles(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    if (!parentElement) return;

    const computedStyle = window.getComputedStyle(parentElement);

    this.colorPicker.value = rgbToHex(computedStyle.color);
    this.bgColorPicker.value = rgbToHex(computedStyle.backgroundColor);

    const currentFont = computedStyle.fontFamily.replace(/['"]+/g, "");
    let fontFound = false;

    // Check if current font is in our list
    for (let i = 0; i < this.fontPicker.options.length; i++) {
      if (this.fontPicker.options[i].value === currentFont) {
        this.fontPicker.selectedIndex = i;
        fontFound = true;
        break;
      }
    }

    // If not found, select Arial
    if (!fontFound) {
      this.fontPicker.selectedIndex = 0; // Arial is at index 0
    }

    // Set font size
    const currentSize = computedStyle.fontSize;
    let sizeFound = false;

    for (let i = 0; i < this.fontSizePicker.options.length; i++) {
      if (this.fontSizePicker.options[i].value === currentSize) {
        this.fontSizePicker.selectedIndex = i;
        sizeFound = true;
        break;
      }
    }

    if (!sizeFound) {
      // Default to 16px
      for (let i = 0; i < this.fontSizePicker.options.length; i++) {
        if (this.fontSizePicker.options[i].value === "16px") {
          this.fontSizePicker.selectedIndex = i;
          break;
        }
      }
    }

    const isSuperscript = computedStyle.verticalAlign === "super";
    const isSubscript = computedStyle.verticalAlign === "sub";

    this.updateButtonStyle(this.superscriptBtn, isSuperscript);
    this.updateButtonStyle(this.subscriptBtn, isSubscript);

    if (isSuperscript) this.superscriptBtn.classList.add("active");
    if (isSubscript) this.subscriptBtn.classList.add("active");
  }

  applyColor(color: string): void {
    this.applyStyle("color", color);
  }

  applyBackgroundColor(bgColor: string): void {
    this.applyStyle("backgroundColor", bgColor);
  }

  applyFontFamily(fontFamily: string): void {
    this.applyStyle("fontFamily", fontFamily);
  }

  applyFontSize(fontSize: string): void {
    this.applyStyle("fontSize", fontSize);
  }

  applyStyle(property: string, value: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    (span.style as CSSStyleDeclaration)[property as any] = value;
    span.textContent = range.toString();

    range.deleteContents();
    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(span);
    selection.addRange(newRange);
  }
}

function rgbToHex(rgb: string): string {
  if (rgb.startsWith("rgb")) {
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) return "#000000";

    return `#${rgbValues
      .slice(0, 3)
      .map((value) => Number.parseInt(value, 10).toString(16).padStart(2, "0"))
      .join("")}`;
  } else if (rgb.startsWith("#")) {
    return rgb;
  } else if (rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") {
    return "#ffffff";
  } else {
    return "#000000";
  }
}
