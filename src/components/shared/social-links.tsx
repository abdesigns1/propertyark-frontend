import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "PropertyArk on Facebook",
    title: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61594923290344#",
    icon: FacebookIcon,
    external: true,
  },
  {
    label: "PropertyArk on Instagram",
    title: "Instagram",
    href: "https://www.instagram.com/propertyark_?igsi=MTM4MzlzdGQ5eW8yMQ%3D%3D&utm_source=qr",
    icon: InstagramIcon,
    external: true,
  },
  {
    label: "Email PropertyArk",
    title: "propertyark26@gmail.com",
    href: "mailto:propertyark26@gmail.com",
    icon: Mail,
    external: false,
  },
];

export function SocialLinks({
  variant = "plain",
}: {
  variant?: "plain" | "circle";
}) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      {SOCIAL_LINKS.map(({ label, title, href, icon: Icon, external }) => (
        <a
          key={href}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          aria-label={label}
          title={title}
          className={cn(
            "flex items-center justify-center transition-colors hover:text-foreground",
            variant === "circle"
              ? "size-10 rounded-full border hover:border-primary hover:text-primary"
              : "rounded-md p-1.5 hover:bg-muted",
          )}
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}
