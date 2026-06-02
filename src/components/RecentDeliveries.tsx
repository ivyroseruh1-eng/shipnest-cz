import { CheckCircle2, MapPin } from "lucide-react";

const deliveries = [
  { id: "SN29481372", to: "Rohan S.", city: "Pune", state: "Maharashtra", item: "iPhone 16 Pro 256GB", courier: "Blue Dart", ago: "2h ago" },
  { id: "SN29478815", to: "Priya R.", city: "Bengaluru", state: "Karnataka", item: "Galaxy S25 Ultra 512GB", courier: "Delhivery", ago: "5h ago" },
  { id: "SN29475204", to: "Arjun M.", city: "Hyderabad", state: "Telangana", item: "Pixel 9 Pro 256GB", courier: "DTDC", ago: "9h ago" },
  { id: "SN29470889", to: "Neha K.", city: "Mumbai", state: "Maharashtra", item: "iPad Pro 13 M4 1TB", courier: "Blue Dart", ago: "14h ago" },
  { id: "SN29462471", to: "Vikram T.", city: "Delhi", state: "NCR", item: "OnePlus 13 256GB", courier: "Delhivery", ago: "21h ago" },
  { id: "SN29459003", to: "Ananya P.", city: "Kolkata", state: "West Bengal", item: "iPhone 17 Pro Max 512GB", courier: "Blue Dart", ago: "1d ago" },
];

const RecentDeliveries = () => (
  <section className="border-t border-border bg-secondary/30 py-16">
    <div className="max-w-[980px] mx-auto px-4">
      <div className="text-center mb-10">
        <p className="text-[12px] text-success font-medium uppercase tracking-wider">Signed for at the door</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mt-2">Recently delivered across India</h2>
        <p className="text-[14px] text-muted-foreground mt-2">Names abbreviated for customer privacy. Live data refreshed hourly.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {deliveries.map(d => (
          <div key={d.id} className="bg-background border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Order #{d.id}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Delivered
              </span>
            </div>
            <p className="text-[15px] font-semibold text-foreground mt-3">{d.item}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[12px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{d.to} · {d.city}, {d.state}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>via {d.courier}</span>
              <span>{d.ago}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RecentDeliveries;