import { LayoutDashboard, FileText, MessageSquare, Workflow, LogOut, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { open } = useSidebar();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out"
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 via-background to-background dark:from-purple-950/20 dark:via-background dark:to-background pointer-events-none" />

      <SidebarHeader className="border-b border-purple-200/30 dark:border-purple-800/30 px-6 py-4 relative z-10">
        {open && (
          <div className="group">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">RIDA</h1>
            <p className="text-xs text-muted-foreground">Document Intelligence</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-700 dark:text-purple-300">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-purple-100/50 dark:hover:bg-purple-900/20 data-[active=true]:bg-purple-200/70 dark:data-[active=true]:bg-purple-800/50 data-[active=true]:text-purple-900 dark:data-[active=true]:text-purple-100 transition-all duration-200 hover:shadow-md hover:shadow-purple-500/20"
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-purple-200/30 dark:border-purple-800/30 p-4 relative z-10">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-purple-100/50 dark:hover:bg-purple-900/20 hover:text-purple-900 dark:hover:text-purple-100 transition-all duration-200 hover:shadow-md hover:shadow-purple-500/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {open && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
