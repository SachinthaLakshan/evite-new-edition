import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import { Menu, UserCircle, LogOut, HomeIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onHomeClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
  onLogout,
  onProfileClick,
  onHomeClick,
}) => {
  const { session } = useAuth();
  const pathname = usePathname() || "";
  const user = session?.user;

  // Determine dynamic title based on path
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "My Events";
    if (pathname === "/dashboard/create-event") return "Create Event";
    if (pathname === "/profile") return "Account Profile";
    if (pathname === "/admin") return "Admin Dashboard";
    if (pathname.startsWith("/events/")) return "Event Settings";
    return "Dashboard";
  };

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Profile";

  // Get avatar URL if available
  const avatarUrl = user?.user_metadata?.avatar_url || "";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200/80 px-4 md:px-8 flex items-center justify-between w-full">
      {/* Left controls: Hamburger trigger + Logo (mobile) / Title (desktop) */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>
        )}
        
        {/* Mobile-only Logo */}
        <div 
          className="flex md:hidden items-center cursor-pointer" 
          onClick={onHomeClick}
        >
          <img src="/assets/logo.png" alt="Evite" className="h-7 w-auto" />
        </div>

        {/* Desktop-only Page Title */}
        <h1 className="hidden md:block text-lg font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right controls: User profile metadata and actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 rounded-full hover:bg-gray-100 hover:text-gray-900 text-gray-600 transition-all py-1.5 px-3"
          onClick={onHomeClick}
        >
          <HomeIcon className="h-4 w-4" />
          <span className="hidden sm:inline-block font-medium text-xs">Home</span>
        </Button>
        
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full hover:bg-gray-100 text-gray-700 transition-all py-1.5 px-2.5"
          onClick={onProfileClick}
        >
          {avatarUrl ? (
            <Avatar className="h-7 w-7 border border-gray-200 shadow-sm relative">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-purple-50 p-1.5 rounded-full text-purple-700 shadow-sm">
              <UserCircle className="h-4 w-4" />
            </div>
          )}
          <span className="hidden md:inline-block font-medium text-xs tracking-tight">{displayName}</span>
        </Button>
        
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
