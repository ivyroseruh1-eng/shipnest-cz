import { Shield, Truck, RotateCcw, BadgeCheck, Globe } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    { icon: Shield, label: "Secure Payment" },
    { icon: Truck, label: "Ships from Czech Republic" },
    { icon: RotateCcw, label: "30-Day Returns" },
    { icon: BadgeCheck, label: "Authentic Products" },
    { icon: Globe, label: "Worldwide Delivery" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {badges.map(b => (
        <div key={b.label} className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl">
          <b.icon className="w-6 h-6 text-primary" />
          <span className="text-xs text-center text-muted-foreground font-medium">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
