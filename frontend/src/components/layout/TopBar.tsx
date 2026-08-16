"use client";

import Link from "next/link";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="h-[56px] w-full flex items-center bg-surface-bright sticky top-0 z-50 justify-between px-[24px] border-b border-outline-variant">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-[16px]">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-[8px]">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-on-primary text-[10px] font-bold">A</span>
          </div>
          <span className="text-title-sm font-semibold text-primary hidden sm:inline">
            Aureon Document Control
          </span>
        </div>

        <div className="h-6 w-px bg-outline-variant mx-[4px] hidden sm:block" />

        <nav className="hidden sm:flex items-center gap-[8px] text-body-sm text-on-surface-variant">
          <span className="hover:text-on-surface cursor-pointer transition-colors">
            Dashboard
          </span>
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex items-center gap-[16px] flex-1 max-w-md mx-[24px]">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-[10px] top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search documents, workflows..."
            className="w-full h-[36px] pl-[32px] pr-[8px] border border-outline-variant rounded-[4px] bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary text-body-sm text-on-surface placeholder:text-outline transition-colors outline-none"
          />
        </div>
      </div>

      {/* Right: Actions + Avatar */}
      <div className="flex items-center gap-[16px]">
        <Link
          href="#"
          className="text-label-caps text-on-surface-variant hover:text-on-surface transition-colors hidden md:inline"
        >
          Help
        </Link>

        <div className="flex items-center gap-[8px] text-on-surface-variant">
          <Link href="/notifications" className="relative">
            <button className="hover:bg-surface-container-low p-1.5 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-surface-bright" />
            </button>
          </Link>

          <button className="hover:bg-surface-container-low p-1.5 rounded-full transition-colors hidden md:flex">
            <HelpCircle size={20} />
          </button>
        </div>

        <Link href="/profile">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
            <span className="text-body-sm font-semibold text-on-surface-variant">
              RS
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
