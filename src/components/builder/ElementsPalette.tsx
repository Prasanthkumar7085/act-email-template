import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  AlignLeft,
  List,
  Box,
  Layout,
  MousePointerClick,
  Image as ImageIcon,
  MoveVertical,
  Minus,
  GripVertical
} from "lucide-react";

interface PaletteElement {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'content' | 'layout';
}

const elements: PaletteElement[] = [
  // Content Elements
  {
    id: "palette-heading",
    label: "Heading",
    icon: <Type className="w-5 h-5" />,
    description: "Large title text",
    category: 'content'
  },
  {
    id: "palette-paragraph",
    label: "Paragraph",
    icon: <AlignLeft className="w-5 h-5" />,
    description: "Regular text block",
    category: 'content'
  },
  {
    id: "palette-list",
    label: "List",
    icon: <List className="w-5 h-5" />,
    description: "Bullet or numbered",
    category: 'content'
  },
  {
    id: "palette-image",
    label: "Image",
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Upload or URL",
    category: 'content'
  },
  {
    id: "palette-button",
    label: "Button",
    icon: <MousePointerClick className="w-5 h-5" />,
    description: "Call to action",
    category: 'content'
  },

  // Layout Elements
  {
    id: "palette-columns",
    label: "Columns",
    icon: <Layout className="w-5 h-5" />,
    description: "Multi-column row",
    category: 'layout'
  },
  {
    id: "palette-div",
    label: "Container",
    icon: <Box className="w-5 h-5" />,
    description: "Group elements",
    category: 'layout'
  },
  {
    id: "palette-divider",
    label: "Divider",
    icon: <Minus className="w-5 h-5" />,
    description: "Separator line",
    category: 'layout'
  },
  {
    id: "palette-spacer",
    label: "Spacer",
    icon: <MoveVertical className="w-5 h-5" />,
    description: "Empty space",
    category: 'layout'
  }
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
        group relative flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing
        bg-white border border-surface-200 shadow-sm transition-all duration-200
        hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5
        ${isDragging ? "opacity-50 ring-2 ring-brand-500 scale-95" : "opacity-100"}
      `}
    >
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors
        bg-surface-50 text-surface-500 group-hover:bg-brand-50 group-hover:text-brand-700
      `}>
        {element.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-surface-700 group-hover:text-surface-900 truncate">
          {element.label}
        </div>
        <div className="text-[10px] text-surface-400 truncate">
          {element.description}
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-surface-300">
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
}

export default function ElementsPalette() {
  const contentElements = elements.filter(el => el.category === 'content');
  const layoutElements = elements.filter(el => el.category === 'layout');

  return (
    <div className="space-y-6">
      {/* Content Section */}
      <div>
        <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-1">
          Content Blocks
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {contentElements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}
        </div>
      </div>

      {/* Layout Section */}
      <div>
        <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-1">
          Layout Structure
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {layoutElements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}
        </div>
      </div>
    </div>
  );
}
