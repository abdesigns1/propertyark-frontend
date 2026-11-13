import Image from "next/image";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 text-2xl font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-xl font-semibold tracking-tight">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-8 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc pl-6 text-muted-foreground marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal pl-6 text-muted-foreground marker:font-semibold marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mt-2 leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-primary bg-muted/50 px-5 py-3 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href = "", children }) => {
    const className = "font-medium text-primary underline underline-offset-4";
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={className} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  },
  img: ({ src, alt = "" }) =>
    typeof src === "string" ? (
      <span className="relative mt-8 block aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
        />
      </span>
    ) : null,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

export function BlogArticleContent({ content }: { content: string }) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
