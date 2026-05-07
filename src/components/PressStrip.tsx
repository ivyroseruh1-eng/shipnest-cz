import Reveal from "./Reveal";

const press = ["WIRED", "The Verge", "TechCrunch", "Engadget", "Forbes", "Bloomberg"];

const PressStrip = () => (
  <section className="border-y border-border bg-background py-10">
    <div className="max-w-[980px] mx-auto px-4">
      <Reveal>
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">
          Featured in
        </p>
      </Reveal>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {press.map((p, i) => (
          <Reveal key={p} delay={i * 60}>
            <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight text-foreground/40 hover:text-foreground/80 transition-colors uppercase">
              {p}
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default PressStrip;
