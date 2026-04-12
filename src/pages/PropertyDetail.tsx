import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContactAgentForm from "@/components/ContactAgentForm";
import MortgageCalculator from "@/components/MortgageCalculator";
import ScheduleTourForm from "@/components/ScheduleTourForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize, Calendar, ChevronLeft, ChevronRight, ArrowLeft, User, Phone } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimilarProperties from "@/components/SimilarProperties";

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

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-[16/9] rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-16 w-28" />
              <Skeleton className="h-16 w-28" />
              <Skeleton className="h-16 w-28" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) return (
    <div className="container py-20 text-center text-muted-foreground">
      <p className="text-lg">Property not found.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/listings">Back to Listings</Link></Button>
    </div>
  );

  const images = property.images?.length ? property.images : ["/placeholder.svg"];

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="container py-6 md:py-8">
      {/* Back button */}
      <Link to="/listings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />Back to Listings
      </Link>

      {/* Image Gallery / Carousel */}
      <div className="relative overflow-hidden rounded-xl bg-muted mb-8">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage}
            src={images[selectedImage]}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="aspect-[16/9] w-full object-cover"
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm p-2 hover:bg-card transition-colors shadow-md">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm p-2 hover:bg-card transition-colors shadow-md">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-2 rounded-full transition-all ${i === selectedImage ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === selectedImage ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={img} alt="" className="h-16 w-24 object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{property.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {property.address && `${property.address}, `}{property.city}{property.state ? `, ${property.state}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl font-bold text-primary md:text-4xl">{fmt(property.price)}</p>
                <div className="mt-2 flex gap-2 justify-end">
                  <Badge className="capitalize">{property.property_type}</Badge>
                  <Badge variant="outline" className="text-accent border-accent">For Sale</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Bed, label: "Bedrooms", value: property.bedrooms },
              { icon: Bath, label: "Bathrooms", value: property.bathrooms },
              { icon: Maximize, label: "Area", value: property.area_sqft ? `${property.area_sqft.toLocaleString()} sqft` : "N/A" },
              { icon: Calendar, label: "Listed", value: new Date(property.created_at).toLocaleDateString() },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-primary mb-2" />
                  <p className="font-semibold text-foreground text-lg">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">About This Property</h2>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Map placeholder */}
          {(property.latitude && property.longitude) && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">Location</h2>
              <div className="aspect-[16/9] rounded-xl bg-muted border flex items-center justify-center text-muted-foreground">
                <MapPin className="h-8 w-8 mr-2" /> Map View
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {agentProfile && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Listed by</p>
                    <p className="font-heading text-lg font-semibold text-foreground">{agentProfile.full_name || "Agent"}</p>
                  </div>
                </div>
                {agentProfile.phone && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />{agentProfile.phone}
                  </div>
                )}
              </div>
            </Card>
          )}
          <ScheduleTourForm propertyId={property.id} />
          <MortgageCalculator price={Number(property.price)} />
          <Card>
            <CardContent className="p-5">
              <ContactAgentForm propertyId={property.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <SimilarProperties
        propertyId={property.id}
        city={property.city}
        propertyType={property.property_type}
        price={Number(property.price)}
      />
    </div>
  );
}
