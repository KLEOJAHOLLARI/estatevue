import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Building2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Admin() {
  const { user, hasRole, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, profiles!properties_created_by_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && hasRole("admin"),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && hasRole("admin"),
  });

  const updatePropertyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("properties").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-all-properties"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-all-properties"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error: roleErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (roleErr) throw roleErr;
      const { error: profileErr } = await supabase.from("profiles").delete().eq("user_id", userId);
      if (profileErr) throw profileErr;
    },
    onSuccess: () => {
      toast.success("User data deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delError) throw delError;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const statusColor = (s: string) =>
    s === "approved"
      ? "bg-primary text-primary-foreground"
      : s === "rejected"
        ? "bg-destructive text-destructive-foreground"
        : "bg-muted text-muted-foreground";

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!hasRole("admin")) return <Navigate to="/" />;

  const pending = properties?.filter((p) => p.status === "pending") || [];

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
      <p className="text-muted-foreground mb-6">Manage users and properties</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{properties?.length || 0}</p><p className="text-sm text-muted-foreground">Total Listings</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">{pending.length}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{users?.length || 0}</p><p className="text-sm text-muted-foreground">Total Users</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{properties?.filter((p) => p.status === "approved").length || 0}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
      </div>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" />Properties</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          {propsLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading properties...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties?.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.city}</TableCell>
                    <TableCell>{fmt(p.price)}</TableCell>
                    <TableCell><Badge className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell>{p.profiles?.full_name || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" disabled={p.status === "approved"} onClick={() => updatePropertyStatus.mutate({ id: p.id, status: "approved" })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" disabled={p.status === "rejected"} onClick={() => updatePropertyStatus.mutate({ id: p.id, status: "rejected" })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this property?")) deleteProperty.mutate(p.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!properties || properties.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No properties found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {usersLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Change Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || "No name"}</TableCell>
                    <TableCell><Badge variant="secondary">{u.user_roles?.[0]?.role || "user"}</Badge></TableCell>
                    <TableCell>
                      <Select defaultValue={u.user_roles?.[0]?.role || "user"} onValueChange={(v) => updateRole.mutate({ userId: u.user_id, role: v as AppRole })}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this user's data?")) deleteUser.mutate(u.user_id); }}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!users || users.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
