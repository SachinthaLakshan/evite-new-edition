import React from "react";
import { CalendarCheck } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="w-20 h-20 object-contain"
      />
    </div>
  );
};

export default Logo;
