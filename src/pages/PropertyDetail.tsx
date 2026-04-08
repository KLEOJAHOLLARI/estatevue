import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContactAgentForm from "@/components/ContactAgentForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Bed, Bath, Maximize, Calendar } from "lucide-react";
import { useState } from "react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: agentProfile } = useQuery({
    queryKey: ["agent", property?.created_by],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", property!.created_by).single();
      return data;
    },
    enabled: !!property?.created_by,
  });

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (isLoading) return <div className="container py-8"><Skeleton className="h-96 rounded-lg" /></div>;
  if (!property) return <div className="container py-20 text-center text-muted-foreground">Property not found.</div>;

  const images = property.images?.length ? property.images : ["/placeholder.svg"];

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="overflow-hidden rounded-lg">
            <img src={images[selectedImage]} alt={property.title} className="aspect-[16/9] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">{property.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.address && `${property.address}, `}{property.city}{property.state ? `, ${property.state}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl font-bold text-primary">{fmt(property.price)}</p>
                <Badge className="mt-1 capitalize">{property.property_type}</Badge>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-foreground"><Bed className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{property.bedrooms}</span> Bedrooms</div>
              <div className="flex items-center gap-2 text-foreground"><Bath className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{property.bathrooms}</span> Bathrooms</div>
              {property.area_sqft && <div className="flex items-center gap-2 text-foreground"><Maximize className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{property.area_sqft}</span> sqft</div>}
              <div className="flex items-center gap-2 text-foreground"><Calendar className="h-5 w-5 text-muted-foreground" />{new Date(property.created_at).toLocaleDateString()}</div>
            </div>

            {property.description && (
              <div className="mt-6">
                <h2 className="font-heading text-xl font-semibold text-foreground">Description</h2>
                <p className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {agentProfile && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-heading text-lg font-semibold">Listed by</h3>
                <p className="mt-1 text-foreground">{agentProfile.full_name || "Agent"}</p>
                {agentProfile.phone && <p className="text-sm text-muted-foreground">{agentProfile.phone}</p>}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <ContactAgentForm propertyId={property.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
