export interface InvitationConfig {
  template_id: string;
  couple_names: {
    person1: string;
    person2: string;
  };
  custom_text: {
    main_message: string;
    additional_info: string;
  };
  text_positions: {
    couple_names: { x: number; y: number };
    venue: { x: number; y: number };
    date: { x: number; y: number };
    guest_name: { x: number; y: number };
  };
  styling: {
    font_family: string;
    primary_color: string;
    secondary_color: string;
    text_color: string;
  };
  guest_name_position: 'top' | 'bottom' | 'header' | 'center';
}

export interface InvitationTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  defaultConfig: Partial<InvitationConfig>;
}

export const AVAILABLE_FONTS = [
  'Playfair Display',
  'Great Vibes',
  'Cormorant Garamond',
  'Cinzel',
  'Dancing Script',
  'Montserrat',
  'Lora',
  'Raleway',
] as const;

export const GUEST_NAME_POSITIONS = [
  { value: 'top', label: 'Top of Card' },
  { value: 'header', label: 'Header Section' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom of Card' },
] as const;
