import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface Filters {
  search: string;
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  cities: string[];
}

export default function PropertyFilters({ filters, onChange, cities }: Props) {
  const [expanded, setExpanded] = useState(false);
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const hasActiveFilters = filters.city !== "all" || filters.type !== "all" || filters.minPrice || filters.maxPrice || filters.bedrooms !== "all";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, city..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="lg"
          onClick={() => setExpanded(!expanded)}
          className="h-11 gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
              {[filters.city !== "all", filters.type !== "all", !!filters.minPrice, !!filters.maxPrice, filters.bedrooms !== "all"].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => onChange({ search: filters.search, city: "all", type: "all", minPrice: "", maxPrice: "", bedrooms: "all" })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4 animate-fade-in">
          <Select value={filters.city} onValueChange={(v) => set("city", v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Min Price" type="number" className="w-[120px]" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
          <Input placeholder="Max Price" type="number" className="w-[120px]" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
          <Select value={filters.bedrooms} onValueChange={(v) => set("bedrooms", v)}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Bedrooms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Beds</SelectItem>
              <SelectItem value="1">1+ Bed</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
              <SelectItem value="5">5+ Beds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
