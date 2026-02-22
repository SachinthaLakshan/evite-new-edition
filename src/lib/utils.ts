
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidGoogleMapsUrl(url: string): boolean {
  if (!url) return true; // Empty URL is considered valid (since it's optional)
  
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === 'goo.gl' ||
      urlObj.hostname === 'maps.google.com' ||
      urlObj.hostname === 'www.google.com/maps' ||
      urlObj.hostname.endsWith('maps.app.goo.gl') ||
      urlObj.hostname.includes('google.com/maps')
    );
  } catch {
    return false;
  }
}

export function convertToDirectImageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Convert Google Drive sharing URL to direct image URL
    if (urlObj.hostname.includes('drive.google.com') && url.includes('file/d/')) {
      const fileId = url.split('file/d/')[1].split('/')[0];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Return the original URL for other cases
    return url;
  } catch {
    return url;
  }
}

export const isValidImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500/10 text-green-700 border border-green-300";
    case "cancelled":
      return "bg-red-500/10 text-red-700 border border-red-300";
    case "ongoing":
      return "bg-yellow-500/10 text-yellow-700 border border-yellow-300";
    case "pending":
      return "bg-blue-500/10 text-blue-700 border border-blue-300";
    case "upcoming":
      return "bg-purple-500/10 text-purple-700 border border-purple-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};
