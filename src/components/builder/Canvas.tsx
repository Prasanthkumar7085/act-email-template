import React from "react";
import type { Block } from "./BuilderPage";

export default function Canvas({
  blocks,
  setBlocks,
  selectedId,
  setSelectedId,
  onRemove,
}: {
  blocks: Block[];
  setBlocks: (b: Block[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onRemove: (id: string) => void;
}) {
  function move(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[to];
    next[to] = next[idx];
    next[idx] = tmp;
    setBlocks(next);
  }

  return (
    <div className="mt-4">
      <div className="border border-slate-200 p-4 min-h-[320px]">
        {blocks.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            Add components from the left to begin building your email.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {blocks.map((blk, idx) => (
              <div
                key={blk.id}
                className={`p-3 border rounded bg-white ${selectedId === blk.id ? "ring-2 ring-cyan-400" : ""}`}
                onClick={() => setSelectedId(blk.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm capitalize">
                    {blk.type}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        move(idx, -1);
                      }}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        move(idx, 1);
                      }}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(blk.id);
                      }}
                      className="px-2 py-1 text-xs border rounded text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-700">
                  {blk.type === "header" && (
                    <h3 className="text-lg font-semibold">{blk.props.text}</h3>
                  )}
                  {blk.type === "text" && <p>{blk.props.text}</p>}
                  {blk.type === "button" && (
                    <a className="inline-block px-3 py-2 bg-cyan-500 text-white rounded">
                      {blk.props.text}
                    </a>
                  )}
                  {blk.type === "image" && (
                    <img
                      src={blk.props.src}
                      alt={blk.props.alt}
                      className="max-w-full h-auto"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
