import { convertEditorJSToHTMLWithStyles } from "../components/builder/emailTemplates";

export async function convertEditorjsToHtml(editorData: any): Promise<string> {
  const blocks = Array.isArray(editorData)
    ? editorData
    : editorData?.blocks || [];

  try {
    return convertEditorJSToHTMLWithStyles(editorData);
  } catch (err) {
    return Promise.resolve(convertEditorJSToHTMLWithStyles(blocks));
  }
}
