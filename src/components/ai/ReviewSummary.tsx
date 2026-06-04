import { useEffect, useState } from "react";
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Summary = {
  pros: string[];
  cons: string[];
  bestFor: string;
};

const CACHE_PREFIX = "shipnest.review-summary.v1.";

const ReviewSummary = ({
  productId,
  productName,
  reviews,
}: {
  productId: string;
  productName: string;
  reviews: Array<{ rating: number; comment: string }>;
}) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reviews.length) return;
    const cacheKey = CACHE_PREFIX + productId;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSummary(JSON.parse(cached));
        return;
      }
    } catch {}

    setLoading(true);
    supabase.functions
      .invoke("review-summary", {
        body: {
          productName,
          reviews: reviews.slice(0, 30).map((r) => ({ rating: r.rating, comment: r.comment })),
        },
      })
      .then(({ data, error }) => {
        if (error) throw error;
        const s = data as Summary;
        if (s?.pros && s?.cons) {
          setSummary(s);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(s));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (!reviews.length) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-transparent border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">AI summary</p>
          <p className="text-[11px] text-muted-foreground">From {reviews.length} verified reviews</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading reviews…
        </div>
      )}

      {summary && (
        <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
          <div>
            <div className="flex items-center gap-1.5 text-success font-semibold mb-2">
              <ThumbsUp className="w-3.5 h-3.5" /> Pros
            </div>
            <ul className="space-y-1.5 text-muted-foreground">
              {summary.pros.slice(0, 3).map((p, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-success">•</span>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-destructive font-semibold mb-2">
              <ThumbsDown className="w-3.5 h-3.5" /> Cons
            </div>
            <ul className="space-y-1.5 text-muted-foreground">
              {summary.cons.slice(0, 3).map((p, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-destructive">•</span>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-primary font-semibold mb-2">
              <Users className="w-3.5 h-3.5" /> Best for
            </div>
            <p className="text-muted-foreground leading-relaxed">{summary.bestFor}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;