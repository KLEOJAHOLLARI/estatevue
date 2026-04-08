import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Listings() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: "", city: "all", type: "all", minPrice: "", maxPrice: "", bedrooms: "all",
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("status", "approved").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("property_id").eq("user_id", user!.id);
      return new Set(data?.map((f) => f.property_id) || []);
    },
  });

  const cities = useMemo(() => [...new Set(properties?.map((p) => p.city) || [])].sort(), [properties]);

  const filtered = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => {
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) && !p.city.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.city !== "all" && p.city !== filters.city) return false;
      if (filters.type !== "all" && p.property_type !== filters.type) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.bedrooms !== "all" && p.bedrooms < Number(filters.bedrooms)) return false;
      return true;
    });
  }, [properties, filters]);

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">Property Listings</h1>
      <p className="mt-2 text-muted-foreground">Browse our curated collection of properties</p>
      <div className="mt-6">
        <PropertyFilters filters={filters} onChange={setFilters} cities={cities} />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No properties match your criteria.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorited={favorites?.has(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
