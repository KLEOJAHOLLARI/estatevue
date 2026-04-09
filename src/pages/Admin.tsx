import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users, Building2, CheckCircle, XCircle, Trash2, Search,
  TrendingUp, ShieldCheck, Eye, MapPin, Bed, Bath
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Admin() {
  const { user, hasRole, loading } = useAuth();
  const queryClient = useQueryClient();
  const [propSearch, setPropSearch] = useState("");
  const [propStatusFilter, setPropStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [selectedProp, setSelectedProp] = useState<any>(null);

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
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)");
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
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleApproval = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_approved: approved } as any).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? "User approved" : "User approval revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="container py-8 space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (!hasRole("admin")) return <Navigate to="/" />;

  const pending = properties?.filter((p) => p.status === "pending") || [];
  const approved = properties?.filter((p) => p.status === "approved") || [];
  const rejected = properties?.filter((p) => p.status === "rejected") || [];
  const agents = users?.filter((u: any) => u.user_roles?.[0]?.role === "agent") || [];

  // Filtered properties
  const filteredProps = properties?.filter((p: any) => {
    if (propStatusFilter !== "all" && p.status !== propStatusFilter) return false;
    if (propSearch && !p.title.toLowerCase().includes(propSearch.toLowerCase()) && !p.city.toLowerCase().includes(propSearch.toLowerCase())) return false;
    return true;
  }) || [];

  // Filtered users
  const filteredUsers = users?.filter((u: any) => {
    if (userSearch && !(u.full_name || "").toLowerCase().includes(userSearch.toLowerCase())) return false;
    return true;
  }) || [];

  // Chart data
  const statusChartData = [
    { name: "Approved", value: approved.length, color: "hsl(var(--primary))" },
    { name: "Pending", value: pending.length, color: "hsl(var(--accent))" },
    { name: "Rejected", value: rejected.length, color: "hsl(var(--destructive))" },
  ];

  const typeChartData = Object.entries(
    (properties || []).reduce((acc: Record<string, number>, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview and management of your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Listings", value: properties?.length || 0, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending Review", value: pending.length, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Total Users", value: users?.length || 0, icon: Users, color: "text-accent", bg: "bg-accent/10" },
          { label: "Agents", value: agents.length, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-heading text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {properties && properties.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Properties by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {statusChartData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Properties by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" />Properties ({properties?.length || 0})</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users ({users?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search properties..." value={propSearch} onChange={(e) => setPropSearch(e.target.value)} className="pl-10" />
                </div>
                <Select value={propStatusFilter} onValueChange={setPropStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {propsLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead className="hidden md:table-cell">City</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Agent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProps.map((p: any) => (
                        <TableRow key={p.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <img src={p.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                              </div>
                              <span className="font-medium text-foreground line-clamp-1">{p.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{p.city}</TableCell>
                          <TableCell className="font-medium">{fmt(p.price)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${statusBadge(p.status)}`}>{p.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{p.profiles?.full_name || "Unknown"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedProp(p)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" disabled={p.status === "approved"} onClick={() => updatePropertyStatus.mutate({ id: p.id, status: "approved" })}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" disabled={p.status === "rejected"} onClick={() => updatePropertyStatus.mutate({ id: p.id, status: "rejected" })}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Delete?")) deleteProperty.mutate(p.id); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProps.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No properties found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Change Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {(u.full_name || "?")[0].toUpperCase()}
                              </div>
                              <span className="font-medium">{u.full_name || "No name"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.is_approved ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{u.user_roles?.[0]?.role || "user"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select defaultValue={u.user_roles?.[0]?.role || "user"} onValueChange={(v) => updateRole.mutate({ userId: u.user_id, role: v as AppRole })}>
                              <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {u.is_approved ? (
                                <Button size="sm" variant="ghost" className="text-amber-600 hover:bg-amber-50" onClick={() => toggleApproval.mutate({ userId: u.user_id, approved: false })}>
                                  <XCircle className="h-4 w-4 mr-1" />Revoke
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50" onClick={() => toggleApproval.mutate({ userId: u.user_id, approved: true })}>
                                  <CheckCircle className="h-4 w-4 mr-1" />Approve
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Delete this user's data?")) deleteUser.mutate(u.user_id); }}>
                                <Trash2 className="h-4 w-4 mr-1" />Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Property Detail Modal */}
      <Dialog open={!!selectedProp} onOpenChange={(open) => !open && setSelectedProp(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedProp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">{selectedProp.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={selectedProp.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-heading text-2xl font-bold text-primary">{fmt(selectedProp.price)}</p>
                  <Badge variant="outline" className={`capitalize ${statusBadge(selectedProp.status)}`}>{selectedProp.status}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  {selectedProp.city}{selectedProp.state ? `, ${selectedProp.state}` : ""}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-1.5 text-sm"><Bed className="h-4 w-4 text-muted-foreground" />{selectedProp.bedrooms} Beds</div>
                  <div className="flex items-center gap-1.5 text-sm"><Bath className="h-4 w-4 text-muted-foreground" />{selectedProp.bathrooms} Baths</div>
                  {selectedProp.area_sqft && <div className="flex items-center gap-1.5 text-sm"><Building2 className="h-4 w-4 text-muted-foreground" />{selectedProp.area_sqft} sqft</div>}
                </div>
                {selectedProp.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedProp.description}</p>
                )}
                <p className="text-xs text-muted-foreground">Agent: {selectedProp.profiles?.full_name || "Unknown"}</p>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" disabled={selectedProp.status === "approved"} onClick={() => { updatePropertyStatus.mutate({ id: selectedProp.id, status: "approved" }); setSelectedProp(null); }}>
                    <CheckCircle className="h-4 w-4 mr-1.5" />Approve
                  </Button>
                  <Button variant="outline" className="flex-1" disabled={selectedProp.status === "rejected"} onClick={() => { updatePropertyStatus.mutate({ id: selectedProp.id, status: "rejected" }); setSelectedProp(null); }}>
                    <XCircle className="h-4 w-4 mr-1.5" />Reject
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => { if (confirm("Delete?")) { deleteProperty.mutate(selectedProp.id); setSelectedProp(null); } }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
