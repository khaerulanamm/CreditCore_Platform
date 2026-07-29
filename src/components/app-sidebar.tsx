import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Database,
  FilePlus2,
  HeartPulse,
  Info,
  LayoutDashboard,
  Map,
  Network,
  ShieldCheck,
  Timer,
  Workflow,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage, type TranslationKey } from "@/i18n";

const workspace = [
  { key: "dashboard", url: "/", icon: LayoutDashboard },
  { key: "assessment", url: "/assessment", icon: FilePlus2 },
  { key: "observability", url: "/logs", icon: Activity },
  { key: "health", url: "/health", icon: HeartPulse },
] as const;

const knowledge = [
  { key: "architecture", url: "/architecture", icon: Network },
  { key: "businessLogic", url: "/business-logic", icon: Workflow },
  { key: "apiDocs", url: "/api-docs", icon: BookOpen },
  { key: "roadmap", url: "/roadmap", icon: Map },
  { key: "about", url: "/about", icon: Info },
] as const;

const production = [
  { key: "security", url: "/security", icon: Timer },
  { key: "dataLayer", url: "/database", icon: Database },
] as const;

export function AppSidebar() {
  const { t } = useLanguage();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shadow-glow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-semibold text-sidebar-foreground">
              CreditCore
            </span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Portfolio Platform
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspace.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={t(item.key as TranslationKey)}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.key as TranslationKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("knowledge")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {knowledge.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={t(item.key as TranslationKey)}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.key as TranslationKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("production")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {production.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={t(item.key as TranslationKey)}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.key as TranslationKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-[10px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          v1.0 · Portfolio Platform
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
