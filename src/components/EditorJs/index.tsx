
import { useParams } from "@tanstack/react-router"
import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { configureEditorTools } from "./EditorTools"

interface EditorJSComponentProps {
    data?: {
        time: number
        blocks: Array<any>
        version: string
    }
    onChange?: (data: any) => void
    pageIndex: number
    onImageUpload?: (file: File) => Promise<{ success: number; file: { url: string } }>
    onHeightChange?: (pageIndex: number, height: number) => void
    editorRef: React.MutableRefObject<Map<number, any> | any>
    pageLayouts?: any[]
    reInitializerEditor?: boolean
}

function EditorJSComponent({ data, onChange, pageIndex, onImageUpload, onHeightChange, editorRef, pageLayouts, reInitializerEditor }: EditorJSComponentProps) {

    const BASE_PAGE_HEIGHT = 800
    const MARGIN = 40;

    const params = useParams({ strict: false })

    const pathname = window.location.pathname
    const isEditable = params?.responseId || params?.documentId || pathname.includes("create-workflow-template") || pathname.includes("all-templates-preview") || pathname.includes("workflow") ? true : false


    const containerRef = useRef<HTMLDivElement>(null)
    const localEditorRef = useRef<any | null>(null)
    const heightObserverRef = useRef<ResizeObserver | null>(null)
    const [isEditorReady, setIsEditorReady] = useState(false)
    const mountedRef = useRef(false)
    const initializingRef = useRef(false)
    const lastDataRef = useRef<string>("")

    const calculateContentHeight = useCallback(async (): Promise<number> => {
        if (!containerRef.current) return BASE_PAGE_HEIGHT

        await new Promise((resolve) => setTimeout(resolve, 100))

        const editorElement = containerRef.current.querySelector(`#editorjs-${pageIndex}`)
        if (!editorElement) return BASE_PAGE_HEIGHT

        const blocks = editorElement.querySelectorAll(".ce-block")
        let totalHeight = MARGIN * 2

        blocks.forEach((block) => {
            const blockElement = block as HTMLElement
            const rect = blockElement.getBoundingClientRect()
            const styles = window.getComputedStyle(blockElement)
            const marginTop = Number.parseInt(styles.marginTop) || 0
            const marginBottom = Number.parseInt(styles.marginBottom) || 0
            const paddingTop = Number.parseInt(styles.paddingTop) || 0
            const paddingBottom = Number.parseInt(styles.paddingBottom) || 0
            totalHeight += rect.height + marginTop + marginBottom + paddingTop + paddingBottom
        })

        totalHeight += 50
        return Math.max(BASE_PAGE_HEIGHT, totalHeight)
    }, [])

    const updatePageHeight = useCallback(async () => {
        if (!mountedRef.current) return
        const newHeight = await calculateContentHeight()
        if (onHeightChange) {
            onHeightChange(pageIndex, newHeight)
        }
    }, [calculateContentHeight, onHeightChange, pageIndex])

    const applyAlignmentFromTunes = useCallback(async (editor: any) => {
        if (!mountedRef.current || !editor) return;

        try {
            const savedData = await editor.save();
            const blockElements = containerRef.current?.querySelectorAll(".ce-block") || [];

            savedData.blocks.forEach((block: any, index: number) => {
                const alignment = block?.tunes?.alignment?.alignment || "left";
                const blockElement = blockElements[index] as HTMLElement;

                if (!blockElement) return;

                const contentSelectors = [
                    ".ce-block__content",
                    ".ce-header",
                    ".cdx-paragraph",
                    ".ce-list",
                    ".ce-list__item",
                    ".ce-quote",
                    ".professional-horizontal-line"
                ];

                let contentElement: HTMLElement | null = null;

                for (const selector of contentSelectors) {
                    contentElement = blockElement.querySelector(selector);
                    if (contentElement) break;
                }

                if (contentElement) {
                    contentElement.style.textAlign = alignment;
                }

                const textElements = blockElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div');
                textElements.forEach((element: Element) => {
                    const el = element as HTMLElement;
                    if (!el.style.textAlign || el.style.textAlign === "") {
                        el.style.textAlign = alignment;
                    }
                });
            });
        } catch (error) {
            console.warn("Error applying alignment:", error);
        }
    }, []);

    const setupHeightObserver = useCallback(() => {
        if (!containerRef.current || !mountedRef.current) return

        if (heightObserverRef.current) {
            heightObserverRef.current.disconnect()
        }

        heightObserverRef.current = new ResizeObserver(() => {
            setTimeout(() => {
                updatePageHeight()
            }, 200)
        })

        const editorElement = containerRef.current.querySelector(`#editorjs-${pageIndex}`)
        if (editorElement) {
            heightObserverRef.current.observe(editorElement)
        }
    }, [])


    const replaceCustomSpanWithValue = useCallback(() => {
        if (!containerRef.current) return;

        const editorElement = containerRef.current.querySelector(`#editorjs-${pageIndex}`);
        if (!editorElement) return;

        const spans = editorElement.querySelectorAll("span[data-custom-value]");

        spans.forEach((span) => {
            const displayValue = (span.textContent?.trim() && span.getAttribute("data-custom-value"));
            if (displayValue) {
                const textNode = document.createTextNode(displayValue);
                span.replaceWith(textNode);
            } else {
                const textNode = document.createTextNode(" ");
                span.replaceWith(textNode);
            }
        });
    }, [pageIndex]);

    const cleanupEditor = useCallback(async () => {
        if (heightObserverRef.current) {
            heightObserverRef.current.disconnect()
            heightObserverRef.current = null
        }

        if (localEditorRef.current) {
            try {
                if (typeof localEditorRef.current.destroy === "function") {
                    await localEditorRef.current.destroy()
                }
            } catch (error) {
                console.warn("Error destroying editor:", error)
            }
            localEditorRef.current = null
        }

        const editorElement = containerRef.current?.querySelector(`#editorjs-${pageIndex}`)
        if (editorElement) {
            editorElement.innerHTML = ""
        }

        if (editorRef?.current) {
            const editorsMap = editorRef.current as unknown as Map<number, any>
            editorsMap?.delete(pageIndex)
        }

        setIsEditorReady(false)
        initializingRef.current = false
    }, [])

    const initializeEditor = useCallback(async () => {
        if (initializingRef.current || !mountedRef.current) return

        initializingRef.current = true

        try {
            await cleanupEditor()

            await new Promise((resolve) => setTimeout(resolve, 50))

            if (!mountedRef.current) return

            const editorElement = containerRef.current?.querySelector(`#editorjs-${pageIndex}`)
            if (editorElement) {
                editorElement.innerHTML = ""
            }

            const EditorJSLib = (await import('@editorjs/editorjs')).default
            const editor = new EditorJSLib({
                holder: `editorjs-${pageIndex}`,
                tools: configureEditorTools({
                    responseId: params?.responseId,
                    onImageUpload,
                    pageIndex,
                    isEditable,
                }) as any,
                data: data || {
                    time: Date.now(),
                    blocks: [],
                    version: "2.30.8",
                },
                onReady: () => {
                    if (!mountedRef.current) return

                    setIsEditorReady(true)
                    lastDataRef.current = JSON.stringify(data)

                    setTimeout(() => {
                        if (mountedRef.current) {
                            applyAlignmentFromTunes(editor)
                            setupHeightObserver()
                            updatePageHeight()
                        }
                    }, 100)

                    if (isEditable) {
                        if (pathname.includes('builder-print')) {
                            replaceCustomSpanWithValue()
                        }

                        const editorElement = containerRef.current?.querySelector(`#editorjs-${pageIndex}`)
                        if (editorElement) {
                            const editorContainer = editorElement as HTMLElement

                            editorContainer.setAttribute('data-gramm', 'false')
                            editorContainer.setAttribute('data-gramm_editor', 'false')
                            editorContainer.setAttribute('data-enable-grammarly', 'false')
                            editorContainer.setAttribute('spellcheck', 'false')

                            // prevent paste/drop default behaviors that can break editor styling
                            const events = ['paste', 'drop']
                            events.forEach((eventType) => {
                                editorElement.addEventListener(eventType, (e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                })
                            })

                            const editableElements = editorElement.querySelectorAll('[contenteditable]')
                            editableElements.forEach((el) => {
                                const element = el as HTMLElement
                                element.setAttribute('data-gramm', 'false')
                                element.setAttribute('data-gramm_editor', 'false')
                                element.setAttribute('data-enable-grammarly', 'false')
                                element.setAttribute('spellcheck', 'false')
                            })
                        }
                    }
                },
                onChange: async () => {
                    if (!mountedRef.current) return

                    try {
                        const content = await editor.save()
                        if (!content) return

                        if (data && data.blocks) {
                            content.blocks = content.blocks.map((block, index) => {
                                if (data.blocks && data.blocks[index] && data.blocks[index].id) {
                                    return { ...block, id: data.blocks[index].id };
                                }
                                return block;
                            });
                        }

                        onChange?.(content)
                        await applyAlignmentFromTunes(editor)

                        setTimeout(() => {
                            if (mountedRef.current) {
                                updatePageHeight()
                            }
                        }, 200)
                    } catch (error) {
                        console.warn("Error in onChange:", error)
                    }
                },
            })

            localEditorRef.current = editor

            if (editorRef && typeof editorRef === "object") {
                if (!editorRef.current) {
                    editorRef.current = new Map()
                }
                const editorsMap = editorRef.current as unknown as Map<number, any>
                editorsMap.set(pageIndex, editor)
            }
        } catch (error) {
            console.error("Error initializing editor:", error)
        } finally {
            initializingRef.current = false
        }
    }, [reInitializerEditor

    ])

    useEffect(() => {
        const currentDataString = JSON.stringify(data)

        if (
            isEditorReady &&
            localEditorRef.current &&
            data &&
            currentDataString !== lastDataRef.current &&
            mountedRef.current
        ) {
            const renderData = async () => {
                try {
                    await localEditorRef.current?.clear()

                    await localEditorRef.current?.render(data)

                    lastDataRef.current = currentDataString

                    setTimeout(() => {
                        if (mountedRef.current && localEditorRef.current) {
                            applyAlignmentFromTunes(localEditorRef.current)
                            updatePageHeight()
                        }
                    }, 300)
                } catch (error) {
                    console.warn("Error rendering data:", error)
                    initializeEditor()
                }
            }

            renderData()
        }
    }, [isEditorReady, applyAlignmentFromTunes, reInitializerEditor])

    useEffect(() => {
        mountedRef.current = true
        initializeEditor()

        return () => {
            mountedRef.current = false
            cleanupEditor()
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className={`editor-container absolute inset-0  bg-opacity-10`}
            style={{
                width: "100%",
                overflow: "hidden",
                minHeight: `${BASE_PAGE_HEIGHT}px`,
                zIndex: 10,
                backgroundColor: pageLayouts?.[pageIndex]?.background || "#ffffff",
            }}
        >
            <div
                id={`editorjs-${pageIndex}`}
                className="w-full"
                style={{
                    minHeight: "100px",
                }}
                aria-label={`Editor for page ${pageIndex + 1}`}
            />
            {isEditable && (
                <style>{`
          .ce-toolbar__actions {
            display: none !important;
            visibility: hidden !important;
          }
          .ce-inline-toolbar {
            display: none !important;
            visibility: hidden !important;
          }
          grammarly-extension,
          grammarly-popups,
          .gr_-editor-card-content,
          .gr_-editor-card,
          [data-grammarly-part],
          grammarly-mirror {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
            )}
        </div>
    )
}

export default EditorJSComponent