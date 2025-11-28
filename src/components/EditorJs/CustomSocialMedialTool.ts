interface SocialMediaData {
  service: string;
  url: string;
  embed?: string;
  caption?: string;
}

interface SocialMediaConfig {
  placeholder?: string;
  captionPlaceholder?: string;
  services?: string[];
}

class SocialMediaTool {
  private api: any;
  private readOnly: boolean;
  private data: SocialMediaData;
  private config: SocialMediaConfig;
  private wrapper: HTMLElement | null = null;
  private urlInput: HTMLInputElement | null = null;
  private captionInput: HTMLInputElement | null = null;

  static get toolbox() {
    return {
      title: "Social Media",
      icon: `<svg width="17" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
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
      placeholder: config?.placeholder || "Paste social media link...",
      captionPlaceholder:
        config?.captionPlaceholder || "Add caption (optional)",
      services: config?.services || [
        "youtube",
        "twitter",
        "instagram",
        "facebook",
        "tiktok",
        "linkedin",
        "pinterest",
        "reddit",
        "vimeo",
      ],
    };

    this.data = {
      service: data?.service || "",
      url: data?.url || "",
      embed: data?.embed || "",
      caption: data?.caption || "",
    };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("social-media-tool");
    this.wrapper.style.cssText = `
      padding: 20px;
      border: 2px dashed #e5e7eb;
      border-radius: 8px;
      background: #fafafa;
      margin: 10px 0;
    `;

    if (this.data.url && this.data.service) {
      this._renderPreview();
    } else {
      this._renderInput();
    }

    return this.wrapper;
  }

  private _renderInput(): void {
    if (!this.wrapper) return;

    const inputWrapper = document.createElement("div");
    inputWrapper.style.cssText =
      "display: flex; flex-direction: column; gap: 12px;";

    // URL Input
    const urlContainer = document.createElement("div");
    urlContainer.style.cssText =
      "display: flex; gap: 8px; align-items: center;";

    this.urlInput = document.createElement("input");
    this.urlInput.type = "text";
    this.urlInput.placeholder = this.config.placeholder || "";
    this.urlInput.value = this.data.url;
    this.urlInput.readOnly = this.readOnly;
    this.urlInput.style.cssText = `
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    `;

    this.urlInput.addEventListener("focus", () => {
      if (this.urlInput) {
        this.urlInput.style.borderColor = "#3b82f6";
      }
    });

    this.urlInput.addEventListener("blur", () => {
      if (this.urlInput) {
        this.urlInput.style.borderColor = "#d1d5db";
      }
    });

    this.urlInput.addEventListener("paste", (e) => {
      setTimeout(() => {
        if (this.urlInput?.value) {
          this._processUrl(this.urlInput.value);
        }
      }, 100);
    });

    const embedButton = document.createElement("button");
    embedButton.textContent = "Embed";
    embedButton.type = "button";
    embedButton.style.cssText = `
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    `;

    embedButton.addEventListener("mouseenter", () => {
      embedButton.style.background = "#2563eb";
    });

    embedButton.addEventListener("mouseleave", () => {
      embedButton.style.background = "#3b82f6";
    });

    embedButton.addEventListener("click", () => {
      if (this.urlInput?.value) {
        this._processUrl(this.urlInput.value);
      }
    });

    urlContainer.appendChild(this.urlInput);
    urlContainer.appendChild(embedButton);
    inputWrapper.appendChild(urlContainer);

    // Caption Input
    this.captionInput = document.createElement("input");
    this.captionInput.type = "text";
    this.captionInput.placeholder = this.config.captionPlaceholder || "";
    this.captionInput.value = this.data.caption || "";
    this.captionInput.readOnly = this.readOnly;
    this.captionInput.style.cssText = `
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    `;

    this.captionInput.addEventListener("input", () => {
      if (this.captionInput) {
        this.data.caption = this.captionInput.value;
      }
    });

    this.captionInput.addEventListener("focus", () => {
      if (this.captionInput) {
        this.captionInput.style.borderColor = "#3b82f6";
      }
    });

    this.captionInput.addEventListener("blur", () => {
      if (this.captionInput) {
        this.captionInput.style.borderColor = "#d1d5db";
      }
    });

    inputWrapper.appendChild(this.captionInput);

    // Supported services hint
    const hint = document.createElement("div");
    hint.textContent = `Supported: ${this.config.services?.join(", ")}`;
    hint.style.cssText = `
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      margin-top: 8px;
    `;
    inputWrapper.appendChild(hint);

    this.wrapper.appendChild(inputWrapper);
  }

  private _processUrl(url: string): void {
    const service = this._detectService(url);

    if (!service) {
      this._showError("Unsupported social media platform");
      return;
    }

    this.data.url = url;
    this.data.service = service;
    this.data.embed = this._generateEmbed(url, service);

    // Re-render with preview
    if (this.wrapper) {
      this.wrapper.innerHTML = "";
      this._renderPreview();
    }
  }

  private _detectService(url: string): string {
    const urlLower = url.toLowerCase();

    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      return "youtube";
    } else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      return "twitter";
    } else if (urlLower.includes("instagram.com")) {
      return "instagram";
    } else if (
      urlLower.includes("facebook.com") ||
      urlLower.includes("fb.com")
    ) {
      return "facebook";
    } else if (urlLower.includes("tiktok.com")) {
      return "tiktok";
    } else if (urlLower.includes("linkedin.com")) {
      return "linkedin";
    } else if (urlLower.includes("pinterest.com")) {
      return "pinterest";
    } else if (urlLower.includes("reddit.com")) {
      return "reddit";
    } else if (urlLower.includes("vimeo.com")) {
      return "vimeo";
    }

    return "";
  }

  private _generateEmbed(url: string, service: string): string {
    let embedUrl = "";

    switch (service) {
      case "youtube": {
        const videoId = this._extractYouTubeId(url);
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        break;
      }
      case "vimeo": {
        const videoId = this._extractVimeoId(url);
        if (videoId) {
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        break;
      }
      case "twitter":
      case "instagram":
      case "facebook":
      case "tiktok":
      case "linkedin":
      case "pinterest":
      case "reddit":
        embedUrl = url;
        break;
    }

    return embedUrl;
  }

  private _extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  private _extractVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  private _renderPreview(): void {
    if (!this.wrapper) return;

    const previewWrapper = document.createElement("div");
    previewWrapper.style.cssText =
      "display: flex; flex-direction: column; gap: 12px;";

    // Service badge
    const badge = document.createElement("div");
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;
      text-transform: capitalize;
    `;
    badge.innerHTML = `${this._getServiceIcon(this.data.service)} ${this.data.service}`;
    previewWrapper.appendChild(badge);

    // Embed container
    const embedContainer = document.createElement("div");
    embedContainer.style.cssText = `
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    `;

    if (this.data.service === "youtube" || this.data.service === "vimeo") {
      const iframe = document.createElement("iframe");
      iframe.src = this.data.embed;
      iframe.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
      `;
      iframe.setAttribute("allowfullscreen", "true");
      embedContainer.appendChild(iframe);
    } else {
      // For other services, show a link card
      const linkCard = document.createElement("a");
      linkCard.href = this.data.url;
      linkCard.target = "_blank";
      linkCard.rel = "noopener noreferrer";
      linkCard.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        padding: 20px;
        text-align: center;
      `;

      const icon = document.createElement("div");
      icon.style.cssText = "font-size: 48px; margin-bottom: 12px;";
      icon.innerHTML = this._getServiceIcon(this.data.service);
      linkCard.appendChild(icon);

      const serviceText = document.createElement("div");
      serviceText.textContent = `View on ${this.data.service}`;
      serviceText.style.cssText =
        "font-size: 18px; font-weight: 600; text-transform: capitalize;";
      linkCard.appendChild(serviceText);

      const urlText = document.createElement("div");
      urlText.textContent = this.data.url;
      urlText.style.cssText = `
        font-size: 12px;
        opacity: 0.8;
        margin-top: 8px;
        word-break: break-all;
        max-width: 80%;
      `;
      linkCard.appendChild(urlText);

      embedContainer.appendChild(linkCard);
    }

    previewWrapper.appendChild(embedContainer);

    // Caption
    if (this.data.caption) {
      const caption = document.createElement("div");
      caption.textContent = this.data.caption;
      caption.style.cssText = `
        font-size: 14px;
        color: #4b5563;
        text-align: center;
        font-style: italic;
      `;
      previewWrapper.appendChild(caption);
    }

    // Edit/Remove buttons
    if (!this.readOnly) {
      const actions = document.createElement("div");
      actions.style.cssText =
        "display: flex; gap: 8px; justify-content: center;";

      const editButton = document.createElement("button");
      editButton.textContent = "Change URL";
      editButton.type = "button";
      editButton.style.cssText = `
        padding: 8px 16px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      `;

      editButton.addEventListener("mouseenter", () => {
        editButton.style.background = "#4b5563";
      });

      editButton.addEventListener("mouseleave", () => {
        editButton.style.background = "#6b7280";
      });

      editButton.addEventListener("click", () => {
        this.data = {
          service: "",
          url: "",
          embed: "",
          caption: this.data.caption,
        };
        if (this.wrapper) {
          this.wrapper.innerHTML = "";
          this._renderInput();
        }
      });

      actions.appendChild(editButton);
      previewWrapper.appendChild(actions);
    }

    this.wrapper.appendChild(previewWrapper);
  }

  private _getServiceIcon(service: string): string {
    const icons: { [key: string]: string } = {
      youtube: "▶️",
      twitter: "🐦",
      instagram: "📷",
      facebook: "👥",
      tiktok: "🎵",
      linkedin: "💼",
      pinterest: "📌",
      reddit: "🔴",
      vimeo: "🎬",
    };

    return icons[service] || "🔗";
  }

  private _showError(message: string): void {
    if (!this.wrapper) return;

    const error = document.createElement("div");
    error.textContent = message;
    error.style.cssText = `
      padding: 12px 16px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
      margin-top: 8px;
    `;

    this.wrapper.appendChild(error);

    setTimeout(() => {
      error.remove();
    }, 3000);
  }

  save(): SocialMediaData {
    return {
      service: this.data.service,
      url: this.data.url,
      embed: this.data.embed,
      caption: this.data.caption,
    };
  }

  validate(savedData: SocialMediaData): boolean {
    return !!(savedData.url && savedData.service);
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "padding: 10px;";

    const title = document.createElement("div");
    title.textContent = "Social Media Settings";
    title.style.cssText =
      "font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 12px;";
    wrapper.appendChild(title);

    // Caption toggle
    const captionToggle = document.createElement("label");
    captionToggle.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #374151;
    `;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!this.data.caption;
    checkbox.style.cssText = "cursor: pointer;";

    checkbox.addEventListener("change", () => {
      if (!checkbox.checked && this.captionInput) {
        this.data.caption = "";
        this.captionInput.value = "";
      }
    });

    captionToggle.appendChild(checkbox);
    captionToggle.appendChild(document.createTextNode("Show Caption"));
    wrapper.appendChild(captionToggle);

    return wrapper;
  }

  static get pasteConfig() {
    return {
      patterns: {
        youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/,
        instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/,
        facebook: /^https?:\/\/(www\.)?facebook\.com\/.+$/,
        tiktok: /^https?:\/\/(www\.)?tiktok\.com\/.+$/,
        linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+$/,
        vimeo: /^https?:\/\/(www\.)?vimeo\.com\/.+$/,
      },
    };
  }

  onPaste(event: any): void {
    const url = event.detail.data;
    this._processUrl(url);
  }
}

export default SocialMediaTool;
