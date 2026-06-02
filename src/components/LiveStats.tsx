import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 12847, suffix: "", label: "Orders delivered to date" },
  { value: 47, suffix: "", label: "Countries served" },
  { value: 98.6, suffix: "%", label: "On-time delivery rate", decimals: 1 },
  { value: 26, suffix: " days", label: "Avg. Prague → India transit" },
];

const Counter = ({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const dur = 1800;
        const tick = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  const formatted = decimals ? v.toFixed(decimals) : Math.floor(v).toLocaleString();
  return <span ref={ref}>{formatted}{suffix}</span>;
};

const LiveStats = () => (
  <section className="border-t border-border bg-background py-16">
    <div className="max-w-[980px] mx-auto px-4">
      <div className="text-center mb-10">
        <p className="text-[12px] text-primary font-medium uppercase tracking-wider">By the numbers</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mt-2">A platform people trust</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight tabular-nums">
              <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="text-[12px] text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LiveStats;