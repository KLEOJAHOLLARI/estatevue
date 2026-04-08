import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Mail, MailOpen, Building2, MessageSquare } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

const emptyForm = {
  title: "", description: "", price: "", city: "", state: "", address: "",
  property_type: "house", bedrooms: "3", bathrooms: "2", area_sqft: "", images: [] as string[],
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["my-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*, properties(title)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title, description: form.description || null, price: Number(form.price),
        city: form.city, state: form.state || null, address: form.address || null,
        property_type: form.property_type, bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
        images: form.images.length > 0 ? form.images : [],
        created_by: user!.id,
      };
      if (editId) {
        const { error } = await supabase.from("properties").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Property updated" : "Property created (pending approval)");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setForm(emptyForm);
      setEditId(null);
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Property deleted"); queryClient.invalidateQueries({ queryKey: ["my-properties"] }); },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("messages").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-messages"] }),
  });

  const openEdit = (p: any) => {
    setForm({
      title: p.title, description: p.description || "", price: String(p.price),
      city: p.city, state: p.state || "", address: p.address || "",
      property_type: p.property_type, bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      area_sqft: p.area_sqft ? String(p.area_sqft) : "", images: (p.images || []) as string[],
    });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const statusColor = (s: string) => s === "approved" ? "bg-primary text-primary-foreground" : s === "rejected" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editId ? "Edit Property" : "Add New Property"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="Price *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-3 gap-3">
                <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Beds" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
                <Input placeholder="Baths" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <Input placeholder="Area (sqft)" type="number" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} />
              <Input placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : editId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" />Properties ({properties?.length || 0})</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><MessageSquare className="h-4 w-4" />Messages ({messages?.filter((m: any) => !m.is_read).length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6 space-y-4">
          {!properties?.length ? (
            <div className="py-12 text-center text-muted-foreground">No properties yet. Add your first listing!</div>
          ) : properties.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{p.title}</h3>
                    <Badge className={statusColor(p.status)}>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.city} · {fmt(p.price)} · {p.bedrooms}bd/{p.bathrooms}ba</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="messages" className="mt-6 space-y-4">
          {!messages?.length ? (
            <div className="py-12 text-center text-muted-foreground">No messages yet.</div>
          ) : messages.map((m: any) => (
            <Card key={m.id} className={m.is_read ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {m.is_read ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-accent" />}
                      <span className="font-semibold text-foreground">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Re: {m.properties?.title || "Property"}</p>
                    <p className="mt-2 text-sm text-foreground">{m.message}</p>
                  </div>
                  {!m.is_read && (
                    <Button variant="outline" size="sm" onClick={() => markRead.mutate(m.id)}>Mark Read</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
