import { useEffect, useState } from "react";
import { Truck, Package, MapPin, CheckCircle2, Plane } from "lucide-react";

const events = [
  { icon: CheckCircle2, color: "text-success", text: "Order delivered in Mumbai, India" },
  { icon: Plane, color: "text-primary", text: "Order shipped to Tokyo, Japan" },
  { icon: MapPin, color: "text-foreground", text: "Order arrived at customs in Frankfurt" },
  { icon: CheckCircle2, color: "text-success", text: "Order delivered in Prague, Czechia" },
  { icon: Package, color: "text-primary", text: "Order processed in Singapore hub" },
  { icon: Truck, color: "text-foreground", text: "Out for delivery in Toronto, Canada" },
  { icon: Plane, color: "text-primary", text: "Departed Istanbul transit hub" },
  { icon: CheckCircle2, color: "text-success", text: "Delivered in Sydney, Australia" },
];

const ActivityFeed = () => {
  const [visible, setVisible] = useState(events.slice(0, 4));
  useEffect(() => {
    let i = 4;
    const id = setInterval(() => {
      setVisible(prev => [events[i % events.length], ...prev.slice(0, 3)]);
      i++;
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="border-t border-border bg-background py-12">
      <div className="max-w-[680px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-foreground">Live activity</h3>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
          </span>
        </div>
        <div className="space-y-2">
          {visible.map((e, idx) => (
            <div key={`${e.text}-${idx}`}
              className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 animate-fade-in"
              style={{ opacity: 1 - idx * 0.2 }}>
              <e.icon className={`w-4 h-4 ${e.color} shrink-0`} strokeWidth={1.8} />
              <p className="text-[13px] text-foreground flex-1">{e.text}</p>
              <span className="text-[11px] text-muted-foreground">just now</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityFeed;