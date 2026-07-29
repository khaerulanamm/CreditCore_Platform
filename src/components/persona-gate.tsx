import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PERSONAS, setPersona, useStore, type Persona } from "@/lib/scoring-store";

export function PersonaGate({ children }: { children: React.ReactNode }) {
  const persona = useStore((s) => s.persona);
  const [selected, setSelected] = useState<Persona | null>(null);

  if (persona) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Sign in to CreditCore</CardTitle>
          <CardDescription>
            Choose the business role you're evaluating this platform as.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  selected === p.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <p className="font-medium">{p.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{p.description}</p>
              </button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              setPersona(selected);
            }}
          >
            Continue
          </Button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Role-based view simulation for demonstration purposes — not a production authentication
            system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
