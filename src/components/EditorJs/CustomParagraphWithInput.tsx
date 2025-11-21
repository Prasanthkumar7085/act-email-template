class CustomParagraphWithInput {
  data: {
    text: string
    inputs: {
      value: string
      id: string
      position: number
      user?: any
      placeholder?: string
      maxLetters?: number
      isRequired?: boolean
      textColor?: string
    }[]
  }
  private responseId: string | null
  private readOnly = false
  private isInlineFieldPropertiesSectionVisible?: any
  private setInlineFieldPropertiesSectionVisible?: any
  private documentUsers: any[] = []
  private searchParams: any
  private isUserFinishedDocument = false
  private setFormFieldsByPage?: any
  private formFieldsByPage?: any
  private pageIndex?: number = 0
  private setPageWiseEditorBlocks?: any
  private pageWiseEditorBlocks?: any

  constructor({
    data,
    config,
    readOnly = false,
  }: {
    data?: {
      text?: string
      inputs?: {
        value: string
        id: string
        position: number
        user?: any
        placeholder?: string
        maxLetters?: number
        isRequired?: boolean
        textColor?: string
      }[]
    }
    config?: any
    readOnly?: boolean
  }) {
    this.data = {
      text: data?.text || "",
      inputs: data?.inputs || [],
    }
    this.responseId = config?.responseId || null
    this.readOnly = readOnly
    this.isInlineFieldPropertiesSectionVisible = config?.isInlineFieldPropertiesSectionVisible
    this.setInlineFieldPropertiesSectionVisible = config?.setInlineFieldPropertiesSectionVisible
    this.documentUsers = config?.documentUsers || []
    this.searchParams = config?.searchParams || {}
    this.isUserFinishedDocument = config?.isUserFinishedDocument || false
    this.setFormFieldsByPage = config?.setFormFieldsByPage
    this.formFieldsByPage = config?.formFieldsByPage || []
    this.pageIndex = config?.pageIndex || 0
    this.setPageWiseEditorBlocks = config?.setPageWiseEditorBlocks
    this.pageWiseEditorBlocks = config?.pageWiseEditorBlocks
  }

  static get conversionConfig() {
    return {
      export: (data: any) => data.text,
      import: (text: string) => ({ text }),
    }
  }
  static get toolbox() {
    return {
      title: "Paragraph + Input",
      icon: "📝",
    }
  }
  static get isReadOnlySupported() {
    return true
  }

  render() {
    const wrapper = document.createElement("div")
    wrapper.classList.add("custom-paragraph")

    const paragraph = document.createElement("div")
    paragraph.style.margin = "8px 0px"
    if (!this.readOnly) {
      paragraph.contentEditable = "true"
    }
    paragraph.classList.add("custom-paragraph-text")

    paragraph.innerHTML = this.restoreTextWithInputs()

    const addButton = document.createElement("button")
    addButton.innerText = "➕ Add Input"
    addButton.classList.add("insert-input-button")
    addButton.style.display = "none"

    addButton.onclick = () => {
      this.insertInputField(paragraph)
    }

    paragraph.addEventListener("click", () => {
      addButton.style.display = "inline-block"
    })

    document.addEventListener("click", (event) => {
      if (!paragraph.contains(event.target as Node)) {
        addButton.style.display = "none"
      }
    })

    wrapper.appendChild(paragraph);
    if (!this.responseId && !this.readOnly) wrapper.appendChild(addButton);
    setTimeout(() => {
      this.attachInputListeners()
    }, 0)

    return wrapper
  }

  disabledState(userEmail?: any) {
    if (this.isUserFinishedDocument) {
      return true
    } else if (this.searchParams.get("email") && userEmail !== this.searchParams.get("email")) {
      return true
    } else {
      return false
    }
  }

  attachInputListeners() {
    document.querySelectorAll(".dynamic-input").forEach((input) => {
      input.addEventListener("input", (event) => {
        const inputElement = event.target as HTMLInputElement
        const parentWidth = inputElement.parentElement?.parentElement?.clientWidth || 300
        const maxWidth = parentWidth - 30

        const id = inputElement.dataset.id || ""
        const inputData = this.data.inputs.find((input) => input.id === id)

        if (inputData?.maxLetters && inputElement.value.length > inputData.maxLetters) {
          inputElement.value = inputElement.value.slice(0, inputData.maxLetters)
        }

        inputElement.style.width = `${Math.min(maxWidth, Math.max(50, inputElement.value.length * 10))}px`

        this.updateInputValue(id, inputElement.value)

        this.updateValidationState(inputElement)
      })

      input.addEventListener("click", (event) => {
        event.stopPropagation()
        const inputElement = event.target as HTMLInputElement
        if (!this.responseId) this.showFloatingMenu(inputElement)
        if (this.isInlineFieldPropertiesSectionVisible?.visible) {
          this.setInlineFieldPropertiesSectionVisible({
            pageIndex: 0,
            visible: true,
            selectedField: { id: inputElement.dataset.id },
          })
        }
      })

      input.addEventListener("blur-sm", (event) => {
        const inputElement = event.target as HTMLInputElement
        this.updateValidationState(inputElement)
      })
    })

    document.addEventListener("click", (event) => {
      if (!(event.target as HTMLElement).closest(".floating-menu")) {
        this.hideFloatingMenu()
      }
    })
  }

  updateValidationState(inputElement: HTMLInputElement) {
    const id = inputElement.dataset.id || ""
    const inputData = this.data.inputs.find((input) => input.id === id)

    const existingError = inputElement.parentElement?.querySelector(".input-error")
    if (existingError) {
      existingError.remove()
    }
    const userColor = inputData?.user?.color || "#ccc"
    inputElement.style.borderColor = userColor

  }

  restoreTextWithInputs(): string {
    let text = this.data.text || "Type here..."

    this.data.inputs
      .sort((a, b) => a.position - b.position)
      .forEach(({ value, id, position }) => {
        const inputData = this.data.inputs.find((input) => input.id === id)
        const maxLengthAttr = inputData?.maxLetters ? `maxlength="${inputData.maxLetters}"` : ""
        const requiredAttr = inputData?.isRequired ? "required" : ""

        const spanHtml = `
          <span class="input-wrapper" data-id="${id}" data-position="${position}">
          ${this.isUserFinishedDocument
            ? `<p>${value || "---"}</p>`
            : ` <input 
            type="text"
             class="dynamic-input"
              value="${value}" 
              data-id="${id}"
               placeholder="${this.data.inputs[position].placeholder || "Enter text..."}"
                style="color: ${this.data.inputs[position].textColor};width: ${Math.max(100, value.length * 10)}px;border: 1px solid ${this.data.inputs[position].user?.color};"
                 ${this.disabledState(this.data.inputs[position].user?.email) ? "disabled" : ""}
                 ${maxLengthAttr}
                 ${requiredAttr}
          >
          `
          }
          </span>
        `
        text = text.replace(`[input-${id}]`, spanHtml)
      })

    return text.replace(/\[input-\d+\]/g, "")
  }

  insertInputField(paragraph: HTMLElement) {
    const id = Date.now().toString()
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)

    if (range) {
      const inputWrapper = document.createElement("span")
      inputWrapper.classList.add("input-wrapper")
      inputWrapper.dataset.id = id
      inputWrapper.dataset.position = this.data.inputs.length.toString()

      const input = document.createElement("input")
      input.type = "text"
      input.classList.add("dynamic-input")
      input.style.width = "100px"
      input.placeholder = "Enter text..."
      input.dataset.id = id
      input.style.border = `1px solid ${this.documentUsers[0]?.color}`

      const parentWidth = paragraph.clientWidth

      input.addEventListener("click", (event) => {
        event.stopPropagation()
        if (!this.responseId) {
          this.showFloatingMenu(input)
          if (this.isInlineFieldPropertiesSectionVisible?.visible) {
            this.setInlineFieldPropertiesSectionVisible({
              pageIndex: 0,
              visible: true,
              selectedField: { id: input.dataset.id },
            })
          }
        }
      })

      input.addEventListener("input", () => {
        const maxWidth = parentWidth - 30
        const inputData = this.data.inputs.find((item) => item.id === id)

        if (inputData?.maxLetters && input.value.length > inputData.maxLetters) {
          input.value = input.value.slice(0, inputData.maxLetters)
        }

        input.style.width = `${Math.min(maxWidth, Math.max(100, input.value.length * 10))}px`

        this.updateInputValue(id, input.value)
      })

      input.addEventListener("blur-sm", () => {
        this.updateValidationState(input)
      })

      inputWrapper.appendChild(input);

      const placeholder = document.createTextNode(`[input-${id}]`)
      range.insertNode(placeholder)

      placeholder.parentNode?.insertBefore(inputWrapper, placeholder.nextSibling)
      placeholder.remove()

      this.data.inputs.push({
        value: "",
        id,
        position: this.data.inputs.length,
        user: this.documentUsers[0],
        placeholder: "Enter text...",
        maxLetters: 0,
        isRequired: false,
        textColor: "#000000",
      })
      input.focus()
    }
  }

  updateInputValue(id: string, value: string) {
    const inputIndex = this.data.inputs.findIndex((item) => item.id === id)
    if (inputIndex !== -1) {
      this.data.inputs[inputIndex].value = value
    }
    if (this.readOnly) {
      this.handleConfiguration(id, value)
    }
  }

  updateInputPositions() {
    const inputWrappers = document.querySelectorAll(".input-wrapper")
    inputWrappers.forEach((wrapper, index) => {
      const id = (wrapper as HTMLElement).dataset.id
      const inputIndex = this.data.inputs.findIndex((item) => item.id === id)
      if (inputIndex !== -1) {
        this.data.inputs[inputIndex].position = index
      }
    })
  }

  handleConfiguration = (id: string, value: any) => {
    const tempData: any = { ...this.pageWiseEditorBlocks }

    if (tempData[this.pageIndex || 0]?.blocks) {
      tempData[this.pageIndex || 0].blocks.forEach((block: any) => {
        if (block.type === "paragraphWithInput") {
          block.data.inputs = block.data.inputs.map((input: any) =>
            input.id === id ? { ...input, value: value } : input,
          )
        }
      })
    }
    this.setPageWiseEditorBlocks(tempData)
  }

  showFloatingMenu(inputElement: HTMLInputElement) {
    this.hideFloatingMenu()

    const menu = document.createElement("div")
    menu.classList.add("floating-menu")

    // Get the input data
    const id = inputElement.dataset.id || ""
    const inputData = this.data.inputs.find((input) => input.id === id)
    const isRequired = inputData?.isRequired || false
    const maxLetters = inputData?.maxLetters || 0

    menu.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <button class="align-left-btn" style="color:white; font-weight:bold; cursor:pointer">⚙️</button>
        <button class="delete-input-btn" style="color:red; font-weight:bold; cursor:pointer">❌</button>
      </div>
    `

    document.body.appendChild(menu);

    const rect = inputElement.getBoundingClientRect();
    menu.style.position = "absolute";
    menu.style.top = `${window.scrollY + rect.top - 40}px`;
    menu.style.left = `${window.scrollX + rect.left}px`;
    menu.style.background = "rgba(0, 0, 0, 0.8)";
    menu.style.padding = "6px";
    menu.style.borderRadius = "6px";
    menu.style.color = "#fff";
    menu.style.zIndex = "1000";
    menu.style.display = "flex";
    menu.style.gap = "5px";

    menu.querySelector(".align-left-btn")?.addEventListener("click", (e) => {
      e.stopPropagation()
      this.setInlineFieldPropertiesSectionVisible({
        pageIndex: 0,
        visible: true,
        selectedField: { id: inputElement.dataset.id },
      })
    })

    menu.querySelector(".delete-input-btn")?.addEventListener("click", (e) => {
      e.stopPropagation()
      const inputId = inputElement.dataset.id
      inputElement.closest(".input-wrapper")?.remove()

      this.setInlineFieldPropertiesSectionVisible({
        pageIndex: this.pageIndex,
        visible: false,
        selectedField: null,
      })
      this.data.inputs = this.data.inputs.filter((input) => input.id !== inputId)
      this.hideFloatingMenu()
    })
  }

  hideFloatingMenu() {
    document.querySelectorAll(".floating-menu").forEach((menu) => menu.remove())
  }

  save(blockContent: HTMLElement) {

    const paragraph = blockContent.querySelector(".custom-paragraph-text") as HTMLElement
    const inputs: {
      value: string
      id: string
      position: number
      user?: any
      placeholder?: string
      maxLetters?: number
      isRequired?: boolean
      textColor?: string
    }[] = []
    let text = ""
    let currentPosition = 0

    const processTextNode = (node: Node) => {
      const content = node.textContent || ""
      if (content.trim()) {
        text += content
      }
    }

    const processInputWrapper = (wrapper: Element) => {
      const input = wrapper.querySelector("input") as HTMLInputElement
      const id = wrapper.getAttribute("data-id")

      if (id) {
        const existingInput = this.data.inputs.find((item) => item.id === id)

        inputs.push({
          value: input.value || "",
          id: id,
          position: currentPosition++,
          user: existingInput?.user || this.documentUsers[0],
          placeholder: input.placeholder || "",
          maxLetters: existingInput?.maxLetters || 0,
          isRequired: existingInput?.isRequired || false,
          textColor: existingInput?.textColor || "#000000",
        })
        text += ` [input-${id}] `
      }
    }

    const treeWalker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return NodeFilter.FILTER_ACCEPT
        }
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains("input-wrapper")) {
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_SKIP
      },
    })

    let currentNode: any = treeWalker.currentNode
    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        processTextNode(currentNode)
      } else if (
        currentNode.nodeType === Node.ELEMENT_NODE &&
        (currentNode as Element).classList.contains("input-wrapper")
      ) {
        processInputWrapper(currentNode as Element)
      }
      currentNode = treeWalker.nextNode()
    }

    text = text
      .replace(/\u200B/g, "")
      .replace(/\s+/g, " ")
      .trim()

    return {
      text,
      inputs: inputs.sort((a, b) => a.position - b.position),
    }
  }
}

export default CustomParagraphWithInput

