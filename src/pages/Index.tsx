import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Building2, Shield, Users, Search, MapPin, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState({ location: "", type: "all", maxPrice: "" });

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (heroSearch.location) params.set("city", heroSearch.location);
    if (heroSearch.type !== "all") params.set("type", heroSearch.type);
    if (heroSearch.maxPrice) params.set("maxPrice", heroSearch.maxPrice);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Trusted by 1,200+ homebuyers</span>
          </motion.div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Discover Your<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dream Property</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Browse exceptional homes curated by top agents. From cozy apartments to luxury estates — your next chapter starts here.
          </p>

          {/* Hero Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border bg-card p-2 shadow-lg shadow-primary/5">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="City or location..."
                  value={heroSearch.location}
                  onChange={(e) => setHeroSearch({ ...heroSearch, location: e.target.value })}
                  className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 h-11"
                />
              </div>
              <div className="hidden sm:block w-px bg-border" />
              <Select value={heroSearch.type} onValueChange={(v) => setHeroSearch({ ...heroSearch, type: v })}>
                <SelectTrigger className="w-full sm:w-[140px] border-0 bg-transparent shadow-none focus:ring-0 h-11">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:block w-px bg-border" />
              <Input
                placeholder="Max price"
                type="number"
                value={heroSearch.maxPrice}
                onChange={(e) => setHeroSearch({ ...heroSearch, maxPrice: e.target.value })}
                className="w-full sm:w-[130px] border-0 bg-transparent shadow-none focus-visible:ring-0 h-11"
              />
              <Button onClick={handleHeroSearch} size="lg" className="h-11 px-6">
                <Search className="h-4 w-4 mr-2" />Search
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card/50 py-14">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: "Properties", value: "500+", icon: Building2, color: "text-primary" },
            { label: "Happy Clients", value: "1,200+", icon: Users, color: "text-accent" },
            { label: "Expert Agents", value: "50+", icon: Shield, color: "text-primary" },
            { label: "Cities Covered", value: "25+", icon: MapPin, color: "text-accent" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground md:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Featured Properties</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked properties just for you</p>
            </div>
            <Button asChild variant="outline" className="self-start sm:self-auto">
              <Link to="/listings">View All Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : properties?.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <PropertyCard property={p} />
                  </motion.div>
                ))}
          </div>
          {!isLoading && (!properties || properties.length === 0) && (
            <div className="py-20 text-center text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground/30" />
              <p className="text-lg">No properties available yet.</p>
              <p className="text-sm">Check back soon for new listings.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="container relative text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">Ready to List Your Property?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80 leading-relaxed">
            Join our network of trusted agents and reach thousands of potential buyers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/register">Become an Agent</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/listings">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-10">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-foreground">EstateVue</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} EstateVue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
