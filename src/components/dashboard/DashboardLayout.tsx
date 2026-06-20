"use client";

import React, { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import ProfileModal from "../dashboard/ProfileModal";
import { useAuth } from "@/components/AuthProvider";
import { 
  LayoutDashboard, 
  PlusCircle, 
  UserCircle, 
  ShieldAlert, 
  LogOut, 
  X 
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { session, isAdmin } = useAuth();
  const user = session?.user;
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Profile";

  const navLinks = [
    {
      label: "My Events",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Create Event",
      href: "/dashboard/create-event",
      icon: PlusCircle,
      exact: false,
    },
    {
      label: "My Profile",
      href: "/profile",
      icon: UserCircle,
      exact: false,
    },
    {
      label: "Admin Panel",
      href: "/admin",
      icon: ShieldAlert,
      exact: false,
      adminOnly: true,
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/50 text-gray-800">
      
      {/* ══ MOBILE SIDEBAR BACKDROP ══ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* ══ SIDEBAR NAVIGATION CONTAINER ══ */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200/80 flex flex-col justify-between
          transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col flex-1">
          {/* Logo / Header area */}
          <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
              <img src="/assets/logo.png" alt="Evite" className="w-auto h-8" />
            </div>
            {/* Close button on mobile */}
            <button 
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null;
              const isActive = link.exact 
                ? pathname === link.href 
                : pathname.startsWith(link.href);
              
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    router.push(link.href);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-purple-50 text-purple-700 font-semibold shadow-sm ring-1 ring-purple-100/50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <link.icon className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions inside Sidebar */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* User info trigger card */}
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
          >
            <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-normal">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate leading-normal">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT AREA ══ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Unified Toolbar Header */}
        <DashboardHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onHomeClick={handleHomeClick}
        />
        
        {/* Content panel */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
