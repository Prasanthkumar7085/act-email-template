// tools/CustomButtonTool.ts

import { ToolConfig } from "@editorjs/editorjs";
import { ButtonData } from "./toolsTypes";

export class CustomButtonTool {
  private api: any;
  private data: ButtonData;
  private nodes: { [key: string]: HTMLElement } = {};

  static get toolbox(): { title: string; icon: string } {
    return {
      title: "Button",
      icon: '<svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2.5l-8 8m0 0h5m-5 0v-5"/></svg>',
    };
  }

  constructor({ data, api }: ToolConfig) {
    this.api = api;
    this.data = {
      text: data?.text || "Click Here",
      url: data?.url || "#",
      alignment: data?.alignment || "center",
      style: data?.style || "primary",
      backgroundColor: data?.backgroundColor || "#007bff",
      textColor: data?.textColor || "#ffffff",
      padding: data?.padding || "12px 24px",
      borderRadius: data?.borderRadius || "4px",
      type: "button",
    };
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      text-align: ${this.data.alignment};
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    `;

    const button = document.createElement("a");
    button.href = this.data.url;
    button.target = "_blank";
    button.style.cssText = `
      display: inline-block;
      background-color: ${this.data.backgroundColor};
      color: ${this.data.textColor};
      padding: ${this.data.padding};
      border-radius: ${this.data.borderRadius};
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    button.textContent = this.data.text;

    // Add hover effect for preview
    button.addEventListener("mouseenter", () => {
      button.style.opacity = "0.8";
      button.style.transform = "translateY(-1px)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.opacity = "1";
      button.style.transform = "translateY(0)";
    });

    wrapper.appendChild(button);
    this.nodes.wrapper = wrapper;

    return wrapper;
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    `;

    wrapper.innerHTML = `
      <div style="display: grid; gap: 12px;">
        <!-- Basic Settings -->
        <div style="display: grid; gap: 8px;">
          <label style="font-weight: 500; font-size: 12px; color: #495057;">BUTTON TEXT</label>
          <input type="text" class="button-text" value="${this.data.text}" 
                 style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" 
                 placeholder="Enter button text">
        </div>

        <div style="display: grid; gap: 8px;">
          <label style="font-weight: 500; font-size: 12px; color: #495057;">BUTTON URL</label>
          <input type="url" class="button-url" value="${this.data.url}" 
                 style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" 
                 placeholder="https://example.com">
        </div>

        <!-- Style Settings -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">BACKGROUND</label>
            <input type="color" class="button-bg-color" value="${this.data.backgroundColor}" 
                   style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">TEXT COLOR</label>
            <input type="color" class="button-text-color" value="${this.data.textColor}" 
                   style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>

        <!-- Advanced Settings -->
        <div style="display: grid; gap: 8px;">
          <label style="font-weight: 500; font-size: 12px; color: #495057;">ALIGNMENT</label>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="align-btn ${this.data.alignment === "left" ? "active" : ""}" data-align="left" 
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; background: ${this.data.alignment === "left" ? "#007bff" : "white"}; color: ${this.data.alignment === "left" ? "white" : "#333"}; border-radius: 4px;">
              Left
            </button>
            <button type="button" class="align-btn ${this.data.alignment === "center" ? "active" : ""}" data-align="center" 
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; background: ${this.data.alignment === "center" ? "#007bff" : "white"}; color: ${this.data.alignment === "center" ? "white" : "#333"}; border-radius: 4px;">
              Center
            </button>
            <button type="button" class="align-btn ${this.data.alignment === "right" ? "active" : ""}" data-align="right" 
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; background: ${this.data.alignment === "right" ? "#007bff" : "white"}; color: ${this.data.alignment === "right" ? "white" : "#333"}; border-radius: 4px;">
              Right
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">PADDING</label>
            <select class="button-padding" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="8px 16px" ${this.data.padding === "8px 16px" ? "selected" : ""}>Small</option>
              <option value="12px 24px" ${this.data.padding === "12px 24px" ? "selected" : ""}>Medium</option>
              <option value="16px 32px" ${this.data.padding === "16px 32px" ? "selected" : ""}>Large</option>
            </select>
          </div>
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">BORDER RADIUS</label>
            <select class="button-radius" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="0px" ${this.data.borderRadius === "0px" ? "selected" : ""}>Square</option>
              <option value="4px" ${this.data.borderRadius === "4px" ? "selected" : ""}>Rounded</option>
              <option value="25px" ${this.data.borderRadius === "25px" ? "selected" : ""}>Pill</option>
            </select>
          </div>
        </div>
      </div>
    `;

    this.setupSettingsEvents(wrapper);
    return wrapper;
  }

  private setupSettingsEvents(wrapper: HTMLElement): void {
    const textInput = wrapper.querySelector(".button-text") as HTMLInputElement;
    const urlInput = wrapper.querySelector(".button-url") as HTMLInputElement;
    const bgColorInput = wrapper.querySelector(
      ".button-bg-color"
    ) as HTMLInputElement;
    const textColorInput = wrapper.querySelector(
      ".button-text-color"
    ) as HTMLInputElement;
    const paddingSelect = wrapper.querySelector(
      ".button-padding"
    ) as HTMLSelectElement;
    const radiusSelect = wrapper.querySelector(
      ".button-radius"
    ) as HTMLSelectElement;
    const alignButtons = wrapper.querySelectorAll(".align-btn");

    const updateHandler = () => this.updateButton();

    textInput.addEventListener("input", updateHandler);
    urlInput.addEventListener("input", updateHandler);
    bgColorInput.addEventListener("input", updateHandler);
    textColorInput.addEventListener("input", updateHandler);
    paddingSelect.addEventListener("change", updateHandler);
    radiusSelect.addEventListener("change", updateHandler);

    alignButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        this.data.alignment = target.dataset.align as any;
        updateHandler();
      });
    });
  }

  private updateButton(): void {
    if (this.nodes.wrapper) {
      const newButton = this.render();
      this.nodes.wrapper.parentNode?.replaceChild(
        newButton,
        this.nodes.wrapper
      );
      this.nodes.wrapper = newButton;
    }
  }

  save(): ButtonData {
    return this.data;
  }
}
