import { InvitationConfig } from "./invitation";

export interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url: string;
  image_url: string;
  theme_id?: string;
  invitation_config?: InvitationConfig;
}

export interface Guest {
  name: string;
  email: string;
  whatsapp_number?: string;
}

export interface SliderImage {
  type: "file" | "link";
  url: string;
  file?: File;
}
