interface CustomImageToolData {
  url: string;
  caption: string;
  width: string;
  height: string;
  rotation: number;
  aspectRatio: string;
  flipX: boolean;
  flipY: boolean;
  zoom: number;
}

export default class CustomImageTool {
  static get toolbox() {
    return {
      title: "Image",
      icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path d='M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14M21 19l-4-5-4 5M21 19H3'></path></svg>",
    };
  }
  static get isReadOnlySupported() {
    return true;
  }

  static get pasteConfig() {
    return {
      tags: ["IMG"],
      patterns: {
        image: /https?:\/\/.*\.(?:jpe?g|png|gif|bmp|webp)/i,
      },
      files: {
        mimeTypes: ["image/*"],
      },
    };
  }

  onPaste(event: CustomEvent) {
    switch (event.detail.type) {
      case "file":
        const file = event.detail.file;
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.data.url = e.target!.result as string;
            this.createImage();
          };
          reader.readAsDataURL(file);
        }
        break;
      case "tag":
        const img = event.detail.data as HTMLImageElement;
        this.data.url = img.src;
        this.createImage();
        break;
      case "pattern":
        if (event.detail.key === "image") {
          this.data.url = event.detail.data as string;
          this.createImage();
        }
        break;
    }
  }

  renderSettings(): HTMLElement {
    // Hide settings when in complete mode
    if (this.isCompleteMode()) {
      return document.createElement("div"); // Return empty div
    }

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "12px";
    wrapper.style.padding = "16px";
    wrapper.style.backgroundColor = "#fff";
    wrapper.style.borderRadius = "8px";
    wrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "280px";
    wrapper.style.margin = "0 auto";
    wrapper.style.border = "1px solid #e1e5e9";

    // Aspect Ratio Section
    const aspectSection = this.createSection("Aspect Ratio");
    wrapper.appendChild(aspectSection);

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="free">Free</option>
      <option value="1:1">1:1 Square</option>
      <option value="4:3">4:3 Standard</option>
      <option value="3:2">3:2 Classic</option>
      <option value="16:9">16:9 Wide</option>
      <option value="9:16">9:16 Portrait</option>
      <option value="3:4">3:4 Vertical</option>
      <option value="2:1">2:1 Panoramic</option>
      <option value="1:2">1:2 Tall</option>
      <option value="9:10">9:10 Story</option>
    `;
    select.value = this.data.aspectRatio;
    select.style.width = "100%";
    select.style.padding = "10px 12px";
    select.style.border = "1px solid #d0d5dd";
    select.style.borderRadius = "6px";
    select.style.backgroundColor = "#fff";
    select.style.fontSize = "14px";
    select.style.color = "#344054";
    select.style.cursor = "pointer";
    select.style.transition = "all 0.2s ease";
    select.addEventListener("change", (event) => {
      this.data.aspectRatio = (event.target as HTMLSelectElement).value;
      this.applyAspectRatio();
    });
    select.addEventListener("mouseenter", () => {
      select.style.borderColor = "#4086FF";
    });
    select.addEventListener("mouseleave", () => {
      select.style.borderColor = "#d0d5dd";
    });
    wrapper.appendChild(select);

    // Transform Section
    const transformSection = this.createSection("Transform");
    wrapper.appendChild(transformSection);

    // Rotate Button
    const rotateButton = this.createButton("↻ Rotate 90°", () => {
      this.data.rotation = (this.data.rotation + 90) % 360;
      this.applyTransformation();
    });
    rotateButton.style.marginBottom = "8px";
    wrapper.appendChild(rotateButton);

    // Flip Buttons Container
    const flipContainer = document.createElement("div");
    flipContainer.style.display = "flex";
    flipContainer.style.gap = "8px";
    flipContainer.style.width = "100%";

    const flipXButton = this.createButton("↔ Flip X", () => {
      this.data.flipX = !this.data.flipX;
      this.applyTransformation();
    });
    flipXButton.style.flex = "1";

    const flipYButton = this.createButton("↕ Flip Y", () => {
      this.data.flipY = !this.data.flipY;
      this.applyTransformation();
    });
    flipYButton.style.flex = "1";

    flipContainer.appendChild(flipXButton);
    flipContainer.appendChild(flipYButton);
    wrapper.appendChild(flipContainer);

    // Zoom Section
    const zoomSection = this.createSection("Zoom");
    wrapper.appendChild(zoomSection);

    // Zoom Controls
    const zoomControls = document.createElement("div");
    zoomControls.style.display = "flex";
    zoomControls.style.gap = "6px";
    zoomControls.style.width = "100%";

    const zoomOutButton = this.createButton("−", () => {
      this.data.zoom = Math.max(0.1, this.data.zoom * 0.9);
      this.applyZoom();
    });
    zoomOutButton.style.flex = "1";
    zoomOutButton.style.padding = "8px";

    const zoomResetButton = this.createButton("Reset", () => {
      this.data.zoom = 1;
      this.applyZoom();
    });
    zoomResetButton.style.flex = "2";
    zoomResetButton.style.backgroundColor = "#f8f9fa";
    zoomResetButton.style.color = "#667085";

    const zoomInButton = this.createButton("+", () => {
      this.data.zoom *= 1.1;
      this.applyZoom();
    });
    zoomInButton.style.flex = "1";
    zoomInButton.style.padding = "8px";

    zoomControls.appendChild(zoomOutButton);
    zoomControls.appendChild(zoomResetButton);
    zoomControls.appendChild(zoomInButton);
    wrapper.appendChild(zoomControls);

    // Zoom Percentage Display
    const zoomDisplay = document.createElement("div");
    zoomDisplay.style.textAlign = "center";
    zoomDisplay.style.fontSize = "12px";
    zoomDisplay.style.color = "#667085";
    zoomDisplay.style.marginTop = "4px";
    zoomDisplay.innerText = `${Math.round(this.data.zoom * 100)}%`;

    // Update zoom display when zoom changes
    const updateZoomDisplay = () => {
      zoomDisplay.innerText = `${Math.round(this.data.zoom * 100)}%`;
    };

    // Override zoom button click handlers to update display
    [zoomInButton, zoomOutButton, zoomResetButton].forEach((button) => {
      const originalClick = button.onclick;
      button.onclick = (e: MouseEvent) => {
        if (originalClick) originalClick(e);
        updateZoomDisplay();
      };
    });

    wrapper.appendChild(zoomDisplay);

    return wrapper;
  }

  private createSection(title: string): HTMLElement {
    const section = document.createElement("div");
    section.style.width = "100%";

    const label = document.createElement("label");
    label.innerText = title;
    label.style.fontSize = "13px";
    label.style.fontWeight = "600";
    label.style.color = "#344054";
    label.style.width = "100%";
    label.style.textAlign = "left";
    label.style.marginBottom = "6px";
    label.style.display = "block";

    section.appendChild(label);
    return section;
  }

  private createButton(
    text: string,
    onClick: (e: MouseEvent) => void
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerText = text;
    button.style.border = "1px solid #d0d5dd";
    button.style.padding = "10px 12px";
    button.style.borderRadius = "6px";
    button.style.backgroundColor = "#fff";
    button.style.color = "#4086FF";
    button.style.fontSize = "13px";
    button.style.fontWeight = "500";
    button.style.cursor = "pointer";
    button.style.transition = "all 0.2s ease";
    button.style.outline = "none";

    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#f0f8ff";
      button.style.borderColor = "#4086FF";
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#fff";
      button.style.borderColor = "#d0d5dd";
    });

    button.addEventListener("mousedown", () => {
      button.style.backgroundColor = "#e6f2ff";
    });

    button.addEventListener("mouseup", () => {
      button.style.backgroundColor = "#f0f8ff";
    });

    button.addEventListener("click", onClick);

    return button;
  }

  private api: any;
  private config: any;
  private data: any;
  private readOnly = false;
  private wrapper: HTMLElement | null;
  private imageContainer: HTMLElement | null;
  private resizeHandles: HTMLElement[];
  private completedPreview: boolean;
  private readonly MAX_PARENT_WIDTH = 729; // A4 width constraint

  constructor({
    data,
    config,
    api,
    readOnly = false,
  }: {
    data: any;
    config: any;
    api: any;
    readOnly?: boolean;
  }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};
    this.data = {
      url: data.file?.url || data.url || "",
      caption: data.caption || "",
      width: data.dimensions?.width || "auto",
      height: data.dimensions?.height || "auto",
      rotation: data.rotation || 0,
      aspectRatio: data.aspectRatio || "free",
      flipX: data.flipX || false,
      flipY: data.flipY || false,
      zoom: data.zoom || 1,
    };
    this.wrapper = null;
    this.imageContainer = null;
    this.resizeHandles = [];
    this.completedPreview = config.isEditable || false;
  }

  // Check if we're in complete mode
  private isCompleteMode(): boolean {
    return (
      window.location.pathname.includes("/complete") ||
      window.location.pathname.includes("/builder-print")
    );
  }

  // Check if resize handles should be shown
  private shouldShowResizeHandles(): boolean {
    return !this.readOnly && !this.isCompleteMode();
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("image-tool-wrapper");
    this.wrapper.style.maxWidth = `${this.MAX_PARENT_WIDTH}px`;
    this.wrapper.style.margin = "0 auto";

    // Add paste event listener to the wrapper only if not in complete mode
    if (!this.isCompleteMode()) {
      this.wrapper.addEventListener("paste", this.handlePaste.bind(this));
    }

    if (this.data.url) {
      this.createImage();
    } else {
      this.createUploadUI();
    }

    return this.wrapper;
  }

  private handlePaste(event: ClipboardEvent): void {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            this.data.url = e.target!.result as string;
            this.createImage();
          };
          reader.readAsDataURL(file);
          event.preventDefault();
          break;
        }
      }
    }

    // Check for pasted text (image URLs)
    const pastedText = clipboardData.getData("text");
    if (pastedText) {
      const imageUrlPattern = /https?:\/\/.*\.(?:jpe?g|png|gif|bmp|webp)/i;
      if (imageUrlPattern.test(pastedText)) {
        this.data.url = pastedText;
        this.createImage();
        event.preventDefault();
      }
    }
  }

  createImage(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = "";

    this.imageContainer = document.createElement("div");
    this.imageContainer.classList.add("image-container");
    this.imageContainer.style.position = "relative";
    this.imageContainer.style.overflow = "visible";
    this.imageContainer.style.display = "inline-block";
    this.imageContainer.style.maxWidth = "100%";

    const image = document.createElement("img");
    image.src = this.data.url;
    image.style.maxWidth = "100%"; // Constrain to parent width
    image.style.maxHeight = "none";
    image.style.width = this.data.width === "auto" ? "auto" : this.data.width;
    image.style.height =
      this.data.height === "auto" ? "auto" : this.data.height;
    image.style.marginTop = "12px";
    image.style.marginBottom = "12px";
    image.style.display = "block";
    image.style.borderRadius = "4px";

    image.onerror = () => {
      console.error("Failed to load image:", this.data.url);
      this.showImageError();
    };

    image.onload = () => {
      if (this.data.width === "auto" || this.data.height === "auto") {
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        let initialWidth = naturalWidth;
        if (naturalWidth > this.MAX_PARENT_WIDTH) {
          initialWidth = this.MAX_PARENT_WIDTH;
        }

        const initialHeight = (naturalHeight * initialWidth) / naturalWidth;

        this.data.width = `${initialWidth}px`;
        this.data.height = `${initialHeight}px`;
        image.style.width = this.data.width;
        image.style.height = this.data.height;
      }
      this.applyTransformation(image);
      this.updateResizeHandles();
    };

    this.applyTransformation(image);
    image.classList.add("image-tool-image");

    this.imageContainer.appendChild(image);
    this.wrapper.appendChild(this.imageContainer);

    // Create resize handles only when allowed
    if (this.shouldShowResizeHandles()) {
      this.createResizeHandles();
      this.applyAspectRatio();
    }

    // Add paste hint only when not in complete mode
    if (!this.isCompleteMode()) {
      this.addPasteHint();
    }
  }

  private showImageError(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = "";
    const errorContainer = document.createElement("div");
    errorContainer.style.textAlign = "center";
    errorContainer.style.padding = "20px";
    errorContainer.style.color = "#dc2626";
    errorContainer.style.border = "1px solid #fecaca";
    errorContainer.style.borderRadius = "4px";
    errorContainer.style.backgroundColor = "#fef2f2";

    errorContainer.innerHTML = `
      <div style="margin-bottom: 10px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p style="margin: 0; font-size: 14px; font-weight: 500;">Failed to load image</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">Please try another image or URL</p>
    `;

    // Only show retry button when not in complete mode
    if (!this.isCompleteMode()) {
      const retryButton = this.createButton("Try Again", () => {
        this.createUploadUI();
      });
      retryButton.style.marginTop = "12px";
      retryButton.style.backgroundColor = "#dc2626";
      retryButton.style.color = "white";
      errorContainer.appendChild(retryButton);
    }

    this.wrapper.appendChild(errorContainer);
  }

  private addPasteHint(): void {
    if (!this.wrapper || this.readOnly || this.isCompleteMode()) return;

    const pasteHint = document.createElement("div");

    this.wrapper.appendChild(pasteHint);
  }

  applyTransformation(image?: HTMLImageElement): void {
    if (!image && this.imageContainer) {
      image = this.imageContainer.querySelector("img") as HTMLImageElement;
    }

    if (!image) return;

    let transform = `rotate(${this.data.rotation}deg)`;
    transform += this.data.flipX ? " scaleX(-1)" : "";
    transform += this.data.flipY ? " scaleY(-1)" : "";
    transform += ` scale(${this.data.zoom})`;

    image.style.transform = transform;
    image.style.transformOrigin = "center center";
  }

  applyZoom(): void {
    if (!this.imageContainer) return;
    const image = this.imageContainer.querySelector("img") as HTMLImageElement;
    if (!image) return;

    this.applyTransformation(image);
    this.updateResizeHandles();
  }

  createResizeHandles(): void {
    this.removeResizeHandles();

    if (this.isCompleteMode()) return;

    const positions = [
      "nw",
      "ne",
      "se",
      "sw",
      "top",
      "right",
      "bottom",
      "left",
    ];

    this.resizeHandles = positions.map((pos) => {
      const handle = document.createElement("div");
      handle.classList.add(
        "custom-image-tool__resize-handle",
        `custom-image-tool__resize-handle--${pos}`
      );
      handle.style.position = "absolute";
      handle.style.width = "12px";
      handle.style.height = "12px";
      handle.style.backgroundColor = "#4086FF";
      handle.style.border = "2px solid #fff";
      handle.style.borderRadius = "50%";
      handle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      handle.style.cursor =
        pos === "nw" || pos === "se"
          ? "nwse-resize"
          : pos === "ne" || pos === "sw"
            ? "nesw-resize"
            : pos === "top" || pos === "bottom"
              ? "ns-resize"
              : "ew-resize";
      handle.style.zIndex = "10";
      handle.style.transition = "all 0.1s ease";

      handle.addEventListener("mouseenter", () => {
        handle.style.transform = "scale(1.2)";
        handle.style.backgroundColor = "#2563eb";
      });
      handle.addEventListener("mouseleave", () => {
        handle.style.transform = "scale(1)";
        handle.style.backgroundColor = "#4086FF";
      });

      handle.addEventListener("mousedown", (event) =>
        this.startResize(event, pos)
      );
      this.imageContainer!.appendChild(handle);
      return handle;
    });

    this.updateResizeHandles();
  }

  private removeResizeHandles(): void {
    this.resizeHandles.forEach((handle) => {
      if (handle.parentNode) {
        handle.parentNode.removeChild(handle);
      }
    });
    this.resizeHandles = [];
  }

  updateResizeHandles(): void {
    if (
      !this.imageContainer ||
      this.resizeHandles.length === 0 ||
      this.isCompleteMode()
    )
      return;

    const image = this.imageContainer.querySelector("img") as HTMLImageElement;
    if (!image) return;

    const containerRect = this.imageContainer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const relTop = imageRect.top - containerRect.top;
    const relLeft = imageRect.left - containerRect.left;
    const visWidth = imageRect.width;
    const visHeight = imageRect.height;

    this.resizeHandles.forEach((handle) => {
      const pos = handle.classList[1].split("--")[1];

      switch (pos) {
        case "nw":
          handle.style.top = `${relTop - 6}px`;
          handle.style.left = `${relLeft - 6}px`;
          break;
        case "ne":
          handle.style.top = `${relTop - 6}px`;
          handle.style.left = `${relLeft + visWidth - 6}px`;
          break;
        case "se":
          handle.style.top = `${relTop + visHeight - 6}px`;
          handle.style.left = `${relLeft + visWidth - 6}px`;
          break;
        case "sw":
          handle.style.top = `${relTop + visHeight - 6}px`;
          handle.style.left = `${relLeft - 6}px`;
          break;
        case "top":
          handle.style.top = `${relTop - 6}px`;
          handle.style.left = `${relLeft + visWidth / 2 - 6}px`;
          break;
        case "right":
          handle.style.top = `${relTop + visHeight / 2 - 6}px`;
          handle.style.left = `${relLeft + visWidth - 6}px`;
          break;
        case "bottom":
          handle.style.top = `${relTop + visHeight - 6}px`;
          handle.style.left = `${relLeft + visWidth / 2 - 6}px`;
          break;
        case "left":
          handle.style.top = `${relTop + visHeight / 2 - 6}px`;
          handle.style.left = `${relLeft - 6}px`;
          break;
      }
    });
  }

  applyAspectRatio(): void {
    if (!this.imageContainer) return;
    const image = this.imageContainer.querySelector("img") as HTMLImageElement;
    if (!image) return;

    if (this.data.aspectRatio !== "free") {
      const [w, h] = this.data.aspectRatio.split(":").map(Number);
      const currentWidth =
        parseInt(image.style.width, 10) || image.naturalWidth || 300;

      let newWidth = Math.max(
        50,
        Math.min(currentWidth, this.MAX_PARENT_WIDTH)
      );
      const newHeight = Math.round((newWidth * h) / w);

      image.style.width = `${newWidth}px`;
      image.style.height = `${newHeight}px`;
      this.data.width = `${newWidth}px`;
      this.data.height = `${newHeight}px`;
    }
    this.updateResizeHandles();
  }

  startResize(event: MouseEvent, position: string): void {
    if (this.isCompleteMode()) return;

    event.preventDefault();
    event.stopPropagation();

    const image = this.imageContainer!.querySelector("img") as HTMLImageElement;
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = image.offsetWidth;
    const startHeight = image.offsetHeight;

    const aspectRatio =
      this.data.aspectRatio !== "free" ? startWidth / startHeight : null;

    const onMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (position.includes("right")) newWidth = startWidth + dx;
      if (position.includes("left")) newWidth = startWidth - dx;
      if (position.includes("bottom")) newHeight = startHeight + dy;
      if (position.includes("top")) newHeight = startHeight - dy;

      if (position === "nw") {
        newWidth = startWidth - dx;
        newHeight = startHeight - dy;
      } else if (position === "ne") {
        newWidth = startWidth + dx;
        newHeight = startHeight - dy;
      } else if (position === "sw") {
        newWidth = startWidth - dx;
        newHeight = startHeight + dy;
      } else if (position === "se") {
        newWidth = startWidth + dx;
        newHeight = startHeight + dy;
      }

      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      newWidth = Math.min(newWidth, this.MAX_PARENT_WIDTH);

      if (aspectRatio) {
        if (position.includes("right") || position.includes("left")) {
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newWidth = Math.round(newHeight * aspectRatio);
          newWidth = Math.min(newWidth, this.MAX_PARENT_WIDTH);
          newHeight = Math.round(newWidth / aspectRatio);
        }
      }

      image.style.width = `${newWidth}px`;
      image.style.height = `${newHeight}px`;
      this.data.width = `${newWidth}px`;
      this.data.height = `${newHeight}px`;

      this.updateResizeHandles();
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  createUploadUI(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = "";

    if (this.isCompleteMode()) {
      const messageContainer = document.createElement("div");
      messageContainer.style.textAlign = "center";
      messageContainer.style.padding = "20px";
      messageContainer.style.color = "#667085";
      messageContainer.style.fontStyle = "italic";
      messageContainer.innerText = "Image preview";
      this.wrapper.appendChild(messageContainer);
      return;
    }

    const uploadContainer = document.createElement("div");
    uploadContainer.style.textAlign = "center";
    uploadContainer.style.padding = "40px 20px";
    uploadContainer.style.border = "2px dashed #d0d5dd";
    uploadContainer.style.borderRadius = "8px";
    uploadContainer.style.backgroundColor = "#f8f9fa";
    uploadContainer.style.cursor = "pointer";
    uploadContainer.style.transition = "all 0.2s ease";

    uploadContainer.addEventListener("mouseenter", () => {
      uploadContainer.style.borderColor = "#4086FF";
      uploadContainer.style.backgroundColor = "#f0f8ff";
    });
    uploadContainer.addEventListener("mouseleave", () => {
      uploadContainer.style.borderColor = "#d0d5dd";
      uploadContainer.style.backgroundColor = "#f8f9fa";
    });

    const uploadIcon = document.createElement("div");
    uploadIcon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#667085" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    `;
    uploadIcon.style.marginBottom = "12px";
    uploadIcon.style.display = "flex";
    uploadIcon.style.justifyContent = "center";
    uploadIcon.style.alignItems = "center";

    const uploadText = document.createElement("div");
    uploadText.style.display = "flex";
    uploadText.style.flexDirection = "column";
    uploadText.style.alignItems = "center";
    uploadText.style.justifyContent = "center";
    uploadText.innerHTML = `
      <div style="font-size: 16px; font-weight: 600; color: #344054; margin-bottom: 4px;">
        Upload Image
      </div>
      <div style="font-size: 14px; color: #667085;">
        or paste from clipboard
      </div>
    `;

    uploadContainer.appendChild(uploadIcon);
    uploadContainer.appendChild(uploadText);

    uploadContainer.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/jpg,image/png";
      input.addEventListener("change", (event: Event) => {
        const inputTarget = event.target as HTMLInputElement;
        const file = inputTarget.files?.[0];
        const allowed = ["image/jpeg", "image/jpg", "image/png"];
        // if (!allowed.includes(file.type)) {
        //  failedPopper("These type of Image is not accepted");
        //   return;
        // }
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            this.data.url = e.target!.result as string;
            this.createImage();
          };
          reader.readAsDataURL(file);
        }
      });
      input.click();
    });

    uploadContainer.addEventListener("paste", this.handlePaste.bind(this));

    this.wrapper.appendChild(uploadContainer);
  }

  save(): any {
    const image = this.imageContainer?.querySelector("img") as HTMLImageElement;
    if (image) {
      this.data.width = `${image.offsetWidth}px`;
      this.data.height = `${image.offsetHeight}px`;
    }

    return {
      file: { url: this.data.url },
      caption: this.data.caption,
      dimensions: { width: this.data.width, height: this.data.height },
      rotation: this.data.rotation,
      aspectRatio: this.data.aspectRatio || "free",
      flipX: this.data.flipX,
      flipY: this.data.flipY,
      zoom: this.data.zoom,
    };
  }
}
