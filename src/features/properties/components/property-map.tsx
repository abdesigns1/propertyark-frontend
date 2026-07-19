import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PropertyMap({ address }: { address: string }) {
  const query = encodeURIComponent(address);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Map Location</h2>
        <Button
          asChild
          size="sm"
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <a
            href={`https://www.google.com/maps?q=${query}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Map
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <iframe
          title="Property location map"
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="h-[320px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
