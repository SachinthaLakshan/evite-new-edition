import React, { useRef, useState, useCallback } from "react";
import { InvitationConfig } from "@/types/invitation";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import FloralTemplate from "./templates/FloralTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

interface InvitationPreviewProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
  editable?: boolean;
  onPositionChange?: (
    key: keyof InvitationConfig["text_positions"],
    position: { x: number; y: number },
  ) => void;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({
  config,
  guestName,
  eventData,
  editable = false,
  onPositionChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState<
    keyof InvitationConfig["text_positions"] | null
  >(null);

  const handlePointerDown = (
    key: keyof InvitationConfig["text_positions"],
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setActiveKey(key);
  };

  const handlePointerUp = useCallback(() => {
    setActiveKey(null);
  }, []);

  const handlePointerMove = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    ) => {
      if (!activeKey || !onPositionChange || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const point = "touches" in e ? e.touches[0] : e;
      const x = ((point.clientX - rect.left) / rect.width) * 100;
      const y = ((point.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.min(100, Math.max(0, x));
      const clampedY = Math.min(100, Math.max(0, y));
      onPositionChange(activeKey, { x: clampedX, y: clampedY });
    },
    [activeKey, onPositionChange],
  );

  const renderTemplate = () => {
    const props = {
      config,
      guestName,
      eventData,
      editable,
      onPositionChange,
    } as const;

    switch (config.template_id) {
      case "classic":
        return <ClassicTemplate {...props} />;
      case "modern":
        return <ModernTemplate {...props} />;
      case "floral":
        return <FloralTemplate {...props} />;
      case "minimal":
        return <MinimalTemplate {...props} />;
      default:
        return <ClassicTemplate {...props} />;
    }
  };

  const draggableItems: Array<{
    key: keyof InvitationConfig["text_positions"];
    label: string;
    content: string;
  }> = [
    {
      key: "couple_names",
      label: "Names",
      content:
        `${config.couple_names.person1} & ${config.couple_names.person2}`.trim(),
    },
    {
      key: "venue",
      label: "Venue",
      content: eventData.location,
    },
    {
      key: "date",
      label: "Date",
      content: new Date(eventData.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    {
      key: "guest_name",
      label: "Guest Name",
      content: guestName || "Guest Name",
    },
  ];

  const handleKeyDown = (
    key: keyof InvitationConfig["text_positions"],
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!onPositionChange) return;
    const step = e.shiftKey ? 5 : 1;
    const current = config.text_positions[key];
    if (!current) return;

    let { x, y } = current;
    switch (e.key) {
      case "ArrowUp":
        y = Math.max(0, y - step);
        break;
      case "ArrowDown":
        y = Math.min(100, y + step);
        break;
      case "ArrowLeft":
        x = Math.max(0, x - step);
        break;
      case "ArrowRight":
        x = Math.min(100, x + step);
        break;
      default:
        return;
    }

    e.preventDefault();
    onPositionChange(key, { x, y });
  };

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <div className={editable ? "pointer-events-none select-none" : ""}>
        {renderTemplate()}
      </div>

      {editable && (
        <div className="absolute inset-0">
          {draggableItems.map((item) => {
            const pos = config.text_positions[item.key];
            if (!pos) return null;
            if (item.key === "guest_name" && !guestName) return null;
            return (
              <div
                key={item.key}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseDown={(e) => handlePointerDown(item.key, e)}
                onTouchStart={(e) => handlePointerDown(item.key, e)}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(item.key, e)}
                role="button"
                aria-label={`Move ${item.label}`}
              >
                <div className="rounded-full bg-white/85 backdrop-blur px-3 py-2 text-xs font-semibold text-gray-800 shadow-md border border-gray-200 min-w-[120px] text-center">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">
                    {item.label}
                  </div>
                  <div
                    className="text-sm font-medium truncate"
                    title={item.content}
                  >
                    {item.content || item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvitationPreview;
