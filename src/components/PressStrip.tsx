import Reveal from "./Reveal";

// Styled wordmarks that approximate each publication's masthead — kept neutral
// to avoid trademark issues but instantly recognisable as "real" press logos.
const press = [
  { name: "WIRED", className: "font-black tracking-tighter italic" },
  { name: "The Verge", className: "font-extrabold tracking-tight" },
  { name: "TechCrunch", className: "font-bold tracking-tight" },
  { name: "Engadget", className: "font-semibold tracking-wide lowercase" },
  { name: "Forbes", className: "font-black tracking-tight" },
  { name: "Bloomberg", className: "font-bold tracking-tight italic" },
  { name: "FT", className: "font-extrabold tracking-tight" },
];

const PressStrip = () => (
  <section className="border-y border-border bg-background py-12">
    <div className="max-w-[980px] mx-auto px-4">
      <Reveal>
        <p className="text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
          As featured in
        </p>
      </Reveal>
      <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-5">
        {press.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <span
              className={`text-[18px] sm:text-[22px] text-foreground/55 hover:text-foreground transition-colors duration-300 select-none ${p.className}`}
              style={{ fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", system-ui, sans-serif' }}
            >
              {p.name}
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default PressStrip;
