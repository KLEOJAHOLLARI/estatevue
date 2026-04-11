import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Percent, Clock } from "lucide-react";

interface Props {
  price: number;
}

export default function MortgageCalculator({ price }: Props) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const downPayment = price * (downPaymentPct / 100);
  const loanAmount = price - downPayment;

  const monthly = useMemo(() => {
    if (loanAmount <= 0 || rate <= 0) return 0;
    const r = rate / 100 / 12;
    const n = years * 12;
    return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, rate, years]);

  const totalPaid = monthly * years * 12;
  const totalInterest = totalPaid - loanAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const principalPct = loanAmount > 0 ? (loanAmount / totalPaid) * 100 : 0;
  const interestPct = 100 - principalPct;

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Mortgage Calculator</h3>
        </div>

        {/* Monthly Payment */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. Monthly Payment</p>
          <p className="font-heading text-3xl font-bold text-primary">{fmt(monthly)}</p>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />Down Payment</Label>
            <span className="font-medium text-foreground">{downPaymentPct}% · {fmt(downPayment)}</span>
          </div>
          <Slider value={[downPaymentPct]} onValueChange={([v]) => setDownPaymentPct(v)} min={0} max={50} step={1} />
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5" />Interest Rate</Label>
            <span className="font-medium text-foreground">{rate.toFixed(1)}%</span>
          </div>
          <Slider value={[rate * 10]} onValueChange={([v]) => setRate(v / 10)} min={10} max={120} step={1} />
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Loan Term</Label>
            <span className="font-medium text-foreground">{years} years</span>
          </div>
          <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={5} max={30} step={5} />
        </div>

        {/* Breakdown bar */}
        <div className="space-y-2">
          <div className="h-3 rounded-full overflow-hidden flex bg-muted">
            <div className="bg-primary transition-all" style={{ width: `${principalPct}%` }} />
            <div className="bg-accent transition-all" style={{ width: `${interestPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              Principal: {fmt(loanAmount)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent inline-block" />
              Interest: {fmt(totalInterest)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
