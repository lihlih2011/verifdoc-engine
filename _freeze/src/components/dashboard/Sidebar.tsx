"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, FlaskConical } from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Historique des analyses",
      href: "/dashboard/history",
      icon: History,
    },
    {
      name: "Nouvelle analyse",
      href: "/analyze",
      icon: FlaskConical,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-sidebar-background border-r border-sidebar-border p-4 flex-col sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};