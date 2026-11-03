"use client";

import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  emptyPlaceholder?: string;
  className?: string;
}

const customComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-neutral-900 mt-5 mb-2.5 pb-1.5 border-b border-neutral-200 tracking-tight font-manrope">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-neutral-900 mt-4 mb-2 pb-1 border-b border-neutral-100 tracking-tight font-manrope">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-neutral-900 mt-3.5 mb-1.5 tracking-tight font-manrope">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-neutral-800 mt-3 mb-1 font-manrope">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-3 font-manrope">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 text-xs sm:text-sm text-neutral-700 space-y-1 font-manrope">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 text-xs sm:text-sm text-neutral-700 space-y-1 font-manrope">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-neutral-700 leading-relaxed font-manrope pl-0.5">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-1.5 my-3 text-xs sm:text-sm italic text-neutral-600 bg-blue-50/30 rounded-r font-manrope">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="p-3.5 my-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800 shadow-xs">
      {children}
    </pre>
  ),
  code({ className, children, ...props }) {
    const isInline = !className && !String(children).includes("\n");
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono text-[11px] text-neutral-800 font-medium"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900 font-manrope">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-neutral-800 font-manrope">{children}</em>
  ),
  hr: () => <hr className="my-5 border-t border-neutral-200" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 border border-neutral-200 rounded-xl">
      <table className="w-full text-xs text-left font-manrope border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 font-semibold">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-neutral-800 font-semibold border-r border-neutral-200 last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-neutral-700 border-t border-neutral-100 border-r border-neutral-200 last:border-r-0">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors font-manrope"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || "Image"}
      className="rounded-xl border border-neutral-200 my-4 max-h-96 object-contain shadow-xs"
    />
  ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  emptyPlaceholder = "*No content yet*",
  className = "",
}) => {
  return (
    <div
      className={`prose prose-neutral max-w-none text-neutral-800 leading-relaxed font-manrope ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
        {content || emptyPlaceholder}
      </ReactMarkdown>
    </div>
  );
};

