import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

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
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="pl-10"
        />
      </div>
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
      <Input placeholder="Min $" type="number" className="w-[110px]" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
      <Input placeholder="Max $" type="number" className="w-[110px]" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
      <Select value={filters.bedrooms} onValueChange={(v) => set("bedrooms", v)}>
        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Bedrooms" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Beds</SelectItem>
          <SelectItem value="1">1+</SelectItem>
          <SelectItem value="2">2+</SelectItem>
          <SelectItem value="3">3+</SelectItem>
          <SelectItem value="4">4+</SelectItem>
          <SelectItem value="5">5+</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
