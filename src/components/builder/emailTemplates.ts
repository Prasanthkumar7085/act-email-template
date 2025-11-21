function inlineStyle(styleObj: Record<string, string | number>) {
  return Object.entries(styleObj)
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`
    )
    .join(";");
}

function escapeHtml(str: any) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Accept either our simple block type or EditorJS blocks (array of {type, data})
export function generateEmailHTML(input: any) {
  const blocks = Array.isArray(input) ? input : input?.blocks || [];

  const bodyStyles = inlineStyle({
    "background-color": "#ffffff",
    margin: 0,
    padding: 0,
  });

  const rows = blocks
    .map((blk: any) => {
      const type = blk.type || blk.type;

      if (type === "header") {
        const text = blk.data?.text || blk.props?.text || "";
        return `<tr><td style="padding:24px;text-align:center;"><h1 style="margin:0;font-size:24px;color:#111;">${escapeHtml(text)}</h1></td></tr>`;
      }

      if (type === "paragraph") {
        const text = blk.data?.text || blk.props?.text || "";
        return `<tr><td style="padding:16px 24px;text-align:left;color:#333;font-size:16px;">${escapeHtml(text)}</td></tr>`;
      }

      if (type === "list") {
        const items = blk.data?.items || [];
        const listHtml = `<ul style="margin:0 0 0 18px;padding:0;color:#333;">${items.map((it: string) => `<li>${escapeHtml(it)}</li>`).join("")}</ul>`;
        return `<tr><td style="padding:8px 24px;text-align:left;">${listHtml}</td></tr>`;
      }

      if (type === "image") {
        const url =
          blk.data?.file?.url || blk.data?.url || blk.props?.src || "";
        const alt = blk.data?.caption || blk.props?.alt || "";
        return `<tr><td style="padding:0;text-align:center;"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="max-width:600px;width:100%;height:auto;display:block;"/></td></tr>`;
      }

      if (type === "delimiter" || type === "horizontalLine") {
        return `<tr><td style="padding:12px 24px;text-align:center;"><hr style="border:none;border-top:1px solid #e5e7eb;width:100%;"/></td></tr>`;
      }

      return "";
    })
    .join("\n");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
  </head>
  <body style="${bodyStyles}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
      ${rows}
    </table>
  </body>
</html>`;

  return html;
}
