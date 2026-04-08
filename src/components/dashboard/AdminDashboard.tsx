import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Building2, CheckCircle, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: allProperties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*, profiles!properties_created_by_fkey(full_name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*, user_roles(role)");
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("properties").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Property status updated"); queryClient.invalidateQueries({ queryKey: ["admin-properties"] }); },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Upsert role
      const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delError) throw delError;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("User role updated"); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const statusColor = (s: string) => s === "approved" ? "bg-primary text-primary-foreground" : s === "rejected" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground";

  const pending = allProperties?.filter((p) => p.status === "pending") || [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="text-muted-foreground">Manage users and properties</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{allProperties?.length || 0}</p><p className="text-sm text-muted-foreground">Total Listings</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">{pending.length}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{allUsers?.length || 0}</p><p className="text-sm text-muted-foreground">Total Users</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{allProperties?.filter((p) => p.status === "approved").length || 0}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
      </div>

      <Tabs defaultValue="properties" className="mt-8">
        <TabsList>
          <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" />Properties</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6 space-y-4">
          {allProperties?.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4 flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{p.title}</h3>
                    <Badge className={statusColor(p.status)}>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.city} · {fmt(p.price)} · by {p.profiles?.full_name || "Unknown"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={p.status === "approved"} onClick={() => updateStatus.mutate({ id: p.id, status: "approved" })}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="outline" disabled={p.status === "rejected"} onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })}>
                    <XCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          {allUsers?.map((u: any) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between p-4 flex-wrap gap-4">
                <div>
                  <p className="font-semibold text-foreground">{u.full_name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{u.user_id}</p>
                </div>
                <Select defaultValue={u.user_roles?.[0]?.role || "user"} onValueChange={(v) => updateRole.mutate({ userId: u.user_id, role: v as AppRole })}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
