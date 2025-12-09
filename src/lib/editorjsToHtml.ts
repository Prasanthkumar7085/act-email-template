import { convertEditorJSToHTML } from "../components/builder/emailTemplates";

export async function convertEditorjsToHtml(editorData: any): Promise<string> {
  const blocks = Array.isArray(editorData)
    ? editorData
    : editorData?.blocks || [];

  try {
    // Use convertEditorJSToHTML directly to get HTML with inline styles only (no classes)
    return convertEditorJSToHTML(editorData);
  } catch (err) {
    return Promise.resolve(convertEditorJSToHTML(blocks));
  }
}
