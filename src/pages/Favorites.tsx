import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", "full"],
    enabled: !!user,
    queryFn: async () => {
      const { data: favs } = await supabase.from("favorites").select("property_id, properties(*)").eq("user_id", user!.id);
      return favs?.map((f: any) => f.properties).filter(Boolean) || [];
    },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Saved Properties</h1>
      </div>
      <p className="text-muted-foreground mb-8">Properties you've saved for later</p>
      <div>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : !data?.length ? (
          <div className="py-20 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No saved properties yet</p>
            <p className="text-sm text-muted-foreground mt-1">Browse listings and tap the heart icon to save</p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/listings">Browse Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p: any) => <PropertyCard key={p.id} property={p} isFavorited />)}
          </div>
        )}
      </div>
    </div>
  );
}
