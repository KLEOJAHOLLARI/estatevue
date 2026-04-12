import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarPropertiesProps {
  propertyId: string;
  city: string;
  propertyType: string;
  price: number;
}

export default function SimilarProperties({ propertyId, city, propertyType, price }: SimilarPropertiesProps) {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["similar-properties", propertyId],
    queryFn: async () => {
      // Fetch properties in same city or same type, excluding current
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .neq("id", propertyId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data?.length) return [];

      // Score and rank by relevance
      const scored = data.map((p) => {
        let score = 0;
        if (p.city === city) score += 3;
        if (p.property_type === propertyType) score += 2;
        // Price within 30% range
        const priceDiff = Math.abs(p.price - price) / price;
        if (priceDiff < 0.1) score += 3;
        else if (priceDiff < 0.3) score += 2;
        else if (priceDiff < 0.5) score += 1;
        return { ...p, score };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 4);
    },
  });

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Similar Properties</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!properties?.length) return null;

  return (
    <div className="mt-12">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Similar Properties</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
