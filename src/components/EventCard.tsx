"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  status: "upcoming" | "ongoing" | "past";
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  location,
  description,
  attendees,
  status,
  onDelete,
}) => {
  const router = useRouter();

  const statusColors = {
    upcoming: "bg-green-100 text-green-800",
    ongoing: "bg-blue-100 text-blue-800",
    past: "bg-gray-100 text-gray-800",
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl font-semibold mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {date}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2" />
            {attendees} {attendees === 1 ? "attendee" : "attendees"}
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-2">
              {truncateText(description, 100)}
            </p>
          )}
          <div className="pt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push(`/events/${id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
