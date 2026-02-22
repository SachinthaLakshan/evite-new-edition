import React from "react";
import { ImageResponse } from "next/og";
import { supabase } from "@/integrations/supabase/client";

export const runtime = "edge";
// export const alt = "Event Invitation";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

async function fetchData(eventId?: string, attendeeId?: string) {
  let eventTitle = "You are invited";
  let eventLocation = "";
  let eventDate: string | null = null;
  let invitationConfig: any = null;
  let guestName = "Guest";

  if (eventId) {
    const { data: event, error } = await supabase
      .from("events")
      .select("title, location, date, invitation_config")
      .eq("id", eventId)
      .maybeSingle<any>();

    if (!error && event) {
      if (event.title) eventTitle = event.title;
      if (event.location) eventLocation = event.location as string;
      if (event.date) eventDate = event.date as string;
      if ((event as any).invitation_config)
        invitationConfig = (event as any).invitation_config;
    }
  }

  if (attendeeId) {
    const { data: attendee } = await supabase
      .from("attendees")
      .select("name")
      .eq("id", attendeeId)
      .maybeSingle();

    if (attendee?.name) guestName = attendee.name as string;
  }

  return { eventTitle, eventLocation, eventDate, invitationConfig, guestName };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const attendeeId = searchParams.get("attendeeId") || undefined;

  const { eventTitle, eventLocation, eventDate, invitationConfig, guestName } =
    await fetchData(eventId, attendeeId);

  const primary = invitationConfig?.styling?.primary_color || "#4F46E5";
  const secondary = invitationConfig?.styling?.secondary_color || "#EC4899";
  const textColor = invitationConfig?.styling?.text_color || "#0F172A";
  const fontFamily =
    invitationConfig?.styling?.font_family || "Playfair Display";

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date coming soon";

  const element = React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 20% 20%, ${primary}22, transparent 35%), radial-gradient(circle at 80% 30%, ${secondary}22, transparent 30%), linear-gradient(135deg, #ffffff, #f7f7ff)`,
        fontFamily,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          width: "1000px",
          height: "520px",
          padding: "48px",
          background: "rgba(255,255,255,0.9)",
          borderRadius: "28px",
          boxShadow: "0 25px 80px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: textColor,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "inline-flex",
              padding: "10px 16px",
              borderRadius: "999px",
              background: `${primary}22`,
              color: primary,
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            },
          },
          "Invitation",
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "20px",
              color: "#475569",
              fontWeight: 500,
            },
          },
          `For ${guestName}`,
        ),
      ),
      React.createElement(
        "div",
        { style: { textAlign: "center", marginTop: "12px" } },
        React.createElement(
          "div",
          {
            style: {
              fontSize: "60px",
              fontWeight: 700,
              color: primary,
              lineHeight: 1.1,
            },
          },
          eventTitle,
        ),
        React.createElement(
          "div",
          {
            style: {
              marginTop: "20px",
              fontSize: "28px",
              fontWeight: 500,
              color: textColor,
            },
          },
          formattedDate,
        ),
        React.createElement(
          "div",
          {
            style: {
              marginTop: "10px",
              fontSize: "24px",
              color: "#334155",
            },
          },
          eventLocation || "Location to be announced",
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "24px",
            color: "#475569",
            padding: "0 8px",
          },
        },
        React.createElement(
          "div",
          null,
          "We can’t wait to celebrate with you.",
        ),
        React.createElement(
          "div",
          {
            style: {
              padding: "10px 18px",
              borderRadius: "12px",
              background: secondary,
              color: "white",
              fontWeight: 700,
            },
          },
          "RSVP",
        ),
      ),
    ),
  );

  return new ImageResponse(element, size);
}
