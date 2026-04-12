import { Link, useNavigate } from "react-router-dom";
import { useCompare } from "@/lib/compare";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bed, Bath, Maximize, MapPin, X, Building2 } from "lucide-react";

export default function Compare() {
  const { selected, remove, clear } = useCompare();
  const navigate = useNavigate();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (selected.length < 2) {
    return (
      <div className="container py-20 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground">Select Properties to Compare</h1>
        <p className="mt-2 text-muted-foreground">
          Add at least 2 properties from the listings page to compare them side-by-side.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/listings">Browse Listings</Link>
        </Button>
      </div>
    );
  }

  const rows: { label: string; icon?: typeof Bed; render: (p: (typeof selected)[0]) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (p) => {
        const min = Math.min(...selected.map((s) => s.price));
        return (
          <span className={`font-heading text-xl font-bold ${p.price === min ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
            {fmt(p.price)}
            {p.price === min && selected.length > 1 && (
              <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-600 dark:text-green-400">
                Best
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      label: "Type",
      render: (p) => <Badge className="capitalize">{p.property_type}</Badge>,
    },
    {
      label: "Location",
      icon: MapPin,
      render: (p) => (
        <span className="text-sm text-muted-foreground">
          {p.address && `${p.address}, `}{p.city}{p.state ? `, ${p.state}` : ""}
        </span>
      ),
    },
    {
      label: "Bedrooms",
      icon: Bed,
      render: (p) => {
        const max = Math.max(...selected.map((s) => s.bedrooms));
        return (
          <span className={`font-semibold ${p.bedrooms === max ? "text-primary" : "text-foreground"}`}>
            {p.bedrooms}
          </span>
        );
      },
    },
    {
      label: "Bathrooms",
      icon: Bath,
      render: (p) => {
        const max = Math.max(...selected.map((s) => s.bathrooms));
        return (
          <span className={`font-semibold ${p.bathrooms === max ? "text-primary" : "text-foreground"}`}>
            {p.bathrooms}
          </span>
        );
      },
    },
    {
      label: "Area",
      icon: Maximize,
      render: (p) => {
        if (!p.area_sqft) return <span className="text-muted-foreground text-sm">N/A</span>;
        const max = Math.max(...selected.map((s) => s.area_sqft || 0));
        return (
          <span className={`font-semibold ${p.area_sqft === max ? "text-primary" : "text-foreground"}`}>
            {p.area_sqft.toLocaleString()} sqft
          </span>
        );
      },
    },
    {
      label: "Price / sqft",
      render: (p) => {
        if (!p.area_sqft) return <span className="text-muted-foreground text-sm">N/A</span>;
        const ppsf = p.price / p.area_sqft;
        const allPpsf = selected.filter((s) => s.area_sqft).map((s) => s.price / s.area_sqft!);
        const min = Math.min(...allPpsf);
        return (
          <span className={`font-semibold ${ppsf === min ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
            {fmt(Math.round(ppsf))}
          </span>
        );
      },
    },
  ];

  return (
    <div className="container py-6 md:py-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear All
        </Button>
      </div>

      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Compare Properties</h1>

      {/* Property headers */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
        <div /> {/* empty corner */}
        {selected.map((p) => (
          <Card key={p.id} className="overflow-hidden relative group">
            <button
              onClick={() => remove(p.id)}
              className="absolute top-2 right-2 z-10 rounded-full bg-card/80 p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <img
              src={p.images?.[0] || "/placeholder.svg"}
              alt={p.title}
              className="aspect-[4/3] w-full object-cover"
            />
            <CardContent className="p-3">
              <Link to={`/property/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 text-sm">
                {p.title}
              </Link>
            </CardContent>
          </Card>
        ))}

        {/* Comparison rows */}
        {rows.map((row, i) => (
          <>
            <div
              key={`label-${row.label}`}
              className={`flex items-center gap-2 text-sm font-medium text-muted-foreground py-4 ${i % 2 === 0 ? "bg-muted/30" : ""} px-3 rounded-l-lg`}
            >
              {row.icon && <row.icon className="h-4 w-4" />}
              {row.label}
            </div>
            {selected.map((p) => (
              <div
                key={`${row.label}-${p.id}`}
                className={`flex items-center py-4 px-3 ${i % 2 === 0 ? "bg-muted/30" : ""} ${p.id === selected[selected.length - 1].id ? "rounded-r-lg" : ""}`}
              >
                {row.render(p)}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}
