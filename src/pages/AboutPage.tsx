import { Link } from "react-router-dom";
import { ChevronRight, Globe, Shield, Truck, Heart, MapPin, Users } from "lucide-react";

const values = [
  { icon: Shield, title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors. No refurbished, no fakes — ever." },
  { icon: Truck, title: "Global Logistics", desc: "Shipping to 180+ countries from our central European hub, with real-time tracking on every order." },
  { icon: Heart, title: "Customer First", desc: "30-day returns, 2-year warranty, and a dedicated support team that actually responds." },
  { icon: Globe, title: "Based in Prague", desc: "Our warehouse and operations are in the heart of Europe, enabling fast delivery worldwide." },
];

const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
    <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">About</span>
    </nav>

    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-foreground tracking-tight">About ShipNest</h1>
      <p className="text-muted-foreground text-[15px] max-w-2xl mx-auto leading-relaxed">
        We're a premium electronics retailer based in Prague, Czech Republic. Since 2021, we've shipped over 2.4 million orders to customers in 180+ countries — with a 98.7% on-time delivery rate.
      </p>
    </div>

    {/* Story */}
    <section className="bg-secondary/50 border border-border/50 rounded-2xl p-8 space-y-4">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Our Story</h2>
      <div className="text-[14px] text-muted-foreground leading-relaxed space-y-3">
        <p>ShipNest started with a simple idea: buying premium tech shouldn't depend on where you live. In many countries, the latest smartphones, laptops, and accessories are either unavailable, overpriced, or sold through unreliable channels.</p>
        <p>We set up our operations in Prague — strategically located in central Europe — to serve customers worldwide. Our warehouse stocks genuine products from Apple, Samsung, Sony, and other leading brands, all sourced through authorized distribution channels.</p>
        <p>Today, ShipNest s.r.o. is a registered Czech company (IČO: 12345678) with a growing team dedicated to delivering the best tech to your doorstep, no matter where you are.</p>
      </div>
    </section>

    {/* Values */}
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-foreground tracking-tight text-center">What We Stand For</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {values.map(v => (
          <div key={v.title} className="border border-border/50 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <v.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              <h3 className="font-semibold text-foreground">{v.title}</h3>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Location */}
    <section className="bg-secondary/50 border border-border/50 rounded-2xl p-8 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-bold text-foreground tracking-tight">Our Location</h2>
      </div>
      <div className="text-[14px] text-muted-foreground leading-relaxed space-y-2">
        <p><strong className="text-foreground">ShipNest s.r.o.</strong></p>
        <p>Karlova 256/1<br />110 00 Prague 1<br />Czech Republic 🇨🇿</p>
        <p className="flex items-center gap-2"><Users className="w-4 h-4" /> Company ID (IČO): 12345678</p>
      </div>
    </section>

    <div className="text-center">
      <Link to="/shop" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors">
        Browse Products
      </Link>
    </div>
  </div>
);

export default AboutPage;
