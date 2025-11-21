import { API, BlockTool, BlockToolData, ToolConfig } from "@editorjs/editorjs";

interface ListItem {
  content: string;
  meta: Record<string, any>;
  items: ListItem[];
}

interface ListData extends BlockToolData {
  style: ListStyle;
  items: ListItem[];
  meta: {
    counterType: CounterType;
  };
}

type ListStyle = "ordered" | "unordered" | "checklist";
type CounterType = "numeric" | "roman" | "alphabetic";

interface ListConfig {
  listStyles?: Array<{
    name: ListStyle;
    title: string;
    icon: string;
  }>;
  counterTypes?: Array<{
    name: CounterType;
    title: string;
  }>;
}

interface ListToolbox {
  title: string;
  icon: string;
}

export default class List implements BlockTool {
  private api: API;
  private readOnly: boolean;
  private data: ListData;
  private settings: Required<ListConfig>;

  static get toolbox(): ListToolbox {
    return {
      title: "List",
      icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"><path d="M5.625 4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0-4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0 9.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm-4.5-5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0-4.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0 9.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/></svg>',
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  constructor({
    data,
    config,
    api,
    readOnly,
  }: {
    data: ListData;
    config?: ListConfig;
    api: API;
    readOnly: boolean;
  }) {
    this.api = api;
    this.readOnly = readOnly;
    this.settings = {
      listStyles: config?.listStyles || [
        {
          name: "ordered",
          title: "Numbered",
          icon: "1.",
        },
        {
          name: "unordered",
          title: "Bulleted",
          icon: "•",
        },
        {
          name: "checklist",
          title: "Checklist",
          icon: "☐",
        },
      ],
      counterTypes: config?.counterTypes || [
        {
          name: "numeric",
          title: "1, 2, 3...",
        },
        {
          name: "roman",
          title: "I, II, III...",
        },
        {
          name: "alphabetic",
          title: "a, b, c...",
        },
      ],
    };

    this.data = {
      style: data.style || "unordered",
      items: data.items || [],
      meta: {
        counterType: data.meta?.counterType || "numeric",
      },
    };
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add("cdx-list-wrapper");

    if (!this.readOnly) {
      const toolbar = this.createToolbar();
      wrapper.appendChild(toolbar);
    }

    const listElement =
      this.data.style === "ordered"
        ? document.createElement("ol")
        : document.createElement("ul");

    listElement.classList.add("cdx-list");
    listElement.classList.add(`cdx-list--${this.data.style}`);

    if (this.data.style === "ordered") {
      listElement.setAttribute("type", this.getCounterTypeAttribute());
    }

    this.data.items.forEach((item) => {
      const listItem = this.createListItem(item);
      listElement.appendChild(listItem);
    });

    if (!this.readOnly) {
      const addButton = this.createAddButton();
      wrapper.appendChild(addButton);
    }

    wrapper.appendChild(listElement);
    return wrapper;
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement("div");
    toolbar.classList.add("cdx-list-toolbar");

    const styleSelect = document.createElement("select");
    styleSelect.classList.add("cdx-list-style-select");

    this.settings.listStyles.forEach((style) => {
      const option = document.createElement("option");
      option.value = style.name;
      option.text = style.title;
      option.selected = this.data.style === style.name;
      styleSelect.appendChild(option);
    });

    styleSelect.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLSelectElement;
      this.data.style = target.value as ListStyle;
      this.updateList();
    });

    const counterSelect = document.createElement("select");
    counterSelect.classList.add("cdx-list-counter-select");

    this.settings.counterTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.name;
      option.text = type.title;
      option.selected = this.data.meta.counterType === type.name;
      counterSelect.appendChild(option);
    });

    counterSelect.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLSelectElement;
      this.data.meta.counterType = target.value as CounterType;
      this.updateList();
    });

    counterSelect.style.display =
      this.data.style === "ordered" ? "block" : "none";

    toolbar.appendChild(styleSelect);
    toolbar.appendChild(counterSelect);

    return toolbar;
  }

  private createListItem(item: ListItem): HTMLElement {
    const li = document.createElement("li");
    li.classList.add("cdx-list-item");

    const content = document.createElement("div");
    content.classList.add("cdx-list-item__content");
    content.contentEditable = !this.readOnly ? "true" : "false";
    content.innerHTML = item.content || "";

    if (!this.readOnly) {
      content.addEventListener("input", () => {
        item.content = content.innerHTML;
      });

      const nestButton = document.createElement("button");
      nestButton.classList.add("cdx-list-item__nest");
      nestButton.innerHTML = "→";
      nestButton.addEventListener("click", () => {
        this.nestItem(item);
      });

      li.appendChild(nestButton);
    }

    li.appendChild(content);

    if (item.items && item.items.length > 0) {
      const nestedList = document.createElement(
        this.data.style === "ordered" ? "ol" : "ul"
      );
      nestedList.classList.add("cdx-list--nested");

      item.items.forEach((nestedItem) => {
        nestedList.appendChild(this.createListItem(nestedItem));
      });

      li.appendChild(nestedList);
    }

    return li;
  }

  private createAddButton(): HTMLElement {
    const button = document.createElement("button");
    button.classList.add("cdx-list-add-item");
    button.innerHTML = "+ Add Item";
    button.addEventListener("click", () => {
      this.data.items.push({
        content: "",
        meta: {},
        items: [],
      });
      this.updateList();
    });
    return button;
  }

  private nestItem(item: ListItem): void {
    const index = this.data.items.indexOf(item);
    if (index > 0) {
      const parentItem = this.data.items[index - 1];
      if (!parentItem.items) {
        parentItem.items = [];
      }
      parentItem.items.push(item);
      this.data.items.splice(index, 1);
      this.updateList();
    }
  }

  private getCounterTypeAttribute(): string {
    switch (this.data.meta.counterType) {
      case "roman":
        return "I";
      case "alphabetic":
        return "a";
      default:
        return "1";
    }
  }

  private updateList(): void {
    const wrapper = this.render();
    const oldWrapper = document.querySelector(".cdx-list-wrapper");
    if (oldWrapper) {
      oldWrapper.parentNode?.replaceChild(wrapper, oldWrapper);
    }
  }

  save(blockContent: HTMLElement): ListData {
    const items = Array.from(
      blockContent.querySelectorAll(".cdx-list-item")
    ).map((item) => {
      const content = item.querySelector(".cdx-list-item__content");
      const nestedList = item.querySelector(".cdx-list--nested");

      return {
        content: content?.innerHTML || "",
        meta: {},
        items: nestedList ? this.parseNestedItems(nestedList) : [],
      };
    });

    return {
      style: this.data.style,
      items: items,
      meta: this.data.meta,
    };
  }

  private parseNestedItems(nestedList: Element): ListItem[] {
    return Array.from(
      nestedList.querySelectorAll(":scope > .cdx-list-item")
    ).map((item) => {
      const content = item.querySelector(".cdx-list-item__content");
      const furtherNestedList = item.querySelector(".cdx-list--nested");

      return {
        content: content?.innerHTML || "",
        meta: {},
        items: furtherNestedList
          ? this.parseNestedItems(furtherNestedList)
          : [],
      };
    });
  }

  static get pasteConfig(): { tags: string[] } {
    return {
      tags: ["OL", "UL", "LI"],
    };
  }
}

// CSS styles remain the same as before
const styles = `
.cdx-list-wrapper {
    margin: 1em 0;
}

.cdx-list-toolbar {
    margin-bottom: 10px;
}

.cdx-list-toolbar select {
    margin-right: 10px;
    padding: 5px;
}

.cdx-list {
    margin: 0;
    padding-left: 40px;
}

.cdx-list--unordered {
    list-style: disc;
}

.cdx-list--ordered {
    list-style: decimal;
}

.cdx-list--checklist {
    list-style: none;
}

.cdx-list-item {
    position: relative;
    margin: 8px 0;
}

.cdx-list-item__content {
    min-height: 24px;
    padding: 3px 0;
}

.cdx-list-item__nest {
    position: absolute;
    left: -25px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    opacity: 0.6;
}

.cdx-list-item__nest:hover {
    opacity: 1;
}

.cdx-list--nested {
    margin-left: 25px;
}

.cdx-list-add-item {
    margin-top: 10px;
    padding: 5px 10px;
    border: 1px dashed #ccc;
    background: transparent;
    cursor: pointer;
}

.cdx-list-add-item:hover {
    background: #f8f8f8;
}
`;
