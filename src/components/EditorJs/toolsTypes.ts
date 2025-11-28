// types/editorjs-tools.ts
export interface ToolConfig {
  api: any;
  data?: any;
  config?: any;
}

export interface LayoutColumn {
  id: string;
  content: any[]; // EditorJS blocks
  width?: string;
}

export interface LayoutData {
  columns: number;
  layout: "equal" | "aside" | "featured";
  columnsData: LayoutColumn[];
  gap: string;
  type: string;
}

export interface ButtonData {
  text: string;
  url: string;
  alignment: "left" | "center" | "right";
  style: "primary" | "secondary" | "outline";
  backgroundColor: string;
  textColor: string;
  padding: string;
  borderRadius: string;
  type: string;
}

export interface SocialMediaData {
  platforms: Array<{
    id: string;
    url: string;
    customIcon?: string;
  }>;
  alignment: "left" | "center" | "right";
  iconSize: string;
  spacing: string;
  type: string;
}

export interface SpacerData {
  height: string;
  unit: "px" | "em" | "rem";
  breakpoint: "all" | "desktop" | "mobile";
  backgroundColor: string;
  type: string;
}

export interface DividerData {
  style: "solid" | "dashed" | "dotted" | "double";
  thickness: number;
  color: string;
  alignment: "left" | "center" | "right";
  width: number;
  type: string;
}
