import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  style,
}: {
  items: BreadcrumbItem[];
  style?: CSSProperties;
}) {
  return (
    <nav style={style} className="border-b border-border bg-surface py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 text-sm">
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
