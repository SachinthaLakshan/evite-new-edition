import { InvitationConfig } from "./invitation";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type AttendeeResponse = "pending" | "accepted" | "declined";

export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string | null;
  location: string;
  location_url?: string | null;
  image_url?: string | null;
  slider_images?: string[] | null;
  status: EventStatus;
  user_id?: string | null;
  agenda?: AgendaItem[] | null;
  attendees?: Attendee[];
  theme_id?: string | null;
  invitation_config?: InvitationConfig | null;
  created_at?: string;
  updated_at?: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  whatsapp_number?: string | null;
  response: AttendeeResponse;
  link_shared?: boolean;
  event_id?: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  description: string;
}
