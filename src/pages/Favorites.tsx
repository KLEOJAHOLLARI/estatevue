import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

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
      <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
        <Heart className="h-7 w-7 text-accent" /> Saved Properties
      </h1>
      <p className="mt-2 text-muted-foreground">Properties you've saved for later</p>
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-lg" />)}
          </div>
        ) : !data?.length ? (
          <div className="py-20 text-center text-muted-foreground">You haven't saved any properties yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p: any) => <PropertyCard key={p.id} property={p} isFavorited />)}
          </div>
        )}
      </div>
    </div>
  );
}
