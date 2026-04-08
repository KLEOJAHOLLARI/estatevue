import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  property: {
    id: string;
    title: string;
    price: number;
    city: string;
    state: string | null;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number | null;
    images: string[] | null;
    status: string;
  };
  isFavorited?: boolean;
}

export default function PropertyCard({ property, isFavorited }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const image = property.images?.[0] || "/placeholder.svg";

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Please login to save favorites"); return; }
      if (isFavorited) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", property.id);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, property_id: property.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <Card className="group overflow-hidden border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground capitalize">{property.property_type}</Badge>
        {user && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFav.mutate(); }}
            className="absolute right-3 top-3 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-accent text-accent" : "text-muted-foreground"}`} />
          </button>
        )}
      </div>
      <Link to={`/property/${property.id}`}>
        <CardContent className="p-4">
          <p className="font-heading text-xl font-bold text-foreground">{fmt(property.price)}</p>
          <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-1">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />{property.city}{property.state ? `, ${property.state}` : ""}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms} Beds</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms} Baths</span>
            {property.area_sqft && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{property.area_sqft} sqft</span>}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
