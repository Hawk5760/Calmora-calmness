import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar as CalendarIcon, Clock, User, CheckCircle, Phone, Video, MessageSquare } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "02:00 PM", available: true },
  { time: "03:00 PM", available: true },
  { time: "04:00 PM", available: true },
  { time: "05:00 PM", available: false },
  { time: "06:00 PM", available: true },
];

const counselors = [
  { id: "1", name: "Dr. Priya Sharma", specialization: "Anxiety & Stress", available: true },
  { id: "2", name: "Dr. Rahul Mehta", specialization: "Depression & Mood", available: true },
  { id: "3", name: "Dr. Anita Verma", specialization: "Relationship Issues", available: false },
];

type SessionType = "video" | "audio" | "chat";

export function CounselorBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>("video");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !selectedCounselor) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a date, time, and counselor.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // In a real app, this would save to database
      // For now, we'll save to localStorage and show success
      const booking = {
        id: crypto.randomUUID(),
        userId: user?.id,
        counselorId: selectedCounselor,
        counselorName: counselors.find(c => c.id === selectedCounselor)?.name,
        date: selectedDate.toISOString(),
        time: selectedTime,
        sessionType,
        notes,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      const existingBookings = JSON.parse(localStorage.getItem("counselorBookings") || "[]");
      existingBookings.push(booking);
      localStorage.setItem("counselorBookings", JSON.stringify(existingBookings));

      setBookingComplete(true);
      toast({
        title: "Session Booked! ✅",
        description: `Your ${sessionType} session with ${booking.counselorName} on ${selectedDate.toLocaleDateString()} at ${selectedTime} is confirmed.`,
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const resetBooking = () => {
    setSelectedDate(undefined);
    setSelectedTime(null);
    setSelectedCounselor(null);
    setNotes("");
    setBookingComplete(false);
  };

  if (bookingComplete) {
    return (
      <Card className="p-6 text-center bg-card/80 backdrop-blur-sm">
        <div className="py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Booked!</h2>
          <p className="text-muted-foreground mb-6">
            You'll receive a confirmation email with session details shortly.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
            <p className="text-sm"><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
            <p className="text-sm"><strong>Time:</strong> {selectedTime}</p>
            <p className="text-sm"><strong>Counselor:</strong> {counselors.find(c => c.id === selectedCounselor)?.name}</p>
            <p className="text-sm"><strong>Type:</strong> {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Call</p>
          </div>
          <Button onClick={resetBooking}>Book Another Session</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gradient-soul">Book a Counseling Session</h2>
        <p className="text-muted-foreground mt-2">
          Connect with certified mental health professionals for personalized support
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Select Counselor */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Select Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {counselors.map((counselor) => (
              <div
                key={counselor.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCounselor === counselor.id
                    ? "border-primary bg-primary/10"
                    : counselor.available
                    ? "border-border hover:border-primary/50"
                    : "border-border opacity-50 cursor-not-allowed"
                }`}
                onClick={() => counselor.available && setSelectedCounselor(counselor.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{counselor.name}</p>
                    <p className="text-sm text-muted-foreground">{counselor.specialization}</p>
                  </div>
                  <Badge variant={counselor.available ? "default" : "secondary"}>
                    {counselor.available ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Select Date */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Time Slots */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Select Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                size="sm"
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className="text-xs"
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Type */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Session Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={sessionType === "video" ? "default" : "outline"}
              onClick={() => setSessionType("video")}
              className="flex flex-col h-auto py-4"
            >
              <Video className="w-5 h-5 mb-1" />
              <span className="text-xs">Video Call</span>
            </Button>
            <Button
              variant={sessionType === "audio" ? "default" : "outline"}
              onClick={() => setSessionType("audio")}
              className="flex flex-col h-auto py-4"
            >
              <Phone className="w-5 h-5 mb-1" />
              <span className="text-xs">Audio Call</span>
            </Button>
            <Button
              variant={sessionType === "chat" ? "default" : "outline"}
              onClick={() => setSessionType("chat")}
              className="flex flex-col h-auto py-4"
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-xs">Text Chat</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes (Optional)</CardTitle>
          <CardDescription>
            Share anything you'd like the counselor to know before the session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., Topics you'd like to discuss, any specific concerns..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Book Button */}
      <Button
        onClick={handleBookSession}
        disabled={!selectedDate || !selectedTime || !selectedCounselor || isBooking}
        className="w-full py-6 text-lg"
      >
        {isBooking ? "Booking..." : "Confirm Booking"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Sessions are confidential. You can cancel or reschedule up to 24 hours before the appointment.
      </p>
    </div>
  );
}
