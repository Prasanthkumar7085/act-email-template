import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface PaletteElement {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const elements: PaletteElement[] = [
  {
    id: "palette-heading",
    label: "Heading",
    icon: "📝",
    description: "Add a heading",
  },
  {
    id: "palette-paragraph",
    label: "Paragraph",
    icon: "📄",
    description: "Add text content",
  },
  {
    id: "palette-list",
    label: "List",
    icon: "📋",
    description: "Add a bullet list",
  },
  {
    id: "palette-div",
    label: "Container",
    icon: "📦",
    description: "Add a container div",
  },
  {
    id: "palette-columns",
    label: "Columns",
    icon: "📊",
    description: "Add column layout",
  },
  {
    id: "palette-button",
    label: "Button",
    icon: "🔘",
    description: "Add a button",
  },
  {
    id: "palette-image",
    label: "Image",
    icon: "🖼️",
    description: "Add an image",
  },
  {
    id: "palette-spacer",
    label: "Spacer",
    icon: "↕️",
    description: "Add spacing",
  },
  {
    id: "palette-divider",
    label: "Divider",
    icon: "➖",
    description: "Add a divider line",
  },
];

function DraggableElement({ element }: { element: PaletteElement }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
                bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-grab active:cursor-grabbing
                hover:border-blue-500 hover:bg-blue-50 transition-all duration-200
                ${isDragging ? "opacity-50" : "opacity-100"}
            `}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{element.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{element.label}</div>
          <div className="text-xs text-gray-500">{element.description}</div>
        </div>
      </div>
    </div>
  );
}

export default function ElementsPalette() {
  return (
    <div className="space-y-3">
      {elements.map((element) => (
        <DraggableElement key={element.id} element={element} />
      ))}
    </div>
  );
}
