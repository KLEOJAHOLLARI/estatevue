import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function ContactAgentForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: user?.email || "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      property_id: propertyId,
      sender_id: user?.id || null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) { toast.error("Failed to send message"); return; }
    toast.success("Message sent to agent!");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading text-lg font-semibold">Contact Agent</h3>
      <Input placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Textarea placeholder="Message *" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <Button type="submit" className="w-full" disabled={loading}>
        <Send className="h-4 w-4 mr-2" />{loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
