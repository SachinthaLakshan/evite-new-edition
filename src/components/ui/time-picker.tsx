import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  // Parse HH:mm to 12h format
  const [hours, minutes] = value ? value.split(":") : ["12", "00"];
  
  const hourInt = parseInt(hours);
  const displayHour = hourInt === 0 ? "12" : hourInt > 12 ? (hourInt - 12).toString() : hourInt.toString();
  const ampm = hourInt >= 12 ? "PM" : "AM";
  const displayMinute = minutes || "00";

  const handleHourChange = (newHour: string) => {
    let finalHour = parseInt(newHour);
    if (ampm === "PM" && finalHour < 12) finalHour += 12;
    if (ampm === "AM" && finalHour === 12) finalHour = 0;
    
    onChange(`${finalHour.toString().padStart(2, "0")}:${displayMinute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hours}:${newMinute.padStart(2, "0")}`);
  };

  const handleAmPmChange = (newAmPm: string) => {
    let finalHour = parseInt(displayHour);
    if (newAmPm === "PM" && finalHour < 12) finalHour += 12;
    if (newAmPm === "AM" && finalHour === 12) finalHour = 0;
    
    onChange(`${finalHour.toString().padStart(2, "0")}:${displayMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Select value={displayHour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[70px] px-2 h-10">
          <SelectValue placeholder="Hr" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <SelectItem key={h} value={h.toString()}>
              {h.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="text-gray-400">:</span>

      <Select value={displayMinute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[70px] px-2 h-10">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
            <SelectItem key={m} value={m.toString().padStart(2, "0")}>
              {m.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={ampm} onValueChange={handleAmPmChange}>
        <SelectTrigger className="w-[70px] px-2 h-10">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
