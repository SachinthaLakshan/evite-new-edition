"use client";

import React, { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import ProfileModal from "../dashboard/ProfileModal";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="centered-container">
        <DashboardHeader
          onLogout={handleLogout}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onHomeClick={handleHomeClick}
        />
        {children}

        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
