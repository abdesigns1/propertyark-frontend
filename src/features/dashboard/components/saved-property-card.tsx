"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PropertyCardActions } from "@/features/properties/components/property-card-actions";
import { PURPOSE_BADGE_STYLES, PURPOSE_LABELS } from "@/features/properties/utils/property-labels";
import type { Property } from "@/features/properties/types";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";

export function SavedPropertyCard({ property }: { property: Property }) {
  return (
    <Card className="grid gap-0 overflow-hidden py-0 shadow-sm md:min-h-52 md:grid-cols-[32%_1fr]">
      <div className="relative min-h-52 overflow-hidden md:min-h-full">
        <Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 100vw, 32vw" className="object-cover" />
        <Badge className={cn("absolute left-3 top-3", PURPOSE_BADGE_STYLES[property.purpose])}>{PURPOSE_LABELS[property.purpose]}</Badge>
      </div>
      <div className="relative flex min-w-0 flex-col px-5 py-5 md:px-6">
        <PropertyCardActions propertyId={property.id} propertyTitle={property.title} className="absolute right-4 top-4" />
        <div className="pr-12">
          <Link href={`/properties/${property.id}`} className="line-clamp-1 text-lg font-semibold text-primary hover:text-primary-hover">{property.title}</Link>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" /><span className="truncate">{property.location.address}, {property.location.city}</span></p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><BedDouble className="size-4" />{property.bedrooms}</span><Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1.5"><Bath className="size-4" />{property.bathrooms}</span><Separator orientation="vertical" className="h-4" />
            {property.sizeSqm && <span className="flex items-center gap-1.5"><Ruler className="size-4" />{property.sizeSqm.toLocaleString()} {property.sizeUnit ?? "sqm"}</span>}
          </div>
        </div>
        <Separator className="mt-auto mb-4" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Price amount={property.price} currency={property.currency} className="font-numeric text-2xl font-bold text-primary" />
          <div className="flex gap-2"><Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary" asChild><Link href={`/properties/${property.id}`}>View Detail</Link></Button><Button asChild><Link href={`/properties/${property.id}`}>Book Inspection</Link></Button></div>
        </div>
      </div>
    </Card>
  );
}
