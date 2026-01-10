import EditorJS from "@editorjs/editorjs";

interface ColumnData {
  cols: Array<{
    blocks: any[];
  }>;
  numberOfColumns: number;
  layout: {
    gap: number;
    backgroundColor: string;
    columnBackgroundColor: string;
    borderColor: string;
    borderRadius: number;
    padding: number;
    customCSS: string;
  };
}

interface ColumnConfig {
  EditorJS: typeof EditorJS;
  tools: any;
  defaultColumns?: number;
  maxColumns?: number;
  defaultGap?: number;
  defaultBackgroundColor?: string;
  defaultColumnBackgroundColor?: string;
  defaultBorderColor?: string;
  defaultBorderRadius?: number;
  defaultPadding?: number;
}

class CustomColumnsTool {
  private api: any;
  private readOnly: boolean;
  private data: ColumnData;
  private config: ColumnConfig;
  private wrapper: HTMLElement | null = null;
  private editors: EditorJS[] = [];
  private columnWrappers: HTMLElement[] = [];
  private settingsPanel: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: "Columns",
      icon: `<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg">
              <path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/>
            </svg>`,
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = {
      EditorJS: config?.EditorJS || EditorJS,
      tools: config?.tools || {},
      defaultColumns: config?.defaultColumns || 2,
      maxColumns: config?.maxColumns || 4,
      defaultGap: config?.defaultGap || 20,
      defaultBackgroundColor: config?.defaultBackgroundColor || "transparent",
      defaultColumnBackgroundColor:
        config?.defaultColumnBackgroundColor || "#fafafa",
      defaultBorderColor: config?.defaultBorderColor || "#e8e8eb",
      defaultBorderRadius: config?.defaultBorderRadius || 8,
      defaultPadding: config?.defaultPadding || 8,
    };

    this.data = {
      cols: data?.cols || this._createEmptyColumns(this.config.defaultColumns),
      numberOfColumns: data?.numberOfColumns || this.config.defaultColumns,
      layout: data?.layout || {
        gap: this.config.defaultGap,
        backgroundColor: this.config.defaultBackgroundColor,
        columnBackgroundColor: this.config.defaultColumnBackgroundColor,
        borderColor: this.config.defaultBorderColor,
        borderRadius: this.config.defaultBorderRadius,
        padding: this.config.defaultPadding,
        customCSS: data?.layout?.customCSS || "",
      },
    };
  }

  private _createEmptyColumns(count: number): Array<{ blocks: any[] }> {
    return Array.from({ length: count }, () => ({ blocks: [] }));
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("table");
    this.wrapper.classList.add("custom-columns-tool");
    this._applyStyles();

    // Initialize the columns array properly
    if (!this.data.cols || this.data.cols.length < this.data.numberOfColumns) {
      this.data.cols = this._createEmptyColumns(this.data.numberOfColumns);
    }

    // Create column layout
    this._renderColumns();

    // Inject responsive styles
    this._injectResponsiveStyles();

    return this.wrapper;
  }

  private _injectResponsiveStyles(): void {
    const styleId = "custom-layout-tool-styles";
    const existingStyle = document.getElementById(styleId);

    // Always update style content to ensure latest version
    const style = existingStyle || document.createElement("style");
    if (!existingStyle) {
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      /* Mobile view (media query OR explicit class from builder) */
      @media only screen and (max-width: 768px) {
        ${this._getMobileStyles()}
      }

      /* Explicit mobile view override */
      .mobile-view-active .custom-columns-tool,
      .mobile-view-active .custom-columns-tool tbody,
      .mobile-view-active .custom-columns-tool tr,
      .mobile-view-active .custom-columns-tool td,
      .mobile-view-active .custom-columns-tool .custom-column {
          display: block !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
      }
      
      .mobile-view-active .custom-columns-tool {
           table-layout: auto !important;
           height: auto !important;
      }

      .mobile-view-active .custom-columns-tool td.custom-column {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-bottom: 16px !important;
          border-left: none !important;
          border-right: none !important;
      }
        
      .mobile-view-active .custom-columns-tool td.custom-column:last-child {
          margin-bottom: 0 !important;
      }
    `;
  }

  private _getMobileStyles(): string {
    return `
        .custom-columns-tool,
        .custom-columns-tool tbody,
        .custom-columns-tool tr,
        .custom-columns-tool td,
        .custom-columns-tool .custom-column {
          display: block !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Reset table specific properties */
        .custom-columns-tool {
           table-layout: auto !important;
           height: auto !important;
        }

        .custom-columns-tool td.custom-column {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-bottom: 16px !important;
          border-left: none !important;
          border-right: none !important;
        }
        
        .custom-columns-tool td.custom-column:last-child {
          margin-bottom: 0 !important;
        }
    `;
  }

  private _applyStyles(): void {
    if (!this.wrapper) return;

    this.wrapper.style.cssText = `
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      box-sizing: border-box;
      margin: 10px 0;
      position: relative;
      background: ${this.data.layout.backgroundColor};
      border-radius: ${this.data.layout.borderRadius}px;
      ${this.data.layout.customCSS}
    `;


  }

  private _renderColumns(): void {
    if (!this.wrapper) return;

    // Clear existing columns (tbody/tr)
    this.wrapper.innerHTML = "";

    // Safely destroy existing editors
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && editor.destroy) {
        try {
          const destroyPromise: any = editor.destroy();
          if (destroyPromise && typeof destroyPromise.catch === "function") {
            destroyPromise.catch((err: any) => {
              console.error(`Error destroying editor ${i}:`, err);
            });
          }
        } catch (err) {
          console.error(`Error in destroy for editor ${i}:`, err);
        }
      }
    }
    this.editors = [];

    // Ensure we have the right number of columns in data
    while (this.data.cols.length < this.data.numberOfColumns) {
      this.data.cols.push({ blocks: [] });
    }

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");

    // Create columns
    const gap = this.data.layout.gap;

    for (let i = 0; i < this.data.numberOfColumns; i++) {
      const td = document.createElement("td");
      td.classList.add("custom-column");

      // Calculate gap padding
      let paddingLeft = 0;
      let paddingRight = 0;

      if (i === 0) {
        // First column: padding right = gap/2
        paddingRight = gap / 2;
      } else if (i === this.data.numberOfColumns - 1) {
        // Last column: padding left = gap/2
        paddingLeft = gap / 2;
      } else {

        paddingLeft = gap / 2;
        paddingRight = gap / 2;
      }


      td.style.cssText = `
            width: ${100 / this.data.numberOfColumns}%;
            vertical-align: top;
            box-sizing: border-box;
            padding-left: ${paddingLeft}px;
            padding-right: ${paddingRight}px;
            padding-top: 0;
            padding-bottom: 0;
        `;

      const innerContent = document.createElement("div");
      innerContent.style.cssText = `
            display: block;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 1px solid ${this.data.layout.borderColor};
            border-radius: ${this.data.layout.borderRadius}px;
            padding: ${this.data.layout.padding}px;
            background: ${this.data.layout.columnBackgroundColor};
            min-height: 100px;
            transition: all 0.3s ease;
            overflow: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
        `;

      const editorHolder = document.createElement("div");
      editorHolder.id = `column-editor-${Date.now()}-${i}`;
      editorHolder.style.cssText = `
            background: white;
            border-radius: 4px;
            padding: 6px;
            min-height: 80px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
        `;

      innerContent.appendChild(editorHolder);
      td.appendChild(innerContent);
      tr.appendChild(td);
      this.columnWrappers.push(innerContent); // Keep track of inner content for style updates

      // Initialize editor for this column
      setTimeout(
        () => {
          this._initializeColumnEditor(editorHolder.id, i);
        },
        100 * (i + 1)
      );
    }

    tbody.appendChild(tr);
    this.wrapper.appendChild(tbody);
  }

  private _initializeColumnEditor(holderId: string, columnIndex: number): void {
    try {
      const holderElement = document.getElementById(holderId);
      if (!holderElement) {
        console.warn(`Holder element ${holderId} not found`);
        return;
      }

      const editor = new this.config.EditorJS({
        holder: holderId,
        tools: this.config.tools, // This includes columns tool, enabling nested columns
        data: {
          blocks: this.data.cols[columnIndex]?.blocks || [],
        },
        readOnly: this.readOnly,
        minHeight: 0,
        onChange: async () => {
          if (!this.readOnly) {
            try {
              const savedData = await editor.save();
              if (this.data.cols[columnIndex]) {
                this.data.cols[columnIndex] = {
                  blocks: savedData.blocks,
                };
              }
            } catch (error) {
              console.error("Error saving column data:", error);
            }
          }
        },
        onReady: () => {
          this.editors[columnIndex] = editor;
          // Ensure editor content doesn't exceed column width
          const editorElement = document.getElementById(holderId);
          if (editorElement) {
            const codexEditor = editorElement.querySelector(".codex-editor");
            if (codexEditor) {
              (codexEditor as HTMLElement).style.maxWidth = "100%";
              (codexEditor as HTMLElement).style.boxSizing = "border-box";
              (codexEditor as HTMLElement).style.overflow = "hidden";
            }
          }
        },
      });
    } catch (error) {
      console.error("Error initializing column editor:", error);
    }
  }

  private async _changeColumnCount(newCount: number): Promise<void> {
    // Save current editor data before making changes
    const savedData: any[] = [];

    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && typeof editor.save === "function") {
        try {
          const data = await editor.save();
          savedData[i] = data.blocks;
        } catch (error) {
          console.error(`Error saving column ${i}:`, error);
          savedData[i] = [];
        }
      } else {
        savedData[i] = this.data.cols[i]?.blocks || [];
      }
    }

    // Update data structure
    if (newCount > this.data.numberOfColumns) {
      const columnsToAdd = newCount - this.data.numberOfColumns;
      for (let i = 0; i < columnsToAdd; i++) {
        this.data.cols.push({ blocks: [] });
      }
    } else if (newCount < this.data.numberOfColumns) {
      this.data.cols = this.data.cols.slice(0, newCount);
    }

    this.data.numberOfColumns = newCount;
    this._renderColumns();
  }

  // Method to update styles when settings change
  private _updateLayoutStyle(property: string, value: any): void {
    (this.data.layout as any)[property] = value;

    // Re-render columns to apply gap changes (as they affect TD padding)
    if (property === "gap") {
      this._applyStyles();
      this._renderColumns();
      return;
    }

    this._applyStyles();

    // Update individual columns (inner content divs)
    this.columnWrappers.forEach((column) => {
      if (property === "borderColor") {
        column.style.borderColor = value;
      } else if (property === "columnBackgroundColor") {
        column.style.background = value;
      } else if (property === "borderRadius") {
        column.style.borderRadius = `${value}px`;
      } else if (property === "padding") {
        column.style.padding = `${value}px`;
      }
    });
  }

  async save(): Promise<ColumnData> {
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && typeof editor.save === "function") {
        try {
          const savedData = await editor.save();
          this.data.cols[i] = {
            blocks: savedData.blocks,
          };
        } catch (error) {
          console.error(`Error saving column ${i}:`, error);
        }
      }
    }

    return {
      cols: this.data.cols,
      numberOfColumns: this.data.numberOfColumns,
      layout: this.data.layout,
    };
  }

  validate(savedData: ColumnData): boolean {
    return (
      savedData.cols &&
      Array.isArray(savedData.cols) &&
      savedData.cols.length > 0
    );
  }

  renderSettings(): HTMLElement {
    this.settingsPanel = document.createElement("div");
    this.settingsPanel.style.cssText = "padding: 10px; max-width: 300px;";

    this._renderColumnCountSettings();
    this._renderLayoutSettings();
    this._renderColorSettings();
    this._renderAdvancedSettings();

    return this.settingsPanel;
  }

  private _renderColumnCountSettings(): void {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 20px;";

    const title = document.createElement("div");
    title.textContent = "Column Layout";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    section.appendChild(title);

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap;";

    for (let i = 1; i <= this.config.maxColumns; i++) {
      const button = document.createElement("button");
      button.textContent = `${i}`;
      button.type = "button";
      button.style.cssText = `
        width: 36px;
        height: 36px;
        border: 1px solid ${i === this.data.numberOfColumns ? "#3b82f6" : "#e5e7eb"};
        border-radius: 6px;
        background: ${i === this.data.numberOfColumns ? "#3b82f6" : "white"};
        color: ${i === this.data.numberOfColumns ? "white" : "#374151"};
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      button.addEventListener("mouseenter", () => {
        if (i !== this.data.numberOfColumns) {
          button.style.background = "#f3f4f6";
          button.style.borderColor = "#d1d5db";
        }
      });

      button.addEventListener("mouseleave", () => {
        if (i !== this.data.numberOfColumns) {
          button.style.background = "white";
          button.style.borderColor = "#e5e7eb";
        }
      });

      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._changeColumnCount(i);

        buttonsWrapper.querySelectorAll("button").forEach((btn) => {
          const btnElement = btn as HTMLElement;
          const btnNumber = parseInt(btnElement.textContent || "0");
          if (btnNumber === i) {
            btnElement.style.background = "#3b82f6";
            btnElement.style.color = "white";
            btnElement.style.borderColor = "#3b82f6";
          } else {
            btnElement.style.background = "white";
            btnElement.style.color = "#374151";
            btnElement.style.borderColor = "#e5e7eb";
          }
        });
      });

      buttonsWrapper.appendChild(button);
    }

    section.appendChild(buttonsWrapper);
    this.settingsPanel!.appendChild(section);
  }

  private _renderLayoutSettings(): void {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 20px;";

    const title = document.createElement("div");
    title.textContent = "Layout Settings";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    section.appendChild(title);

    // Gap setting
    const gapWrapper = this._createSliderSetting(
      "Gap",
      this.data.layout.gap,
      0,
      50,
      (value) => {
        this._updateLayoutStyle("gap", value);
      }
    );
    section.appendChild(gapWrapper);

    // Padding setting
    const paddingWrapper = this._createSliderSetting(
      "Padding",
      this.data.layout.padding,
      0,
      30,
      (value) => {
        this._updateLayoutStyle("padding", value);
      }
    );
    section.appendChild(paddingWrapper);

    // Border Radius setting
    const borderRadiusWrapper = this._createSliderSetting(
      "Border Radius",
      this.data.layout.borderRadius,
      0,
      20,
      (value) => {
        this._updateLayoutStyle("borderRadius", value);
      }
    );
    section.appendChild(borderRadiusWrapper);

    this.settingsPanel!.appendChild(section);
  }

  private _renderColorSettings(): void {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 20px;";

    const title = document.createElement("div");
    title.textContent = "Color Settings";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    section.appendChild(title);

    // Background Color
    const bgColorWrapper = this._createColorSetting(
      "Background Color",
      this.data.layout.backgroundColor,
      (value) => {
        this._updateLayoutStyle("backgroundColor", value);
      }
    );
    section.appendChild(bgColorWrapper);

    // Column Background Color
    const columnBgColorWrapper = this._createColorSetting(
      "Column Background",
      this.data.layout.columnBackgroundColor,
      (value) => {
        this._updateLayoutStyle("columnBackgroundColor", value);
      }
    );
    section.appendChild(columnBgColorWrapper);

    // Border Color
    const borderColorWrapper = this._createColorSetting(
      "Border Color",
      this.data.layout.borderColor,
      (value) => {
        this._updateLayoutStyle("borderColor", value);
      }
    );
    section.appendChild(borderColorWrapper);

    this.settingsPanel!.appendChild(section);
  }

  private _renderAdvancedSettings(): void {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 10px;";

    const title = document.createElement("div");
    title.textContent = "Advanced Settings";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    section.appendChild(title);

    // Custom CSS
    const cssWrapper = document.createElement("div");
    cssWrapper.style.cssText = "margin-bottom: 12px;";

    const cssLabel = document.createElement("label");
    cssLabel.textContent = "Custom CSS";
    cssLabel.style.cssText =
      "display: block; font-size: 12px; color: #374151; margin-bottom: 4px;";
    cssWrapper.appendChild(cssLabel);

    const cssTextarea = document.createElement("textarea");
    cssTextarea.value = this.data.layout.customCSS;
    cssTextarea.placeholder = "Enter custom CSS styles...";
    cssTextarea.style.cssText = `
      width: 100%;
      height: 60px;
      padding: 6px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      resize: vertical;
    `;

    cssTextarea.addEventListener("input", (e) => {
      const value = (e.target as HTMLTextAreaElement).value;
      this._updateLayoutStyle("customCSS", value);
    });

    cssWrapper.appendChild(cssTextarea);
    section.appendChild(cssWrapper);

    // Reset to defaults button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset to Defaults";
    resetButton.type = "button";
    resetButton.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      color: #374151;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.15s;
    `;

    resetButton.addEventListener("mouseenter", () => {
      resetButton.style.background = "#f3f4f6";
    });

    resetButton.addEventListener("mouseleave", () => {
      resetButton.style.background = "white";
    });

    resetButton.addEventListener("click", () => {
      this.data.layout = {
        gap: this.config.defaultGap!,
        backgroundColor: this.config.defaultBackgroundColor!,
        columnBackgroundColor: this.config.defaultColumnBackgroundColor!,
        borderColor: this.config.defaultBorderColor!,
        borderRadius: this.config.defaultBorderRadius!,
        padding: this.config.defaultPadding!,
        customCSS: "",
      };
      this._applyStyles();
      this._renderColumns();

      // Refresh settings panel
      if (this.settingsPanel) {
        this.settingsPanel.innerHTML = "";
        this._renderColumnCountSettings();
        this._renderLayoutSettings();
        this._renderColorSettings();
        this._renderAdvancedSettings();
      }
    });

    section.appendChild(resetButton);
    this.settingsPanel!.appendChild(section);
  }

  private _createSliderSetting(
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (value: number) => void
  ): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "margin-bottom: 12px;";

    const labelRow = document.createElement("div");
    labelRow.style.cssText =
      "display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;";

    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    labelElement.style.cssText = "font-size: 12px; color: #374151;";

    const valueElement = document.createElement("span");
    valueElement.textContent = `${value}px`;
    valueElement.style.cssText = "font-size: 11px; color: #6b7280;";

    labelRow.appendChild(labelElement);
    labelRow.appendChild(valueElement);
    wrapper.appendChild(labelRow);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.value = value.toString();
    slider.style.cssText = `
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #e5e7eb;
      outline: none;
      -webkit-appearance: none;
    `;

    slider.addEventListener("input", (e) => {
      const newValue = parseInt((e.target as HTMLInputElement).value);
      valueElement.textContent = `${newValue}px`;
      onChange(newValue);
    });

    wrapper.appendChild(slider);
    return wrapper;
  }

  private _createColorSetting(
    label: string,
    value: string,
    onChange: (value: string) => void
  ): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "margin-bottom: 12px;";

    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    labelElement.style.cssText =
      "display: block; font-size: 12px; color: #374151; margin-bottom: 4px;";
    wrapper.appendChild(labelElement);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = value;
    colorInput.style.cssText = `
      width: 100%;
      height: 32px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
    `;

    colorInput.addEventListener("input", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      onChange(newValue);
    });

    wrapper.appendChild(colorInput);
    return wrapper;
  }

  destroy(): void {
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && editor.destroy) {
        try {
          const destroyPromise = editor.destroy();
          if (destroyPromise && typeof destroyPromise.catch === "function") {
            destroyPromise.catch((err: any) => {
              console.error(`Error destroying editor ${i}:`, err);
            });
          }
        } catch (err) {
          console.error(`Error in destroy for editor ${i}:`, err);
        }
      }
    }
    this.editors = [];
    this.columnWrappers = [];
    this.wrapper = null;
    this.settingsPanel = null;
  }
}

export default CustomColumnsTool;
