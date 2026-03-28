import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { UserCircle, LogOut, HomeIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onLogout: () => void;
  onProfileClick: () => void;
  onHomeClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onLogout,
  onProfileClick,
  onHomeClick,
}) => {
  const { session } = useAuth();
  const user = session?.user;

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Profile";

  // Get avatar URL if available
  const avatarUrl = user?.user_metadata?.avatar_url || "";

  return (
    <header className="sticky top-4 z-50 mb-8 px-6 py-4 flex justify-between items-center rounded-2xl glass-morphism shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div 
        className="flex items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]" 
        onClick={onHomeClick}
      >
        <img src="/assets/logo.png" alt="Evite" className="w-auto h-10 md:h-12 drop-shadow-sm" />
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
          onClick={onHomeClick}
        >
          <HomeIcon className="h-4.5 w-4.5" />
          <span className="hidden sm:inline-block font-medium">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full hover:bg-secondary/15 hover:text-secondary-foreground transition-all duration-300 py-1.5 px-3"
          onClick={onProfileClick}
        >
          {avatarUrl ? (
            <Avatar className="h-7 w-7 border-2 border-secondary/30 shadow-sm relative -ml-1">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-secondary/10 text-secondary-foreground font-medium text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-secondary/15 p-1.5 rounded-full text-secondary-foreground shadow-sm relative -ml-1">
              <UserCircle className="h-4.5 w-4.5" />
            </div>
          )}
          <span className="hidden sm:inline-block font-medium tracking-tight">{displayName}</span>
        </Button>
        
        <div className="h-6 w-px bg-gray-200/80 mx-1 hidden sm:block rounded-full"></div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full hover:bg-destructive/10 hover:text-destructive border-transparent hover:border-destructive/20 shadow-none hover:shadow-sm transition-all duration-300 group ml-1"
          onClick={onLogout}
        >
          <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline-block font-medium">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
