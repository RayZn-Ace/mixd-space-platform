import { useState } from "react";
import { CreditCard, Loader2, Smartphone, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/mixd";

export type MockMethod = "card" | "paypal" | "on_site" | "credits";

const METHODS: { id: MockMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "paypal", label: "PayPal", hint: "Pay with your PayPal balance", icon: Wallet },
  { id: "credits", label: "Membership credits", hint: "Use days from your plan", icon: Smartphone },
  { id: "on_site", label: "Pay on site", hint: "Settle at the front desk", icon: Building2 },
];

export function PaymentSheet({
  amountCents,
  busy,
  onPay,
  creditsAvailable = 0,
}: {
  amountCents: number;
  busy: boolean;
  creditsAvailable?: number;
  onPay: (method: MockMethod) => void;
}) {
  const [method, setMethod] = useState<MockMethod>("card");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const cardReady = card.replace(/\s/g, "").length >= 12 && exp.length >= 4 && cvc.length >= 3;
  const ready = method === "card" ? cardReady : method === "credits" ? creditsAvailable > 0 : true;

  return (
    <div>
      <p className="eyebrow">Payment</p>
      <div className="mt-4 space-y-2">
        {METHODS.map((m) => {
          const active = method === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors " +
                (active ? "border-foreground bg-surface" : "border-border bg-card")
              }
            >
              <Icon className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{m.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {m.id === "credits" && creditsAvailable > 0
                    ? `${creditsAvailable} credits available`
                    : m.hint}
                </span>
              </span>
              <span
                className={
                  "size-4 shrink-0 rounded-full border " +
                  (active ? "border-foreground bg-foreground" : "border-border")
                }
              />
            </button>
          );
        })}
      </div>

      {method === "card" && (
        <div className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-4">
          <input
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base outline-none focus:border-foreground"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              inputMode="numeric"
              placeholder="MM/YY"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base outline-none focus:border-foreground"
            />
            <input
              inputMode="numeric"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base outline-none focus:border-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Demo checkout — no real card is charged. Any test number works.
          </p>
        </div>
      )}

      <Button className="mt-6 w-full" disabled={busy || !ready} onClick={() => onPay(method)}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : method === "on_site" ? (
          "Reserve & pay on site"
        ) : (
          `Pay ${formatPrice(amountCents)}`
        )}
      </Button>
    </div>
  );
}
