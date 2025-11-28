// tools/CustomLayoutTool.ts

import { ToolConfig } from "@editorjs/editorjs";
import { LayoutColumn, LayoutData } from "./toolsTypes";

export class CustomLayoutTool {
  private api: any;
  private data: LayoutData;
  private config: any;
  private nodes: { [key: string]: HTMLElement } = {};

  static get toolbox(): { title: string; icon: string } {
    return {
      title: "Layout",
      icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M1 0h5v15H1V0zm10 0h5v15h-5V0z"/></svg>',
    };
  }

  static get enableLineBreaks(): boolean {
    return true;
  }

  constructor({ data, config, api }: ToolConfig) {
    this.api = api;
    this.config = config || {};
    this.data = this.validateData(data);
  }

  private validateData(data: any): LayoutData {
    const defaultData: LayoutData = {
      columns: 2,
      layout: "equal",
      columnsData: [],
      gap: "20px",
      type: "layout",
    };

    if (!data) return defaultData;

    // Ensure we have proper column data
    const columnsData: LayoutColumn[] = Array.from(
      { length: data.columns || 2 },
      (_, index) => {
        const existingColumn = data.columnsData?.[index];
        return {
          id: existingColumn?.id || `column-${index + 1}`,
          content: existingColumn?.content || [],
          width: this.getColumnWidth(
            data.layout || "equal",
            index,
            data.columns || 2
          ),
        };
      }
    );

    return {
      columns: data.columns || 2,
      layout: data.layout || "equal",
      columnsData,
      gap: data.gap || "20px",
      type: "layout",
    };
  }

  private getColumnWidth(
    layout: string,
    index: number,
    totalColumns: number
  ): string {
    switch (layout) {
      case "aside":
        return index === 0 ? "2fr" : "1fr";
      case "featured":
        return index === 0 ? "1fr" : "2fr";
      default:
        return "1fr";
    }
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "layout-container";

    // Create the actual layout preview that users can interact with
    const layoutPreview = document.createElement("div");
    layoutPreview.className = "layout-preview";
    layoutPreview.style.cssText = `
      display: grid;
      grid-template-columns: ${this.data.columnsData.map((col) => col.width).join(" ")};
      gap: ${this.data.gap};
      padding: 20px;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
      min-height: 200px;
    `;

    // Create columns with content areas
    this.data.columnsData.forEach((column, index) => {
      const columnElement = document.createElement("div");
      columnElement.className = `layout-column column-${index + 1}`;
      columnElement.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        padding: 15px;
        min-height: 150px;
        display: flex;
        flex-direction: column;
      `;

      const columnHeader = document.createElement("div");
      columnHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      `;

      columnHeader.innerHTML = `
        <strong style="color: #666;">Column ${index + 1}</strong>
        <span style="font-size: 12px; color: #999;">${column.width}</span>
      `;

      const contentArea = document.createElement("div");
      contentArea.className = "column-content";
      contentArea.style.cssText = `
        flex: 1;
        min-height: 100px;
        background: #f8f9fa;
        border-radius: 4px;
        padding: 10px;
        font-size: 12px;
        color: #666;
      `;

      if (column.content && column.content.length > 0) {
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div>✓ Content Added</div>
            <small>${column.content.length} block(s)</small>
          </div>
        `;
      } else {
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #999;">
            <div>Click to add content</div>
            <small>Double-click to edit</small>
          </div>
        `;
      }

      // Make content area interactive
      contentArea.addEventListener("dblclick", () => {
        this.editColumnContent(index);
      });

      columnElement.appendChild(columnHeader);
      columnElement.appendChild(contentArea);
      layoutPreview.appendChild(columnElement);
    });

    wrapper.appendChild(layoutPreview);
    this.nodes.wrapper = wrapper;

    return wrapper;
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      padding: 10px;
      background: #f5f5f5;
      border-radius: 6px;
    `;

    wrapper.innerHTML = `
      <div style="display: grid; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 12px;">COLUMNS</label>
          <select class="layout-columns-select" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="2" ${this.data.columns === 2 ? "selected" : ""}>2 Columns</option>
            <option value="3" ${this.data.columns === 3 ? "selected" : ""}>3 Columns</option>
            <option value="4" ${this.data.columns === 4 ? "selected" : ""}>4 Columns</option>
          </select>
        </div>

        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 12px;">LAYOUT STYLE</label>
          <select class="layout-style-select" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="equal" ${this.data.layout === "equal" ? "selected" : ""}>Equal Width</option>
            <option value="aside" ${this.data.layout === "aside" ? "selected" : ""}>With Aside</option>
            <option value="featured" ${this.data.layout === "featured" ? "selected" : ""}>Featured Left</option>
          </select>
        </div>

        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 12px;">GAP BETWEEN COLUMNS</label>
          <select class="layout-gap-select" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="10px" ${this.data.gap === "10px" ? "selected" : ""}>Small (10px)</option>
            <option value="20px" ${this.data.gap === "20px" ? "selected" : ""}>Medium (20px)</option>
            <option value="30px" ${this.data.gap === "30px" ? "selected" : ""}>Large (30px)</option>
          </select>
        </div>

        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
          <button type="button" class="clear-all-content" style="width: 100%; padding: 8px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Clear All Content
          </button>
        </div>
      </div>
    `;

    // Event listeners for settings
    const columnsSelect = wrapper.querySelector(
      ".layout-columns-select"
    ) as HTMLSelectElement;
    const styleSelect = wrapper.querySelector(
      ".layout-style-select"
    ) as HTMLSelectElement;
    const gapSelect = wrapper.querySelector(
      ".layout-gap-select"
    ) as HTMLSelectElement;
    const clearButton = wrapper.querySelector(
      ".clear-all-content"
    ) as HTMLButtonElement;

    columnsSelect.addEventListener("change", () => {
      this.updateColumns(parseInt(columnsSelect.value));
    });

    styleSelect.addEventListener("change", () => {
      this.updateLayout(styleSelect.value as any);
    });

    gapSelect.addEventListener("change", () => {
      this.updateGap(gapSelect.value);
    });

    clearButton.addEventListener("click", () => {
      this.clearAllContent();
    });

    return wrapper;
  }

  private updateColumns(newColumnCount: number): void {
    this.data.columns = newColumnCount;

    // Update columns data
    this.data.columnsData = Array.from(
      { length: newColumnCount },
      (_, index) => {
        const existingColumn = this.data.columnsData[index];
        return {
          id: existingColumn?.id || `column-${index + 1}`,
          content: existingColumn?.content || [],
          width: this.getColumnWidth(this.data.layout, index, newColumnCount),
        };
      }
    );

    this.updatePreview();
  }

  private updateLayout(newLayout: "equal" | "aside" | "featured"): void {
    this.data.layout = newLayout;

    // Update column widths
    this.data.columnsData.forEach((column, index) => {
      column.width = this.getColumnWidth(newLayout, index, this.data.columns);
    });

    this.updatePreview();
  }

  private updateGap(newGap: string): void {
    this.data.gap = newGap;
    this.updatePreview();
  }

  private clearAllContent(): void {
    this.data.columnsData.forEach((column) => {
      column.content = [];
    });
    this.updatePreview();
  }

  private editColumnContent(columnIndex: number): void {
    // This would typically open a nested EditorJS instance or modal
    // For now, we'll simulate with a prompt
    const content = prompt("Enter content for this column (simulated):");
    if (content) {
      this.data.columnsData[columnIndex].content = [
        {
          type: "paragraph",
          data: { text: content },
        },
      ];
      this.updatePreview();
    }
  }

  private updatePreview(): void {
    if (this.nodes.wrapper) {
      const newPreview = this.render();
      this.nodes.wrapper.parentNode?.replaceChild(
        newPreview,
        this.nodes.wrapper
      );
      this.nodes.wrapper = newPreview;
    }
  }

  save(): LayoutData {
    return this.data;
  }
}
