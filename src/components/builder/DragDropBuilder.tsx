import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import ElementsPalette from "./ElementsPalette";
import DragDropCanvas from "./DragDropCanvas";
import UserFriendlyStylingPanel from "./UserFriendlyStylingPanel";
import { BookTemplate, Box } from "lucide-react";
import { PREDEFINED_TEMPLATES } from "@/data/predefinedDragAndDropTemplates";

export interface EmailElement {
  id: string;
  type:
  | "heading"
  | "paragraph"
  | "list"
  | "div"
  | "columns"
  | "button"
  | "image"
  | "spacer"
  | "divider";
  content?: string;
  level?: number;
  items?: string[];
  listStyle?: "unordered" | "ordered" | "nested";
  nestedItems?: { items: string[]; level: number }[];
  columns?: EmailElement[][];
  children?: EmailElement[];
  imageStyle?: "default" | "rounded" | "circle" | "avatar";
  columnGap?: string;
  columnAlign?: "stretch" | "start" | "center" | "end";
  columnColors?: string[];
  columnPadding?: string[];
  url?: string;
  linkUrl?: string;
  linkTarget?: "_blank" | "_self";
  styles?: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    padding?: string;
    margin?: string;
    borderRadius?: string;
    border?: string;
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: string;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    borderLeft?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
    lineHeight?: string;
    fontFamily?: string;
    objectFit?: string;
    display?: string;
  };
}

interface DragDropBuilderProps {
  elements: EmailElement[];
  onElementsChange: (elements: EmailElement[]) => void;
  pageLayouts: any[];
  activeView: "desktop" | "mobile";
}

export default function DragDropBuilder({
  elements,
  onElementsChange,
  pageLayouts,
  activeView,
}: DragDropBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<"elements" | "templates">(
    "elements"
  );

  const layout = pageLayouts?.[0] || {
    width: 900,
    maxWidth: 900,
    background: "#ffffff",
    borderRadius: 8,
    padding: { top: 40, right: 40, bottom: 40, left: 40 },
    height: 800,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Check if dragging from palette (elements start with 'palette-')
    if (String(event.active.id).startsWith("palette-")) {
      setIsDraggingFromPalette(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDraggingFromPalette(false);

    if (!over) return;

    // If dragging from palette, add new element
    if (String(active.id).startsWith("palette-")) {
      const elementType = String(active.id).replace(
        "palette-",
        ""
      ) as EmailElement["type"];
      const newElement = createElementFromType(elementType);

      // If dropped on a specific element, insert before it, otherwise append
      if (
        String(over.id) !== "canvas-drop-zone" &&
        !String(over.id).startsWith("palette-")
      ) {
        const targetIndex = elements.findIndex((el) => el.id === over.id);
        if (targetIndex !== -1) {
          const newElements = [...elements];
          newElements.splice(targetIndex, 0, newElement);
          onElementsChange(newElements);
        } else {
          onElementsChange([...elements, newElement]);
        }
      } else {
        onElementsChange([...elements, newElement]);
      }
      setSelectedElementId(newElement.id);
      return;
    }

    // If dragging within canvas, reorder elements
    if (
      active.id !== over.id &&
      !String(over.id).startsWith("palette-") &&
      over.id !== "canvas-drop-zone"
    ) {
      const oldIndex = elements.findIndex((el) => el.id === active.id);
      const newIndex = elements.findIndex((el) => el.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onElementsChange(arrayMove(elements, oldIndex, newIndex));
      }
    }
  };

  const createElementFromType = (type: EmailElement["type"]): EmailElement => {
    const baseId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    switch (type) {
      case "heading":
        return {
          id: baseId,
          type: "heading",
          content: "New Heading",
          level: 1,
          styles: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e293b",
            margin: "16px 0",
          },
        };
      case "paragraph":
        return {
          id: baseId,
          type: "paragraph",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          styles: {
            fontSize: "16px",
            color: "#1e293b",
            margin: "12px 0",
            lineHeight: "1.6",
          },
        };
      case "list":
        return {
          id: baseId,
          type: "list",
          items: ["Item 1", "Item 2", "Item 3"],
          styles: {
            margin: "12px 0",
            padding: "0 0 0 20px",
          },
        };
      case "div":
        return {
          id: baseId,
          type: "div",
          children: [],
          styles: {
            padding: "16px",
            margin: "8px 0",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
          },
        };
      case "columns":
        return {
          id: baseId,
          type: "columns",
          columns: [
            [
              {
                id: `${baseId}-col1-1`,
                type: "paragraph",
                content: "Column 1 content",
              },
            ],
            [
              {
                id: `${baseId}-col2-1`,
                type: "paragraph",
                content: "Column 2 content",
              },
            ],
          ],
          styles: {
            margin: "16px 0",
          },
        };
      case "button":
        return {
          id: baseId,
          type: "button",
          content: "Click Me",
          url: "",
          linkTarget: "_blank",
          styles: {
            backgroundColor: "#06b6d4",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600",
            margin: "16px 0",
            display: "inline-block",
          },
        };
      case "image":
        return {
          id: baseId,
          type: "image",
          content: "https://via.placeholder.com/600x300",
          styles: {
            width: "100%",
            maxWidth: "100%",
            height: "auto",
            margin: "16px 0",
            borderRadius: "8px",
            objectFit: "cover",
            display: "block",
          },
        };
      case "spacer":
        return {
          id: baseId,
          type: "spacer",
          styles: {
            height: "32px",
            margin: "0",
          },
        };
      case "divider":
        return {
          id: baseId,
          type: "divider",
          styles: {
            height: "1px",
            backgroundColor: "#e2e8f0",
            margin: "24px 0",
            border: "none",
          },
        };
      default:
        return {
          id: baseId,
          type: "paragraph",
          content: "New element",
        };
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES.find((t) => t.id === templateId);
    if (template && template.elements) {
      // Generate new IDs for all elements to avoid conflicts
      const elementsWithNewIds = template.elements.map((element: any) => ({
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        children: element.children
          ? element.children.map((child: any) => ({
            ...child,
            id: `${child.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }))
          : undefined,
        columns: element.columns
          ? element.columns.map((column: any) =>
            column.map((colElement: any) => ({
              ...colElement,
              id: `${colElement.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            }))
          )
          : undefined,
      }));

      onElementsChange(elementsWithNewIds);
      if (elementsWithNewIds.length > 0) {
        setSelectedElementId(elementsWithNewIds[0].id);
      }
    }
  };

  const updateElement = (id: string, updates: Partial<EmailElement>) => {
    const updateNested = (els: EmailElement[]): EmailElement[] => {
      return els.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates };
        }
        if (el.children) {
          return { ...el, children: updateNested(el.children) };
        }
        if (el.columns) {
          return { ...el, columns: el.columns.map((col) => updateNested(col)) };
        }
        return el;
      });
    };
    onElementsChange(updateNested(elements));
  };

  const deleteElement = (id: string) => {
    const deleteNested = (els: EmailElement[]): EmailElement[] => {
      return els
        .filter((el) => el.id !== id)
        .map((el) => {
          if (el.children) {
            return { ...el, children: deleteNested(el.children) };
          }
          if (el.columns) {
            return {
              ...el,
              columns: el.columns.map((col) => deleteNested(col)),
            };
          }
          return el;
        });
    };
    onElementsChange(deleteNested(elements));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const addElementToContainer = (
    containerId: string,
    newElement: EmailElement
  ) => {
    const addToContainer = (els: EmailElement[]): EmailElement[] => {
      return els.map((el) => {
        if (el.id === containerId && el.type === "div") {
          return { ...el, children: [...(el.children || []), newElement] };
        }
        if (el.children) {
          return { ...el, children: addToContainer(el.children) };
        }
        if (el.columns) {
          return {
            ...el,
            columns: el.columns.map((col) => addToContainer(col)),
          };
        }
        return el;
      });
    };
    onElementsChange(addToContainer(elements));
    setSelectedElementId(newElement.id);
  };

  const addElementToColumn = (
    containerId: string,
    columnIndex: number,
    newElement: EmailElement
  ) => {
    const addToColumn = (els: EmailElement[]): EmailElement[] => {
      return els.map((el) => {
        if (el.id === containerId && el.type === "columns" && el.columns) {
          const newColumns = [...el.columns];
          if (newColumns[columnIndex]) {
            newColumns[columnIndex] = [...newColumns[columnIndex], newElement];
          }
          return { ...el, columns: newColumns };
        }
        if (el.children) {
          return { ...el, children: addToColumn(el.children) };
        }
        if (el.columns) {
          return { ...el, columns: el.columns.map((col) => addToColumn(col)) };
        }
        return el;
      });
    };
    onElementsChange(addToColumn(elements));
    setSelectedElementId(newElement.id);
  };

  // Find selected element (including nested ones)
  const findElementById = (
    els: EmailElement[],
    id: string
  ): EmailElement | null => {
    for (const el of els) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findElementById(el.children, id);
        if (found) return found;
      }
      if (el.columns) {
        for (const column of el.columns) {
          const found = findElementById(column, id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const selectedElement = selectedElementId
    ? findElementById(elements, selectedElementId)
    : null;

  const moveElement = (direction: "up" | "down") => {
    if (!selectedElementId) return;

    const findElementIndex = (
      els: EmailElement[],
      id: string,
      path: number[] = []
    ): number[] | null => {
      for (let i = 0; i < els.length; i++) {
        if (els[i].id === id) return [...path, i];
        if (els[i].children) {
          const found = findElementIndex(els[i].children!, id, [
            ...path,
            i,
            -1,
          ]);
          if (found) return found;
        }
        if (els[i].columns) {
          for (let colIdx = 0; colIdx < els[i].columns!.length; colIdx++) {
            const found = findElementIndex(els[i].columns![colIdx], id, [
              ...path,
              i,
              -2,
              colIdx,
            ]);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const updateElements = (
      els: EmailElement[],
      path: number[],
      newElements: EmailElement[]
    ): EmailElement[] => {
      if (path.length === 1) {
        const newEls = [...els];
        newEls[path[0]] = { ...newEls[path[0]], children: newElements };
        return newEls;
      }
      // Handle nested paths
      return els.map((el, idx) => {
        if (idx === path[0]) {
          if (path[1] === -1 && el.children) {
            return {
              ...el,
              children: updateElements(el.children, path.slice(2), newElements),
            };
          } else if (path[1] === -2 && el.columns) {
            const colIdx = path[2];
            const newColumns = [...el.columns];
            newColumns[colIdx] = updateElements(
              newColumns[colIdx],
              path.slice(3),
              newElements
            );
            return { ...el, columns: newColumns };
          }
        }
        return el;
      });
    };

    const path = findElementIndex(elements, selectedElementId);
    if (!path || path.length === 0) return;

    // For top-level elements
    if (path.length === 1) {
      const index = path[0];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= elements.length) return;

      const newElements = arrayMove(elements, index, newIndex);
      onElementsChange(newElements);
      return;
    }

    // For nested elements, we need to handle them differently
    // This is complex, so let's handle top-level first
  };

  const canMoveUp = (): boolean => {
    if (!selectedElementId) return false;
    const index = elements.findIndex((el) => el.id === selectedElementId);
    return index > 0;
  };

  const canMoveDown = (): boolean => {
    if (!selectedElementId) return false;
    const index = elements.findIndex((el) => el.id === selectedElementId);
    return index >= 0 && index < elements.length - 1;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Elements & Templates Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 mb-2">Add Content</h3>
            <p className="text-sm text-gray-500">
              Drag elements or apply templates
            </p>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setLeftPanelTab("elements")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${leftPanelTab === "elements"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Box className="w-4 h-4" />
                  <span>Elements</span>
                </div>
              </button>
              <button
                onClick={() => setLeftPanelTab("templates")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${leftPanelTab === "templates"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookTemplate className="w-4 h-4" />
                  <span>Templates</span>
                </div>
              </button>
            </div>
          </div>

          <div className=" p-4">
            {leftPanelTab === "elements" ? (
              <ElementsPalette />
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Templates</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Apply a pre-built template to start quickly
                </p>

                <div className="space-y-3">
                  {PREDEFINED_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => applyTemplate(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{template.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">
                              {template.name}
                            </h5>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {template.elements.length} blocks
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {template.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyTemplate(template.id);
                            }}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Apply Template →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Drag & Drop Builder
                </h2>
                <p className="text-sm text-gray-500">
                  Build your email template
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{elements.length}</span>{" "}
                  elements
                </div>
                {leftPanelTab === "templates" && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Template Mode
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center min-h-full">
              <div
                className={`bg-white rounded-xl shadow-lg transform transition-all duration-300 ${activeView === "mobile"
                    ? "scale-90 mobile-view-active"
                    : "scale-100"
                  }`}
                style={{
                  width:
                    activeView === "mobile"
                      ? "420px"
                      : `${layout.width || 900}px`,
                  maxWidth:
                    activeView === "mobile"
                      ? "420px"
                      : `${layout.maxWidth || 900}px`,
                  backgroundColor: layout.background || "#ffffff",
                  backgroundImage: layout.backgroundImage
                    ? `url(${layout.backgroundImage})`
                    : undefined,
                  backgroundSize: layout.backgroundSize || "cover",
                  backgroundRepeat: layout.backgroundRepeat || "no-repeat",
                  borderRadius: `${layout.borderRadius || 8}px`,
                  padding: `${layout.padding?.top || 40}px ${layout.padding?.right || 40}px ${layout.padding?.bottom || 40}px ${layout.padding?.left || 40}px`,
                  minHeight: layout.height ? `${layout.height}px` : "auto",
                }}
              >
                <SortableContext
                  items={elements.map((el) => el.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DragDropCanvas
                    elements={elements}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    onUpdateElement={updateElement}
                    onDeleteElement={deleteElement}
                    onAddElementToContainer={addElementToContainer}
                    onAddElementToColumn={addElementToColumn}
                    onMoveElementUp={(id) => {
                      const index = elements.findIndex((el) => el.id === id);
                      if (index > 0) {
                        onElementsChange(arrayMove(elements, index, index - 1));
                      }
                    }}
                    onMoveElementDown={(id) => {
                      const index = elements.findIndex((el) => el.id === id);
                      if (index < elements.length - 1) {
                        onElementsChange(arrayMove(elements, index, index + 1));
                      }
                    }}
                    canMoveUp={(id) => {
                      const index = elements.findIndex((el) => el.id === id);
                      return index > 0;
                    }}
                    canMoveDown={(id) => {
                      const index = elements.findIndex((el) => el.id === id);
                      return index >= 0 && index < elements.length - 1;
                    }}
                  />
                </SortableContext>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Styling Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 mb-1">Properties</h3>
            <p className="text-sm text-gray-500">
              {selectedElement
                ? `Editing: ${selectedElement.type}`
                : "Select an element to edit"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedElement ? (
              <UserFriendlyStylingPanel
                element={selectedElement}
                onUpdate={(updates) =>
                  updateElement(selectedElement.id, updates)
                }
                onDelete={() => deleteElement(selectedElement.id)}
                onMoveUp={() => {
                  const index = elements.findIndex(
                    (el) => el.id === selectedElementId
                  );
                  if (index > 0) {
                    onElementsChange(arrayMove(elements, index, index - 1));
                  }
                }}
                onMoveDown={() => {
                  const index = elements.findIndex(
                    (el) => el.id === selectedElementId
                  );
                  if (index < elements.length - 1) {
                    onElementsChange(arrayMove(elements, index, index + 1));
                  }
                }}
                canMoveUp={canMoveUp()}
                canMoveDown={canMoveDown()}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">
                  Select an element from the canvas to edit its properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId && isDraggingFromPalette ? (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {String(activeId).replace("palette-", "")}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
