import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Renders text with clickable links and proper word-breaking for long URLs.
export default function Linkify({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          // reset lastIndex since regex is global
          URL_REGEX.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline break-all hover:text-green-700"
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}
