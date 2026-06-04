import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";

const reviews = [
  { name: "Arjun M.", city: "Mumbai", rating: 5, body: "Ordered the iPhone 17 Pro Max. Sealed, original, arrived exactly when the tracker said it would. ShipNest is the real deal.", product: "iPhone 17 Pro Max" },
  { name: "Sophie K.", city: "Berlin", rating: 5, body: "Express shipping was actually express. Updates at every milestone. Best international electronics order I've made.", product: "Galaxy S25 Ultra" },
  { name: "Daniel R.", city: "London", rating: 5, body: "Customer service answered in under 2 minutes. Product was perfect. Won't shop anywhere else for premium tech.", product: "MacBook Pro 16" },
  { name: "Priya S.", city: "Bengaluru", rating: 5, body: "The tracking page is genuinely impressive — saw it move through every checkpoint. Total trust earned.", product: "Pixel 9 Pro" },
  { name: "Tomáš N.", city: "Prague", rating: 5, body: "Local pickup was a breeze. Genuine product, sealed box, great price. Highly recommend.", product: "Sony WH-1000XM6" },
  { name: "Aisha B.", city: "Dubai", rating: 5, body: "Was nervous ordering electronics internationally. ShipNest's tracking and support put me at ease. 10/10.", product: "iPad Pro M5" },
];

const ReviewsCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5500);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2].map((o) => reviews[(index + o) % reviews.length]);

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-[980px] mx-auto px-4">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2">Reviews</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Loved worldwide.
              </h2>
              <p className="text-[14px] text-muted-foreground mt-2">4.9 average from 12,400+ verified customers.</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
                className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % reviews.length)}
                className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {visible.map((r, i) => (
            <div
              key={`${index}-${i}`}
              className="bg-secondary/60 rounded-2xl p-6 space-y-3 animate-fade-in"
            >
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-amber-500 text-amber-500" : "text-border"}`} />
                ))}
              </div>
              <p className="text-[14px] text-foreground leading-relaxed">"{r.body}"</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.city}</p>
                </div>
                <span className="text-[10px] text-success font-semibold bg-success/10 px-2 py-1 rounded-full">✓ Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;