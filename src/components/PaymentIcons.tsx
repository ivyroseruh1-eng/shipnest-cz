// Authentic vector SVG payment marks (clean scalable paths, zero external assets, accurate brand colors)
import React from "react";

export const Visa = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 54 18" className={className} aria-label="Visa" fill="none">
    <path
      d="M21.2 1.5L14.7 16.5H10.5L6.4 4.5C6.1 3.7 5.9 3.4 5.2 3C3.9 2.3 1.8 1.8 0 1.4L0.1 1H7.5C8.5 1 9.4 1.7 9.6 2.8L11.5 12.2L15.6 1.5H21.2Z"
      fill="#1A1F71"
    />
    <path
      d="M26.2 1.5L22.9 16.5H18.9L22.2 1.5H26.2Z"
      fill="#1A1F71"
    />
    <path
      d="M34.2 5.5C34.2 3.4 31.4 3 28.5 3C27.1 3.1 25.8 3.4 24.6 3.9L25.3 7C26.3 6.5 27.5 6.2 28.7 6.2C30.1 6.2 30.9 6.8 30.9 7.6C30.9 8.4 30.2 8.8 28.8 9.5C26.4 10.6 24.8 11.7 24.8 13.6C24.8 16.2 27.7 17.8 31.6 17.8C33.2 17.8 34.6 17.4 35.6 17L35 13.9C34.1 14.3 33 14.7 31.8 14.7C30.3 14.7 29.4 14.1 29.4 13.2C29.4 12.4 30.2 11.9 31.7 11.2C33.7 10.1 34.2 8.8 34.2 5.5Z"
      fill="#1A1F71"
    />
    <path
      d="M45.5 1.5L42.3 16.5H38.7L41.3 4.8C41.1 4.4 40.5 4.1 39.9 4.1C38.7 4.1 37.7 5.4 37.1 6.9L35.3 16.5H31.5L37.5 1.5H41.3L43.3 10.6L44.1 1.5H45.5Z"
      fill="#1A1F71"
    />
  </svg>
);

export const Mastercard = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 38 24" className={className} aria-label="Mastercard" fill="none">
    <rect width="38" height="24" rx="4" fill="#141414" />
    <circle cx="14" cy="12" r="7.5" fill="#EB001B" />
    <circle cx="24" cy="12" r="7.5" fill="#F79E1B" />
    <path
      d="M19 6.64A7.47 7.47 0 0 1 22 12c0 2.15-1.2 4.02-3 4.96A7.47 7.47 0 0 1 16 12c0-2.15 1.2-4.02 3-4.96Z"
      fill="#FF5F00"
    />
  </svg>
);

export const Amex = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 40 24" className={className} aria-label="American Express" fill="none">
    <rect width="40" height="24" rx="4" fill="#006FCF" />
    <path
      d="M6 18L10 6H13.2L17.2 18H14.5L13.7 15.4H9.5L8.7 18H6ZM10.2 13.3H13L11.6 8.8H11.5L10.2 13.3ZM18.2 18V6H21.5L23.7 12.6H23.8L26 6H29.3V18H26.8V10.2H26.7L24.5 16.5H22.9L20.8 10.2H20.7V18H18.2ZM30.5 18V6H37.8V8.3H33.2V10.8H37V13.1H33.2V15.7H37.8V18H30.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const ApplePay = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 46 24" className={className} aria-label="Apple Pay" fill="none">
    <rect width="46" height="24" rx="4" fill="#000000" />
    {/* Apple Logo */}
    <path
      d="M12.9 6.2c.5-.6.8-1.4.7-2.2-.8 0-1.6.5-2.1 1.1-.4.5-.8 1.4-.7 2.2.9.1 1.7-.5 2.1-1.1Z"
      fill="#FFFFFF"
    />
    <path
      d="M13.6 7.4c-1.2 0-2.1.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.3 2.2-.3 5.4 1 7.1.6.9 1.3 1.8 2.2 1.8.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.3.6.9 0 1.6-.8 2.2-1.7.7-1 1-2 1-2.1 0 0-1.9-.7-1.9-2.9 0-1.8 1.5-2.7 1.6-2.7-.9-1.2-2.1-1.4-2.7-1.4Z"
      fill="#FFFFFF"
    />
    {/* Pay text in Apple SF vector paths */}
    <path
      d="M22 6.5H25.3C27.5 6.5 29 7.7 29 9.7C29 11.7 27.5 12.9 25.3 12.9H23.7V17.5H22V6.5ZM23.7 11.4H25.2C26.5 11.4 27.3 10.7 27.3 9.7C27.3 8.7 26.5 8 25.2 8H23.7V11.4Z"
      fill="#FFFFFF"
    />
    <path
      d="M34.2 17.5L34 16.1C33.4 17.2 32.2 17.7 31 17.7C29.2 17.7 28.1 16.5 28.1 14.8C28.1 12.9 29.5 11.9 32.1 11.8L33.9 11.7V11.1C33.9 10 33.2 9.4 32.1 9.4C31 9.4 30.2 9.9 29.8 10.6L28.6 9.7C29.3 8.7 30.6 8 32.2 8C34.4 8 35.6 9.2 35.6 11.2V17.5H34.2ZM33.9 13.1L32.4 13.2C30.9 13.3 30 13.8 30 14.8C30 15.7 30.6 16.3 31.6 16.3C32.9 16.3 33.9 15.3 33.9 14V13.1Z"
      fill="#FFFFFF"
    />
    <path
      d="M37.1 20.4L39.8 12.8L37.4 9.8H39.3L40.7 11.9L42.1 9.8H44L40.4 14.1L38.7 20.4H37.1Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const GPay = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 46 24" className={className} aria-label="Google Pay" fill="none">
    <rect width="46" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
    {/* Google 4-color 'G' */}
    <g transform="translate(6, 4)">
      <path
        d="M8.7 8.16C8.7 7.6 8.65 7.07 8.56 6.56H0V9.8H4.88C4.67 10.93 4.04 11.89 3.08 12.53V14.8H6C7.71 13.23 8.7 10.92 8.7 8.16Z"
        fill="#4285F4"
      />
      <path
        d="M0 16.96C2.35 16.96 4.32 16.18 5.76 14.85L2.84 12.58C2.03 13.12 1.01 13.44 0 13.44C-1.54 13.44 -2.84 12.4 -3.3 11H-6.32V13.34C-4.84 15.5 -2.14 16.96 0 16.96Z"
        fill="#34A853"
      />
      <path
        d="M-3.3 11C-3.42 10.63 -3.48 10.23 -3.48 9.82C-3.48 9.41 -3.42 9.01 -3.3 8.64V6.3H-6.32C-6.94 7.53 -7.28 8.91 -7.28 10.38C-7.28 11.85 -6.94 13.23 -6.32 14.46L-3.3 11Z"
        fill="#FBBC05"
      />
      <path
        d="M0 6.2C1.28 6.2 2.43 6.64 3.33 7.5L5.78 5.05C4.28 3.65 2.35 2.68 0 2.68C-2.14 2.68 -4.84 4.14 -6.32 6.3L-3.3 8.64C-2.84 7.24 -1.54 6.2 0 6.2Z"
        fill="#EA4335"
      />
    </g>
    {/* Pay text */}
    <g transform="translate(23, 5)">
      <path
        d="M1.3 2H4.8C6.9 2 8.3 3.3 8.3 5.3C8.3 7.3 6.9 8.6 4.8 8.6H3V13.5H1.3V2ZM3 7.1H4.7C5.9 7.1 6.6 6.4 6.6 5.3C6.6 4.2 5.9 3.5 4.7 3.5H3V7.1Z"
        fill="#3C4043"
      />
      <path
        d="M13.6 13.5L13.4 12.2C12.8 13.2 11.7 13.7 10.6 13.7C8.9 13.7 7.9 12.6 7.9 11C7.9 9.2 9.2 8.2 11.7 8.1L13.3 8V7.4C13.3 6.4 12.7 5.8 11.6 5.8C10.6 5.8 9.9 6.3 9.5 7L8.4 6.1C9.1 5.1 10.3 4.4 11.8 4.4C13.8 4.4 15 5.5 15 7.4V13.5H13.6ZM13.3 9.4L12 9.5C10.6 9.6 9.7 10.1 9.7 11C9.7 11.8 10.3 12.4 11.2 12.4C12.4 12.4 13.3 11.5 13.3 10.3V9.4Z"
        fill="#3C4043"
      />
      <path
        d="M16.3 16.3L18.8 9.1L16.6 6.3H18.4L19.7 8.3L21 6.3H22.8L19.4 10.4L17.8 16.3H16.3Z"
        fill="#3C4043"
      />
    </g>
  </svg>
);

export const PayPalIcon = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 46 24" className={className} aria-label="PayPal" fill="none">
    <rect width="46" height="24" rx="4" fill="#003087" />
    <g transform="translate(14, 4)">
      {/* Back P */}
      <path
        d="M4.2 1.5H10.5C13.1 1.5 14.8 2.8 14.3 5.4C13.8 7.9 11.9 9.3 9.3 9.3H6.8L5.2 17.5H1L4.2 1.5Z"
        fill="#0079C1"
      />
      {/* Front overlapping P */}
      <path
        d="M7.4 4.8H13.2C15.6 4.8 17.1 6 16.7 8.4C16.1 11.2 14.1 12.6 11.6 12.6H9.3L8 19H4.5L7.4 4.8Z"
        fill="#00457C"
        opacity="0.9"
      />
      <path
        d="M8.2 4.8H13.5C15.8 4.8 17.3 6 16.9 8.4C16.3 11.2 14.3 12.6 11.8 12.6H9.5L8.2 19H5.2L8.2 4.8Z"
        fill="#0079C1"
      />
    </g>
  </svg>
);

const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {[Visa, Mastercard, Amex, ApplePay, GPay, PayPalIcon].map((Brand, i) => (
      <div key={i} className="h-7 px-2 rounded-md bg-white border border-border flex items-center justify-center shadow-xs">
        <Brand />
      </div>
    ))}
  </div>
);

export default PaymentIcons;
