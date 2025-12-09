import { convertEditorjsToHtml } from "./editorjsToHtml";

type View = "desktop" | "mobile";

type PageLayout = {
  background?: string;
  backgroundImage?: string;
  backgroundRepeat?: string;
  backgroundSize?: string;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  width?: number;
  maxWidth?: number;
  borderRadius?: number;
};

export async function buildEmailFromEditor(
  editorData: any,
  view: View = "desktop",
  pageLayout?: PageLayout
) {
  const inner = await convertEditorjsToHtml(editorData);

  const padding = {
    top: pageLayout?.padding?.top ?? 40,
    right: pageLayout?.padding?.right ?? 40,
    bottom: pageLayout?.padding?.bottom ?? 40,
    left: pageLayout?.padding?.left ?? 40,
  };

  // Respect layout dimensions while keeping a safe email width
  const targetWidth = pageLayout?.width ?? (view === "mobile" ? 375 : 600);
  const targetMaxWidth =
    pageLayout?.maxWidth ?? (view === "mobile" ? 375 : 900);
  const resolvedWidth =
    view === "mobile"
      ? Math.min(targetWidth, targetMaxWidth, 375)
      : targetWidth;
  const resolvedMaxWidth =
    view === "mobile"
      ? Math.min(targetMaxWidth, 375)
      : Math.max(targetWidth, targetMaxWidth || targetWidth);

  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const background = pageLayout?.background || "#FFFFFF";
  const backgroundImage = pageLayout?.backgroundImage
    ? `background-image:url(${pageLayout.backgroundImage});`
    : "";
  const backgroundRepeat = pageLayout?.backgroundRepeat
    ? `background-repeat:${pageLayout.backgroundRepeat};`
    : "";
  const backgroundSize = pageLayout?.backgroundSize
    ? `background-size:${pageLayout.backgroundSize};`
    : "";
  const borderRadius =
    typeof pageLayout?.borderRadius === "number" ? pageLayout.borderRadius : 8;

  // Format inner content with proper indentation
  const formattedInner = inner
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `              ${line}`)
    .join("\n");

  // Wrap content in email-compatible structure with inline styles only
  return `<!doctype html>

<html>
  <body>
    <div
      style='background-color:#FFFFFF;color:#03124A;font-family:Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:${resolvedMaxWidth}px;width:${resolvedWidth}px;background-color:${background};${backgroundImage}${backgroundRepeat}${backgroundSize}border-radius:${borderRadius}px;overflow:hidden;"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td style="padding:${paddingStyle}">
${formattedInner}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}

export async function buildDesktopEmailFromEditor(
  editorData: any,
  pageLayout?: PageLayout
) {
  return buildEmailFromEditor(editorData, "desktop", pageLayout);
}

export async function buildMobileEmailFromEditor(
  editorData: any,
  pageLayout?: PageLayout
) {
  return buildEmailFromEditor(editorData, "mobile", pageLayout);
}
