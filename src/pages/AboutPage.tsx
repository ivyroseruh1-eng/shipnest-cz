import { Link } from "react-router-dom";
import { ChevronRight, Globe, Shield, Truck, Heart, MapPin, Users, Package, Award } from "lucide-react";
import Certifications from "@/components/Certifications";

const values = [
  { icon: Shield, title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors. No refurbished, no fakes — ever." },
  { icon: Truck, title: "Global Logistics", desc: "Shipping to 60+ countries from our central European hub, with real-time tracking at every milestone." },
  { icon: Heart, title: "Customer First", desc: "30-day returns, 2-year warranty, and a dedicated support team that actually responds within hours." },
  { icon: Globe, title: "Based in Prague", desc: "Our warehouse and operations sit in the heart of Europe — minimising customs friction worldwide." },
];

const team = [
  { name: "Tomáš Havel", role: "Co-founder & CEO", initials: "TH" },
  { name: "Karolína Dvořák", role: "Head of Logistics", initials: "KD" },
  { name: "Markus Weber", role: "Head of Partnerships", initials: "MW" },
  { name: "Anya Petrova", role: "Customer Experience", initials: "AP" },
];

const milestones = [
  { year: "2021", event: "ShipNest s.r.o. founded in Prague." },
  { year: "2022", event: "First 10,000 orders shipped across Europe." },
  { year: "2023", event: "Expansion to MENA & APAC. AIG insurance partnership signed." },
  { year: "2024", event: "Authorised reseller status confirmed with Apple, Samsung & Google distributors." },
  { year: "2025", event: "142,000+ orders delivered. Trustpilot rating 4.9 / 5." },
];

const AboutPage = () => (
  <div className="bg-background">
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">
    <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">About</span>
    </nav>

    <div className="text-center space-y-4">
      <p className="text-[12px] text-primary font-semibold uppercase tracking-[0.2em]">Our company</p>
      <h1 className="display text-4xl sm:text-5xl text-foreground">Premium tech, delivered honestly.</h1>
      <p className="text-muted-foreground text-[15px] max-w-2xl mx-auto leading-relaxed">
        ShipNest is a registered Czech electronics retailer based in Prague. Since 2021 we've shipped 142,000+ verified orders to customers in 60+ countries, with a 98.6% on-time delivery rate and a 4.9/5 Trustpilot score.
      </p>
    </div>

    {/* Headline stats */}
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Package, value: "142k+", label: "Orders delivered" },
        { icon: Globe, value: "62", label: "Countries served" },
        { icon: Award, value: "4.9 / 5", label: "Trustpilot rating" },
        { icon: Users, value: "24", label: "People on the team" },
      ].map(s => (
        <div key={s.label} className="bg-secondary/50 border border-border rounded-2xl p-5 text-center">
          <s.icon className="w-5 h-5 mx-auto text-primary" strokeWidth={1.6} />
          <p className="text-2xl font-semibold text-foreground tracking-tight mt-2">{s.value}</p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </section>

    {/* Story */}
    <section className="bg-secondary/50 border border-border rounded-3xl p-8 sm:p-10 space-y-4">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight">Our story</h2>
      <div className="text-[14px] text-muted-foreground leading-relaxed space-y-3">
        <p>ShipNest started in a small office in Prague's Karlín district in early 2021. The founders — Tomáš and Karolína — kept running into the same problem: friends abroad were paying 30–60% above European retail for the same iPhone, MacBook or Galaxy, and often through resellers nobody quite trusted.</p>
        <p>So we built ShipNest to do one thing very well: source flagship electronics from authorised European distributors, hold them in a single insured warehouse outside Prague, and ship them anywhere in the world — sealed, tracked end-to-end, and priced fairly.</p>
        <p>Four years later we've processed over 142,000 orders across 62 countries. Every package leaves our hub with a tamper-evident seal, an AIG insurance policy up to $5,000, and a 14-step tracking trail you can follow in real time.</p>
        <p>ShipNest s.r.o. is a registered Czech company (IČO 19842501, DIČ CZ19842501) and an Authorised Reseller for Apple, Samsung and Google distribution partners across the EU.</p>
      </div>
    </section>

    {/* Values */}
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight text-center">What we stand for</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {values.map(v => (
          <div key={v.title} className="border border-border rounded-2xl p-6 space-y-2 bg-background">
            <div className="flex items-center gap-2">
              <v.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              <h3 className="font-semibold text-foreground">{v.title}</h3>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Team */}
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight text-center">The people behind ShipNest</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {team.map(t => (
          <div key={t.name} className="bg-secondary/50 border border-border rounded-2xl p-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-foreground text-background flex items-center justify-center text-[15px] font-semibold tracking-wide">
              {t.initials}
            </div>
            <p className="text-[14px] font-semibold text-foreground mt-3">{t.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Milestones */}
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight text-center">Milestones</h2>
      <div className="border-l-2 border-border ml-2 sm:ml-6 space-y-5 pl-6">
        {milestones.map(m => (
          <div key={m.year} className="relative">
            <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">{m.year}</p>
            <p className="text-[14px] text-foreground mt-0.5">{m.event}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Location */}
    <section className="bg-secondary/50 border border-border rounded-2xl p-8 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground tracking-tight">Registered office</h2>
      </div>
      <div className="text-[14px] text-muted-foreground leading-relaxed space-y-2">
        <p><strong className="text-foreground">ShipNest s.r.o.</strong></p>
        <p>Na Příkopě 859/22<br />110 00 Nové Město, Prague<br />Czech Republic</p>
        <p className="flex items-center gap-2"><Users className="w-4 h-4" /> IČO 19842501 · DIČ CZ19842501</p>
        <p className="text-[12px] text-muted-foreground">Support hours: Mon–Sat 09:00–20:00 CET · avg. reply under 2 hours</p>
      </div>
    </section>

    <div className="text-center">
      <Link to="/shop" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors">
        Browse products
      </Link>
    </div>

    {/* Discreet staff access — hidden from main nav */}
    <div className="pt-6 border-t border-border/40 flex items-center justify-center">
      <Link to="/admin" className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors tracking-wider">
        Staff Access
      </Link>
    </div>
  </div>
  <Certifications />
  </div>
);

export default AboutPage;
