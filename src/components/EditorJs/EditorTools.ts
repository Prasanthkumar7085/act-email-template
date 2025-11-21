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
// import IndentTune from "./CustomIndentTool";

export function configureEditorTools({
  responseId,
  onImageUpload,
  setInlineFieldPropertiesSectionVisible,
  isInlineFieldPropertiesSectionVisible,
  documentUsers,
  searchParams,
  isUserFinishedDocument,
  setFormFieldsByPage,
  formFieldsByPage,
  pageIndex,
  setPageWiseEditorBlocks,
  pageWiseEditorBlocks,
  setOpenTableProperties,
  openTableProperties,
  isEditable,
  defaultDateFormat,
  emailForPublicDocumentView,
  currentDocumentResponse,
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
    // paragraphWithInput: {
    //   shortcut: "CMD+ALT+I",
    //   class: CustomParagraphWithInput,
    //   inlineToolbar: true,
    //   config: {
    //     responseId,
    //     setInlineFieldPropertiesSectionVisible,
    //     isInlineFieldPropertiesSectionVisible,
    //     documentUsers,
    //     searchParams,
    //     isUserFinishedDocument,
    //     setFormFieldsByPage,
    //     formFieldsByPage,
    //     pageIndex,
    //     setPageWiseEditorBlocks,
    //     pageWiseEditorBlocks,
    //   },
    // },
    delimiter: {
      class: Delimiter,
      tunes: ["alignment", "indentTune"],
    },
    // code: Code,
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
    // mention: {
    //   class: MentionInlineTool,
    //   config: {
    //     preserveHtml: true,
    //     sanitizer: {
    //       span: {
    //         class: true,
    //         "data-user-id": true,
    //         "data-field": true,
    //         "data-custom-value": true,
    //         style: true,
    //       },
    //     },
    //     emailForPublicDocumentView,
    //     documentStatus: "Draft",
    //     users: documentUsers || [],
    //     placeholderText: "Enter value",
    //     allowCustomInput: true,
    //     defaultDateFormat,
    //     company_id:
    //       currentDocumentResponse?.company_id?._id ||
    //       currentDocumentResponse?.company_id,
    //     selectedUser: {
    //       default: true,
    //       e_signature_required: true,
    //       value: "SENDER",
    //       name: "Prasanth mpk Kumar 23",
    //       full_name: "Prasanth mpk Kumar 23",
    //       email: "prasanth.m@orotron.com",
    //       first_name: "Prasanth mpk",
    //       last_name: "Kumar 23",
    //       phone: "919052722415",
    //       company_name: "New IT",
    //       type: "SENDER",
    //       user_type: "SIGNER",
    //       has_approval_access: false,
    //       is_cc: false,
    //       e_signature_order: 0,
    //       e_signature_verified: false,
    //       color: "#F754A2",
    //       role: "sender",
    //       address: "ffdfdfdfddff",
    //       entity_data_id: null,
    //       title: "Prasanth Kumar Morcha",
    //       document_completed: false,
    //       last_verified_on: null,
    //       terms_and_conditions: {
    //         accepted: false,
    //       },
    //       _id: "68a7ecad444f97d676645797",
    //     },
    //   },
    // },
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
  };
}
