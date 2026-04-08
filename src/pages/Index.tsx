import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Shield, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import { motion } from "framer-motion";

export default function Index() {
  const { data: properties } = useQuery({
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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container relative z-10 text-center"
        >
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Find Your Perfect<br />
            <span className="text-primary">Dream Home</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Discover exceptional properties curated by top agents. From cozy apartments to luxury estates — your next chapter starts here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base">
              <Link to="/listings">Browse Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-12">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: "Properties", value: "500+", icon: Building2 },
            { label: "Happy Clients", value: "1,200+", icon: Users },
            { label: "Expert Agents", value: "50+", icon: Shield },
            { label: "Cities Covered", value: "25+", icon: Building2 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-heading text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {properties && properties.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Featured Properties</h2>
                <p className="mt-2 text-muted-foreground">Hand-picked properties just for you</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/listings">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">Ready to List Your Property?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join our network of trusted agents and reach thousands of potential buyers.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link to="/register">Become an Agent</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EstateVue. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
