import { IMAGE_LINE } from "@/lib/images";

type Block =
  | { kind: "para"; lines: string[] }
  | { kind: "steps"; items: { marker: string; text: string }[] }
  | { kind: "bullets"; items: string[] }
  | { kind: "image"; alt: string; target: string };

const NUMBERED = /^(\d+)[.)]\s+(.*)$/;
const BULLET = /^[-*•]\s+(.*)$/;

// Procedures are almost always step lists. Parsing them into real blocks
// (instead of one preformatted blob) is what makes a 12-step procedure
// scannable while someone is halfway through doing it.
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      blocks.push({ kind: "para", lines: para });
      para = [];
    }
  };

  content.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();

    const image = line.match(IMAGE_LINE);
    if (image) {
      flushPara();
      blocks.push({ kind: "image", alt: image[1], target: image[2] });
      return;
    }

    const numbered = line.match(NUMBERED);
    if (numbered) {
      flushPara();
      const last = blocks[blocks.length - 1];
      const item = { marker: numbered[1], text: numbered[2] };
      if (last && last.kind === "steps") {
        last.items.push(item);
      } else {
        blocks.push({ kind: "steps", items: [item] });
      }
      return;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "bullets") {
        last.items.push(bullet[1]);
      } else {
        blocks.push({ kind: "bullets", items: [bullet[1]] });
      }
      return;
    }

    if (line === "") {
      flushPara();
      return;
    }

    para.push(rawLine);
  });

  flushPara();
  return blocks;
}

export default function ProcedureBody({
  content,
  imageUrls,
}: {
  content: string;
  imageUrls: Record<string, string>;
}) {
  const blocks = parseBlocks(content);

  return (
    <div className="text-ink">
      {blocks.map((block, i) => {
        if (block.kind === "para") {
          return (
            <p key={i} className="leading-relaxed mb-4 whitespace-pre-wrap">
              {block.lines.join("\n")}
            </p>
          );
        }

        if (block.kind === "steps") {
          return (
            <ol key={i} className="mb-5 space-y-3">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="shrink-0 text-sm font-semibold text-accent tabular-nums pt-0.5 w-6 text-right">{item.marker}.</span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.kind === "bullets") {
          return (
            <ul key={i} className="mb-5 space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="shrink-0 text-accent pt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        const src = imageUrls[block.target] ?? (/^https?:\/\//.test(block.target) ? block.target : null);
        if (!src) {
          return <p key={i} className="text-sm text-ink-soft italic my-4">Screenshot unavailable.</p>;
        }
        return (
          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block my-5">
            <img src={src} alt={block.alt || "Procedure screenshot"} className="rounded border border-line max-h-[420px] w-auto object-contain cursor-zoom-in hover:opacity-90" />
          </a>
        );
      })}
    </div>
  );
}
