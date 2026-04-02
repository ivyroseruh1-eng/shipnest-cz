const PaymentIcons = () => (
  <div className="flex items-center gap-3">
    {/* Visa */}
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
      <path d="M19.5 21H17L14.5 13.5C14.38 13.1 14.15 12.75 13.8 12.6C12.9 12.15 11.9 11.8 10.8 11.65V11.35H15.3C15.9 11.35 16.35 11.8 16.4 12.35L17.5 18.15L19.5 11.35H22L19.5 21ZM23 21H20.6L22.6 11.35H25L23 21ZM29.5 14.1C29.55 13.55 30 13.25 30.55 13.25C31.4 13.2 32.3 13.4 33.1 13.75L33.55 11.6C32.75 11.25 31.9 11.1 31.1 11.1C28.75 11.1 27 12.45 27 14.3C27 15.7 28.2 16.4 29.1 16.85C30.05 17.3 30.4 17.6 30.35 18C30.35 18.6 29.65 18.9 29 18.9C28.05 18.9 27.1 18.6 26.3 18.2L25.85 20.35C26.75 20.7 27.7 20.85 28.6 20.85C31.2 20.9 32.85 19.55 32.85 17.55C32.85 15.05 29.5 14.9 29.5 14.1ZM39.5 21L37.6 11.35H35.6C35.15 11.35 34.7 11.65 34.55 12.1L31 21H33.5L33.95 19.7H37L37.3 21H39.5ZM34.55 17.7L35.8 14.15L36.5 17.7H34.55Z" fill="hsl(var(--foreground))" />
    </svg>

    {/* Mastercard */}
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
      <circle cx="20" cy="16" r="7" fill="hsl(var(--muted-foreground))" opacity="0.3" />
      <circle cx="28" cy="16" r="7" fill="hsl(var(--muted-foreground))" opacity="0.3" />
      <path d="M24 10.5C25.6 11.8 26.6 13.8 26.6 16C26.6 18.2 25.6 20.2 24 21.5C22.4 20.2 21.4 18.2 21.4 16C21.4 13.8 22.4 11.8 24 10.5Z" fill="hsl(var(--muted-foreground))" opacity="0.5" />
    </svg>

    {/* Amex */}
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
      <text x="24" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
    </svg>

    {/* Apple Pay */}
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
      <text x="24" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="6.5" fontWeight="600" fontFamily="sans-serif"> Pay</text>
    </svg>
  </div>
);

export default PaymentIcons;
