import type { OutputData } from "@editorjs/editorjs";

interface SplitResult {
  shouldSplit: boolean;
  currentContent: OutputData;
  overflowContent: OutputData;
}

interface SplitParams {
  content: OutputData;
  pageIndex: number;
  containerRef: any;
}

export async function handleContentSplit({
  content,
  pageIndex,
  containerRef,
}: SplitParams): Promise<SplitResult> {
  if (!content.blocks || content.blocks.length === 0) {
    return {
      shouldSplit: false,
      currentContent: content,
      overflowContent: content,
    };
  }

  const editorElement = document.getElementById(`editorjs-${pageIndex}`);
  if (!editorElement) {
    return {
      shouldSplit: false,
      currentContent: content,
      overflowContent: content,
    };
  }

  const contentHeight =
    editorElement
      .querySelector(".codex-editor__redactor")
      ?.getBoundingClientRect().height || 0;
  const containerHeight = containerRef.getBoundingClientRect().height;
  const threshold = containerHeight - 20;

  if (contentHeight <= threshold) {
    return {
      shouldSplit: false,
      currentContent: content,
      overflowContent: content,
    };
  }

  const splitIndex = await findSplitIndex(content.blocks, threshold, pageIndex);

  if (splitIndex <= 0 || splitIndex >= content.blocks.length) {
    return {
      shouldSplit: false,
      currentContent: content,
      overflowContent: content,
    };
  }
  const currentBlocks = content.blocks?.slice(0, splitIndex) || [];
  const overflowBlocks = content.blocks?.slice(splitIndex) || [];
  return {
    currentContent: {
      time: Date.now(),
      blocks: currentBlocks,
      version: "2.30.7",
    },
    overflowContent: {
      time: Date.now(),
      blocks: overflowBlocks,
      version: "2.30.7",
    },
    shouldSplit: true,
  };
}

async function findSplitIndex(
  blocks: any[],
  maxHeight: number,
  pageIndex: number
): Promise<number> {
  const editorElement = document.getElementById(`editorjs-${pageIndex}`);
  if (!editorElement) return -1;

  let currentHeight = 0;
  let splitIndex = -1;
  let lastValidIndex = -1;

  for (let i = 0; i < blocks.length; i++) {
    const blockElement = editorElement.querySelector(
      `[data-id="${blocks[i].id}"]`
    );
    if (!blockElement) continue;

    const blockHeight = blockElement.getBoundingClientRect().height;

    if (currentHeight + blockHeight > maxHeight) {
      splitIndex = i === 0 ? 1 : lastValidIndex > 0 ? lastValidIndex : i;
      break;
    }

    currentHeight += blockHeight;
    lastValidIndex = i + 1;
  }

  if (splitIndex === -1 && blocks.length > 1) {
    splitIndex = Math.ceil(blocks.length / 2);
  }

  return splitIndex;
}
