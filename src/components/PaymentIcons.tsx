// Real card-brand SVG marks (no external requests, recognizable shapes)
const Visa = () => (
  <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-label="Visa">
    <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontWeight="900" fontStyle="italic" fontSize="14" fill="#1A1F71">VISA</text>
  </svg>
);
const Mastercard = () => (
  <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-label="Mastercard">
    <circle cx="13" cy="11" r="9" fill="#EB001B" />
    <circle cx="23" cy="11" r="9" fill="#F79E1B" />
    <path d="M18 4.5a9 9 0 0 1 0 13 9 9 0 0 1 0-13z" fill="#FF5F00" />
  </svg>
);
const Amex = () => (
  <svg viewBox="0 0 40 22" className="h-5 w-auto" aria-label="American Express">
    <rect width="40" height="22" rx="3" fill="#1F72CD" />
    <text x="20" y="14" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="7" fill="#fff">AMEX</text>
  </svg>
);
const ApplePay = () => (
  <svg viewBox="0 0 40 22" className="h-5 w-auto" aria-label="Apple Pay">
    <rect width="40" height="22" rx="3" fill="#000" />
    <text x="20" y="14" textAnchor="middle" fontFamily="-apple-system, Helvetica, Arial, sans-serif" fontSize="8" fontWeight="600" fill="#fff">Pay</text>
  </svg>
);
const GPay = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="Google Pay">
    <rect width="44" height="22" rx="3" fill="#fff" stroke="#dadce0" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700">
      <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC04">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan><tspan fill="#000"> Pay</tspan>
    </text>
  </svg>
);

const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {[Visa, Mastercard, Amex, ApplePay, GPay].map((Brand, i) => (
      <div key={i} className="h-8 px-2 rounded-md bg-white border border-border flex items-center justify-center shadow-sm">
        <Brand />
      </div>
    ))}
  </div>
);

export { Visa, Mastercard, Amex, ApplePay, GPay };
export default PaymentIcons;
