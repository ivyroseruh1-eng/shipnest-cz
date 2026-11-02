// Real SVG payment marks (zero external requests, sharp vector rendering)

export const Visa = () => (
  <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-label="Visa">
    <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontWeight="900" fontStyle="italic" fontSize="14" fill="#1A1F71">VISA</text>
  </svg>
);

export const Mastercard = () => (
  <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-label="Mastercard">
    <circle cx="13" cy="11" r="9" fill="#EB001B" />
    <circle cx="23" cy="11" r="9" fill="#F79E1B" />
    <path d="M18 4.5a9 9 0 0 1 0 13 9 9 0 0 1 0-13z" fill="#FF5F00" />
  </svg>
);

export const Amex = () => (
  <svg viewBox="0 0 40 22" className="h-5 w-auto" aria-label="American Express">
    <rect width="40" height="22" rx="3" fill="#1F72CD" />
    <text x="20" y="14" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="7" fill="#fff">AMEX</text>
  </svg>
);

export const ApplePay = () => (
  <svg viewBox="0 0 40 22" className="h-5 w-auto" aria-label="Apple Pay">
    <rect width="40" height="22" rx="3" fill="#000" />
    <text x="20" y="14" textAnchor="middle" fontFamily="-apple-system, Helvetica, Arial, sans-serif" fontSize="8" fontWeight="600" fill="#fff">Pay</text>
  </svg>
);

export const GPay = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="Google Pay">
    <rect width="44" height="22" rx="3" fill="#fff" stroke="#dadce0" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700">
      <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC04">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan><tspan fill="#000"> Pay</tspan>
    </text>
  </svg>
);

export const PayPalIcon = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="PayPal">
    <rect width="44" height="22" rx="3" fill="#003087" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="800" fontStyle="italic" fill="#0079C1">
      <tspan fill="#0079C1">Pay</tspan><tspan fill="#00457C">Pal</tspan>
    </text>
  </svg>
);

export const KlarnaIcon = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="Klarna">
    <rect width="44" height="22" rx="3" fill="#FFB3C7" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="800" fill="#0A0A0A">Klarna.</text>
  </svg>
);

export const IdealIcon = () => (
  <svg viewBox="0 0 40 22" className="h-5 w-auto" aria-label="iDEAL">
    <rect width="40" height="22" rx="3" fill="#CC0066" />
    <text x="20" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="800" fill="#fff">iDEAL</text>
  </svg>
);

export const AlipayIcon = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="Alipay">
    <rect width="44" height="22" rx="3" fill="#1677FF" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700" fill="#fff">支 Alipay</text>
  </svg>
);

export const WeChatPayIcon = () => (
  <svg viewBox="0 0 48 22" className="h-5 w-auto" aria-label="WeChat Pay">
    <rect width="48" height="22" rx="3" fill="#07C160" />
    <text x="24" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="700" fill="#fff">微信支付</text>
  </svg>
);

export const JcbIcon = () => (
  <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-label="JCB">
    <rect width="36" height="22" rx="3" fill="#0E4C92" />
    <text x="18" y="14" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="7" fontWeight="900" fill="#fff">JCB</text>
  </svg>
);

export const PayPayIcon = () => (
  <svg viewBox="0 0 44 22" className="h-5 w-auto" aria-label="PayPay">
    <rect width="44" height="22" rx="3" fill="#FF0033" />
    <text x="22" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="800" fill="#fff">PayPay</text>
  </svg>
);

const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {[Visa, Mastercard, Amex, ApplePay, GPay, PayPalIcon, KlarnaIcon, AlipayIcon, WeChatPayIcon, PayPayIcon].map((Brand, i) => (
      <div key={i} className="h-8 px-2 rounded-md bg-white border border-border flex items-center justify-center shadow-xs">
        <Brand />
      </div>
    ))}
  </div>
);

export default PaymentIcons;
