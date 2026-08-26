"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, ChevronDown, FileText, GitBranch, HelpCircle, History, LayoutDashboard, Settings, Shield } from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    children: [
      { label: "Repository", href: "/documents" },
      { label: "Grid View", href: "/documents/grid" },
      { label: "Archived", href: "/documents/archived" },
    ],
  },
  {
    label: "Workflows",
    href: "/reviews",
    icon: GitBranch,
    children: [
      { label: "Pending Reviews", href: "/reviews/pending" },
      { label: "Periodic Review", href: "/reviews/periodic" },
    ],
  },
  {
    label: "Document Intelligence",
    href: "/intelligence",
    icon: Brain,
    children: [
      { label: "Overview", href: "/intelligence" },
      { label: "Ask Documents", href: "/intelligence/ask" },
    ],
  },
  {
    label: "Audit Trail",
    href: "/admin/audit",
    icon: History,
  },
  {
    label: "Administration",
    href: "/admin",
    icon: Shield,
    children: [
      { label: "Users", href: "/admin/users" },
      { label: "Roles & Permissions", href: "/admin/roles" },
      { label: "Departments", href: "/admin/departments" },
      { label: "Document Types", href: "/admin/document-types" },
      { label: "Workflow Templates", href: "/admin/workflows" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

const bottomNavItems = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Help", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/documents" && pathname === "/documents") return true;
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/documents" && href !== "/dashboard" && pathname.startsWith(href)) return true;
    return pathname === href;
  };

  const isGroupActive = (item: (typeof navItems)[0]) => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <aside className="w-[260px] h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant shrink-0">
      {/* Organization Branding */}
      <div className="p-[24px] border-b border-outline-variant flex items-center gap-[16px]">
        <div className="w-10 h-10 rounded-[4px] bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-title-sm">
          A
        </div>
        <div>
          <h2 className="text-title-sm font-semibold text-on-surface leading-tight">
            Aureon Pharma
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Quality Control System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-[16px] overflow-y-auto">
        <ul className="space-y-0.5 px-[8px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isGroupActive(item);

            return (
              <li key={item.href}>
                <Link
                  href={item.children ? item.children[0].href : item.href}
                  className={`flex items-center gap-[16px] px-[16px] py-[8px] rounded-r-[4px] transition-colors duration-200 ${
                    active
                      ? "bg-secondary-container text-on-secondary-container font-semibold border-l-4 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low border-l-4 border-transparent"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-body-md flex-1">{item.label}</span>
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${active ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>

                {/* Sub-navigation */}
                {item.children && active && (
                  <ul className="ml-[52px] mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`block px-[12px] py-[6px] rounded-[4px] text-body-sm transition-colors ${
                            isActive(child.href)
                              ? "text-on-surface font-medium bg-surface-container-low"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-outline-variant p-[8px]">
        <ul className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-[16px] px-[16px] py-[8px] text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-[4px] text-body-md"
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={async () => {
                const { createClient } = await import('@/utils/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                const routerModule = await import("next/navigation");
                routerModule.redirect('/login');
              }}
              className="w-full flex items-center gap-[16px] px-[16px] py-[8px] text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-[4px] text-body-md text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
