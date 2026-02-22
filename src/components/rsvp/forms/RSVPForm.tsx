
import React, { useState, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RSVPFormProps {
  attendee: any;
  setAttendee: (value: any) => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ attendee, setAttendee }) => {
  const [attending, setAttending] = useState<string | null>(attendee?.response || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!attendee?.id) {
      toast.error("Please verify your invitation first.");
      return;
    }

    if (!attending) {
      toast.error("Please select whether you will be attending.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("attendees")
        .update({ response: attending })
        .eq("id", attendee.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating RSVP:", error);
        toast.error("Failed to update RSVP. Please try again.");
        return;
      }

      setAttendee(data);
      toast.success("RSVP updated successfully!");
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Hi {attendee?.name}!
        </CardTitle>
        <CardDescription className="text-center">
          Please let us know if you'll be attending our event.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="attending">Will you be attending?</Label>
            <div className="flex gap-2">
              <Button
                variant={attending === "yes" ? "default" : "outline"}
                type="button"
                onClick={() => setAttending("yes")}
              >
                Yes
              </Button>
              <Button
                variant={attending === "no" ? "default" : "outline"}
                type="button"
                onClick={() => setAttending("no")}
              >
                No
              </Button>
              <Button
                variant={attending === "maybe" ? "default" : "outline"}
                type="button"
                onClick={() => setAttending("maybe")}
              >
                Maybe
              </Button>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RSVPForm;
