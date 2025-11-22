import { ReactNode } from "react";
import { AppSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
