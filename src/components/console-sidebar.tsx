"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  BarChart2,
  Film,
  CheckSquare,
  Key,
  Webhook,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Usage", href: "/usage", icon: BarChart2 },
  { label: "Renders", href: "/renders", icon: Film },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "API Keys", href: "/api-keys", icon: Key },
  { label: "Webhooks", href: "/webhooks", icon: Webhook },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function ConsoleSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--bg-2)",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Link href="/dashboard" aria-label="FrameLane Console">
          <Logo width={120} />
        </Link>
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-dim)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          Console
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                color: isActive ? "var(--fg)" : "var(--fg-mute)",
                background: isActive
                  ? "rgba(255,255,255,0.06)"
                  : "transparent",
                transition: "all 0.12s",
                textDecoration: "none",
                marginBottom: 1,
              }}
            >
              <Icon
                size={15}
                style={{
                  color: isActive ? "var(--orange)" : "var(--fg-dim)",
                  flexShrink: 0,
                }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--line)",
        }}
      >
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/signup" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 4,
            fontSize: 13,
            color: "var(--fg-mute)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--fg)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-mute)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={15} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
