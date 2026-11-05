// Authentic vector SVG payment marks sourced directly from official brand guidelines & Datatrans.
// Standardized in international 120x80 (3:2) payment card proportions.
import React from "react";

export type PaymentBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "stripe"
  | "apple-pay"
  | "google-pay"
  | "paypal"
  | "sepa"
  | "ideal"
  | "bancontact"
  | "blik";

export interface PaymentIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  withContainer?: boolean;
}

const BRAND_ALTS: Record<PaymentBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  stripe: "Stripe",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  paypal: "PayPal",
  sepa: "SEPA Direct Debit",
  ideal: "iDEAL",
  bancontact: "Bancontact",
  blik: "BLIK",
};

const SIZE_CLASSES = {
  xs: "h-5 w-[30px] rounded",
  sm: "h-6 w-[36px] rounded-md",
  md: "h-7.5 w-[45px] rounded-md",
  lg: "h-9 w-[54px] rounded-lg",
};

export const PaymentBadge: React.FC<{
  brand: PaymentBrand;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}> = ({ brand, size = "sm", className = "" }) => {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-border/80 dark:border-neutral-700/60 shadow-2xs overflow-hidden shrink-0 select-none aspect-[3/2] ${SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={`/assets/payment/${brand}.svg`}
        alt={BRAND_ALTS[brand]}
        className={`w-full h-full object-contain ${brand === "visa" ? "px-0.5" : ""}`}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};

export const Visa = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="visa" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/visa.svg"
      alt="Visa"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const Mastercard = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="mastercard" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/mastercard.svg"
      alt="Mastercard"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const Amex = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="amex" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/amex.svg"
      alt="American Express"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const ApplePay = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="apple-pay" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/apple-pay.svg"
      alt="Apple Pay"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const GPay = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="google-pay" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/google-pay.svg"
      alt="Google Pay"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const PayPalIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="paypal" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/paypal.svg"
      alt="PayPal"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const SepaIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="sepa" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/sepa.svg"
      alt="SEPA Direct Debit"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const IdealIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="ideal" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/ideal.svg"
      alt="iDEAL"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const BancontactIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="bancontact" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/bancontact.svg"
      alt="Bancontact"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const BlikIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="blik" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/blik.svg"
      alt="BLIK"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

export const StripeIcon = ({ className = "", size = "sm", withContainer = true }: PaymentIconProps) =>
  withContainer ? (
    <PaymentBadge brand="stripe" size={size} className={className} />
  ) : (
    <img
      src="/assets/payment/stripe.svg"
      alt="Stripe"
      className={`object-contain select-none ${className || "h-5 w-auto"}`}
      loading="lazy"
      draggable={false}
    />
  );

const PaymentIcons = () => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {(["visa", "mastercard", "amex", "stripe", "apple-pay", "google-pay", "paypal", "sepa", "ideal", "bancontact", "blik"] as PaymentBrand[]).map(
      (brand) => (
        <PaymentBadge key={brand} brand={brand} size="sm" />
      )
    )}
  </div>
);

export default PaymentIcons;
