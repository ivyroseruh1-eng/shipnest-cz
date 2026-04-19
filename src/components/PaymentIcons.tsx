const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {["VISA", "MC", "AMEX", "Pay"].map(label => (
      <div key={label} className="h-7 px-3 rounded-md bg-background border border-border flex items-center justify-center">
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">{label}</span>
      </div>
    ))}
  </div>
);

export default PaymentIcons;
