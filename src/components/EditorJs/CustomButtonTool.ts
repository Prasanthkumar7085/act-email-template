// src/tools/ButtonTool/ButtonTool.t
interface ButtonData {
  text: string;
  url: string;
  style: "filled" | "outline" | "text";
  color: string;
  backgroundColor: string;
  align: "left" | "center" | "right";
  target: "_blank" | "_self";
  size: "small" | "medium" | "large";
}

class ButtonTool {
  static get toolbox() {
    return {
      title: "Button",
      icon: `<svg width="17" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>`,
    };
  }

  data: ButtonData;
  wrapper: HTMLElement;
  settingsWrapper?: HTMLElement;

  constructor({ data }: { data?: ButtonData }) {
    this.data = {
      text: data?.text || "Click Me",
      url: data?.url || "https://example.com",
      style: data?.style || "filled",
      color: data?.color || "#ffffff",
      backgroundColor: data?.backgroundColor || "#3b82f6",
      align: data?.align || "left",
      target: data?.target || "_blank",
      size: data?.size || "medium",
    };
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("button-tool-wrapper");

    const button = document.createElement("a");
    button.href = this.data.url;
    button.target = this.data.target;
    button.style.textDecoration = "none";
    button.textContent = this.data.text;
    button.classList.add("button-tool", this.data.style, this.data.size);
    button.style.color = this.data.color;
    button.style.backgroundColor = this.data.backgroundColor;
    button.style.textAlign = this.data.align as any;

    this.wrapper.appendChild(button);
    this.wrapper.style.textAlign = this.data.align;

    return this.wrapper;
  }

  renderSettings() {
    const settings = document.createElement("div");
    settings.classList.add("button-settings");

    const items = [
      { icon: "⚙️", title: "Settings", callback: () => this.openSettings() },
      {
        icon: "↗",
        title: "Open link",
        callback: () => window.open(this.data.url, this.data.target),
      },
    ];

    items.forEach((item) => {
      const button = document.createElement("div");
      button.classList.add("cdx-settings-button");
      button.innerHTML = item.icon;
      button.title = item.title;
      button.onclick = item.callback;
      settings.appendChild(button);
    });

    return settings;
  }

  openSettings() {
    if (this.settingsWrapper && this.settingsWrapper.parentNode) {
      this.settingsWrapper.parentNode.removeChild(this.settingsWrapper);
      return;
    }

    this.settingsWrapper = document.createElement("div");
    this.settingsWrapper.classList.add("button-settings-modal");
    this.settingsWrapper.innerHTML = this.getSettingsHTML();

    document.body.appendChild(this.settingsWrapper);

    // Close on outside click
    const close = (e: MouseEvent) => {
      if (!this.settingsWrapper?.contains(e.target as Node)) {
        this.settingsWrapper?.remove();
        document.removeEventListener("click", close);
      }
    };
    setTimeout(() => document.addEventListener("click", close), 0);

    this.bindSettingEvents();
  }

  getSettingsHTML() {
    return `
      <div class="modal-content">
        <h3>Button Settings</h3>

        <label>Text</label>
        <input type="text" class="btn-text" value="${this.data.text}" placeholder="Button text">

        <label>URL</label>
        <input type="url" class="btn-url" value="${this.data.url}" placeholder="https://">

        <label>Style</label>
        <select class="btn-style">
          <option value="filled" ${this.data.style === "filled" ? "selected" : ""}>Filled</option>
          <option value="outline" ${this.data.style === "outline" ? "selected" : ""}>Outline</option>
          <option value="text" ${this.data.style === "text" ? "selected" : ""}>Text</option>
        </select>

        <label>Size</label>
        <select class="btn-size">
          <option value="small" ${this.data.size === "small" ? "selected" : ""}>Small</option>
          <option value="medium" ${this.data.size === "medium" ? "selected" : ""}>Medium</option>
          <option value="large" ${this.data.size === "large" ? "selected" : ""}>Large</option>
        </select>

        <label>Text Color</label>
        <input type="color" class="btn-color" value="${this.data.color}">

        <label>Background Color</label>
        <input type="color" class="btn-bg" value="${this.data.backgroundColor}">

        <label>Alignment</label>
        <div class="align-buttons">
          <button type="button" class="align-btn ${this.data.align === "left" ? "active" : ""}" data-align="left">Left</button>
          <button type="button" class="align-btn ${this.data.align === "center" ? "active" : ""}" data-align="center">Center</button>
          <button type="button" class="align-btn ${this.data.align === "right" ? "active" : ""}" data-align="right">Right</button>
        </div>

        <label>Open in new tab</label>
        <label class="switch">
          <input type="checkbox" class="btn-target" ${this.data.target === "_blank" ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      </div>
    `;
  }

  bindSettingEvents() {
    const modal = this.settingsWrapper!;
    const update = () => this.updateButton();

    modal.querySelector(".btn-text")?.addEventListener("input", (e) => {
      this.data.text = (e.target as HTMLInputElement).value || "Button";
      update();
    });

    modal.querySelector(".btn-url")?.addEventListener("input", (e) => {
      this.data.url = (e.target as HTMLInputElement).value || "#";
      update();
    });

    modal.querySelector(".btn-style")?.addEventListener("change", (e) => {
      this.data.style = (e.target as HTMLSelectElement).value as any;
      update();
    });

    modal.querySelector(".btn-size")?.addEventListener("change", (e) => {
      this.data.size = (e.target as HTMLSelectElement).value as any;
      update();
    });

    modal.querySelector(".btn-color")?.addEventListener("input", (e) => {
      this.data.color = (e.target as HTMLInputElement).value;
      update();
    });

    modal.querySelector(".btn-bg")?.addEventListener("input", (e) => {
      this.data.backgroundColor = (e.target as HTMLInputElement).value;
      update();
    });

    modal.querySelectorAll(".align-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal
          .querySelectorAll(".align-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.data.align = btn.getAttribute("data-align") as any;
        update();
      });
    });

    modal.querySelector(".btn-target")?.addEventListener("change", (e) => {
      this.data.target = (e.target as HTMLInputElement).checked
        ? "_blank"
        : "_self";
    });
  }

  updateButton() {
    const button = this.wrapper.querySelector("a") as HTMLAnchorElement;
    if (!button) return;

    button.textContent = this.data.text;
    button.href = this.data.url;
    button.target = this.data.target;

    // Remove old classes
    button.className = "button-tool";
    button.classList.add(this.data.style, this.data.size);

    button.style.color = this.data.color;
    button.style.backgroundColor = this.data.backgroundColor;
    button.style.borderColor =
      this.data.style === "outline" ? this.data.backgroundColor : "";
    button.style.textAlign = this.data.align as any;

    this.wrapper.style.textAlign = this.data.align;
  }

  save() {
    return this.data;
  }

  static get sanitize() {
    return {
      text: {},
      url: {},
      style: {},
      color: {},
      backgroundColor: {},
      align: {},
      target: {},
      size: {},
    };
  }
}

export default ButtonTool;
