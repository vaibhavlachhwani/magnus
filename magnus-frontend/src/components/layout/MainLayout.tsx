import React from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar"
import { Home, Users, FileUp, ShieldCheck, Database } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Students", url: "/students", icon: Users },
  { title: "Upload Document", url: "/upload", icon: FileUp },
  { title: "Verify Document", url: "/verify", icon: ShieldCheck },
]

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background dark">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-2 px-2">
              <Database className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">Magnus</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 shrink-0 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4 lg:hidden" />
            <div className="flex-1">
              <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {items.find(i => i.url === location.pathname)?.title || "Magnus System"}
              </h1>
            </div>
          </header>
          <div className="p-4 md:p-8 flex-1 overflow-auto">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}
