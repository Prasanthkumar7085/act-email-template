import sampleTemplate from "../../sampleEmailTemplateHtml.html?raw";
import { convertEditorjsToHtml } from "./editorjsToHtml";

type View = "desktop" | "mobile";

export async function buildEmailFromEditor(
  editorData: any,
  view: View = "desktop"
) {
  const inner = await convertEditorjsToHtml(editorData);
  if (!sampleTemplate) return inner;
  let out = sampleTemplate.replace(
    "<!-- Dynamic HTML will be injected here -->",
    inner
  );

  if (view === "mobile") {
    out = out.replace(/max-width:\s*600px/gi, "max-width:375px");
  }

  return out;
}

export async function buildDesktopEmailFromEditor(editorData: any) {
  return buildEmailFromEditor(editorData, "desktop");
}

export async function buildMobileEmailFromEditor(editorData: any) {
  return buildEmailFromEditor(editorData, "mobile");
}
