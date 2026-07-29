import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { useServerSync, setPersona, useStore, PERSONAS } from "@/lib/scoring-store";
import { PersonaGate } from "@/components/persona-gate";
import { LanguageProvider, useLanguage } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

function HeaderPersona() {
  const { t } = useLanguage();
  const persona = useStore((s) => s.persona);
  const meta = PERSONAS.find((p) => p.id === persona);
  const initials = meta
    ? meta.label
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "?";
  return (
    <button
      onClick={() => setPersona(null)}
      title={t("switchRole")}
      className="hidden items-center gap-2 rounded-full border border-border/60 bg-card px-2 py-1 transition-colors hover:border-primary/40 sm:flex"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-hero text-[10px] font-semibold text-white">
        {initials}
      </div>
      <div className="flex flex-col items-start leading-tight pr-1">
        <span className="text-[10px] font-medium">{meta?.label ?? t("guest")}</span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
          {t("switchRole")}
        </span>
      </div>
    </button>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CreditCore — Fintech Credit Scoring Console" },
      {
        name: "description",
        content:
          "Professional credit scoring dashboard: run assessments, monitor SLIK OJK status, and inspect webhook API traffic.",
      },
      { property: "og:title", content: "CreditCore — Fintech Credit Scoring Console" },
      {
        property: "og:description",
        content:
          "Professional credit scoring dashboard: run assessments, monitor SLIK OJK status, and inspect webhook API traffic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CreditCore — Fintech Credit Scoring Console" },
      {
        name: "twitter:description",
        content:
          "Professional credit scoring dashboard: run assessments, monitor SLIK OJK status, and inspect webhook API traffic.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          // Runs before paint/hydration so the correct theme class is applied
          // immediately — avoids the flash-of-wrong-theme / "mode reset on
          // refresh" issue where the server always rendered `.dark` and the
          // client-side ThemeToggle effect only fixed it after hydration.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d);}catch(e){document.documentElement.classList.add("dark");}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useServerSync();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <RootApplication />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function RootApplication() {
  const { t } = useLanguage();
  return (
    <PersonaGate>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
              <SidebarTrigger />
              <div className="ml-1 flex items-center gap-2">
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("project")}
                  </span>
                  <span className="font-display text-sm font-semibold">CreditCore Platform</span>
                </div>
                <span className="ml-2 hidden rounded-md border border-border/60 bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                  v1.0
                </span>
                <span className="hidden items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success md:inline-flex">
                  Production
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {t("live")}
                </span>
                <LanguageSwitcher />
                <HeaderPersona />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1">
              <Outlet />
            </main>
            <footer className="border-t border-border/60 bg-card/40 px-4 py-4">
              <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-foreground">
                    CreditCore Platform
                  </span>
                  <span className="opacity-60">·</span>
                  <span>Production-oriented credit decisioning portfolio</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span>REST API</span>
                  <span className="opacity-40">•</span>
                  <span>Observability</span>
                  <span className="opacity-40">•</span>
                  <span>Portfolio v1.0</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </PersonaGate>
  );
}
