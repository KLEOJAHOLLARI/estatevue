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
  const { toggle, isSelected } = useCompare();
  const queryClient = useQueryClient();
  const image = property.images?.[0] || "/placeholder.svg";
  const compared = isSelected(property.id);

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
    <Card className="group overflow-hidden border bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={property.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge className="bg-primary/90 text-primary-foreground capitalize backdrop-blur-sm text-xs">
            {property.property_type}
          </Badge>
          <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm text-xs">
            For Sale
          </Badge>
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {user && (
            <button
              onClick={(e) => { e.preventDefault(); toggleFav.mutate(); }}
              className="rounded-full bg-card/80 p-2.5 backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(property); }}
            className={`rounded-full p-2.5 backdrop-blur-sm transition-all hover:scale-110 ${compared ? "bg-primary text-primary-foreground" : "bg-card/80 hover:bg-card text-muted-foreground"}`}
            title={compared ? "Remove from compare" : "Add to compare"}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="font-heading text-2xl font-bold text-white drop-shadow-lg">{fmt(property.price)}</p>
        </div>
      </div>
      <Link to={`/property/${property.id}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />{property.city}{property.state ? `, ${property.state}` : ""}
              </p>
            </div>
            <p className="font-heading text-lg font-bold text-primary flex-shrink-0 group-hover:hidden">{fmt(property.price)}</p>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms} Beds</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms} Baths</span>
            {property.area_sqft && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{property.area_sqft.toLocaleString()} sqft</span>}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
