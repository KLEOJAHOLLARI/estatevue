import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import PropertyFilters from "@/components/PropertyFilters";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Map, Building2 } from "lucide-react";

const PropertyMap = lazy(() => import("@/components/PropertyMap"));

export default function Listings() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [filters, setFilters] = useState({
    search: "",
    city: searchParams.get("city") || "all",
    type: searchParams.get("type") || "all",
    minPrice: "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: "all",
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Property Listings</h1>
          <p className="mt-1 text-muted-foreground">
            {isLoading ? "Loading..." : `${filtered.length} properties found`}
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />Grid
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <Map className="h-4 w-4 mr-1.5" />Map
          </Button>
        </div>
      </div>

      <PropertyFilters filters={filters} onChange={setFilters} cities={cities} />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium">No properties match your criteria</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            <Button variant="outline" className="mt-4" onClick={() => setFilters({ search: "", city: "all", type: "all", minPrice: "", maxPrice: "", bedrooms: "all" })}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorited={favorites?.has(p.id)} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} isFavorited={favorites?.has(p.id)} />
              ))}
            </div>
            <div className="sticky top-24">
              <Suspense fallback={<div className="rounded-xl bg-muted border flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">Loading map...</div>}>
                <PropertyMap properties={filtered} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
