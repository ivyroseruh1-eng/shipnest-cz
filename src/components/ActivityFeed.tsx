import { useEffect, useState } from "react";
import { Truck, Package, MapPin, CheckCircle2, Plane, Warehouse } from "lucide-react";

const events = [
  { icon: CheckCircle2, color: "text-success", text: "Delivered in Berlin, DE", time: "2 min ago" },
  { icon: Truck, color: "text-foreground", text: "Out for delivery in London, UK", time: "11 min ago" },
  { icon: Plane, color: "text-primary", text: "Departed Frankfurt FRA Cargo", time: "23 min ago" },
  { icon: MapPin, color: "text-foreground", text: "Cleared customs · Amsterdam Schiphol", time: "38 min ago" },
  { icon: Plane, color: "text-primary", text: "Departed Istanbul transit hub", time: "1 hr ago" },
  { icon: Warehouse, color: "text-primary", text: "Scanned at Prague PRG Gateway", time: "1 hr ago" },
  { icon: CheckCircle2, color: "text-success", text: "Delivered in Madrid, ES", time: "2 hr ago" },
  { icon: Package, color: "text-primary", text: "Packed at Prague warehouse", time: "3 hr ago" },
  { icon: Truck, color: "text-foreground", text: "Out for delivery in Dubai, AE", time: "3 hr ago" },
  { icon: CheckCircle2, color: "text-success", text: "Delivered in Warsaw, PL", time: "4 hr ago" },
];

const ActivityFeed = () => {
  const [visible, setVisible] = useState(events.slice(0, 5));
  useEffect(() => {
    let i = 5;
    const id = setInterval(() => {
      setVisible(prev => [events[i % events.length], ...prev.slice(0, 4)]);
      i++;
    }, 6000);
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
              <span className="text-[11px] text-muted-foreground tabular-nums">{idx === 0 ? "just now" : e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityFeed;