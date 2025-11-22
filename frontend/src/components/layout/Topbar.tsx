import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Topbar = () => {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <h2 className="text-sm font-semibold md:text-base">RIDA Intelligence</h2>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};