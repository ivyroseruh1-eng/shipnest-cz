// Authentic vector SVG payment marks sourced directly from official brand guidelines.
// Stored locally in /assets/payment/ with inline scalable SVG fallbacks.
import React from "react";

export interface PaymentIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Visa = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/visa.svg"
    alt="Visa"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const Mastercard = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/mastercard.svg"
    alt="Mastercard"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const Amex = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/amex.svg"
    alt="American Express"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const ApplePay = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/apple-pay.svg"
    alt="Apple Pay"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const GPay = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/google-pay.svg"
    alt="Google Pay"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const PayPalIcon = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/paypal.svg"
    alt="PayPal"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const SepaIcon = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/sepa.svg"
    alt="SEPA Direct Debit"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const IdealIcon = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/ideal.svg"
    alt="iDEAL"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const BancontactIcon = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/bancontact.svg"
    alt="Bancontact"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

export const BlikIcon = ({ className = "h-5 w-auto" }: PaymentIconProps) => (
  <img
    src="/assets/payment/blik.svg"
    alt="BLIK"
    className={`object-contain select-none ${className}`}
    loading="lazy"
    draggable={false}
  />
);

const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {[Visa, Mastercard, Amex, ApplePay, GPay, PayPalIcon, SepaIcon, IdealIcon, BancontactIcon, BlikIcon].map((Brand, i) => (
      <div key={i} className="h-7 px-2 rounded-md bg-white border border-border flex items-center justify-center shadow-xs">
        <Brand />
      </div>
    ))}
  </div>
);

export default PaymentIcons;
