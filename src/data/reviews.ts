export interface Review {
  name: string;
  date: string;
  rating: number;
  comment: string;
  verified: boolean;
}

// Generic review pool — mapped to products by index rotation
const reviewPool: Review[][] = [
  [
    { name: "Tomáš K.", date: "2026-03-12", rating: 5, comment: "Absolutely stunning device. Arrived in perfect condition, well-packaged with all accessories. Shipping from Prague was surprisingly fast — got it in 4 days to Germany.", verified: true },
    { name: "Sarah M.", date: "2026-02-28", rating: 5, comment: "Best purchase I've made this year. The quality is exactly as described and customer support was very responsive when I had questions about my order.", verified: true },
    { name: "James L.", date: "2026-02-15", rating: 4, comment: "Great product overall. Delivery took about a week to the UK which is reasonable. Only minor complaint is the box had a small dent, but the product inside was perfect.", verified: true },
    { name: "Anna P.", date: "2026-01-30", rating: 5, comment: "Third time ordering from ShipNest. Always reliable, always authentic products. This one exceeded my expectations — the build quality is phenomenal.", verified: true },
    { name: "Marco R.", date: "2026-01-18", rating: 4, comment: "Very satisfied with the purchase. Works exactly as expected. The tracking system kept me updated throughout. Would buy again.", verified: true },
  ],
  [
    { name: "Elena V.", date: "2026-03-08", rating: 5, comment: "Incredible value for money. I compared prices across 5 different stores and ShipNest had the best deal. Plus free shipping? Can't beat it.", verified: true },
    { name: "David H.", date: "2026-02-22", rating: 5, comment: "The product is amazing. Screen quality, performance, everything is top-notch. Shipping was fast and the packaging was very secure.", verified: true },
    { name: "Lisa T.", date: "2026-02-10", rating: 4, comment: "Really happy with this purchase. Setup was easy and everything works perfectly. Took 6 days to arrive in the US which is great for international shipping.", verified: true },
    { name: "Martin B.", date: "2026-01-28", rating: 5, comment: "Genuine product, no doubt about it. Registered with the manufacturer without any issues. ShipNest is legit — I was skeptical at first but they delivered.", verified: true },
    { name: "Sophie W.", date: "2026-01-15", rating: 4, comment: "Good product, good price, good service. The only reason I'm not giving 5 stars is because I wish they had more color options in stock.", verified: true },
  ],
  [
    { name: "Petr N.", date: "2026-03-05", rating: 5, comment: "Dorazilo do Prahy za 2 dny! Perfektní stav, originální balení. Určitě doporučuji. (Arrived in Prague in 2 days! Perfect condition, original packaging.)", verified: true },
    { name: "Raj P.", date: "2026-02-18", rating: 5, comment: "Shipped to India in 8 days. Product is 100% genuine. I verified the serial number with the manufacturer. Very impressed with ShipNest.", verified: true },
    { name: "Christine F.", date: "2026-02-05", rating: 4, comment: "Love the product! Camera quality is insane. Only thing is customs took a couple extra days, but that's not ShipNest's fault.", verified: true },
    { name: "Ahmed K.", date: "2026-01-22", rating: 5, comment: "Best online tech store I've used. Product arrived exactly as shown, with all original accessories. The 30-day return policy gave me confidence to order.", verified: true },
    { name: "Yuki T.", date: "2026-01-10", rating: 5, comment: "Ordered to Japan, arrived in 7 days. Everything is original. Battery health at 100%. Very professional packaging. Will order again.", verified: true },
  ],
];

export const getProductReviews = (productId: string): Review[] => {
  // Deterministic mapping based on product ID
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash |= 0;
  }
  const poolIndex = Math.abs(hash) % reviewPool.length;
  return reviewPool[poolIndex];
};
