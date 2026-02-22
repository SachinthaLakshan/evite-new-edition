"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

const Navigation = () => {
  return (
    <div>
      <Link href="/profile">
        <Button variant="ghost">
          <UserIcon className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </Link>
    </div>
  );
};

export default Navigation;
