import { CheckCircle2 } from "lucide-react";

const deliveries = [
  { id: "SN5781", flag: "🇮🇳", city: "Mumbai", country: "India", item: "iPhone 17 Pro", ago: "2h ago" },
  { id: "SN5782", flag: "🇩🇪", city: "Berlin", country: "Germany", item: "Galaxy S25 Ultra", ago: "4h ago" },
  { id: "SN5783", flag: "🇯🇵", city: "Tokyo", country: "Japan", item: "Pixel 10 Pro XL", ago: "6h ago" },
  { id: "SN5784", flag: "🇨🇦", city: "Toronto", country: "Canada", item: "iPad Pro 13", ago: "8h ago" },
];

const RecentDeliveries = () => (
  <section className="border-t border-border bg-secondary/30 py-16">
    <div className="max-w-[980px] mx-auto px-4">
      <div className="text-center mb-10">
        <p className="text-[12px] text-success font-medium uppercase tracking-wider">Live</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mt-2">Recent successful deliveries</h2>
        <p className="text-[14px] text-muted-foreground mt-2">Real orders, signed for at the door.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {deliveries.map(d => (
          <div key={d.id} className="bg-background border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{d.flag}</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-3">Order #{d.id}</p>
            <p className="text-[14px] font-semibold text-foreground mt-1 truncate">{d.item}</p>
            <p className="text-[12px] text-muted-foreground mt-1">Delivered to {d.city}, {d.country}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{d.ago}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RecentDeliveries;