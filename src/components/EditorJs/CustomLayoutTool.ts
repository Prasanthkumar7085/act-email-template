import EditorJS from "@editorjs/editorjs";

interface ColumnData {
  cols: Array<{
    blocks: any[];
  }>;
  numberOfColumns: number;
}

interface ColumnConfig {
  EditorJS: typeof EditorJS;
  tools: any;
  defaultColumns?: number;
  maxColumns?: number;
}

class CustomColumnsTool {
  private api: any;
  private readOnly: boolean;
  private data: ColumnData;
  private config: ColumnConfig;
  private wrapper: HTMLElement | null = null;
  private editors: EditorJS[] = [];
  private columnWrappers: HTMLElement[] = [];

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
    };

    this.data = {
      cols: data?.cols || this._createEmptyColumns(this.config.defaultColumns),
      numberOfColumns: data?.numberOfColumns || this.config.defaultColumns,
    };
  }

  private _createEmptyColumns(count: number): Array<{ blocks: any[] }> {
    return Array.from({ length: count }, () => ({ blocks: [] }));
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("custom-columns-tool");
    this.wrapper.style.cssText = `
      display: flex;
      gap: 20px;
      width: 100%;
      margin: 10px 0;
      position: relative;
    `;

    // Initialize the columns array properly
    if (!this.data.cols || this.data.cols.length < this.data.numberOfColumns) {
      this.data.cols = this._createEmptyColumns(this.data.numberOfColumns);
    }

    // Create column layout
    this._renderColumns();

    return this.wrapper;
  }

  private _renderColumns(): void {
    if (!this.wrapper) return;

    // Clear existing columns
    this.columnWrappers.forEach((col) => {
      if (col && col.parentNode) {
        col.remove();
      }
    });
    this.columnWrappers = [];

    // Safely destroy existing editors
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && editor.destroy) {
        try {
          const destroyPromise = editor.destroy();
          // Only add catch if destroy returns a promise
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

    // Create columns
    for (let i = 0; i < this.data.numberOfColumns; i++) {
      const columnWrapper = document.createElement("div");
      columnWrapper.classList.add("custom-column");
      columnWrapper.style.cssText = `
        flex: 1;
        border: 1px solid #e8e8eb;
        border-radius: 8px;
        padding: 15px;
        background: #fafafa;
        min-height: 100px;
      `;

      const editorHolder = document.createElement("div");
      editorHolder.id = `column-editor-${Date.now()}-${i}`;
      editorHolder.style.cssText = `
        background: white;
        border-radius: 4px;
        padding: 10px;
        min-height: 80px;
      `;

      columnWrapper.appendChild(editorHolder);
      this.wrapper!.appendChild(columnWrapper);
      this.columnWrappers.push(columnWrapper);

      // Initialize editor for this column
      setTimeout(
        () => {
          this._initializeColumnEditor(editorHolder.id, i);
        },
        100 * (i + 1)
      ); // Stagger initialization to avoid conflicts
    }
  }

  private _initializeColumnEditor(holderId: string, columnIndex: number): void {
    try {
      // Ensure the holder element still exists
      const holderElement = document.getElementById(holderId);
      if (!holderElement) {
        console.warn(`Holder element ${holderId} not found`);
        return;
      }

      const editor = new this.config.EditorJS({
        holder: holderId,
        tools: this.config.tools,
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
          // Editor is ready, store the reference
          this.editors[columnIndex] = editor;
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
      // Add new columns
      const columnsToAdd = newCount - this.data.numberOfColumns;
      for (let i = 0; i < columnsToAdd; i++) {
        this.data.cols.push({ blocks: [] });
      }
    } else if (newCount < this.data.numberOfColumns) {
      // Remove columns (keep data for undo)
      this.data.cols = this.data.cols.slice(0, newCount);
    }

    this.data.numberOfColumns = newCount;

    // Re-render columns
    this._renderColumns();
  }

  async save(): Promise<ColumnData> {
    // Save all editor data before returning
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
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "padding: 10px;";

    // Title
    const title = document.createElement("div");
    title.textContent = "Column Layout";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    wrapper.appendChild(title);

    // Buttons wrapper
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

        // Update button styles
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

    wrapper.appendChild(buttonsWrapper);

    // Info text
    const info = document.createElement("div");
    info.textContent = "Select number of columns";
    info.style.cssText = "font-size: 11px; color: #6b7280; margin-top: 8px;";
    wrapper.appendChild(info);

    return wrapper;
  }

  destroy(): void {
    // Safely destroy all editors
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && editor.destroy) {
        try {
          const destroyPromise = editor.destroy();
          // Only add catch if destroy returns a promise
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
  }
}

export default CustomColumnsTool;
