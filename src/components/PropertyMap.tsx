import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Link } from "react-router-dom";
import { Bed, Bath, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Property {
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
  latitude: number | null;
  longitude: number | null;
  status: string;
}

interface Props {
  properties: Property[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function PropertyMap({ properties }: Props) {
  const mappable = properties.filter((p) => p.latitude && p.longitude);

  if (mappable.length === 0) {
    return (
      <div className="rounded-xl border bg-muted flex items-center justify-center min-h-[500px] text-muted-foreground">
        <p className="text-center">No properties with location data available.<br />
          <span className="text-sm">Add coordinates when creating listings to see them on the map.</span>
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    mappable.reduce((s, p) => s + p.latitude!, 0) / mappable.length,
    mappable.reduce((s, p) => s + p.longitude!, 0) / mappable.length,
  ];

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height: "600px" }}>
      <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappable.map((p) => (
          <Marker key={p.id} position={[p.latitude!, p.longitude!]} icon={defaultIcon}>
            <Popup minWidth={240} maxWidth={280}>
              <Link to={`/property/${p.id}`} className="block no-underline text-foreground">
                <div className="space-y-2">
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px] capitalize">
                        {p.property_type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.city}{p.state ? `, ${p.state}` : ""}
                    </p>
                    <p className="font-bold text-primary text-base">{fmt(p.price)}</p>
                    <div className="flex gap-3 text-[11px] text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms}</span>
                      {p.area_sqft && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{p.area_sqft.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
