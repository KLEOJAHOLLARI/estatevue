import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

interface Props {
  propertyId: string;
}

export default function ScheduleTourForm({ propertyId }: Props) {
  const { user, profile } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please login to schedule a tour"); return; }
    if (!profile?.is_approved) { toast.error("Your account must be approved to schedule tours"); return; }
    if (!date) { toast.error("Please select a date"); return; }
    if (!time) { toast.error("Please select a time"); return; }

    setLoading(true);
    const { error } = await supabase.from("tour_bookings").insert({
      property_id: propertyId,
      user_id: user.id,
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: time,
      message: message.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to schedule tour");
    } else {
      toast.success("Tour request submitted! The agent will confirm your booking.");
      setDate(undefined);
      setTime("");
      setMessage("");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Schedule a Tour</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Preferred Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Preferred Time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Message (optional)</Label>
          <Textarea
            placeholder="Any questions or special requests..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit} disabled={loading || !date || !time}>
          {loading ? "Submitting..." : "Request Tour"}
        </Button>
      </CardContent>
    </Card>
  );
}
