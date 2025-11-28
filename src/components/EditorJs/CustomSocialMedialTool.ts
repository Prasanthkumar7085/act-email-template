// tools/SocialMediaTool.ts

import { ToolConfig } from "@editorjs/editorjs";
import { SocialMediaData } from "./toolsTypes";

export class SocialMediaTool {
  private api: any;
  private data: SocialMediaData;
  private nodes: { [key: string]: HTMLElement } = {};

  static get toolbox(): { title: string; icon: string } {
    return {
      title: "Social Media",
      icon: '<svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 1a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 13.5a6 6 0 110-12 6 6 0 010 12z"/></svg>',
    };
  }

  constructor({ data, api }: ToolConfig) {
    this.api = api;
    this.data = {
      platforms: data?.platforms || [
        { id: "facebook", url: "", customIcon: "📘" },
        { id: "twitter", url: "", customIcon: "🐦" },
        { id: "instagram", url: "", customIcon: "📷" },
      ],
      alignment: data?.alignment || "center",
      iconSize: data?.iconSize || "24px",
      spacing: data?.spacing || "15px",
      type: "social",
    };
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      text-align: ${this.data.alignment};
      padding: 30px 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    `;

    const socialContainer = document.createElement("div");
    socialContainer.style.cssText = `
      display: inline-flex;
      gap: ${this.data.spacing};
      align-items: center;
    `;

    this.data.platforms.forEach((platform) => {
      if (platform.url) {
        const link = document.createElement("a");
        link.href = platform.url;
        link.target = "_blank";
        link.style.cssText = `
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${this.data.iconSize};
          height: ${this.data.iconSize};
          font-size: calc(${this.data.iconSize} * 0.8);
          text-decoration: none;
          transition: transform 0.2s ease;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        link.innerHTML = platform.customIcon || "🔗";

        link.addEventListener("mouseenter", () => {
          link.style.transform = "scale(1.1)";
        });
        link.addEventListener("mouseleave", () => {
          link.style.transform = "scale(1)";
        });

        socialContainer.appendChild(link);
      }
    });

    // If no platforms with URLs, show placeholder
    if (this.data.platforms.filter((p) => p.url).length === 0) {
      socialContainer.innerHTML = `
        <div style="color: #6c757d; font-size: 14px; padding: 20px;">
          Configure social links in settings
        </div>
      `;
    }

    wrapper.appendChild(socialContainer);
    this.nodes.wrapper = wrapper;

    return wrapper;
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;
    `;

    const platformsHTML = this.data.platforms
      .map(
        (platform, index) => `
      <div style="padding: 12px; border: 1px solid #e9ecef; border-radius: 6px; margin-bottom: 8px; background: white;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <select class="platform-type" data-index="${index}" 
                  style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="facebook" ${platform.id === "facebook" ? "selected" : ""}>📘 Facebook</option>
            <option value="twitter" ${platform.id === "twitter" ? "selected" : ""}>🐦 Twitter</option>
            <option value="instagram" ${platform.id === "instagram" ? "selected" : ""}>📷 Instagram</option>
            <option value="linkedin" ${platform.id === "linkedin" ? "selected" : ""}>💼 LinkedIn</option>
            <option value="youtube" ${platform.id === "youtube" ? "selected" : ""}>📺 YouTube</option>
            <option value="custom" ${!["facebook", "twitter", "instagram", "linkedin", "youtube"].includes(platform.id) ? "selected" : ""}>🔗 Custom</option>
          </select>
          <button type="button" class="remove-platform" data-index="${index}" 
                  style="padding: 6px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
        </div>
        <input type="url" class="platform-url" data-index="${index}" value="${platform.url}" 
               placeholder="https://example.com/username" 
               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
        ${
          platform.id === "custom"
            ? `
          <input type="text" class="custom-icon" data-index="${index}" value="${platform.customIcon || "🔗"}" 
                 placeholder="Emoji or icon" 
                 style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-top: 8px;">
        `
            : ""
        }
      </div>
    `
      )
      .join("");

    wrapper.innerHTML = `
      <div style="display: grid; gap: 16px;">
        <!-- Platforms List -->
        <div>
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">SOCIAL PLATFORMS</label>
            <button type="button" class="add-platform" 
                    style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              + Add Platform
            </button>
          </div>
          <div class="platforms-list">
            ${platformsHTML}
          </div>
        </div>

        <!-- Display Settings -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">ICON SIZE</label>
            <select class="icon-size" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="20px" ${this.data.iconSize === "20px" ? "selected" : ""}>Small</option>
              <option value="24px" ${this.data.iconSize === "24px" ? "selected" : ""}>Medium</option>
              <option value="32px" ${this.data.iconSize === "32px" ? "selected" : ""}>Large</option>
            </select>
          </div>
          <div style="display: grid; gap: 4px;">
            <label style="font-weight: 500; font-size: 12px; color: #495057;">SPACING</label>
            <select class="icon-spacing" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="10px" ${this.data.spacing === "10px" ? "selected" : ""}>Tight</option>
              <option value="15px" ${this.data.spacing === "15px" ? "selected" : ""}>Normal</option>
              <option value="20px" ${this.data.spacing === "20px" ? "selected" : ""}>Wide</option>
            </select>
          </div>
        </div>

        <!-- Alignment -->
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
      </div>
    `;

    this.setupSettingsEvents(wrapper);
    return wrapper;
  }

  private setupSettingsEvents(wrapper: HTMLElement): void {
    // Add platform
    wrapper.querySelector(".add-platform")?.addEventListener("click", () => {
      this.data.platforms.push({ id: "facebook", url: "", customIcon: "📘" });
      this.updateSettings(wrapper);
    });

    // Remove platform
    wrapper.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("remove-platform")) {
        const index = parseInt(target.dataset.index!);
        this.data.platforms.splice(index, 1);
        this.updateSettings(wrapper);
      }
    });

    // Platform type change
    wrapper.addEventListener("change", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("platform-type")) {
        const index = parseInt(target.dataset.index!);
        const select = target as HTMLSelectElement;
        this.data.platforms[index].id = select.value;
        this.updateSettings(wrapper);
      }
    });

    // URL and icon changes
    wrapper.addEventListener("input", (e) => {
      const target = e.target as HTMLElement;
      const index = parseInt(target.dataset.index!);

      if (target.classList.contains("platform-url")) {
        this.data.platforms[index].url = (target as HTMLInputElement).value;
      } else if (target.classList.contains("custom-icon")) {
        this.data.platforms[index].customIcon = (
          target as HTMLInputElement
        ).value;
      }

      this.updatePreview();
    });

    // Display settings
    const iconSize = wrapper.querySelector(".icon-size") as HTMLSelectElement;
    const iconSpacing = wrapper.querySelector(
      ".icon-spacing"
    ) as HTMLSelectElement;
    const alignButtons = wrapper.querySelectorAll(".align-btn");

    iconSize.addEventListener("change", () => {
      this.data.iconSize = iconSize.value;
      this.updatePreview();
    });

    iconSpacing.addEventListener("change", () => {
      this.data.spacing = iconSpacing.value;
      this.updatePreview();
    });

    alignButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        this.data.alignment = target.dataset.align as any;
        this.updatePreview();
      });
    });
  }

  private updateSettings(wrapper: HTMLElement): void {
    const newSettings = this.renderSettings();
    wrapper.parentNode?.replaceChild(newSettings, wrapper);
    this.setupSettingsEvents(newSettings);
    this.updatePreview();
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

  save(): SocialMediaData {
    return this.data;
  }
}
