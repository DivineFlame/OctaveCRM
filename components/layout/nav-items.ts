import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Files,
  Gauge,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Plug,
  Settings,
  Sparkles,
  Users
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/content-studio", label: "Content Studio", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/templates", label: "Templates", icon: Files },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/ai-agents", label: "AI Agents", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/audit", label: "Audit", icon: Gauge }
];
