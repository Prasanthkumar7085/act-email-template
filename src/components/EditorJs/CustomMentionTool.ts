import type { API, InlineTool } from "@editorjs/editorjs";
import apiConfig from "~/lib/config/apiConfig";
import { weekdayOptions } from "~/lib/constants/weekdayoptionsConstants";
import returnSlugFromLabel from "~/utils/helpers/returnSlugFromLabel";

interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  title?: string;
  value?: string;
  type?: string;
  [key: string]: any;
}

interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

interface MentionPlaceholderConfig {
  enabled?: boolean;
  template?: string;
  customText?: string;
}

interface MentionToolConfig {
  users: MentionUser[];
  placeholderText?: string;
  allowCustomInput?: boolean;
  selectedUser?: MentionUser | null;
  documentStatus?: string;
  defaultDateFormat?: string;
  emailForPublicDocumentView?: string;
  dropdownOptions?: DropdownOption[];
  placeholderConfig?: MentionPlaceholderConfig;
  company_id?: string;
}

export class MentionInlineTool implements InlineTool {
  private api: API;
  private config: MentionToolConfig;
  private button: HTMLButtonElement | null = null;
  private state: boolean = false;
  private mentionHandler: MentionHandler | null = null;

  static get isInline() {
    return true;
  }

  static get title() {
    return "Mention";
  }

  constructor({ api, config }: { api: API; config?: MentionToolConfig }) {
    this.api = api;
    this.config = {
      users: config?.users || [],
      placeholderText: config?.placeholderText || "Enter value",
      allowCustomInput: config?.allowCustomInput || true,
      selectedUser: config?.selectedUser || null,
      documentStatus: config?.documentStatus || "Draft",
      defaultDateFormat: config?.defaultDateFormat || "MM-dd-yyyy",
      emailForPublicDocumentView: config?.emailForPublicDocumentView || "",
      dropdownOptions: config?.dropdownOptions || [
        { id: "1", label: "Option 1", value: "Option 1" },
      ],
      placeholderConfig: {
        enabled: config?.placeholderConfig?.enabled ?? true,
        template: config?.placeholderConfig?.template || "Enter your {label}",
        customText: config?.placeholderConfig?.customText,
      },
      company_id: config?.company_id || "",
    };

    this.mentionHandler = new MentionHandler(this.config);

    setTimeout(() => this.reinitializeMentions(), 100);

    if (this.config.documentStatus === "Completed") {
      this.applyCompletedStatusStyling();
    }
  }

  private reinitializeMentions() {
    const editorElement = document.querySelector(".codex-editor");
    if (!editorElement) return;

    const mentions = editorElement.querySelectorAll(".mention");
    mentions.forEach((mentionEl) => {
      const mention = mentionEl as HTMLElement;
      const userId = mention.dataset.userId;
      const field = mention.dataset.field;
      const mentionId = mention.dataset.mentionId;
      const hasValue = mention.dataset.hasValue === "true";
      const customValue = mention.dataset.customValue;

      const savedPlaceholderText = mention.dataset.placeholderText;

      if (!userId || !field) return;

      const user = this.config.users.find((u) => u._id === userId);
      if (!user) return;

      if (!mentionId) {
        mention.dataset.mentionId = this.generateMentionId();
      }

      if (!hasValue && !customValue) {
        const placeholderText =
          savedPlaceholderText ||
          this.mentionHandler?.generatePlaceholderText(
            mention.dataset.fieldLabel || field,
            user
          ) ||
          "";

        mention.textContent = placeholderText;
        mention.dataset.placeholderText = placeholderText;
        this.mentionHandler?.applyPlaceholderStyling(mention, user);
      }

      mention.contentEditable = "false";
      mention.style.userSelect = "none";
      mention.style.pointerEvents = "auto";
      mention.style.cursor = "pointer";

      mention.replaceWith(mention.cloneNode(true));
    });
  }
  private generateMentionId(): string {
    return `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.style.display = "none";
    this.button.classList.add(this.api.styles.inlineToolButton);
    this.button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14.5C4.41 14.5 1.5 11.59 1.5 8C1.5 4.41 4.41 1.5 8 1.5C11.59 1.5 14.5 4.41 14.5 8C14.5 11.59 11.59 14.5 8 14.5ZM11.5 5.5H4.5C4.22 5.5 4 5.72 4 6V10C4 10.28 4.22 10.5 4.5 10.5H11.5C11.78 10.5 12 10.28 12 10V6C12 5.72 11.78 5.5 11.5 5.5ZM11.25 9.75H4.75V6.25H11.25V9.75Z" fill="currentColor"/>
      </svg>
    `;
    return this.button;
  }

  surround(range: Range) {
    // Not used for our implementation
  }

  checkState() {
    return this.state;
  }
  save(block: HTMLElement) {
    const contentElement = block.querySelector(".ce-block__content");
    if (!contentElement) {
      return { text: "" };
    }

    const mentions = contentElement.querySelectorAll(".mention");
    mentions.forEach((mention) => {
      mention.setAttribute("contenteditable", "false");

      if (!mention.getAttribute("data-mention-id")) {
        mention.setAttribute("data-mention-id", this.generateMentionId());
      }

      const hasValue = mention.getAttribute("data-has-value");
      const placeholderText = mention.getAttribute("data-placeholder-text");
      const customValue = mention.getAttribute("data-custom-value");

      if (!customValue && placeholderText) {
        mention.setAttribute("data-placeholder-text", placeholderText);
      }
    });

    return {
      text: contentElement.innerHTML,
    };
  }

  static get sanitize() {
    return {
      span: {
        class: true,
        "data-user-id": true,
        "data-field": true,
        "data-custom-value": true,
        "data-field-label": true,
        "data-date-format": true,
        "data-date-time-format": true,
        "data-time-format": true,
        "data-display-value": true,
        "data-mention-id": true,
        "data-contact_mapped_key": true,
        "data-required": true,
        "data-dropdown-multiselect": true,
        "data-dropdown-options": true,
        "data-has-value": true,
        "data-placeholder-text": true,
        style: true,
        contenteditable: false,
      },
    };
  }

  private applyCompletedStatusStyling() {
    const style = document.createElement("style");
    style.textContent = `
      .codex-editor {
        position: relative;
      }
      .ce-block {
        margin-bottom: 16px;
      }
      
      .mention.completed {
        background-color: #f0f5ff !important;
        border: 1px solid #d6e4ff !important;
        color: #2f54eb !important;
        cursor: default !important;
        pointer-events: none !important;
      }
      
      .mention.completed.empty {
        background-color: #f9f0ff !important;
        border: 1px solid #efdbff !important;
        color: #722ed1 !important;
      }
         .mention.placeholder {
        font-style: italic !important;
        color: #6b7280 !important;
        background-color: #f3f4f6 !important;
        border: 1px solid #d1d5db !important;
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      this.processMentionsForCompletedDocument();
    }, 100);
  }

  private processMentionsForCompletedDocument() {
    const editorElement = document.querySelector(".codex-editor");
    if (!editorElement) return;

    const mentions = editorElement.querySelectorAll(".mention");
    mentions.forEach((mentionEl) => {
      const mention = mentionEl as HTMLElement;
      mention.classList.add("completed");

      const customValue = mention.dataset.customValue;
      if (customValue) {
        mention.textContent = customValue;
      } else {
        mention.textContent = "--";
        mention.classList.add("empty");
      }

      mention.contentEditable = "false";
      mention.style.pointerEvents = "none";
      mention.style.cursor = "default";
    });
  }
}

export class MentionHandler {
  private config: MentionToolConfig;
  private dropdown: HTMLElement | null = null;
  private currentRange: Range | null = null;
  private closePopupHandler: ((e: MouseEvent) => void) | null = null;
  private scrollContainer: HTMLElement | null = null;
  private currentMention: HTMLElement | null = null;
  private currentPopup: HTMLElement | null = null;

  private isDropdownOpen: boolean = false;
  private lastKeyPressed: string | null = null;
  private mentionTriggerPosition: { node: Node; offset: number } | null = null;
  private searchQuery: string = "";
  private customFieldsCache = new Map<string, any[]>();
  private allFieldItems = [];

  private dateFormatOptions = [
    { value: "MM-dd-yyyy", label: "MM-DD-YYYY", format: "MM-dd-yyyy" },
    { value: "dd-MM-yyyy", label: "DD-MM-YYYY", format: "dd-MM-yyyy" },
    { value: "MMM dd yyyy", label: "MMM DD YYYY", format: "MMM dd yyyy" },
    { value: "MM/dd/yyyy", label: "MM/DD/YYYY", format: "MM/dd/yyyy" },
    { value: "dd/MM/yyyy", label: "DD/MM/YYYY", format: "dd/MM/yyyy" },
  ];

  private dateTimeFormatOptions = [
    {
      value: "MM-dd-yyyy HH:mm",
      label: "MM-DD-YYYY HH:MM",
      format: "MM-dd-yyyy HH:mm",
    },
    {
      value: "dd-MM-yyyy HH:mm",
      label: "DD-MM-YYYY HH:MM",
      format: "dd-MM-yyyy HH:mm",
    },
    {
      value: "MMM dd yyyy HH:mm",
      label: "MMM DD YYYY HH:MM",
      format: "MMM dd yyyy HH:mm",
    },
    {
      value: "MM/dd/yyyy hh:mm TT",
      label: "MM/DD/YYYY HH:MM AM/PM",
      format: "MM/dd/yyyy hh:mm TT",
    },
    {
      value: "dd/MM/yyyy HH:mm",
      label: "DD/MM/YYYY HH:MM",
      format: "dd/MM/yyyy HH:mm",
    },
  ];

  private timeFormatOptions = [
    { value: "HH:mm", label: "HH:MM (24-hour)" },
    { value: "hh:mm TT", label: "HH:MM AM/PM (12-hour)" },
  ];

  private debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: number | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }

  private isMobileDevice(): boolean {
    return (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }

  constructor(config: MentionToolConfig) {
    this.config = config;
    this.scrollContainer = this.findScrollContainer();
    this.checkForMentionTrigger = this.debounce(
      this.checkForMentionTrigger.bind(this),
      100
    );
    this.setupGlobalListener();
    this.setupMentionClickListener();
    this.shouldDisableMentions();
  }

  private async loadCustomFields(user: MentionUser): Promise<any[]> {
    const email = user.email;
    const userId = user._id

    if (email&& this.customFieldsCache.has(email)) {
      return this.customFieldsCache.get(email)!;
    }
    if (userId&& this.customFieldsCache.has(userId)) {
      return this.customFieldsCache.get(userId)!;
    }
    try {
      let url = `${apiConfig.app.VITE_PUBLIC_CONTACT_FIELDS_API_URL}/fields/user?company_id=${this.config.company_id}&user_email=${encodeURIComponent(email)}`;
      if (user?.user_id?.trim()?.length == 0 && !user?.email) {
        url = `${apiConfig.app.VITE_PUBLIC_CONTACT_FIELDS_API_URL}/fields/${user.contact_type}?company_id=${this.config.company_id}`;
      }
      console.log({url1237t41234: url})
      const resp = await fetch(url);
      const data = await resp.json();

      const fields = data.data || [];

      let primaryFields = [
        "first_name",
        "last_name",
        "phone",
        "email",
        "address",
        "company_name",
        "full_name",
        "title",
      ];

      let filteredFields = fields.filter(
        (field: any) => !primaryFields.includes(field.field_key)
      );

      this.customFieldsCache.set(email, filteredFields);
      return filteredFields;
    } catch (e) {
      console.warn("Failed to load custom fields for", email, e);
      this.customFieldsCache.set(email, []);
      return [];
    }
  }

  private updateSimilarMentions(
    fieldLabel: string,
    fieldType: string,
    userId: string,
    value: string,
    sourceMention: HTMLElement
  ): void {
    if (!fieldLabel || !fieldType || !userId) return;

    const allMentions = document.querySelectorAll(
      ".mention"
    ) as NodeListOf<HTMLElement>;

    allMentions.forEach((mention) => {
      if (mention === sourceMention) return;

      const mentionFieldLabel =
        mention.getAttribute("data-field-label") || mention.dataset.fieldLabel;
      const mentionFieldType =
        mention.getAttribute("data-field") ||
        mention.dataset.field ||
        mention.dataset.fieldType;
      const mentionUserId =
        mention.getAttribute("data-user-id") || mention.dataset.userId;

      if (
        mentionFieldLabel === fieldLabel &&
        mentionFieldType === fieldType &&
        mentionUserId === userId
      ) {
        let finalValue = value;
        let displayValue = value;

        if (value) {
          switch (fieldType) {
            case "time":
              const timeFormat =
                sourceMention.getAttribute("data-time-format") ||
                sourceMention.dataset.timeFormat ||
                "HH:mm";
              displayValue = value;
              mention.dataset.displayValue = displayValue;
              mention.dataset.timeFormat = timeFormat;
              break;

            case "date":
              const dateFormat =
                sourceMention.getAttribute("data-date-format") ||
                sourceMention.dataset.dateFormat ||
                "MM-dd-yyyy";

              finalValue = value;

              mention.dataset.dateFormat = dateFormat;
              break;

            case "date_time":
              const dateTimeFormat =
                sourceMention.getAttribute("data-date-time-format") ||
                sourceMention.dataset.dateTimeFormat ||
                "MM-dd-yyyy HH:mm";

              finalValue = value;

              mention.dataset.dateTimeFormat = dateTimeFormat;
              break;
            case "dropdown":
              const isMultiselect =
                sourceMention.getAttribute("data-dropdown-multiselect") ==
                "true"
                  ? true
                  : false;
              const dropdownOptions =
                sourceMention.getAttribute("data-dropdown-options") ||
                sourceMention.dataset.dropdownOptions;

              mention.dataset.dropdownMultiselect = isMultiselect.toString();
              if (dropdownOptions?.length > 0) {
                mention.dataset.dropdownOptions = dropdownOptions;
              }
              break;

            default:
              displayValue = value;
              break;
          }

          mention.dataset.customValue = finalValue;
          mention.dataset.hasValue = "true";
          mention.textContent = displayValue;
          this.removePlaceholderStyling(mention);
        } else {
          const user = this.config.users.find(
            (user: any) => user._id === mentionUserId
          );
          mention.dataset.hasValue = "false";
          mention.dataset.customValue = "";
          this.applyPlaceholderStyling(mention, user);
          mention.textContent = this.generatePlaceholderText(fieldLabel, user);

          if (fieldType === "dropdown") {
            const isMultiselect =
              sourceMention.getAttribute("data-dropdown-multiselect") == "true"
                ? true
                : false;
            const dropdownOptions =
              sourceMention.getAttribute("data-dropdown-options") ||
              sourceMention.dataset.dropdownOptions;

            mention.dataset.dropdownMultiselect = isMultiselect.toString();
            if (dropdownOptions?.length > 0) {
              mention.dataset.dropdownOptions = dropdownOptions;
            }
          }
        }

        mention.contentEditable = "false";
        mention.style.userSelect = "none";
        mention.style.pointerEvents = "auto";
      }
    });
  }

  public generatePlaceholderText(
    fieldLabel: string,
    user: MentionUser
  ): string {
    if (!this.config.placeholderConfig?.enabled) {
      return `${user.name?.trim()?.length > 1 ? user.name : user.contact_type_name || user.first_name || user.last_name || user.full_name}@${fieldLabel}`;
    }

    if (this.config.placeholderConfig.customText) {
      return this.config.placeholderConfig.customText;
    }

    const template =
      this.config.placeholderConfig.template || "Enter your {label}";

    return template
      .replace(/{label}/gi, fieldLabel)
      .replace(/{field}/gi, fieldLabel)
      .replace(/{user}/gi, user.name || user.contact_type_name || "")
      .replace(/{firstName}/gi, user.first_name || "")
      .replace(/{lastName}/gi, user.last_name || "")
      .replace(/{fullName}/gi, user.name || user.contact_type_name || "");
  }

  public applyPlaceholderStyling(mention: HTMLElement, user: any) {
    mention.classList.add("placeholder");
    mention.style.fontStyle = "italic";
    mention.style.color = "#6b7280";
    mention.style.backgroundColor = user.color ? user.color + "35" : "#91d5ff";
    mention.style.borderColor = "#d1d5db";
  }

  public removePlaceholderStyling(mention: HTMLElement) {
    mention.classList.remove("placeholder");
    mention.style.fontStyle = "normal";
    mention.style.color = "black";
    mention.classList.remove("mention-highlight");
  }

  public updatePlaceholderConfig(newConfig: MentionPlaceholderConfig) {
    this.config.placeholderConfig = {
      ...this.config.placeholderConfig,
      ...newConfig,
    };
    if (this.config.placeholderConfig?.enabled) {
      this.updateAllMentionPlaceholders();
    }
  }

  private updateAllMentionPlaceholders() {
    const mentions = document.querySelectorAll(
      '.mention[data-has-value="false"]'
    );
    mentions.forEach((mentionEl) => {
      const mention = mentionEl as HTMLElement;
      const userId = mention.dataset.userId;
      const fieldLabel = mention.dataset.fieldLabel || mention.dataset.field;

      if (userId && fieldLabel) {
        const user = this.config.users.find((u) => u._id === userId);
        if (user) {
          const newPlaceholderText = this.generatePlaceholderText(
            fieldLabel,
            user
          );
          mention.textContent = newPlaceholderText;
          mention.dataset.placeholderText = newPlaceholderText;
        }
      }
    });
  }
  private generateMentionId(): string {
    return `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private findScrollContainer(): HTMLElement {
    let element = document.querySelector(".codex-editor") as HTMLElement;
    if (!element) return document.body;

    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      if (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        element.scrollHeight > element.clientHeight
      ) {
        return element;
      }
      element = element.parentElement as HTMLElement;
    }
    return document.body;
  }

  private shouldDisableMentions(): boolean {
    const pathname = window.location.pathname;

    if (
      pathname.includes("document-preview") ||
      pathname.includes("template-preview")
    ) {
      return false;
    }
    const currentUser = this.getCurrentUser();
    return !currentUser;
  }

  private getCurrentUser(): MentionUser | null {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam =
      this.config.emailForPublicDocumentView || urlParams.get("email");
    if (!emailParam) return null;

    return (
      this.config.users.find(
        (user) =>
          user.email && user.email.toLowerCase() === emailParam.toLowerCase()
      ) || null
    );
  }

  private canUserEditMention(mentionUser: MentionUser): boolean {
    const pathname = window.location.pathname;
    const currentUser = this.getCurrentUser();
    if (
      pathname.includes("document-preview") ||
      pathname.includes("template-preview") ||
      pathname.includes("all-templates-preview")
    ) {
      return true;
    }

    if (!currentUser) {
      return false;
    }
    return (
      currentUser.email == mentionUser.email &&
      !window.location.pathname.includes("complete-preview") &&
      !currentUser?.document_completed
    );
  }

  private setupGlobalListener() {
    const getEditorContainer = (
      node: Node | EventTarget | null
    ): HTMLElement | null => {
      if (!node) return null;
      const el: any = node instanceof Node ? node : (node as Element);
      return el.closest?.(".editor-container") as HTMLElement | null;
    };
    document.addEventListener("keydown", (e) => {
      const editor = getEditorContainer(e.target);
      if (!editor) return;

      this.lastKeyPressed = e.key;

      if (e.key === "@") {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range instanceof Range) {
            this.mentionTriggerPosition = {
              node: range.startContainer,
              offset: range.startOffset,
            };
            this.currentRange = range.cloneRange();
            this.searchQuery = "";
            const existingDropdowns = document.querySelectorAll(
              ".mention-dropdown, .mention-fields-dropdown"
            );
            existingDropdowns.forEach((dropdown) => dropdown.remove());
            this.showDropdown(range, this.config.users);
          }
        }
        return;
      }

      if (e.key === "Escape" && this.isDropdownOpen) {
        this.hideDropdown();

        return;
      }

      if (
        this.isDropdownOpen &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault();

        this.navigateDropdown(e.key === "ArrowDown");

        return;
      }
      if (this.isDropdownOpen && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this.selectCurrentDropdownItem();

        return;
      }
      if (this.isDropdownOpen && e.key === "Backspace") {
        this.handleBackspace();

        return;
      }
    });

    document.addEventListener("input", (e) => {
      this.checkForMentionTrigger();
    });

    document.addEventListener("selectionchange", () => {
      this.handleSelectionChange();
    });

    document.addEventListener("click", (e) => {
      if (this.isDropdownOpen && !this.dropdown?.contains(e.target as Node)) {
        this.hideDropdown();
      }
    });
  }

  private selectCurrentDropdownItem() {
    if (!this.dropdown) return;

    const activeItem = this.dropdown.querySelector(
      ".mention-dropdown-item.active"
    );
    if (activeItem) {
      (activeItem as HTMLElement).click();
    }
  }
  private handleBackspace() {
    if (!this.mentionTriggerPosition) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;

    if (container.nodeType === Node.TEXT_NODE) {
      const text = container.textContent || "";
      const offset = range.startOffset;

      if (
        offset === this.mentionTriggerPosition.offset &&
        text[offset - 1] === "@"
      ) {
        this.hideDropdown();
        this.mentionTriggerPosition = null;
        this.searchQuery = "";
        return;
      }

      if (
        offset > this.mentionTriggerPosition.offset &&
        text[this.mentionTriggerPosition.offset - 1] === "@"
      ) {
        this.searchQuery = text.slice(
          this.mentionTriggerPosition.offset,
          offset - 1
        );
        const filteredUsers = this.filterUsers(this.searchQuery);
        this.showDropdown(range, filteredUsers);
      }
    }
  }
  private navigateDropdown(isDown: boolean) {
    if (!this.dropdown) return;

    const items = Array.from(
      this.dropdown.querySelectorAll(".mention-dropdown-item")
    ) as HTMLElement[];
    if (items.length === 0) return;

    const currentActive = this.dropdown.querySelector(
      ".mention-dropdown-item.active"
    );
    let currentIndex = currentActive
      ? items.indexOf(currentActive as HTMLElement)
      : -1;

    if (isDown) {
      currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    }

    items.forEach((item) => {
      item.classList.remove("active");
      item.style.backgroundColor = "transparent";
    });

    items[currentIndex].classList.add("active");
    items[currentIndex].style.backgroundColor = "#f8f9fa";
    items[currentIndex].scrollIntoView({ block: "nearest" });
  }

  private handleSelectionChange() {
    if (!this.isDropdownOpen || !this.mentionTriggerPosition) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.hideDropdown();
      return;
    }

    const range = selection.getRangeAt(0);
    if (!this.isCursorNearMentionTrigger(range)) {
      this.hideDropdown();
    }
  }

  private isCursorNearMentionTrigger(currentRange: Range): boolean {
    if (!this.mentionTriggerPosition) return false;

    const currentContainer = currentRange.startContainer;
    const currentOffset = currentRange.startOffset;

    if (currentContainer === this.mentionTriggerPosition.node) {
      return currentOffset >= this.mentionTriggerPosition.offset;
    }
    if (
      currentContainer.parentNode ===
      this.mentionTriggerPosition.node.parentNode
    ) {
      const parent = currentContainer.parentNode as HTMLElement;
      const textNodes = Array.from(parent.childNodes).filter(
        (n) => n.nodeType === Node.TEXT_NODE
      );
      const triggerNodeIndex = textNodes.indexOf(
        this.mentionTriggerPosition.node as Text
      );
      const currentNodeIndex = textNodes.indexOf(currentContainer as Text);
      if (triggerNodeIndex !== -1 && currentNodeIndex !== -1) {
        return currentNodeIndex >= triggerNodeIndex;
      }
    }
    return false;
  }
  private setupMentionClickListener() {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const mention = target.closest(".mention") as HTMLElement;
      if (mention) {
        e.preventDefault();
        e.stopPropagation();

        const userId = mention.dataset.userId;
        const field = mention.dataset.field;
        const fieldLabel = mention.dataset.fieldLabel;
        const mentionId = mention.dataset.mentionId;

        if (userId && field) {
          const user = this.config.users.find((u) => u._id === userId);
          if (user && this.canUserEditMention(user)) {
            mention.contentEditable = "false";
            mention.style.userSelect = "none";
            mention.style.pointerEvents = "auto";
            mention.style.cursor = "pointer";
            this.openValueEditor(mention, user);
          }
        }
      }
    });
  }

  private filterUsers(query: string): MentionUser[] {
    if (!query) return this.config.users;

    const lowerQuery = query.toLowerCase();
    return this.config.users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.contact_type_name?.toLowerCase().includes(lowerQuery)
    );
  }

  private checkForMentionTrigger() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.hideDropdown();
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.startContainer;

    let element: Element | null = null;
    if (container.nodeType === Node.ELEMENT_NODE) {
      element = container as Element;
    } else if (container.nodeType === Node.TEXT_NODE) {
      element = container.parentElement;
    }

    if (!element) {
      this.hideDropdown();
      return;
    }

    const editorElement = element.closest(".ce-block");
    if (!editorElement) {
      this.hideDropdown();
      return;
    }

    const textBeforeCursor = this.getTextBeforeCursor(
      container,
      range.startOffset
    );

    if (textBeforeCursor.includes("@")) {
      const atIndex = textBeforeCursor.lastIndexOf("@");
      this.searchQuery = textBeforeCursor.slice(atIndex + 1);
      const filteredUsers = this.filterUsers(this.searchQuery);
      const existingDropdowns = document.querySelectorAll(
        ".mention-dropdown, .mention-fields-dropdown"
      );
      existingDropdowns.forEach((dropdown) => dropdown.remove());
      this.showDropdown(range, filteredUsers);
    } else {
      this.hideDropdown();
      this.searchQuery = "";
    }
  }

  private getTextBeforeCursor(node: Node, offset: number): string {
    try {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.substring(0, offset) || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.isContentEditable) {
          let text = "";
          for (
            let i = 0;
            i < Math.min(offset, element.childNodes.length);
            i++
          ) {
            const child = element.childNodes[i];
            text += child.textContent || "";
          }
          return text;
        }
      }
      return "";
    } catch (error) {
      console.warn("Error getting text before cursor:", error);
      return "";
    }
  }

  private showDropdown(range: Range, users: MentionUser[]) {
    if (!(range instanceof Range)) {
      console.warn("Invalid range provided to showDropdown");
      return;
    }

    this.hideDropdown();
    this.currentRange = range.cloneRange();

    if (users.length === 0) {
      return;
    }

    this.isDropdownOpen = true;

    this.scrollContainer =
      (document.querySelector(".codex-editor") as HTMLElement) || document.body;

    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("mention-dropdown");
    Object.assign(this.dropdown.style, {
      position: "absolute",
      background: "white",
      border: "1px solid #e1e5e9",
      borderRadius: "8px",
      maxHeight: "300px",
      overflowY: "auto",
      zIndex: "1000000",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      minWidth: "250px",
    });

    const searchHeader = document.createElement("div");
    Object.assign(searchHeader.style, {
      padding: "12px 16px",
      borderBottom: "1px solid #f0f0f0",
      fontWeight: "600",
      color: "#2d3748",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    });
    searchHeader.textContent = "Select User";
    this.dropdown.appendChild(searchHeader);

    users.forEach((user, index) => {
      const userElement = document.createElement("div");
      userElement.classList.add("mention-dropdown-item");
      userElement.setAttribute("tabindex", "0");
      if (index === 0) {
        userElement.classList.add("active");
        userElement.style.backgroundColor = "#f8f9fa";
      }
      Object.assign(userElement.style, {
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "background-color 0.2s ease",
        borderBottom: "1px solid #f8f9fa",
      });

      userElement.addEventListener("mouseenter", () => {
        this.dropdown
          ?.querySelectorAll(".mention-dropdown-item")
          .forEach((item: HTMLElement) => {
            item.classList.remove("active");
            item.style.backgroundColor = "transparent";
          });
        userElement.classList.add("active");
        userElement.style.backgroundColor = "#f8f9fa";
      });

      userElement.addEventListener("mouseleave", () => {
        if (!userElement.classList.contains("active")) {
          userElement.style.backgroundColor = "transparent";
        }
      });

      const avatarContainer = document.createElement("div");
      Object.assign(avatarContainer.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: user.color ? user.color : "#4a90e2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: "0",
        color: "white",
        fontWeight: "600",
        fontSize: "14px",
      });

      if (user.avatar) {
        const avatar = document.createElement("img");
        avatar.src = user.avatar;
        Object.assign(avatar.style, {
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
        });
        avatarContainer.appendChild(avatar);
      } else {
        avatarContainer.textContent =
          user.name?.length > 1
            ? user.name.charAt(0).toUpperCase()
            : user.contact_type_name.charAt(0).toUpperCase();
      }

      const userInfo = document.createElement("div");
      userInfo.style.flex = "1";
      userInfo.style.minWidth = "0";

      const name = document.createElement("div");
      Object.assign(name.style, {
        fontWeight: "500",
        color: "#2d3748",
        marginBottom: "2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });
      name.textContent =
        user.name?.trim()?.length > 1
          ? user.name
          : user.contact_type_name ||
            user.first_name ||
            user.last_name ||
            user.full_name ||
            "";

      const email = document.createElement("div");
      Object.assign(email.style, {
        fontSize: "12px",
        color: "#718096",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });
      email.textContent = user.email || "";

      userInfo.appendChild(name);
      if (user.email) userInfo.appendChild(email);

      userElement.appendChild(avatarContainer);
      userElement.appendChild(userInfo);

      userElement.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      userElement.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showUserFieldsDropdown(user);
      });

      this.dropdown.appendChild(userElement);
    });

    document.body.appendChild(this.dropdown);

    this.updateDropdownPosition();

    this.scrollContainer.addEventListener(
      "scroll",
      this.updateDropdownPosition.bind(this)
    );

    setTimeout(() => {
      document.addEventListener("click", this.handleClickOutside);
    }, 100);
  }

  private updateDropdownPosition() {
    if (!this.dropdown || !this.currentRange || !this.scrollContainer) return;

    const rect = this.currentRange.getBoundingClientRect();
    const dropdownRect = this.dropdown.getBoundingClientRect();
    const dropdownWidth = dropdownRect.width;
    const dropdownHeight = dropdownRect.height;

    let left = rect.left + window.pageXOffset;
    let top = rect.bottom + window.pageYOffset + 5;

    const maxLeft = window.innerWidth - dropdownWidth - 10;
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 0) {
      left = 0;
    }

    const maxTop =
      window.pageYOffset + window.innerHeight - dropdownHeight - 10;
    if (top > maxTop) {
      top = rect.top + window.pageYOffset - dropdownHeight - 5;
    }
    if (top < window.pageYOffset) {
      top = window.pageYOffset;
    }

    Object.assign(this.dropdown.style, {
      left: `${left}px`,
      top: `${top}px`,
    });
  }

  private hideDropdown() {
    if (this.dropdown) {
      if (this.dropdown.parentNode) {
        this.dropdown.parentNode.removeChild(this.dropdown);
      }
      this.dropdown = null;
    }
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener(
        "scroll",
        this.updateDropdownPosition.bind(this)
      );
    }
    document.removeEventListener("click", this.handleClickOutside);
    this.isDropdownOpen = false;
    this.searchQuery = "";
  }

  private async showUserFieldsDropdown(user: MentionUser) {
    this.hideDropdown();
    const existingDropdowns = document.querySelectorAll(
      ".mention-dropdown, .mention-fields-dropdown"
    );
    existingDropdowns.forEach((dropdown) => dropdown.remove());

    this.allFieldItems = [];

    const staticFields = [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address" },
      { key: "company_name", label: "Company" },
      { key: "full_name", label: "Full Name" },
      { key: "title", label: "Title" },
      { key: "text_value", label: "Single Line Text" },
      { key: "number", label: "Number" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "date_time", label: "Date & Time" },
      { key: "url", label: "URL" },
      { key: "currency", label: "Currency" },
      { key: "dropdown", label: "Dropdown" },
    ];

    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("mention-fields-dropdown");
    Object.assign(this.dropdown.style, {
      position: "absolute",
      background: "white",
      border: "1px solid #e1e5e9",
      borderRadius: "8px",
      maxHeight: "360px",
      overflowY: "auto",
      zIndex: "1000000",
      minWidth: "280px",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
    });

    this.dropdown.addEventListener("click", (e) => e.stopPropagation());

    const userHeader = this.buildUserHeader(user);
    this.dropdown.appendChild(userHeader);

    const searchWrapper = document.createElement("div");
    Object.assign(searchWrapper.style, {
      padding: "8px 12px",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: "45px",
      backgroundColor: "white",
      zIndex: "10",
    });

    const searchInput = document.createElement("input");
    searchInput.placeholder = "Search fields...";
    searchInput.type = "text";
    Object.assign(searchInput.style, {
      width: "100%",
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      outline: "none",
    });

    searchWrapper.appendChild(searchInput);
    this.dropdown.appendChild(searchWrapper);

    searchInput.addEventListener("click", (e) => e.stopPropagation());
    searchInput.addEventListener("input", (e) => e.stopPropagation());

    staticFields.forEach((field) => {
      const el = this.buildFieldItem(field, user[field.key] || "", user, false);

      el.dataset.searchable =
        `${field.label} ${field.key} static`.toLowerCase();

      this.allFieldItems.push(el);
      this.dropdown.appendChild(el);
    });

    const customSection = document.createElement("div");

    const customHeader = document.createElement("div");
    Object.assign(customHeader.style, {
      padding: "8px 16px",
      fontWeight: "600",
      color: "#4b5563",
      backgroundColor: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    });
    customHeader.textContent = "Custom Fields";
    customSection.appendChild(customHeader);
    this.dropdown.appendChild(customSection);

    const loadingSpinner = document.createElement("div");
    loadingSpinner.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" opacity=".3"/>
      <path d="M8 0a8 8 0 018 8h-2a6 6 0 00-6-6V0z">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>`;
    Object.assign(loadingSpinner.style, {
      padding: "8px 16px",
      display: "flex",
      justifyContent: "center",
    });
    customHeader.appendChild(loadingSpinner);

    const noResults = document.createElement("div");
    noResults.textContent = "No Fields Found";
    Object.assign(noResults.style, {
      padding: "12px 16px",
      textAlign: "center",
      color: "#9ca3af",
      fontSize: "13px",
      display: "none",
    });
    this.dropdown.appendChild(noResults);

    document.body.appendChild(this.dropdown);
    this.updateDropdownPosition();

    this.loadCustomFields(user)
      .then((customFields) => {
        loadingSpinner.remove();

        const typeMap: Record<string, string> = {
          text: "text_value",
          number: "number",
          date: "date",
          time: "time",
          date_time: "date_time",
          url: "url",
          currency: "currency",
          dropdown: "dropdown",
          multiple: "dropdown",
          list: "dropdown",
          "weekdays": "dropdown",
          fixed_time: "time",
        };
        const removeFieldsList = ["stamp", "radio", "checkbox"];

        customFields
          .filter((f) => !removeFieldsList.includes(f.field_type))
          .forEach((f: any) => {
            const field = {
              key: f.field_key,
              label: f.label || f.name || "Unnamed",
              field_type: typeMap[f.field_type] || "text_value",
              value: f.value,
              properties: {
                ...f.properties,
                is_multiple: f.field_type == "multiple",
                options:
                  f.field_type == "weekdays"
                    ? weekdayOptions.map((day, index) => ({
                        label: day,
                        value: day,
                        id: index,
                      }))
                    : f.properties.options,
              },
            };

            const el = this.buildFieldItem(field, field.value, user, true);
            el.dataset.searchable =
              `${field.label} ${field.key} ${field.field_type} custom`.toLowerCase();

            this.allFieldItems.push(el);
            customSection.appendChild(el);
          });
      })
      .catch(() => {
        loadingSpinner.remove();
        const errorEl = document.createElement("div");
        errorEl.textContent = "Failed to load custom fields";
        Object.assign(errorEl.style, {
          padding: "12px",
          color: "#ef4444",
          textAlign: "center",
          fontSize: "13px",
        });
        customSection.appendChild(errorEl);
      });

    searchInput.addEventListener("input", () => {
      const query =
        this.searchQuery.toLowerCase() || searchInput.value.toLowerCase();
      let count = 0;

      this.allFieldItems.forEach((el) => {
        const match = el.dataset.searchable!.includes(query);
        el.style.display = match ? "block" : "none";
        if (match) count++;
      });

      noResults.style.display = count === 0 ? "block" : "none";
    });

    setTimeout(
      () => document.addEventListener("click", this.handleClickOutside),
      0
    );
  }

  private buildFieldItem(
    field: {
      key: string;
      label: string;
      value?: any;
      field_type?: string;
      properties?: any;
      isCustom?: boolean;
    },
    fieldValue: string,
    user: MentionUser,
    isCustom: boolean = false
  ) {
    const fieldElement = document.createElement("div");
    fieldElement.classList.add("mention-field-item");
    Object.assign(fieldElement.style, {
      padding: "10px 16px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      borderBottom: "1px solid #f8f9fa",
    });

    fieldElement.addEventListener("mouseenter", () => {
      fieldElement.style.backgroundColor = "#f8f9fa";
    });

    fieldElement.addEventListener("mouseleave", () => {
      fieldElement.style.backgroundColor = "transparent";
    });

    const nameEl = document.createElement("div");
    Object.assign(nameEl.style, {
      fontWeight: "500",
      color: "#2d3748",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    });

    const nameText = document.createElement("span");
    nameText.textContent = field.label;
    nameEl.appendChild(nameText);

    if (isCustom && field.field_type) {
      const typeBadge = document.createElement("span");
      typeBadge.textContent = this.getFieldTypeDisplayName(field.field_type);
      typeBadge.style.fontSize = "10px";
      typeBadge.style.padding = "2px 6px";
      typeBadge.style.backgroundColor = "#e5e7eb";
      typeBadge.style.color = "#6b7280";
      typeBadge.style.borderRadius = "10px";
      typeBadge.style.marginLeft = "auto";
    }

    const valueEl = document.createElement("div");
    Object.assign(valueEl.style, {
      fontSize: "12px",
      color: "#718096",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });

    if (fieldValue) {
      valueEl.textContent = String(fieldValue);
    } else if (isCustom) {
      const displayType = this.getFieldTypeDisplayName(
        field.field_type || "text_value"
      );
      valueEl.textContent = `${displayType} field`;
      valueEl.style.fontStyle = "italic";
    }

    fieldElement.appendChild(nameEl);
    fieldElement.appendChild(valueEl);

    fieldElement.addEventListener("click", () => {
      this.insertMention(user, field, isCustom);
      this.hideDropdown();
    });

    return fieldElement;
  }

  private getFieldTypeDisplayName(fieldType: string): string {
    const typeMap: Record<string, string> = {
      text_value: "Text",
      number: "Number",
      date: "Date",
      time: "Time",
      date_time: "Date Time",
      url: "URL",
      currency: "Currency",
      dropdown: "Dropdown",
      text: "Text",
    };
    return typeMap[fieldType] || fieldType;
  }

  private buildUserHeader(user: MentionUser) {
    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "12px 16px",
      borderBottom: "1px solid #f0f0f0",
      fontWeight: "600",
      color: "#2d3748",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      position: "sticky",
      top: "0",
      backgroundColor: "white",
      zIndex: "10",
    });

    const avatar = document.createElement("div");
    Object.assign(avatar.style, {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: user.color ?? "#4a90e2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      color: "white",
      fontWeight: "600",
      fontSize: "12px",
    });
    if (user.avatar) {
      const img = document.createElement("img");
      img.src = user.avatar;
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        objectFit: "cover",
      });
      avatar.appendChild(img);
    } else {
      avatar.textContent = (
        user.name?.trim()?.length > 1
          ? user.name[0]
          : user.contact_type_name?.[0] || ""
      ).toUpperCase();
    }

    header.appendChild(avatar);
    header.appendChild(
      document.createTextNode(
        user.name?.trim()?.length > 1
          ? user.name
          : user.contact_type_name ||
              user.first_name ||
              user.last_name ||
              user.full_name ||
              ""
      )
    );
    return header;
  }

  private handleClickOutside = (e: MouseEvent) => {
    if (
      this.dropdown &&
      !this.dropdown.contains(e.target as Node) &&
      !(e.target as Element).closest(".mention-dropdown-item")
    ) {
      this.hideDropdown();
    }
  };


  private insertMention(
    user: MentionUser,
    field: {
      key: string;
      label: string;
      value?: any;
      field_type?: string;
      properties?: any;
      isCustom?: boolean;
    },
    isCustom: boolean = false
  ) {
    if (!this.currentRange) return;
    const canEdit = this.canUserEditMention(user);

    try {
      const range = this.currentRange;
      const container = range.startContainer;

      if (container.nodeType === Node.TEXT_NODE) {
        const text = container.textContent || "";
        const startOffset = range.startOffset;
        const atIndex = text.lastIndexOf("@", startOffset - 1);

        if (atIndex !== -1) {
          const newText =
            text.substring(0, atIndex) + text.substring(startOffset);
          container.textContent = newText;
          range.setStart(container, atIndex);
          range.setEnd(container, atIndex);
        }
      }

      const mention = document.createElement("span");
      mention.classList.add("mention");
      Object.assign(mention.style, {
        backgroundColor: user.color ? user.color + "35" : "#91d5ff",
        borderRadius: "4px",
        padding: "2px 6px",
        cursor: "pointer",
        display: "inline-block",
        border: "1px solid #91d5ff",
        color: "black",
        fontWeight: "500",
        margin: "0 2px",
        userSelect: "none",
      });

      const fieldValue = isCustom ? field.value : user[field.key];
      let displayText = "";
      let hasValue = false;

      if (fieldValue) {
        displayText = `${fieldValue}`;
        hasValue = true;
      } else {
        displayText = this.generatePlaceholderText(field.label, user);
        hasValue = false;
        this.applyPlaceholderStyling(mention, user);
      }

      mention.textContent = displayText;

      mention.dataset.userId = user._id || user.id;
      mention.dataset.field = isCustom
        ? field.field_type == "text"
          ? "text_value"
          : field.field_type
        : field.key;
      mention.dataset.fieldLabel = field.label;
      mention.dataset.customValue = fieldValue || "";
      mention.dataset.mentionId = this.generateMentionId();
      mention.dataset.required = "true";
      mention.dataset.hasValue = hasValue.toString();
      mention.dataset.placeholderText = this.generatePlaceholderText(
        field.label,
        user
      );
      mention.dataset.contact_mapped_key = returnSlugFromLabel(field.label)

      if (isCustom) {
        mention.dataset.isCustom = "true";
        mention.dataset.fieldType = field.field_type || "text_value";

        if (field.field_type === "dropdown" && field.properties) {
          const mappedOptions = field.properties.options?.map((o: string, i: number) => typeof o != 'string' ? o :({ id: i + 1, value: o, label: o }));
          mention.dataset.dropdownOptions = JSON.stringify(mappedOptions || []);
          mention.dataset.dropdownMultiselect = field.properties.is_multiple == true ? "true" : "false";
        }

        if (field.properties) {
          mention.dataset.fieldProperties = JSON.stringify(field.properties);
        }
      }

      const fieldType = isCustom ? field.field_type : field.key;
      if (fieldType === "time") {
        mention.dataset.timeFormat = "HH:mm";
      } else if (fieldType === "date") {
        mention.dataset.dateFormat =
          this.config.defaultDateFormat || "dd-MM-yyyy";
      } else if (fieldType === "date_time") {
        mention.dataset.dateTimeFormat =
          `${this.config.defaultDateFormat} HH:mm` || "MM-dd-yyyy HH:mm";
      } else if (fieldType === "dropdown") {
         mention.dataset.dropdownMultiselect = (isCustom && field.properties.is_multiple == true) ? "true" : "false";
        if (isCustom && field.properties?.options) {
          const mappedOptions = field.properties.options?.map(
            (o: string, i: number) => typeof o != 'string' ? o :({ id: i + 1, value: o, label: o })
          );
          mention.dataset.dropdownOptions = JSON.stringify(mappedOptions || []);
        }
      }

      mention.contentEditable = "false";
      mention.style.pointerEvents = "auto";
      mention.style.cursor = "pointer";

      if (canEdit) {
        mention.contentEditable = "false";
        mention.style.pointerEvents = "auto";
        mention.style.cursor = "pointer";

        mention.addEventListener("click", (e) => {
          e.stopPropagation();
          mention.contentEditable = "false";
          this.openValueEditor(mention, user);
        });
      } else {
        mention.contentEditable = "false";
        mention.style.pointerEvents = "none";
        mention.style.cursor = "default";
      }
      range.deleteContents();
      range.insertNode(mention);

      const newRange = document.createRange();
      newRange.setStartAfter(mention);
      newRange.collapse(true);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } catch (error) {
      console.error("Error inserting mention:", error);
    }
  }

  private openDropdownConfigDialog(
    currentOptions: DropdownOption[],
    onSave: (options: DropdownOption[]) => void
  ) {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "10000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    const dialog = document.createElement("div");
    Object.assign(dialog.style, {
      background: "white",
      borderRadius: "12px",
      padding: "0",
      width: "500px",
      maxWidth: "90vw",
      maxHeight: "80vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "20px 24px",
      borderBottom: "1px solid #e5e7eb",
      backgroundColor: "#f8fafc",
    });

    const title = document.createElement("h3");
    Object.assign(title.style, {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#1f2937",
    });
    title.textContent = "Configure Dropdown Options";
    header.appendChild(title);

    const subtitle = document.createElement("p");
    Object.assign(subtitle.style, {
      margin: "4px 0 0 0",
      fontSize: "14px",
      color: "#6b7280",
    });
    subtitle.textContent = "Add, edit, or remove dropdown options";
    header.appendChild(subtitle);

    dialog.appendChild(header);

    const content = document.createElement("div");
    Object.assign(content.style, {
      padding: "24px",
      maxHeight: "400px",
      overflowY: "auto",
    });

    const optionsContainer = document.createElement("div");
    optionsContainer.style.marginBottom = "16px";

    let options = [...currentOptions];
    if (options.length === 0) {
      options = [
        {
          id: Date.now().toString() + Math.random().toString(),
          label: "Option 1",
          value: "Option 1",
        },
      ];
    }

    const renderOptions = () => {
      optionsContainer.innerHTML = "";

      options.forEach((option, index) => {
        const optionRow = document.createElement("div");
        Object.assign(optionRow.style, {
          display: "flex",
          gap: "12px",
          marginBottom: "12px",
          alignItems: "flex-start",
        });

        const inputContainer = document.createElement("div");
        inputContainer.style.flex = "1";
        inputContainer.style.position = "relative";

        const input = document.createElement("input");
        input.type = "text";
        input.value = option.label;
        input.placeholder = "Enter option label...";
        Object.assign(input.style, {
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          outline: "none",
          transition: "border-color 0.2s ease",
        });

        input.addEventListener("focus", () => {
          input.style.borderColor = "#3b82f6";
          input.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        });

        input.addEventListener("blur", () => {
          input.style.borderColor = "#d1d5db";
          input.style.boxShadow = "none";
        });

        input.addEventListener("input", (e) => {
          const value = (e.target as HTMLInputElement).value;
          const trimmedValue = value.trim();

          const isDuplicate = options.some(
            (opt, idx) =>
              idx !== index &&
              opt.label.toLowerCase() === trimmedValue.toLowerCase()
          );

          if (isDuplicate && trimmedValue) {
            input.style.borderColor = "#ef4444";
            input.style.backgroundColor = "#fef2f2";

            let warning = inputContainer.querySelector(
              ".duplicate-warning"
            ) as HTMLElement;
            if (!warning) {
              warning = document.createElement("div");
              warning.className = "duplicate-warning";
              Object.assign(warning.style, {
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              });
              warning.innerHTML = "⚠️ This option already exists";
              inputContainer.appendChild(warning);
            }
          } else {
            input.style.borderColor = "#d1d5db";
            input.style.backgroundColor = "white";

            const warning = inputContainer.querySelector(".duplicate-warning");
            if (warning) {
              warning.remove();
            }

            options[index].label = trimmedValue;
            options[index].value = trimmedValue;
          }
        });

        inputContainer.appendChild(input);

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.149l.83 9.6A1.5 1.5 0 0 0 4.826 14h6.348a1.5 1.5 0 0 0 1.5-1.751l.83-9.6a.58.58 0 0 0-.01-1.149H11Zm-1.25 7a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 1.5 0v3.5Zm-4 0a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 1.5 0v3.5Z"/>
          </svg>
        `;
        deleteBtn.disabled = options.length === 1;
        Object.assign(deleteBtn.style, {
          padding: "10px 12px",
          background: options.length === 1 ? "#f3f4f6" : "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: options.length === 1 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: options.length === 1 ? "0.5" : "1",
          transition: "all 0.2s ease",
        });

        if (options.length > 1) {
          deleteBtn.addEventListener("click", () => {
            options.splice(index, 1);
            renderOptions();
          });

          deleteBtn.addEventListener("mouseenter", () => {
            if (options.length > 1) {
              deleteBtn.style.backgroundColor = "#dc2626";
            }
          });

          deleteBtn.addEventListener("mouseleave", () => {
            if (options.length > 1) {
              deleteBtn.style.backgroundColor = "#ef4444";
            }
          });
        }

        optionRow.appendChild(inputContainer);
        optionRow.appendChild(deleteBtn);
        optionsContainer.appendChild(optionRow);
      });
    };

    renderOptions();
    content.appendChild(optionsContainer);

    // Add Button
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+ Add Option";
    Object.assign(addButton.style, {
      width: "100%",
      padding: "12px 16px",
      background: "white",
      color: "#3b82f6",
      border: "2px dashed #d1d5db",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      marginBottom: "20px",
    });

    addButton.addEventListener("mouseenter", () => {
      addButton.style.borderColor = "#3b82f6";
      addButton.style.backgroundColor = "#f8fafc";
    });

    addButton.addEventListener("mouseleave", () => {
      addButton.style.borderColor = "#d1d5db";
      addButton.style.backgroundColor = "white";
    });

    addButton.addEventListener("click", () => {
      const newOption = {
        id: Date.now().toString() + Math.random().toString(),
        label: `Option ${options.length + 1}`,
        value: `Option ${options.length + 1}`,
      };

      let optionNumber = options.length + 1;
      while (options.some((opt) => opt.label === newOption.label)) {
        optionNumber++;
        newOption.label = `Option ${optionNumber}`;
        newOption.value = `Option ${optionNumber}`;
      }

      options.push(newOption);
      renderOptions();
    });

    content.appendChild(addButton);
    dialog.appendChild(content);

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      padding: "20px 24px",
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "#f8fafc",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    });

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    Object.assign(cancelButton.style, {
      padding: "10px 20px",
      background: "white",
      color: "#374151",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
    });

    cancelButton.addEventListener("mouseenter", () => {
      cancelButton.style.backgroundColor = "#f9fafb";
    });

    cancelButton.addEventListener("mouseleave", () => {
      cancelButton.style.backgroundColor = "white";
    });

    cancelButton.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save Options";
    Object.assign(saveButton.style, {
      padding: "10px 20px",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.2s ease",
    });

    saveButton.addEventListener("mouseenter", () => {
      saveButton.style.backgroundColor = "#2563eb";
    });

    saveButton.addEventListener("mouseleave", () => {
      saveButton.style.backgroundColor = "#3b82f6";
    });

    saveButton.addEventListener("click", () => {
      const validOptions = options.filter((opt) => opt.label.trim() !== "");

      const uniqueOptions = [];
      const seenLabels = new Set();

      for (const option of validOptions) {
        const lowerLabel = option.label.toLowerCase();
        if (!seenLabels.has(lowerLabel)) {
          seenLabels.add(lowerLabel);
          uniqueOptions.push(option);
        }
      }
      if (uniqueOptions.length === 0) {
        alert("Please add at least one valid option");
        return;
      }

      if (uniqueOptions.length !== validOptions.length) {
        alert("Duplicate options have been removed");
      }

      onSave(uniqueOptions);
      document.body.removeChild(overlay);
    });

    footer.appendChild(cancelButton);
    footer.appendChild(saveButton);
    dialog.appendChild(footer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    setTimeout(() => {
      const firstInput = dialog.querySelector("input");
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 100);
  }

  private openValueEditor(mention: HTMLElement, user: MentionUser) {
        const existingDropdowns = document.querySelectorAll(
          ".mention-dropdown, .mention-fields-dropdown, .mention-popup"
        );
        existingDropdowns.forEach((dropdown) => dropdown.remove());
    this.closeExistingPopup();
    if (
      !this.canUserEditMention(user) ||
      mention.getAttribute("data-field") == "email"
    ) {
      return;
    }
    const isMobile = this.isMobileDevice();

    this.scrollContainer = this.findScrollContainer();

    const popup = document.createElement("div");
    popup.classList.add("mention-popup");
    const baseStyles: any = {
      background: "white",
      border: "1px solid #e1e5e9",
      borderRadius: "8px",
      padding: "16px",
      zIndex: "1000000",
      minWidth: "320px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    };

    if (isMobile) {
      Object.assign(baseStyles, {
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "90vw",
        maxWidth: "200px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        transform: `scale(${1.9})`,
        transformOrigin: "center",
      });
    } else {
      Object.assign(baseStyles, {
        position: "absolute",
      });
    }

    Object.assign(popup.style, baseStyles);
    this.currentMention = mention;
    this.currentPopup = popup;

  const header = document.createElement("div");
  Object.assign(header.style, {
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  const avatarContainer = document.createElement("div");
  Object.assign(avatarContainer.style, {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: user.color ? user.color + 55 : "#4a90e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    color: "white",
    fontWeight: "600",
  });

  if (user.avatar) {
    const avatar = document.createElement("img");
    avatar.src = user.avatar;
    Object.assign(avatar.style, {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      objectFit: "cover",
    });
    avatarContainer.appendChild(avatar);
  } else {
    avatarContainer.textContent =
      user.name?.length > 1
        ? user.name.charAt(0).toUpperCase()
        : user.contact_type_name.charAt(0).toUpperCase();
  }
  const userInfo = document.createElement("div");
  const fieldLabel =
    mention.dataset.fieldLabel ||
    mention.getAttribute("data-field-label") ||
    "Field";
  const fieldKey = mention.dataset.field || "";
  const mentionId = mention.dataset.mentionId || "";

  userInfo.innerHTML = `
  <div style="font-weight: 600; color: #2d3748; text-overflow: ellipsis; overflow: hidden; max-width: 500px;">${user.name?.trim()?.length > 1 ? user.name : user.contact_type_name || user.first_name || user.last_name || user.full_name}</div>
  <div style="font-size: 12px; color: #718096;">${fieldLabel}</div>
`;

  header.appendChild(avatarContainer);
  header.appendChild(userInfo);
  popup.appendChild(header);

  if (fieldKey === "dropdown") {
    this.renderDropdownField(popup, mention, user);
    this.handleMobilePopup(popup, isMobile);
    return;
  }

  if (fieldKey === "time") {
    this.renderTimeField(popup, mention, user);
    this.handleMobilePopup(popup, isMobile);
    return;
  }

  let inputType = "text";
  let inputPattern = "";
  let inputPlaceholder =
    `${mention.getAttribute("data-placeholder-text")}` || "Enter value...";
  let currencySymbol = "$";
  let currentDateFormat =
    mention.dataset.dateFormat ||
    this.config.defaultDateFormat ||
    "dd-MM-yyyy";
  let currentDateTimeFormat =
    mention.dataset.dateTimeFormat ||
    `${this.config.defaultDateFormat} HH:mm` ||
    "MM-dd-yyyy HH:mm";
  let currentTimeFormat = mention.getAttribute("data-time-format") || "HH:mm";
  let existingValue = mention.dataset.customValue || user[fieldKey] || "";

  let inputElement: HTMLInputElement | null = null;
  let dateInput: HTMLInputElement | null = null;
  let nativeDateInput: HTMLInputElement | null = null;
  let dateTimeInput: HTMLInputElement | null = null;
  let nativeDateTimeInput: HTMLInputElement | null = null;
  let timeInput: HTMLInputElement | null = null;

  let dateContainer: HTMLDivElement | null = null;
  let dateTimeContainer: HTMLDivElement | null = null;
  let timeContainer: HTMLDivElement | null = null;

  const formatDate = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    switch (format) {
      case "MM-dd-yyyy":
        return `${month}-${day}-${year}`;
      case "dd-MM-yyyy":
        return `${day}-${month}-${year}`;
      case "MMM dd yyyy":
        return `${monthNames[date.getMonth()]} ${day} ${year}`;
      case "MM/dd/yyyy":
        return `${month}/${day}/${year}`;
      case "dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

    const parseDate = (dateString: string, format: string): Date | null => {
      if (!dateString) return null;
      try {
        let day, month, year;
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        switch (format) {
          case "MM-dd-yyyy":
            [month, day, year] = dateString.split("-").map(Number);
            break;
          case "dd-MM-yyyy":
            [day, month, year] = dateString.split("-").map(Number);
            break;
          case "MMM dd yyyy":
            const parts = dateString.split(" ");
            const monthName = parts[0];
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
            month = monthNames.indexOf(monthName) + 1;
            break;
          case "MM/dd/yyyy":
            [month, day, year] = dateString.split("/").map(Number);
            break;
          case "dd/MM/yyyy":
            [day, month, year] = dateString.split("/").map(Number);
            break;
          default:
            return null;
        }
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        return null;
      }
    };

    const formatDateTime = (date: Date, format: string): string => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const twelveHour = (date.getHours() % 12 || 12)
        .toString()
        .padStart(2, "0");
      const ampm = date.getHours() >= 12 ? "PM" : "AM";
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      switch (format) {
        case "MM-dd-yyyy HH:mm":
          return `${month}-${day}-${year} ${hours}:${minutes}`;
        case "dd-MM-yyyy HH:mm":
          return `${day}-${month}-${year} ${hours}:${minutes}`;
        case "MMM dd yyyy HH:mm":
          return `${monthNames[date.getMonth()]} ${day} ${year} ${hours}:${minutes}`;
        case "MM/dd/yyyy hh:mm TT":
          return `${month}/${day}/${year} ${twelveHour}:${minutes} ${ampm}`;
        case "dd/MM/yyyy HH:mm":
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        default:
          return date.toISOString().substring(0, 16).replace("T", " ");
      }
    };

    const parseDateTime = (dateString: string, format: string): Date | null => {
      if (!dateString) return null;

      try {
        let day,
          month,
          year,
          hours = 0,
          minutes = 0;
        const parts = dateString.split(" ");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const datePart = parts[0];
        const timePart = parts[1] ? parts[1] : "00:00";
        let ampm = parts[2] || "";

        const [h, m] = timePart.split(":").map(Number);
        hours = h;
        minutes = m;

        if (ampm) {
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
        }

        switch (format) {
          case "MM-dd-yyyy HH:mm":
            [month, day, year] = datePart.split("-").map(Number);
            break;
          case "dd-MM-yyyy HH:mm":
            [day, month, year] = datePart.split("-").map(Number);
            break;
          case "MMM dd yyyy HH:mm":
            const dateParts = datePart.split(" ");
            const monthName = dateParts[0];
            day = parseInt(dateParts[1]);
            year = parseInt(dateParts[2]);
            month = monthNames.indexOf(monthName) + 1;
            break;
          case "MM/dd/yyyy hh:mm TT":
            [month, day, year] = datePart.split("/").map(Number);
            break;
          case "dd/MM/yyyy HH:mm":
            [day, month, year] = datePart.split("/").map(Number);
            break;
          default:
            return null;
        }

        // Validate parsed components
        if (!month || !day || !year) {
          console.error("Missing date components", { month, day, year });
          return null;
        }

        if (month < 1 || month > 12) {
          console.error(`Invalid month: ${month}`);
          return null;
        }

        if (day < 1 || day > 31) {
          console.error(`Invalid day: ${day}`);
          return null;
        }

        if (hours < 0 || hours > 23) {
          console.error(`Invalid hours: ${hours}`);
          return null;
        }

        if (minutes < 0 || minutes > 59) {
          console.error(`Invalid minutes: ${minutes}`);
          return null;
        }

        const date = new Date(year, month - 1, day, hours, minutes);

        if (isNaN(date.getTime())) {
          console.error("Invalid date created");
          return null;
        }

        return date;
      } catch (error) {
        console.error("Error parsing date:", error, { dateString, format });
        return null;
      }
    };

    const formatTime = (time: string, format: string): string => {
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) return time;

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];

    if (format === "hh:mm TT") {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const parseTime = (timeString: string, format: string): string => {
    if (!timeString) return "";
    try {
      let hours, minutes;
      if (format === "hh:mm TT") {
        const parts = timeString.split(" ");
        const timePart = parts[0];
        const ampm = parts[1] || "";
        const [h, m] = timePart.split(":").map(Number);
        hours = h;
        minutes = m;
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      } else {
        const [h, m] = timeString.split(":").map(Number);
        hours = h;
        minutes = m;
      }
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      return timeString;
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true;

    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isPreviewMode =
    window.location.pathname.includes("document-preview") ||
    window.location.pathname.includes("template-preview");

  const isValidEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showEmailError = (
    inputEl: HTMLInputElement,
    message: string = "Please enter a valid email address"
  ) => {
    const existingError = popup.querySelector(".email-error");
    if (existingError) {
      existingError.remove();
    }

    inputEl.style.borderColor = "#e53e3e";
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "#e53e3e";
    errorDiv.style.fontSize = "12px";
    errorDiv.style.marginTop = "4px";
    errorDiv.style.marginBottom = "8px";
    errorDiv.textContent = message;
    errorDiv.classList.add("email-error");
    inputEl.parentNode?.insertBefore(errorDiv, inputEl.nextSibling);
  };

  const removeEmailError = () => {
    const errorDiv = popup.querySelector(".email-error");
    if (errorDiv) {
      errorDiv.remove();
    }
  };

  switch (fieldKey) {
    case "number":
      inputType = "number";
      inputPlaceholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        "Enter number...";
      break;
    case "phone":
      inputType = "tel";
      inputPattern = "[0-9]*";
      inputPlaceholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        "Enter phone number...";
      break;
    case "email":
      inputType = "email";
      inputPlaceholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        "Enter email address...";
      break;
    case "url":
      inputType = "url";
      inputPlaceholder =
        `${mention.getAttribute("data-placeholder-text")}` || "Enter URL...";
      break;
    case "date":
      dateContainer = document.createElement("div");
      dateContainer.style.position = "relative";
      dateContainer.style.marginBottom = "12px";

      dateInput = document.createElement("input");
      dateInput.type = "text";
      dateInput.readOnly = true;
      dateInput.placeholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        `Select date (${currentDateFormat})...`;

      Object.assign(dateInput.style, {
        width: "100%",
        padding: "8px 12px",
        paddingRight: "40px",
        border: "1px solid #e1e5e9",
        borderRadius: "6px",
        fontSize: isMobile ? "16px" : "14px",
        outline: "none",
        transition: "border-color 0.2s ease",
        boxSizing: "border-box",
        cursor: "pointer",
        background: "#f5f5f5",
      });

      nativeDateInput = document.createElement("input");
      nativeDateInput.type = "date";
      Object.assign(nativeDateInput.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        opacity: "0",
        zIndex: "1",
        cursor: "pointer",
      });

      const calendarButton = document.createElement("button");
      calendarButton.type = "button";
      calendarButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M14 2h-1V1a1 1 0 0 0-2 0v1H5V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM2 3h12a1 1 0 0 1 1 1v1H1V4a1 1 0 0 1 1-1zm12 12H2a1 1 0 0 1-1-1V7h14v7a1 1 0 0 1-1 1z"/>
      </svg>
    `;

      Object.assign(calendarButton.style, {
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#666",
        padding: "4px",
        borderRadius: "4px",
        zIndex: "2",
      });

      calendarButton.addEventListener("mouseenter", () => {
        calendarButton.style.backgroundColor = "#f0f0f0";
      });

      calendarButton.addEventListener("mouseleave", () => {
        calendarButton.style.backgroundColor = "transparent";
      });

      calendarButton.addEventListener("click", () => {
        nativeDateInput!.focus();
        nativeDateInput!.showPicker();
      });
      nativeDateInput.addEventListener("click", () => {
        nativeDateInput!.focus();
        nativeDateInput!.showPicker();
      });
      nativeDateInput.addEventListener("change", (e) => {
        const selectedDate = new Date((e.target as HTMLInputElement).value);
        if (!isNaN(selectedDate.getTime()) && dateInput) {
          const formattedDate = formatDate(selectedDate, currentDateFormat);
          dateInput.value = formattedDate;

          dateInput.style.borderColor = "#e1e5e9";
          const errorDiv = dateContainer!.querySelector(".date-error");
          if (errorDiv) {
            errorDiv.remove();
          }
        }
      });

      if (isPreviewMode) {
        const dateFormatContainer = document.createElement("div");
        dateFormatContainer.style.marginBottom = "8px";

        const dateFormatLabel = document.createElement("span");
        dateFormatLabel.textContent = "Format: ";
        dateFormatLabel.style.fontSize = isMobile ? "16px" : "14px";
        dateFormatLabel.style.marginRight = "8px";

        const dateFormatSelect = document.createElement("select");
        dateFormatSelect.style.padding = "6px 8px";
        dateFormatSelect.style.borderRadius = "4px";
        dateFormatSelect.style.border = "1px solid #e1e5e9";
        dateFormatSelect.style.fontSize = isMobile ? "16px" : "14px";

        this.dateFormatOptions.forEach((format) => {
          const option = document.createElement("option");
          option.value = format.value;
          option.textContent = format.label;
          if (format.value === currentDateFormat) {
            option.selected = true;
          }
          dateFormatSelect.appendChild(option);
        });

        dateFormatSelect.addEventListener("change", () => {
          const previousFormat = currentDateFormat;
          currentDateFormat = dateFormatSelect.value;
          if (dateInput) {
            dateInput.placeholder =
              `${mention.getAttribute("data-placeholder-text")}` ||
              `Select date (${currentDateFormat})...`;
            if (dateInput.value) {
              const parsedDate = parseDate(dateInput.value, previousFormat);
              if (parsedDate && !isNaN(parsedDate.getTime())) {
                dateInput.value = formatDate(parsedDate, currentDateFormat);
                const y = parsedDate.getFullYear();
                const m = (parsedDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const d = parsedDate.getDate().toString().padStart(2, "0");
                nativeDateInput!.value = `${y}-${m}-${d}`;
                const errorDiv = dateContainer!.querySelector(".date-error");
                if (errorDiv) {
                  errorDiv.remove();
                }
              } else {
                dateInput.value = "";
                nativeDateInput!.value = "";
                dateInput.style.borderColor = "#e53e3e";
                const errorDiv = document.createElement("div");
                errorDiv.classList.add("date-error");
                errorDiv.style.color = "#e53e3e";
                errorDiv.style.fontSize = "12px";
                errorDiv.style.marginTop = "4px";
                errorDiv.textContent = `Please enter a valid date in ${previousFormat} format`;
                if (!dateContainer!.querySelector(".date-error")) {
                  dateContainer!.appendChild(errorDiv);
                }
              }
            }
          }
        });

        dateFormatContainer.appendChild(dateFormatLabel);
        dateFormatContainer.appendChild(dateFormatSelect);
        popup.appendChild(dateFormatContainer);
      }

      if (existingValue && dateInput) {
        let existingDate = new Date(existingValue);
        if (isNaN(existingDate.getTime())) {
          existingDate = parseDate(existingValue, currentDateFormat);
        }
        if (existingDate && !isNaN(existingDate.getTime())) {
          dateInput.value = formatDate(existingDate, currentDateFormat);
          const y = existingDate.getFullYear();
          const m = (existingDate.getMonth() + 1).toString().padStart(2, "0");
          const d = existingDate.getDate().toString().padStart(2, "0");
          nativeDateInput!.value = `${y}-${m}-${d}`;
        } else {
          dateInput.value = existingValue;
        }
      }

      dateContainer.appendChild(dateInput);
      dateContainer.appendChild(nativeDateInput);
      dateContainer.appendChild(calendarButton);
      popup.appendChild(dateContainer);
      break;
    case "time":
      timeContainer = document.createElement("div");
      timeContainer.style.marginBottom = "12px";

      timeInput = document.createElement("input");
      timeInput.type = "time";
      timeInput.step = "60";

      Object.assign(timeInput.style, {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #e1e5e9",
        borderRadius: "6px",
        fontSize: isMobile ? "16px" : "14px",
        outline: "none",
        transition: "border-color 0.2s ease",
        boxSizing: "border-box",
      });

      if (isPreviewMode) {
        const timeFormatContainer = document.createElement("div");
        timeFormatContainer.style.marginBottom = "8px";

        const timeFormatLabel = document.createElement("span");
        timeFormatLabel.textContent = "Format: ";
        timeFormatLabel.style.fontSize = isMobile ? "16px" : "14px";
        timeFormatLabel.style.marginRight = "8px";

        const timeFormatSelect = document.createElement("select");
        timeFormatSelect.style.padding = "6px 8px";
        timeFormatSelect.style.borderRadius = "4px";
        timeFormatSelect.style.border = "1px solid #e1e5e9";
        timeFormatSelect.style.fontSize = isMobile ? "16px" : "14px";

        this.timeFormatOptions.forEach((format) => {
          const option = document.createElement("option");
          option.value = format.value;
          option.textContent = format.label;
          if (format.value === currentTimeFormat) {
            option.selected = true;
          }
          timeFormatSelect.appendChild(option);
        });

        timeFormatSelect.addEventListener("change", () => {
          currentTimeFormat = timeFormatSelect.value;
          mention.dataset.timeFormat = currentTimeFormat;

          if (timeInput && timeInput.value) {
            const formattedTime = formatTime(
              timeInput.value,
              currentTimeFormat
            );
            mention.dataset.displayValue = formattedTime;
          }
        });

        timeFormatContainer.appendChild(timeFormatLabel);
        timeFormatContainer.appendChild(timeFormatSelect);
        popup.appendChild(timeFormatContainer);
      }

      if (existingValue && timeInput) {
        const parsedTime = parseTime(existingValue, currentTimeFormat);
        if (parsedTime) {
          timeInput.value = parsedTime;
        } else {
          timeInput.value = existingValue;
        }
      }

      timeContainer.appendChild(timeInput);
      popup.appendChild(timeContainer);
      break;
    case "date_time":
      dateTimeContainer = document.createElement("div");
      dateTimeContainer.style.position = "relative";
      dateTimeContainer.style.marginBottom = "12px";

      dateTimeInput = document.createElement("input");
      dateTimeInput.type = "text";
      dateTimeInput.placeholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        `Enter date and time (${currentDateTimeFormat})...`;

      Object.assign(dateTimeInput.style, {
        width: "100%",
        padding: "8px 12px",
        paddingRight: "40px",
        border: "1px solid #e1e5e9",
        borderRadius: "6px",
        fontSize: isMobile ? "16px" : "14px",
        outline: "none",
        transition: "border-color 0.2s ease",
        boxSizing: "border-box",
      });

      nativeDateTimeInput = document.createElement("input");
      nativeDateTimeInput.type = "datetime-local";
      Object.assign(nativeDateTimeInput.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        opacity: "0",
        zIndex: "1",
        cursor: "pointer",
      });

      const dateTimeButton = document.createElement("button");
      dateTimeButton.type = "button";
      dateTimeButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M14 2h-1V1a1 1 0 0 0-2 0v1H5V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM2 3h12a1 1 0 0 1 1 1v1H1V4a1 1 0 0 1 1-1zm12 12H2a1 1 0 0 1-1-1V7h14v7a1 1 0 0 1-1 1z"/>
      </svg>
    `;

      Object.assign(dateTimeButton.style, {
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#666",
        padding: "4px",
        borderRadius: "4px",
        zIndex: "2",
      });

      dateTimeButton.addEventListener("mouseenter", () => {
        dateTimeButton.style.backgroundColor = "#f0f0f0";
      });

      dateTimeButton.addEventListener("mouseleave", () => {
        dateTimeButton.style.backgroundColor = "transparent";
      });

      nativeDateTimeInput.addEventListener("click", () => {
        nativeDateTimeInput!.focus();
        nativeDateTimeInput!.showPicker();
      });

      dateTimeButton.addEventListener("click", () => {
        nativeDateTimeInput!.focus();
        nativeDateTimeInput!.showPicker();
      });

      nativeDateTimeInput.addEventListener("change", (e) => {
        const value = (e.target as HTMLInputElement).value;
        if (value && dateTimeInput) {
          const date = new Date(value);
          const formatted = formatDateTime(date, currentDateTimeFormat);
          dateTimeInput.value = formatted;

          dateTimeInput.style.borderColor = "#e1e5e9";
          const errorDiv =
            dateTimeContainer!.querySelector(".datetime-error");
          if (errorDiv) {
            errorDiv.remove();
          }
        }
      });

      dateTimeInput.addEventListener("blur", (e) => {
        const value = (e.target as HTMLInputElement).value;
        if (value) {
          const parsedDate = parseDateTime(value, currentDateTimeFormat);
          if (!parsedDate) {
            dateTimeInput.style.borderColor = "#e53e3e";
            const errorDiv = document.createElement("div");
            errorDiv.style.color = "#e53e3e";
            errorDiv.style.fontSize = "12px";
            errorDiv.style.marginTop = "4px";
            errorDiv.textContent = `Please enter in ${currentDateTimeFormat} format`;
            if (!dateTimeContainer!.querySelector(".datetime-error")) {
              errorDiv.classList.add("datetime-error");
              dateTimeContainer!.appendChild(errorDiv);
            }
          } else {
            dateTimeInput.style.borderColor = "#e1e5e9";
            const errorDiv =
              dateTimeContainer!.querySelector(".datetime-error");
            if (errorDiv) {
              errorDiv.remove();
            }
            const y = parsedDate.getFullYear();
            const m = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
            const d = parsedDate.getDate().toString().padStart(2, "0");
            const h = parsedDate.getHours().toString().padStart(2, "0");
            const min = parsedDate.getMinutes().toString().padStart(2, "0");
            nativeDateTimeInput!.value = `${y}-${m}-${d}T${h}:${min}`;
          }
        }
      });

      if (isPreviewMode) {
        const dateTimeFormatContainer = document.createElement("div");
        dateTimeFormatContainer.style.marginBottom = "8px";

        const dateTimeFormatLabel = document.createElement("span");
        dateTimeFormatLabel.textContent = "Format: ";
        dateTimeFormatLabel.style.fontSize = isMobile ? "16px" : "14px";
        dateTimeFormatLabel.style.marginRight = "8px";

        const dateTimeFormatSelect = document.createElement("select");
        dateTimeFormatSelect.style.padding = "6px 8px";
        dateTimeFormatSelect.style.borderRadius = "4px";
        dateTimeFormatSelect.style.border = "1px solid #e1e5e9";
        dateTimeFormatSelect.style.fontSize = isMobile ? "16px" : "14px";

        this.dateTimeFormatOptions.forEach((format) => {
          const option = document.createElement("option");
          option.value = format.value;
          option.textContent = format.label;
          if (format.value === currentDateTimeFormat) {
            option.selected = true;
          }
          dateTimeFormatSelect.appendChild(option);
        });

          dateTimeFormatSelect.addEventListener("change", () => {
            const previousFormat = currentDateTimeFormat;
            currentDateTimeFormat = dateTimeFormatSelect.value;

            if (dateTimeInput) {
              dateTimeInput.placeholder = `Enter date and time (${currentDateTimeFormat})...`;
              if (dateTimeInput.value) {
                const parsed = parseDateTime(
                  dateTimeInput.value,
                  previousFormat
                );
                if (parsed) {
                  dateTimeInput.value = formatDateTime(
                    parsed,
                    currentDateTimeFormat
                  );
                }
              }
            }
          });

        dateTimeFormatContainer.appendChild(dateTimeFormatLabel);
        dateTimeFormatContainer.appendChild(dateTimeFormatSelect);
        popup.appendChild(dateTimeFormatContainer);
      }

      if (existingValue && dateTimeInput) {
        let existingDate = new Date(existingValue);
        if (isNaN(existingDate.getTime())) {
          existingDate = parseDateTime(existingValue, currentDateTimeFormat);
        }
        if (existingDate && !isNaN(existingDate.getTime())) {
          dateTimeInput.value = formatDateTime(
            existingDate,
            currentDateTimeFormat
          );
          const y = existingDate.getFullYear();
          const m = (existingDate.getMonth() + 1).toString().padStart(2, "0");
          const d = existingDate.getDate().toString().padStart(2, "0");
          const h = existingDate.getHours().toString().padStart(2, "0");
          const min = existingDate.getMinutes().toString().padStart(2, "0");
          nativeDateTimeInput!.value = `${y}-${m}-${d}T${h}:${min}`;
        } else {
          dateTimeInput.value = existingValue;
        }
      }

      dateTimeContainer.appendChild(dateTimeInput);
      dateTimeContainer.appendChild(nativeDateTimeInput);
      dateTimeContainer.appendChild(dateTimeButton);
      popup.appendChild(dateTimeContainer);
      break;

    case "currency":
      inputType = "text";
      inputPlaceholder =
        `${mention.getAttribute("data-placeholder-text")}` ||
        "Enter amount...";

      let existingCurrencySymbol = "$";
      let existingNumericValue = "";

      if (existingValue) {
        const symbolMatch = existingValue.match(/[^\d.,]/g);
        if (symbolMatch && symbolMatch.length > 0) {
          existingCurrencySymbol = symbolMatch[0];
        }
        existingNumericValue = existingValue.replace(/[^\d.,]/g, "");

        if (existingNumericValue) {
          const parts = existingNumericValue.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          existingNumericValue = parts.join(".");
        }
      }

      currencySymbol = existingCurrencySymbol;

      if (isPreviewMode) {
        const currencyContainer = document.createElement("div");
        currencyContainer.style.marginBottom = "8px";

        const currencyLabel = document.createElement("span");
        currencyLabel.textContent = "Currency: ";
        currencyLabel.style.fontSize = isMobile ? "16px" : "14px";
        currencyLabel.style.marginRight = "8px";

        const currencySelect = document.createElement("select");
        currencySelect.style.padding = "6px 8px";
        currencySelect.style.borderRadius = "4px";
        currencySelect.style.border = "1px solid #e1e5e9";
        currencySelect.style.fontSize = isMobile ? "16px" : "14px";

        const currencies = [
          { symbol: "$", name: "USD" },
          { symbol: "€", name: "EUR" },
          { symbol: "£", name: "GBP" },
          { symbol: "¥", name: "JPY" },
          { symbol: "₹", name: "INR" },
          { symbol: "₽", name: "RUB" },
          { symbol: "₩", name: "KRW" },
          { symbol: "₺", name: "TRY" },
          { symbol: "₴", name: "UAH" },
        ];

        currencies.forEach((currency) => {
          const option = document.createElement("option");
          option.value = currency.symbol;
          option.textContent = `${currency.symbol} - ${currency.name}`;
          if (currency.symbol === currencySymbol) {
            option.selected = true;
          }
          currencySelect.appendChild(option);
        });

        currencySelect.addEventListener("change", () => {
          currencySymbol = currencySelect.value;
        });

        currencyContainer.appendChild(currencyLabel);
        currencyContainer.appendChild(currencySelect);
        popup.appendChild(currencyContainer);
      }

      existingValue = existingNumericValue;
      break;

    default:
      inputType = "text";
  }

  if (
    fieldKey !== "date" &&
    fieldKey !== "date_time" &&
    fieldKey !== "time"
  ) {
    inputElement = document.createElement("input");
    inputElement.type = inputType;
    if (inputPattern) {
      inputElement.pattern = inputPattern;
    }

    Object.assign(inputElement.style, {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #e1e5e9",
      borderRadius: "6px",
      fontSize: isMobile ? "16px" : "14px",
      outline: "none",
      transition: "border-color 0.2s ease",
      boxSizing: "border-box",
      marginBottom: "12px",
    });
    inputElement.placeholder =
      `${mention.getAttribute("data-placeholder-text")}` || inputPlaceholder;

    if (existingValue) {
      inputElement.value = existingValue;
    }

    if (fieldKey === "email" && inputElement) {
      inputElement.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        removeEmailError();

        if (target.value && !isValidEmail(target.value)) {
          target.style.borderColor = "#e53e3e";
          showEmailError(
            target,
            "Please enter a valid email address (e.g., user@example.com)"
          );
        } else {
          target.style.borderColor = target.value ? "#10b981" : "#e1e5e9";
        }
      });

      inputElement.addEventListener("blur", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value && !isValidEmail(target.value)) {
          target.style.borderColor = "#e53e3e";
          if (!popup.querySelector(".email-error")) {
            showEmailError(
              target,
              "Please enter a valid email address (e.g., user@example.com)"
            );
          }
        } else if (target.value) {
          target.style.borderColor = "#10b981";
        } else {
          target.style.borderColor = "#e1e5e9";
        }
      });
    }

    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveButton.click();
      }
    });

    popup.appendChild(inputElement);
  }

  const addValidation = (input: HTMLInputElement, fieldKey: string) => {
    switch (fieldKey) {
      case "number":
        input.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          target.value = target.value.replace(/[^0-9]/g, "");
        });
        break;

      case "currency":
        input.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          target.value = target.value.replace(/[^0-9.,]/g, "");

          const decimalCount = (target.value.match(/\./g) || []).length;
          if (decimalCount > 1) {
            target.value = target.value.substring(
              0,
              target.value.lastIndexOf(".")
            );
          }

          const cursorPosition = target.selectionStart;
          const numericValue = target.value.replace(/,/g, "");

          if (!isNaN(Number(numericValue)) && numericValue !== "") {
            const parts = numericValue.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            target.value = parts.join(".");

            target.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
        break;

      case "phone":
        input.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          target.value = target.value.replace(/[^0-9+\-\s()]/g, "");
        });
        break;

      case "url":
        inputElement.addEventListener("blur", (e) => {
          const target = e.target as HTMLInputElement;
          if (target.value && !isValidUrl(target.value)) {
            target.style.borderColor = "#e53e3e";
            const errorDiv = document.createElement("div");
            errorDiv.style.color = "#e53e3e";
            errorDiv.style.fontSize = "12px";
            errorDiv.style.marginTop = "-8px";
            errorDiv.style.marginBottom = "12px";
            errorDiv.textContent =
              "Please enter a valid URL (e.g., https://example.com)";
            if (!popup.querySelector(".url-error")) {
              errorDiv.classList.add("url-error");
              popup.insertBefore(errorDiv, buttonContainer);
            }
          } else {
            target.style.borderColor = "#e1e5e9";
            const errorDiv = popup.querySelector(".url-error");
            if (errorDiv) {
              errorDiv.remove();
            }
          }
        });
        break;
    }
  };

  if (inputElement && fieldKey !== "email") {
    addValidation(inputElement, fieldKey);
  }

  const validationMessage = document.createElement("div");
  validationMessage.style.fontSize = "12px";
  validationMessage.style.color = "#718096";
  validationMessage.style.marginTop = "-8px";
  validationMessage.style.marginBottom = "12px";

  switch (fieldKey) {
    case "number":
      validationMessage.textContent = "Numbers only";
      break;
    case "phone":
      validationMessage.textContent = "Phone number format";
      break;
    case "email":
      validationMessage.textContent = "Valid email format required";
      break;
    case "url":
      validationMessage.textContent = "Valid URL format required";
      break;
    case "currency":
      validationMessage.textContent = "";
      break;
    case "time":
      validationMessage.textContent =
        "Select time (format will be applied when saved)";
      break;
  }

  if (
    validationMessage.textContent &&
    fieldKey !== "date" &&
    fieldKey !== "date_time" &&
    fieldKey !== "time"
  ) {
    popup.appendChild(validationMessage);
  }

  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    flexDirection: isMobile ? "column" : "row",
  });

  const clearButton = document.createElement("button");
  Object.assign(clearButton.style, {
    padding: isMobile ? "12px 16px" : "8px 16px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "16px" : "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    WebkitTapHighlightColor: "transparent",
  });
  clearButton.textContent = "Clear";

  clearButton.addEventListener("mouseenter", () => {
    if (!isMobile) clearButton.style.backgroundColor = "#d97706";
  });

  clearButton.addEventListener("mouseleave", () => {
    if (!isMobile) clearButton.style.backgroundColor = "#f59e0b";
  });

  clearButton.addEventListener("touchstart", () => {
    if (isMobile) clearButton.style.backgroundColor = "#d97706";
  });

  clearButton.addEventListener("touchend", () => {
    if (isMobile) {
      setTimeout(() => {
        clearButton.style.backgroundColor = "#f59e0b";
      }, 150);
    }
  });

  clearButton.addEventListener("click", () => {
    switch (fieldKey) {
      case "date":
        if (dateInput) {
          dateInput.value = "";
          if (nativeDateInput) nativeDateInput.value = "";
          dateInput.style.borderColor = "#e1e5e9";
          const errorDiv = dateContainer?.querySelector(".date-error");
          if (errorDiv) errorDiv.remove();
        }
        break;

      case "date_time":
        if (dateTimeInput) {
          dateTimeInput.value = "";
          if (nativeDateTimeInput) nativeDateTimeInput.value = "";
          dateTimeInput.style.borderColor = "#e1e5e9";
          const errorDiv =
            dateTimeContainer?.querySelector(".datetime-error");
          if (errorDiv) errorDiv.remove();
        }
        break;

      case "time":
        if (timeInput) {
          timeInput.value = "";
          timeInput.style.borderColor = "#e1e5e9";
          const errorDiv = timeContainer?.querySelector(".time-error");
          if (errorDiv) errorDiv.remove();
        }
        break;

      default:
        if (inputElement) {
          inputElement.value = "";
          inputElement.style.borderColor = "#e1e5e9";
          removeEmailError();
          const urlError = popup.querySelector(".url-error");
          if (urlError) urlError.remove();
        }
    }
  });
  let fieldType = mention.getAttribute("data-field-type");
  const showClearButton = [
    "date",
    "date_time",
    "time",
    "url",
    "number",
    "currency",
    "text_value",
    "email",
  ].includes(fieldType || fieldKey);
  if (showClearButton) {
    buttonContainer.appendChild(clearButton);
  }

  const deleteButton = document.createElement("button");
  Object.assign(deleteButton.style, {
    padding: isMobile ? "12px 16px" : "8px 16px",
    background: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "16px" : "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    display: isPreviewMode ? "block" : "none",
    WebkitTapHighlightColor: "transparent",
  });
  deleteButton.textContent = "Delete";
  
  deleteButton.addEventListener("mouseenter", () => {
    if (!isMobile) deleteButton.style.backgroundColor = "#c53030";
  });
  
  deleteButton.addEventListener("mouseleave", () => {
    if (!isMobile) deleteButton.style.backgroundColor = "#e53e3e";
  });

  deleteButton.addEventListener("touchstart", () => {
    if (isMobile) deleteButton.style.backgroundColor = "#c53030";
  });

  deleteButton.addEventListener("touchend", () => {
    if (isMobile) {
      setTimeout(() => {
        deleteButton.style.backgroundColor = "#e53e3e";
      }, 150);
    }
  });

  deleteButton.addEventListener("click", () => {
    mention.remove();
    this.closeExistingPopup();
  });

  const saveButton = document.createElement("button");
  Object.assign(saveButton.style, {
    padding: isMobile ? "12px 16px" : "8px 16px",
    background: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "16px" : "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    WebkitTapHighlightColor: "transparent",
  });
  saveButton.textContent = "Save";
  
  saveButton.addEventListener("mouseenter", () => {
    if (!isMobile) saveButton.style.backgroundColor = "#357abd";
  });
  
  saveButton.addEventListener("mouseleave", () => {
    if (!isMobile) saveButton.style.backgroundColor = "#4a90e2";
  });

  saveButton.addEventListener("touchstart", () => {
    if (isMobile) saveButton.style.backgroundColor = "#357abd";
  });

  saveButton.addEventListener("touchend", () => {
    if (isMobile) {
      setTimeout(() => {
        saveButton.style.backgroundColor = "#4a90e2";
      }, 150);
    }
  });

  saveButton.addEventListener("click", () => {
    let isValid = true;
    let finalValue = "";

    switch (fieldKey) {
      case "email":
        if (
          inputElement &&
          inputElement.value &&
          !isValidEmail(inputElement.value)
        ) {
          isValid = false;
          inputElement.style.borderColor = "#e53e3e";
          showEmailError(
            inputElement,
            "Please enter a valid email address before saving"
          );
        } else {
          finalValue = inputElement ? inputElement.value : "";
          removeEmailError();
        }
        break;

      case "url":
        if (
          inputElement &&
          inputElement.value &&
          !isValidUrl(inputElement.value)
        ) {
          isValid = false;
          inputElement.style.borderColor = "#e53e3e";

          const errorDiv = document.createElement("div");
          errorDiv.style.color = "#e53e3e";
          errorDiv.style.fontSize = "12px";
          errorDiv.style.marginTop = "4px";
          errorDiv.textContent = "Please enter a valid URL";
          if (!popup.querySelector(".url-error")) {
            errorDiv.classList.add("url-error");
            popup.insertBefore(errorDiv, buttonContainer);
          }
        } else {
          finalValue = inputElement ? inputElement.value : "";
          const errorDiv = popup.querySelector(".url-error");
          if (errorDiv) {
            errorDiv.remove();
          }
        }
        break;

      case "number":
        if (
          inputElement &&
          inputElement.value &&
          isNaN(Number(inputElement.value.replace(/,/g, "")))
        ) {
          isValid = false;
          inputElement.style.borderColor = "#e53e3e";
        } else {
          finalValue = inputElement ? inputElement.value : "";
        }
        break;

      case "currency":
        if (inputElement) {
          const numericValue = inputElement.value.replace(/,/g, "");
          if (inputElement.value && isNaN(Number(numericValue))) {
            isValid = false;
            inputElement.style.borderColor = "#e53e3e";
          } else if (inputElement.value) {
            const parts = numericValue.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const formattedValue = parts.join(".");
            finalValue = `${currencySymbol}${formattedValue}`;
          } else {
            finalValue = "";
          }
        }
        break;

      case "time":
        if (timeInput && timeInput.value) {
          const rawTime = timeInput.value;
          finalValue = rawTime;

          const displayValue = formatTime(rawTime, currentTimeFormat);
          mention.dataset.displayValue = displayValue;
          mention.dataset.timeFormat = currentTimeFormat;
        } else {
          finalValue = "";
        }
        break;

      case "date":
        if (dateInput) {
          finalValue = dateInput.value;
          mention.dataset.dateFormat = currentDateFormat;
        }
        break;

      case "date_time":
        if (dateTimeInput) {
          finalValue = dateTimeInput.value;
          mention.dataset.dateTimeFormat = currentDateTimeFormat;
        }
        break;

      default:
        finalValue = inputElement ? inputElement.value : "";
    }

    if (!isValid) {
      return;
    }
    const fieldLabel = mention.dataset.fieldLabel;
    const fieldType = mention.dataset.field || mention.dataset.fieldType;
    const userId = mention.dataset.userId;

    mention.dataset.customValue = finalValue;

    if (!mention.dataset.mentionId) {
      mention.dataset.mentionId = this.generateMentionId();
    }

    if (finalValue) {
      this.removePlaceholderStyling(mention);
      mention.dataset.hasValue = "true";

      if (fieldKey === "time" && mention.dataset.displayValue) {
        mention.textContent = mention.dataset.displayValue;
      } else if (fieldKey === "currency") {
        mention.textContent = finalValue;
      } else {
        mention.textContent = `${finalValue}`;
      }
    } else {
      this.applyPlaceholderStyling(mention, user);
      mention.dataset.hasValue = "false";
      const placeholderText =
        mention.getAttribute("data-placeholder-text") ||
        this.generatePlaceholderText(fieldLabel, user);
      mention.textContent = placeholderText;
      mention.dataset.placeholderText = placeholderText;
    }
    this.updateSimilarMentions(
      fieldLabel,
      fieldType,
      userId,
      finalValue,
      mention
    );
    mention.contentEditable = "false";
    mention.style.userSelect = "none";
    mention.style.pointerEvents = "auto";

    this.closeExistingPopup();
  });

  buttonContainer.appendChild(deleteButton);
  buttonContainer.appendChild(saveButton);

  popup.appendChild(buttonContainer);

  this.handleMobilePopup(popup, isMobile);
}

private handleMobilePopup(popup: HTMLDivElement, isMobile: boolean): void {
  if (isMobile) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    overlay.classList.add("mention-popup-overlay");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeExistingPopup();
      }
    });

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      popup.style.opacity = "1";
      popup.style.transform = "translate(-50%, -50%) scale(2.2)";
    });
  } else {
    document.body.appendChild(popup);
    this.updatePopupPosition();

    requestAnimationFrame(() => {
      popup.style.opacity = "1";
      popup.style.transform = "scale(1)";
    });

    const debouncedUpdate = () => {
      let timeout: number;
      return () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          this.updatePopupPosition();
        }, 10);
      };
    };

    const handleScrollResize = debouncedUpdate();
    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);

    this.closePopupHandler = (e: MouseEvent) => {
      if (
        popup &&
        popup.parentNode === document.body &&
        !popup.contains(e.target as Node)
      ) {
        this.closeExistingPopup();
        window.removeEventListener("scroll", handleScrollResize);
        window.removeEventListener("resize", handleScrollResize);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", this.closePopupHandler);
    }, 0);
  }
}



  private renderTimeField(
    popup: HTMLElement,
    mention: HTMLElement,
    user: MentionUser
  ) {
    const isPreviewMode =
      window.location.pathname.includes("document-preview") ||
      window.location.pathname.includes("template-preview");

    let currentTimeFormat = mention.getAttribute("data-time-format") || "HH:mm";

    const existingValue = mention.dataset.customValue || user.time || "";

    if (isPreviewMode) {
      const timeFormatContainer = document.createElement("div");
      timeFormatContainer.style.marginBottom = "12px";

      const timeFormatLabel = document.createElement("label");
      timeFormatLabel.textContent = "Time Format: ";
      timeFormatLabel.style.fontSize = "14px";
      timeFormatLabel.style.marginRight = "8px";
      timeFormatLabel.style.fontWeight = "500";

      const timeFormatSelect = document.createElement("select");
      timeFormatSelect.style.padding = "6px 10px";
      timeFormatSelect.style.borderRadius = "4px";
      timeFormatSelect.style.border = "1px solid #e1e5e9";
      timeFormatSelect.style.fontSize = "14px";

      this.timeFormatOptions.forEach((format) => {
        const option = document.createElement("option");
        option.value = format.value;
        option.textContent = format.label;
        if (format.value === currentTimeFormat) {
          option.selected = true;
        }
        timeFormatSelect.appendChild(option);
      });

      timeFormatContainer.appendChild(timeFormatLabel);
      timeFormatContainer.appendChild(timeFormatSelect);
      popup.appendChild(timeFormatContainer);
    }

    const timeContainer = document.createElement("div");
    timeContainer.style.position = "relative";
    timeContainer.style.marginBottom = "12px";

    const timeInput = document.createElement("input");
    timeInput.type = "text";
    timeInput.readOnly = true;
    timeInput.placeholder =
      `${mention.getAttribute("data-placeholder-text")}` ||
      `Select time (${currentTimeFormat})...`;

    Object.assign(timeInput.style, {
      width: "100%",
      padding: "10px 12px",
      paddingRight: "40px",
      border: "1px solid #e1e5e9",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s ease",
      boxSizing: "border-box",
      cursor: "pointer",
      background: "#f5f5f5",
      fontFamily: "system-ui, -apple-system, sans-serif",
    });

    const nativeTimeInput = document.createElement("input");
    nativeTimeInput.type = "time";
    nativeTimeInput.step = "60";

    nativeTimeInput.min = "00:00";
    nativeTimeInput.max = "23:59";

    Object.assign(nativeTimeInput.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      opacity: "0",
      zIndex: "1",
      cursor: "pointer",
    });

    const timeButton = document.createElement("button");
    timeButton.type = "button";
    timeButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.51 6.51 0 0 1 8 14.5zM8.5 4H7v5l3.5 2.1.7-1.1-3-1.8V4z"/>
    </svg>
  `;

    Object.assign(timeButton.style, {
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#666",
      padding: "4px",
      borderRadius: "4px",
      zIndex: "2",
    });

    timeButton.addEventListener("mouseenter", () => {
      timeButton.style.backgroundColor = "#f0f0f0";
    });

    timeButton.addEventListener("mouseleave", () => {
      timeButton.style.backgroundColor = "transparent";
    });

    nativeTimeInput.addEventListener("click", () => {
      nativeTimeInput.focus();
      nativeTimeInput.showPicker();
    });

    timeButton.addEventListener("click", () => {
      nativeTimeInput.focus();
      nativeTimeInput.showPicker();
    });

    const convert24To12 = (time24: string): string => {
      if (!time24) return "";

      const [hours, minutes] = time24.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;

      return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const convert12To24 = (time12: string): string => {
      if (!time12) return "";

      const timeMatch = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return time12;

      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3].toUpperCase();

      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    const formatTimeForDisplay = (
      timeValue: string,
      format: string
    ): string => {
      if (!timeValue) return "";

      if (format === "hh:mm TT") {
        return convert24To12(timeValue);
      }
      return timeValue;
    };

    const parseTimeForInput = (timeValue: string, format: string): string => {
      if (!timeValue) return "";

      if (format === "hh:mm TT") {
        return convert12To24(timeValue);
      }
      return timeValue;
    };

    const validateTimeFormat = (timeValue: string, format: string): boolean => {
      if (!timeValue) return true;

      if (format === "HH:mm") {
        const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return time24Regex.test(timeValue);
      } else if (format === "hh:mm TT") {
        const time12Regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i;
        return time12Regex.test(timeValue);
      }

      return false;
    };
    nativeTimeInput.addEventListener("change", (e) => {
      const selectedTime = (e.target as HTMLInputElement).value;
      if (selectedTime && timeInput) {
        const formattedTime = formatTimeForDisplay(
          selectedTime,
          currentTimeFormat
        );
        timeInput.value = formattedTime;

        timeInput.style.borderColor = "#e1e5e9";
        const errorDiv = timeContainer.querySelector(".time-error");
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    });

    timeInput.addEventListener("blur", (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        const isValid = validateTimeFormat(value, currentTimeFormat);
        if (!isValid) {
          timeInput.style.borderColor = "#e53e3e";
          const errorDiv = document.createElement("div");
          errorDiv.style.color = "#e53e3e";
          errorDiv.style.fontSize = "12px";
          errorDiv.style.marginTop = "4px";
          errorDiv.textContent = `Please enter time in ${currentTimeFormat} format`;
          if (!timeContainer.querySelector(".time-error")) {
            errorDiv.classList.add("time-error");
            timeContainer.appendChild(errorDiv);
          }
        } else {
          timeInput.style.borderColor = "#e1e5e9";
          const errorDiv = timeContainer.querySelector(".time-error");
          if (errorDiv) {
            errorDiv.remove();
          }

          const time24 = parseTimeForInput(value, currentTimeFormat);
          nativeTimeInput.value = time24;
        }
      }
    });

    if (isPreviewMode) {
      const timeFormatSelect = popup.querySelector(
        "select"
      ) as HTMLSelectElement;
      timeFormatSelect.addEventListener("change", () => {
        const previousFormat = currentTimeFormat;
        currentTimeFormat = timeFormatSelect.value;

        if (timeInput) {
          timeInput.placeholder = `Select time (${currentTimeFormat})...`;

          if (timeInput.value) {
            if (
              previousFormat === "HH:mm" &&
              currentTimeFormat === "hh:mm TT"
            ) {
              const formattedTime = convert24To12(
                parseTimeForInput(timeInput.value, previousFormat)
              );
              timeInput.value = formattedTime;
            } else if (
              previousFormat === "hh:mm TT" &&
              currentTimeFormat === "HH:mm"
            ) {
              const time24 = parseTimeForInput(timeInput.value, previousFormat);
              timeInput.value = time24;
            }

            const time24 = parseTimeForInput(
              timeInput.value,
              currentTimeFormat
            );
            nativeTimeInput.value = time24;

            const isValid = validateTimeFormat(
              timeInput.value,
              currentTimeFormat
            );
            if (!isValid) {
              timeInput.style.borderColor = "#e53e3e";
              const errorDiv = document.createElement("div");
              errorDiv.style.color = "#e53e3e";
              errorDiv.style.fontSize = "12px";
              errorDiv.style.marginTop = "4px";
              errorDiv.textContent = `Invalid time format. Please use ${currentTimeFormat}`;
              if (!timeContainer.querySelector(".time-error")) {
                errorDiv.classList.add("time-error");
                timeContainer.appendChild(errorDiv);
              }
            } else {
              timeInput.style.borderColor = "#e1e5e9";
              const errorDiv = timeContainer.querySelector(".time-error");
              if (errorDiv) {
                errorDiv.remove();
              }
            }
          }
        }
      });
    }

    if (existingValue && timeInput) {
      let existingTime24 = "";

      if (currentTimeFormat === "hh:mm TT") {
        existingTime24 = convert12To24(existingValue);
        timeInput.value = existingValue;
      } else {
        existingTime24 = existingValue;
        timeInput.value = existingValue;
      }

      nativeTimeInput.value = existingTime24;
    }

    timeContainer.appendChild(timeInput);
    timeContainer.appendChild(nativeTimeInput);
    timeContainer.appendChild(timeButton);
    popup.appendChild(timeContainer);

    const validationMessage = document.createElement("div");
    validationMessage.style.fontSize = "12px";
    validationMessage.style.color = "#718096";
    validationMessage.style.marginTop = "-8px";
    validationMessage.style.marginBottom = "12px";

    if (currentTimeFormat === "HH:mm") {
      validationMessage.textContent = "Format: 00:00 to 23:59 (24-hour)";
    } else {
      validationMessage.textContent = "Format: 01:00 AM to 12:59 PM (12-hour)";
    }
    popup.appendChild(validationMessage);

    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
    });

    const clearButton = document.createElement("button");
    Object.assign(clearButton.style, {
      padding: "8px 16px",
      background: "#f59e0b",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.2s ease",
    });
    clearButton.textContent = "Clear";

    clearButton.addEventListener("mouseenter", () => {
      clearButton.style.backgroundColor = "#d97706";
    });

    clearButton.addEventListener("mouseleave", () => {
      clearButton.style.backgroundColor = "#f59e0b";
    });

    clearButton.addEventListener("click", () => {
      if (timeInput) {
        timeInput.value = "";
        timeInput.style.borderColor = "#e1e5e9";
        const errorDiv = timeContainer.querySelector(".time-error");
        if (errorDiv) errorDiv.remove();
      }
    });
    const deleteButton = document.createElement("button");
    Object.assign(deleteButton.style, {
      padding: "8px 16px",
      background: "#e53e3e",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.2s ease",
      display: isPreviewMode ? "block" : "none",
    });
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("mouseenter", () => {
      deleteButton.style.backgroundColor = "#c53030";
    });
    deleteButton.addEventListener("mouseleave", () => {
      deleteButton.style.backgroundColor = "#e53e3e";
    });
    deleteButton.addEventListener("click", () => {
      mention.remove();
      this.closeExistingPopup();
    });

    const saveButton = document.createElement("button");
    Object.assign(saveButton.style, {
      padding: "8px 16px",
      background: "#4a90e2",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.2s ease",
    });
    saveButton.textContent = "Save";
    saveButton.addEventListener("mouseenter", () => {
      saveButton.style.backgroundColor = "#357abd";
    });
    saveButton.addEventListener("mouseleave", () => {
      saveButton.style.backgroundColor = "#4a90e2";
    });

    saveButton.addEventListener("click", () => {
      let finalValue = timeInput.value;

      const fieldLabel = mention.dataset.fieldLabel;
      const fieldType = "time";
      const userId = mention.dataset.userId;

      this.removePlaceholderStyling(mention);
      mention.dataset.hasValue = "true";

      if (finalValue && !validateTimeFormat(finalValue, currentTimeFormat)) {
        timeInput.style.borderColor = "#e53e3e";
        const errorDiv = document.createElement("div");
        errorDiv.style.color = "#e53e3e";
        errorDiv.style.fontSize = "12px";
        errorDiv.style.marginTop = "4px";
        errorDiv.textContent = `Please enter a valid time in ${currentTimeFormat} format`;
        if (!timeContainer.querySelector(".time-error")) {
          errorDiv.classList.add("time-error");
          timeContainer.appendChild(errorDiv);
        }
        return;
      }

      mention.dataset.customValue = finalValue;
      mention.dataset.timeFormat = currentTimeFormat;

      if (!mention.dataset.mentionId) {
        mention.dataset.mentionId = this.generateMentionId();
      }

      if (finalValue) {
        this.removePlaceholderStyling(mention);
        mention.dataset.hasValue = "true";

        mention.textContent = finalValue;
        mention.dataset.displayValue = finalValue;
      } else {
        this.applyPlaceholderStyling(mention, user);
        mention.dataset.hasValue = "false";
        const placeholderText =
          mention.getAttribute("data-placeholder-text") ||
          this.generatePlaceholderText("Time", user);
        mention.textContent = placeholderText;
        mention.dataset.placeholderText = placeholderText;
      }

      this.updateSimilarMentions(
        fieldLabel,
        fieldType,
        userId,
        finalValue,
        mention
      );

      mention.contentEditable = "false";
      mention.style.userSelect = "none";
      mention.style.pointerEvents = "auto";

      this.closeExistingPopup();
    });

    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(saveButton);
    popup.appendChild(buttonContainer);

    document.body.appendChild(popup);
    this.updatePopupPosition();

    const debouncedUpdate = () => {
      let timeout: number;
      return () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          this.updatePopupPosition();
        }, 10);
      };
    };

    const handleScrollResize = debouncedUpdate();
    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);

    this.closePopupHandler = (e: MouseEvent) => {
      if (
        popup &&
        popup.parentNode === document.body &&
        !popup.contains(e.target as Node)
      ) {
        this.closeExistingPopup();
        window.removeEventListener("scroll", handleScrollResize);
        window.removeEventListener("resize", handleScrollResize);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", this.closePopupHandler);
    }, 0);
  }

  private renderDropdownField(
    popup: HTMLElement,
    mention: HTMLElement,
    user: MentionUser
  ) {
    const isPreviewMode =
      window.location.pathname.includes("document-preview") ||
      window.location.pathname.includes("template-preview");

    const existingValue = mention.dataset.customValue || "";
    let isMultiselect =
      mention.getAttribute("data-dropdown-multiselect") === "true"
        ? true
        : false || mention.dataset.dropdownMultiselect === "true";

    let selectedValues = existingValue
      ? existingValue
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v)
      : [];

    let dropdownOptions: DropdownOption[] = [];
    try {
      const storedOptions = mention.dataset.dropdownOptions;
      if (storedOptions) {
        dropdownOptions = JSON.parse(storedOptions);
      } else {
        dropdownOptions = this.config.dropdownOptions || [
          { id: "1", label: "Option 1", value: "Option 1" },
        ];
        mention.dataset.dropdownOptions = JSON.stringify(dropdownOptions);
      }
    } catch (e) {
      dropdownOptions = this.config.dropdownOptions || [
        { id: "1", label: "Option 1", value: "Option 1" },
      ];
      mention.dataset.dropdownOptions = JSON.stringify(dropdownOptions);
    }

    const multiselectContainer = document.createElement("div");
    multiselectContainer.style.marginBottom = "12px";

    const multiselectLabel = document.createElement("label");
    Object.assign(multiselectLabel.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      cursor: "pointer",
    });

    const multiselectCheckbox = document.createElement("input");
    multiselectCheckbox.type = "checkbox";
    multiselectCheckbox.checked = isMultiselect;
    multiselectCheckbox.style.cursor = "pointer";
    mention.dataset.dropdownMultiselect =
      multiselectCheckbox.checked.toString();

    if (!isPreviewMode) {
      multiselectContainer.style.display = "none";
    }

    multiselectCheckbox.addEventListener("change", () => {
      mention.dataset.dropdownMultiselect =
        multiselectCheckbox.checked.toString();
      selectedValues = [];
      mention.dataset.customValue = "";
      this.closeExistingPopup();
      this.openValueEditor(mention, user);
    });

    multiselectLabel.appendChild(multiselectCheckbox);
    multiselectLabel.appendChild(document.createTextNode("Multiple"));
    multiselectContainer.appendChild(multiselectLabel);

    document.body.appendChild(popup);

    const configButton = document.createElement("button");
    configButton.textContent = "⚙️ Configure";
    Object.assign(configButton.style, {
      padding: "1px 2px",
      color: "black",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      marginBottom: "12px",
      display: !isPreviewMode ? "none" : "block",
    });

    configButton.addEventListener("click", () => {
      this.openDropdownConfigDialog(dropdownOptions, (newOptions) => {
        dropdownOptions = newOptions;
        mention.dataset.dropdownOptions = JSON.stringify(newOptions);
        mention.dataset.dropdownMultiselect = isMultiselect.toString();

        const preservedValues = dropdownOptions.filter((selectedValue: any) =>
          newOptions.some((opt: any) => opt.value === selectedValue)
        );

        const finalValues = isMultiselect
          ? preservedValues
          : preservedValues.slice(0, 1);

        const newCustomValue = finalValues.join(", ");
        mention.dataset.customValue = newCustomValue;
        const fieldLabel = mention.dataset.fieldLabel;
        const fieldType = "dropdown";
        const userId = mention.dataset.userId;
        const finalValue = mention.dataset.customValue;

        this.updateSimilarMentions(

          fieldLabel,
          fieldType,
          userId,
          finalValue,
          mention
        );

        this.closeExistingPopup();
        this.openValueEditor(mention, user);
      });
    });

    const firstDiv = document.createElement("div");
    firstDiv.style.display = "flex";
    firstDiv.style.alignItems = "center";
    firstDiv.style.justifyContent = "space-between";

    firstDiv.appendChild(multiselectContainer);
    firstDiv.appendChild(configButton);
    popup.appendChild(firstDiv);

    const searchContainer = document.createElement("div");
    searchContainer.style.marginBottom = "12px";
    searchContainer.style.position = "relative";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search options...";
    Object.assign(searchInput.style, {
      width: "100%",
      padding: "10px 16px",
      paddingLeft: "36px",
      border: "1px solid #e1e5e9",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
    });

    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "#4a90e2";
      searchInput.style.boxShadow = "0 0 0 2px rgba(74, 144, 226, 0.1)";
    });

    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "#e1e5e9";
      searchInput.style.boxShadow = "none";
    });

    const searchIcon = document.createElement("span");
    searchIcon.innerHTML = "🔍";
    Object.assign(searchIcon.style, {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "14px",
      color: "#6b7280",
    });

    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    popup.appendChild(searchContainer);

    const dropdownContainer = document.createElement("div");
    Object.assign(dropdownContainer.style, {
      maxHeight: "200px",
      overflowY: "auto",
      border: "1px solid #e1e5e9",
      borderRadius: "6px",
      backgroundColor: "white",
      marginBottom: "12px",
    });

    const renderFilteredOptions = (filterText: string = "") => {
      dropdownContainer.innerHTML = "";

      const filteredOptions = dropdownOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(filterText.toLowerCase()) ||
          option.value.toLowerCase().includes(filterText.toLowerCase())
      );

      if (filteredOptions.length === 0) {
        const noResults = document.createElement("div");
        Object.assign(noResults.style, {
          padding: "16px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
          fontStyle: "italic",
        });
        noResults.textContent = "No options found";
        dropdownContainer.appendChild(noResults);
        return;
      }

      if (isMultiselect) {
        filteredOptions.forEach((option) => {
          const optionItem = document.createElement("div");
          optionItem.setAttribute("data-option-id", option.id);
          Object.assign(optionItem.style, {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            borderBottom: "1px solid #f3f4f6",
          });

          if (filteredOptions[filteredOptions.length - 1].id === option.id) {
            optionItem.style.borderBottom = "none";
          }

          optionItem.addEventListener("mouseenter", () => {
            optionItem.style.backgroundColor = "#f8fafc";
          });

          optionItem.addEventListener("mouseleave", () => {
            optionItem.style.backgroundColor = "transparent";
          });

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = selectedValues.includes(option.value);
          Object.assign(checkbox.style, {
            cursor: "pointer",
            width: "16px",
            height: "16px",
          });

          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              if (!selectedValues.includes(option.value)) {
                selectedValues.push(option.value);
              }
            } else {
              selectedValues = selectedValues.filter((v) => v !== option.value);
            }
            updateSelectedPreview();
          });

          const optionText = document.createElement("span");
          optionText.textContent = option.value;
          optionText.style.fontSize = "14px";
          optionText.style.flex = "1";

          optionItem.appendChild(checkbox);
          optionItem.appendChild(optionText);
          dropdownContainer.appendChild(optionItem);
        });
      } else {
        filteredOptions.forEach((option) => {
          const optionItem = document.createElement("div");
          optionItem.setAttribute("data-option-id", option.id);
          Object.assign(optionItem.style, {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            borderBottom: "1px solid #f3f4f6",
          });

          if (filteredOptions[filteredOptions.length - 1].id === option.id) {
            optionItem.style.borderBottom = "none";
          }

          optionItem.addEventListener("mouseenter", () => {
            optionItem.style.backgroundColor = "#f8fafc";
          });

          optionItem.addEventListener("mouseleave", () => {
            optionItem.style.backgroundColor = "transparent";
          });

          optionItem.addEventListener("click", () => {
            const allOptions =
              dropdownContainer.querySelectorAll("[data-option-id]");
            allOptions.forEach((opt) => {
              (opt as HTMLElement).style.backgroundColor = "transparent";
            });

            selectedValues = [option.value];

            updateSelectedPreview();
            const radioInput: HTMLInputElement = optionItem.querySelector(
              "input[type='radio']"
            );
            if (radioInput) radioInput.checked = true;

            optionItem.style.backgroundColor = "#eff6ff";
          });
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = `dropdown-option-${mention.dataset.mentionId}`;
          radio.checked = selectedValues.includes(option.value || option.label);
          Object.assign(radio.style, {
            cursor: "pointer",
            width: "16px",
            height: "16px",
          });

          const optionText = document.createElement("span");
          optionText.textContent = option.value;
          optionText.style.fontSize = "14px";
          optionText.style.flex = "1";

          optionItem.appendChild(radio);
          optionItem.appendChild(optionText);
          dropdownContainer.appendChild(optionItem);

          if (radio.checked) {
            optionItem.style.backgroundColor = "#eff6ff";
          }
        });
      }
    };

    const selectedPreview = document.createElement("div");
    Object.assign(selectedPreview.style, {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "8px",
      padding: "8px 12px",
      backgroundColor: "#f8fafc",
      borderRadius: "4px",
      border: "1px solid #e5e7eb",
      minHeight: "20px",
    });

    const updateSelectedPreview = () => {
      if (selectedValues.length === 0) {
        selectedPreview.textContent = "No selection";
        selectedPreview.style.fontStyle = "italic";
        selectedPreview.style.display = "none";
      } else {
        selectedPreview.textContent = `Selected: ${selectedValues.join(", ")}`;
        selectedPreview.style.fontStyle = "normal";
        selectedPreview.style.display = "block";
        if (selectedValues.length > 2) {
          selectedPreview.textContent = `Selected: ${selectedValues
            .slice(0, 2)
            .join(", ")} + ${selectedValues.length - 2} more`;
        }
      }
    };

    updateSelectedPreview();
    popup.appendChild(selectedPreview);

    renderFilteredOptions();

    searchInput.addEventListener("input", (e) => {
      const filterText = (e.target as HTMLInputElement).value;
      renderFilteredOptions(filterText);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        renderFilteredOptions();
        searchInput.blur();
      }
    });

    popup.appendChild(dropdownContainer);

    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
      marginTop: "12px",
    });

    const clearButton = document.createElement("button");
    Object.assign(clearButton.style, {
      padding: "8px 16px",
      background: "#f59e0b",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    });
    clearButton.textContent = "Clear Selection";

    clearButton.addEventListener("click", () => {
      selectedValues = [];
      mention.dataset.customValue = "";
      mention.textContent = `${user.name?.trim()?.length > 1 ? user.name : user.contact_type_name}@Dropdown`;
      updateSelectedPreview();
      renderFilteredOptions(searchInput.value);
    });

    const deleteButton = document.createElement("button");
    Object.assign(deleteButton.style, {
      padding: "8px 16px",
      background: "#e53e3e",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      display: isPreviewMode ? "block" : "none",
    });
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      mention.remove();
      this.closeExistingPopup();
    });

    const saveButton = document.createElement("button");
    Object.assign(saveButton.style, {
      padding: "8px 16px",
      background: "#4a90e2",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    });
    saveButton.textContent = "Save";

    saveButton.addEventListener("click", () => {
      const finalValue = selectedValues.filter((v) => v).join(", ");
      mention.dataset.customValue = finalValue;
      mention.dataset.dropdownOptions = JSON.stringify(dropdownOptions);

      const fieldLabel = mention.dataset.fieldLabel;
      const fieldType = "dropdown";
      const userId = mention.dataset.userId;

      if (!mention.dataset.mentionId) {
        mention.dataset.mentionId = this.generateMentionId();
      }

      if (finalValue) {
        this.removePlaceholderStyling(mention);
        mention.dataset.hasValue = "true";
        mention.textContent = finalValue;
      } else {
        this.applyPlaceholderStyling(mention, user);
        mention.dataset.hasValue = "false";
        const placeholderText =
          mention.getAttribute("data-placeholder-text") ||
          this.generatePlaceholderText("Dropdown", user);
        mention.textContent = placeholderText;
        mention.dataset.placeholderText = placeholderText;
      }
      this.updateSimilarMentions(
        fieldLabel,
        fieldType,
        userId,
        finalValue,
        mention
      );
      mention.contentEditable = "false";
      mention.style.userSelect = "none";
      mention.style.pointerEvents = "auto";

      this.closeExistingPopup();
    });

    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(saveButton);
    popup.appendChild(buttonContainer);

    setTimeout(() => {
      searchInput.focus();
    }, 100);

    this.updatePopupPosition();

    const debouncedUpdate = () => {
      let timeout: number;
      return () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          this.updatePopupPosition();
        }, 10);
      };
    };

    const handleScrollResize = debouncedUpdate();
    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);

    this.closePopupHandler = (e: MouseEvent) => {
      if (
        popup &&
        popup.parentNode === document.body &&
        !popup.contains(e.target as Node)
      ) {
        this.closeExistingPopup();
        window.removeEventListener("scroll", handleScrollResize);
        window.removeEventListener("resize", handleScrollResize);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", this.closePopupHandler);
    }, 0);
  }

  private updatePopupPosition() {
    if (!this.currentPopup || !this.currentMention) return;

    const mentionRect = this.currentMention.getBoundingClientRect();
    const popupRect = this.currentPopup.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = mentionRect.bottom + scrollTop + 5;
    let left = mentionRect.left + scrollLeft;

    const maxLeft = window.innerWidth - popupRect.width - 10;
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 0) {
      left = 0;
    }

    if (top + popupRect.height > scrollTop + window.innerHeight) {
      top = mentionRect.top + scrollTop - popupRect.height - 5;
    }

    Object.assign(this.currentPopup.style, {
      top: `${top}px`,
      left: `${left}px`,
    });
  }

private closeExistingPopup(immediate: boolean = false) {
  if (this.closePopupHandler) {
    document.removeEventListener("click", this.closePopupHandler);
    this.closePopupHandler = null;
  }

  const overlay = document.querySelector(".mention-popup-overlay");
  const isMobile = this.isMobileDevice();

  if (this.currentPopup) {
    if (immediate) {
      // Immediate cleanup without animation when opening new popup
      if (this.currentPopup.parentNode) {
        this.currentPopup.parentNode.removeChild(this.currentPopup);
      }
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        document.body.style.overflow = "";
      }
      this.currentPopup = null;
      this.currentMention = null;
    } else {
      // Animate out
      if (isMobile) {
        this.currentPopup.style.opacity = "0";
        this.currentPopup.style.transform = "translate(-50%, -50%) scale(1.8)";
        if (overlay) {
          (overlay as HTMLElement).style.opacity = "0";
        }
      } else {
        this.currentPopup.style.opacity = "0";
        this.currentPopup.style.transform = "scale(0.95)";
      }

      // Remove after animation
      setTimeout(() => {
        if (this.currentPopup && this.currentPopup.parentNode) {
          this.currentPopup.parentNode.removeChild(this.currentPopup);
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
          document.body.style.overflow = "";
        }
        this.currentPopup = null;
        this.currentMention = null;
      }, 200);
    }
  } else {
    // Immediate cleanup if no animation needed
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = "";
    }
  }
}

  private safeRemoveChild(parent: Node, child: Node) {
    if (parent.contains(child)) {
      parent.removeChild(child);
    }
  }
}
