import { useState } from "react";
import Icon from "./Icon";
import {
  type DescriptionSection,
  isQuestionParagraph,
  parseDescription,
} from "../lib/parseDescription";

export default function ProductDescription({
  body,
  narrative,
}: {
  body: string | null | undefined;
  narrative?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const sections = parseDescription(body);

  if (sections.length === 0 && !narrative) return null;

  if (sections.length === 0) {
    return (
      <div>
        <Eyebrow />
        <p className="text-sm text-on-surface-variant">{narrative}</p>
      </div>
    );
  }

  const [preview, ...rest] = sections;
  const hasMore = rest.length > 0 || !!narrative;

  return (
    <div>
      <Eyebrow />

      <SectionBlock section={preview} />

      {hasMore && (
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="flex flex-col gap-6 overflow-hidden pt-6">
            {rest.map((section, i) => (
              <SectionBlock key={i} section={section} />
            ))}
            {narrative && (
              <p className="text-sm text-on-surface-variant">{narrative}</p>
            )}
          </div>
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-5 flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-on-surface"
        >
          {expanded ? "Mostrar menos" : "Mostrar descrição completa"}
          <Icon
            name="expand_more"
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

function Eyebrow() {
  return (
    <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
      Descrição
    </span>
  );
}

function SectionBlock({ section }: { section: DescriptionSection }) {
  return (
    <div className={section.title ? "border-l-2 border-secondary/25 pl-4" : ""}>
      {section.title && (
        <h3 className="font-serif mb-1.5 text-base text-on-surface md:text-lg">
          {section.title}
        </h3>
      )}
      <div className="flex flex-col gap-2">
        {section.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={
              isQuestionParagraph(paragraph)
                ? "text-sm font-medium text-on-surface"
                : "text-sm text-on-surface-variant"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
