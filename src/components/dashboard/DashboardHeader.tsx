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
    <header className="py-4 mb-8 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/assets/logo.png" alt="Evite" className="w-auto h-14" />
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={onHomeClick}
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={onProfileClick}
        >
          {avatarUrl ? (
            <Avatar className="h-6 w-6 mr-1">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="h-5 w-5" />
          )}
          <span>{displayName}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
