import InlineCode from "@editorjs/inline-code";
import EditorjsList from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
//@ts-ignore
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import { TextColorTool } from "./TextStyleTools";

//@ts-ignore
import IndentTune from "editorjs-indent-tune";

import Delimiter from "@editorjs/delimiter";
import AlignmentTune from "./CustomAlignmentTool";
import { CustomHeaderTool } from "./CustomHeaderTool";
import CustomImageTool from "./CustomImageTool";
import CustomTableTool from "./CustomTableTool";
import { HorizontalLineTool } from "./CustomHorizontalLineTool";
import ButtonTool from "./CustomButtonTool";
import Layout from "editorjs-layout";
import CustomColumnsTool from "./CustomLayoutTool";
import SocialMediaTool from "./CustomSocialMedialTool";
import Quote from "@editorjs/quote";

function getColumnTools(responseId: any, isEditable: any) {
  return {
    header: {
      class: CustomHeaderTool,
      inlineToolbar: true,
      config: {
        placeholder: "Enter a header",
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 2,
        preserveBlank: true,
        preserveTags: ["strong", "u", "em", "b", "i", "span"],
        preserveStyle: true,
        enableLineBreaks: false,
        preserveMentions: true,
        preserveClass: true,
        preserveHtml: true,
      },
      sanitizer: {
        span: {
          class: true,
          "data-user-id": true,
          "data-field": true,
          "data-custom-value": true,
          style: true,
        },
      },
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      config: {
        preserveBlank: true,
        preserveStyle: true,
        enableLineBreaks: true,
        preserveTags: ["strong", "u", "em", "b", "i", "span"],
        preserveHtml: true,
        preserveMentions: true,
        preserveClass: true,
      },
      sanitizer: {
        span: {
          class: true,
          "data-user-id": true,
          "data-field": true,
          "data-custom-value": true,
          "data-field-label": true,
          style: true,
        },
      },
    },
    list: {
      class: EditorjsList,
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
        preserveMentions: true,
      },
    },
    image: {
      class: CustomImageTool,
      config: {
        responseId,
        captionPlaceholder: "Image caption",
        withBorder: true,
        withBackground: true,
        stretched: true,
        enableResizing: true,
        isEditable,
      },
    },
    delimiter: {
      class: Delimiter,
    },
    textStyles: {
      class: TextColorTool,
    },
    underline: Underline,
    marker: {
      class: Marker,
    },
    inlineCode: {
      class: InlineCode,
    },
    button: {
      class: ButtonTool,
      shortcut: "CMD+ALT+B",
    },
  };
}

export function configureEditorTools({
  responseId,
  setOpenTableProperties,
  openTableProperties,
  isEditable,
  EditorJS,
  onImageUpload,
  pageIndex,
}: any) {
  return {
    header: {
      class: CustomHeaderTool,
      shortcut: "CMD+ALT+1",
      inlineToolbar: true,
      tunes: ["alignment", "indentTune"],
      config: {
        placeholder: "Enter a header",
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 2,
        preserveBlank: true,
        preserveTags: ["strong", "u", "em", "b", "i", "span"],
        preserveStyle: true,
        enableLineBreaks: false,
        preserveMentions: true,
        preserveClass: true,
        preserveHtml: true,
        preserveAlignment: true,
      },
      sanitizer: {
        span: {
          class: true,
          "data-user-id": true,
          "data-field": true,
          "data-custom-value": true,
          style: true,
        },
      },
    },
    paragraph: {
      class: Paragraph,
      shortcut: "CMD+ALT+P",
      inlineToolbar: true,
      tunes: ["alignment", "indentTune"],
      config: {
        preserveBlank: true,
        preserveStyle: true,
        enableLineBreaks: true,
        preserveTags: ["strong", "u", "em", "b", "i", "span"],
        preserveHtml: true,
        preserveAlignment: true,
        preserveIndent: true,
        preserveMentions: true,
        preserveClass: true,
      },
      sanitizer: {
        span: {
          class: true,
          "data-user-id": true,
          "data-field": true,
          "data-custom-value": true,
          "data-field-label": true,
          style: true,
        },
      },
    },
    list: {
      shortcut: "CMD+ALT+L",
      class: EditorjsList,
      inlineToolbar: true,
      tunes: ["alignment"],
      config: {
        defaultStyle: "unordered",
        preserveMentions: true,

        levels: [
          {
            tag: "UL",
            style: { marginLeft: "0" },
          },
          {
            tag: "UL",
            style: { marginLeft: "30px" },
          },
          {
            tag: "UL",
            style: { marginLeft: "60px" },
          },
        ],
        types: {
          bullet: {
            tag: "UL",
            style: { listStyleType: "disc" },
          },
          number: {
            tag: "OL",
            style: { listStyleType: "decimal" },
          },
          roman: {
            tag: "OL",
            style: { listStyleType: "lower-roman" },
          },
        },
      },
    },

    delimiter: {
      class: Delimiter,
      tunes: ["alignment", "indentTune"],
    },

    textStyles: {
      class: TextColorTool,
    },

    underline: Underline,

    indentTune: {
      class: IndentTune,
    },

    image: {
      class: CustomImageTool,
      shortcut: "CMD+SHIFT+I",
      config: {
        responseId,
        captionPlaceholder: "Image caption",
        withBorder: true,
        withBackground: true,
        stretched: true,
        enableResizing: true,
        isEditable,
      },
    },

    table: {
      class: CustomTableTool,
      shortcut: "CMD+ALT+T",
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
        withHeadings: true,
        preserveBlank: true,
        preserveStyle: true,
        enableLineBreaks: true,
        preserveTags: ["strong", "u", "em", "b", "i"],
        preserveHtml: true,
        renderOnOverflow: true,
        setOpenTableProperties,
        openTableProperties,
        isEditable,
        preserveMentions: true,
      },
    },

    horizontalLine: {
      class: HorizontalLineTool,
      tunes: ["indentTune"],
      config: {
        defaultStyle: "solid",
        defaultThickness: 2,
        defaultColor: "#000000",
        defaultAlignment: "center",
        preserveBlank: true,
      },
    },

    alignment: {
      class: AlignmentTune,
    },

    marker: {
      class: Marker,
      shortcut: "CMD+ALT+M",
    },

    inlineCode: {
      class: InlineCode,
      shortcut: "CMD+ALT+K",
    },

    button: {
      class: ButtonTool,
      shortcut: "CMD+ALT+B",
    },

    columns: {
      class: CustomColumnsTool,
      config: {
        EditorJsLibrary: EditorJS,
        tools: getColumnTools(responseId, isEditable),
        enableLayoutEditing: true,
        enableLayoutSaving: true,
      },
      shortcut: "CMD+ALT+C",
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      shortcut: "CMD+SHIFT+O",
      config: {
        quotePlaceholder: "Enter a quote",
        captionPlaceholder: "Quote's author",
      },
    },

    // social: {
    //   class: SocialMediaTool,
    //   shortcut: "CMD+ALT+S",
    // },
  };
}
