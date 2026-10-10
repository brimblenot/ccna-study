import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders lesson markdown (GFM tables, lists, inline code) with the shared `.md` prose styles. */
export default function Markdown({ children, tight = false }: { children: string; tight?: boolean }) {
  return (
    <div className={tight ? "md md-tight" : "md"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: kids }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {kids}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
