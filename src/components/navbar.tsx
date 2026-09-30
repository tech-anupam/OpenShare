"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarsBadge } from "@/components/stars-badge";
import { UploadIcon, GlobeIcon, FeedbackIcon, HeartIcon, MenuIcon, XIcon, OpenShareLogo } from "@/components/icons";

const navLinks = [
  { href: "/", label: "Share", icon: UploadIcon },
  { href: "/archives", label: "Archives", icon: GlobeIcon },
  { href: "/donate", label: "Support", icon: HeartIcon },
  { href: "/feedback", label: "Feedback", icon: FeedbackIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <OpenShareLogo size={30} className="transition-transform duration-200 group-hover:scale-105" />
            <span
              className="text-[15px] font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              OpenShare
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 mx-auto">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={14} />
                  <span>{link.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <StarsBadge />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "var(--overlay)" }}
          />
          <div
            className="absolute top-14 left-0 right-0 p-3 space-y-0.5 animate-in"
            style={{
              background: "var(--bg-card)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-primary)",
                    background: active ? "rgba(59,130,246,0.08)" : "transparent",
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 px-4 sm:hidden">
              <StarsBadge />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
