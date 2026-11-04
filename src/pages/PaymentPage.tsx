import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Shield,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  QrCode,
  Smartphone,
  Wallet,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  Visa,
  Mastercard,
  Amex,
  ApplePay,
  GPay,
  PayPalIcon,
  SepaIcon,
  IdealIcon,
  BancontactIcon,
  BlikIcon,
} from "@/components/PaymentIcons";
import Logo from "@/components/brand/Logo";
import { useCart } from "@/context/CartContext";
import {
  useOrders,
  generateOrderId,
  generateTrackingId,
  createDefaultTrackingSteps,
} from "@/context/OrderContext";
import PaymentScene, { CardBrand } from "@/components/payment/PaymentScene";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { DeliveryInfo } from "@/pages/CheckoutPage";

type PaymentCategory = "card" | "sepa" | "regional" | "wallets";
type RegionalMethod = "ideal" | "bancontact" | "blik";

const DUTCH_BANKS = [
  "Select your bank...",
  "ABN AMRO",
  "ING Bank",
  "Rabobank",
  "bunq",
  "SNS Bank",
  "ASN Bank",
  "RegioBank",
  "Triodos Bank",
  "Knab",
];

// Luhn formula check for card validity
const validateLuhn = (numStr: string): boolean => {
  const clean = numStr.replace(/\D/g, "");
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// Real-time card brand detection
const detectCardBrand = (numStr: string): CardBrand => {
  const clean = numStr.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mc";
  if (/^3[47]/.test(clean)) return "amex";
  return "unknown";
};

// Expiry MM/YY validation
const validateExpiry = (exp: string): boolean => {
  const match = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;
  return true;
};

const PaymentPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  // Retrieve delivery info saved during Step 1 (/checkout)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [orderRef] = useState(() => `SN-${Math.floor(100000 + Math.random() * 900000)}`);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shipnest-delivery-info");
      if (saved) {
        setDeliveryInfo(JSON.parse(saved));
      } else if (items.length > 0) {
        // If customer navigated directly to /payment without delivery info, redirect back to /checkout
        toast.error("Please enter your delivery address first.");
        navigate("/checkout");
      }
    } catch {
      navigate("/checkout");
    }
  }, [items.length, navigate]);

  // Selected Category (Razorpay UX: Cards, SEPA, European Online Banking, Digital Wallets)
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("card");
  const [activeRegionalMethod, setActiveRegionalMethod] = useState<RegionalMethod>("ideal");

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    saveCard: false,
  });

  // Pre-fill cardholder name from delivery recipient once loaded
  useEffect(() => {
    if (deliveryInfo?.name && !cardForm.cardName) {
      setCardForm((prev) => ({ ...prev, cardName: deliveryInfo.name.toUpperCase() }));
    }
  }, [deliveryInfo?.name]);

  // SEPA Direct Debit form state
  const [sepaForm, setSepaForm] = useState({
    accountName: "",
    iban: "",
    bic: "",
    acceptMandate: false,
  });

  useEffect(() => {
    if (deliveryInfo?.name && !sepaForm.accountName) {
      setSepaForm((prev) => ({ ...prev, accountName: deliveryInfo.name }));
    }
  }, [deliveryInfo?.name]);

  // Regional methods state
  const [idealBank, setIdealBank] = useState("");
  const [blikCode, setBlikCode] = useState("");

  // Payment processing & 3D Terminal Scene states
  const [isProcessing, setIsProcessing] = useState(false);
  const [authData, setAuthData] = useState<{
    authCode: string;
    refCode: string;
    network: string;
    issuer: string;
    methodLabel: string;
    cardLast4: string;
  } | null>(null);

  const detectedBrand = useMemo(() => detectCardBrand(cardForm.cardNumber), [cardForm.cardNumber]);

  // Auto-format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Auto-format expiry date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardForm((prev) => ({ ...prev, expiry: raw }));
  };

  // Auto-format IBAN (4-character groups)
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 34);
    const formatted = raw.replace(/(.{4})(?=.)/g, "$1 ").trim();
    setSepaForm((prev) => ({ ...prev, iban: formatted }));
  };

  // Quick fill demo test card
  const handleFillDemoCard = () => {
    setCardForm({
      cardName: (deliveryInfo?.name || "ALEX VANCE").toUpperCase(),
      cardNumber: "4532 0123 4567 8910",
      expiry: "12/28",
      cvv: "882",
      saveCard: true,
    });
    toast.info("Filled with authenticated 3D Secure test card.");
  };

  // Trigger payment processing animation
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeCategory === "card") {
      if (!cardForm.cardName.trim()) {
        toast.error("Please enter the cardholder's name.");
        return;
      }
      if (!validateLuhn(cardForm.cardNumber)) {
        toast.error("Please enter a valid credit or debit card number.");
        return;
      }
      if (!validateExpiry(cardForm.expiry)) {
        toast.error("Card expiry date is invalid or expired (MM/YY).");
        return;
      }
      const minCvv = detectedBrand === "amex" ? 4 : 3;
      if (cardForm.cvv.length < minCvv) {
        toast.error(`Please enter a valid ${minCvv}-digit security code (CVV).`);
        return;
      }

      const networkNames: Record<CardBrand, string> = {
        visa: "VisaNet Europe",
        mc: "Mastercard Worldwide",
        amex: "American Express Network",
        unknown: "EMV International",
      };

      const issuingBanks = [
        "BNP Paribas Wealth",
        "Deutsche Bank AG",
        "Société Générale",
        "UBS Switzerland AG",
        "Barclays Private Bank",
      ];

      setAuthData({
        authCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
        refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
        network: networkNames[detectedBrand],
        issuer: issuingBanks[Math.floor(Math.random() * issuingBanks.length)],
        methodLabel: `${detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4)}`,
        cardLast4: cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242",
      });
      setIsProcessing(true);
      return;
    }

    if (activeCategory === "sepa") {
      if (!sepaForm.accountName.trim()) {
        toast.error("Please enter the SEPA account holder name.");
        return;
      }
      const cleanIban = sepaForm.iban.replace(/\s/g, "");
      if (cleanIban.length < 15 || cleanIban.length > 34) {
        toast.error("Please enter a valid European IBAN (e.g. DE89 ... or CZ48 ...).");
        return;
      }
      if (!sepaForm.acceptMandate) {
        toast.error("Please accept the SEPA Direct Debit scheme mandate.");
        return;
      }

      setAuthData({
        authCode: `SEPA${Math.floor(1000 + Math.random() * 9000)}`,
        refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
        network: "SEPA Core Direct Debit (EPC)",
        issuer: "European Central Bank Target2",
        methodLabel: `SEPA IBAN •••• ${cleanIban.slice(-4)}`,
        cardLast4: cleanIban.slice(-4),
      });
      setIsProcessing(true);
      return;
    }

    if (activeCategory === "regional") {
      if (activeRegionalMethod === "ideal") {
        if (!idealBank || idealBank === "Select your bank...") {
          toast.error("Please select your Dutch bank for iDEAL transfer.");
          return;
        }
        setAuthData({
          authCode: `IDL${Math.floor(1000 + Math.random() * 9000)}`,
          refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
          network: "Currence iDEAL 2.0 (NL)",
          issuer: idealBank,
          methodLabel: `iDEAL (${idealBank})`,
          cardLast4: "iDEAL",
        });
        setIsProcessing(true);
        return;
      }

      if (activeRegionalMethod === "blik") {
        if (!/^\d{6}$/.test(blikCode.replace(/\s/g, ""))) {
          toast.error("Please enter a 6-digit BLIK one-time transaction code.");
          return;
        }
        setAuthData({
          authCode: `BLK${Math.floor(1000 + Math.random() * 9000)}`,
          refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
          network: "Polski Standard Płatności (BLIK)",
          issuer: "PKO Bank Polski / mBank",
          methodLabel: "BLIK Direct",
          cardLast4: blikCode.slice(-4),
        });
        setIsProcessing(true);
        return;
      }

      if (activeRegionalMethod === "bancontact") {
        setAuthData({
          authCode: `BC${Math.floor(1000 + Math.random() * 9000)}`,
          refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
          network: "Bancontact Payconiq Company (BE)",
          issuer: "BNP Paribas Fortis / KBC",
          methodLabel: "Bancontact App",
          cardLast4: "BCTC",
        });
        setIsProcessing(true);
        return;
      }
    }

    if (activeCategory === "wallets") {
      setAuthData({
        authCode: `WLT${Math.floor(1000 + Math.random() * 9000)}`,
        refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
        network: "Apple Pay / Secure Enclave",
        issuer: "Apple Distribution International",
        methodLabel: "Apple Pay (Device Account Number)",
        cardLast4: "8812",
      });
      setIsProcessing(true);
    }
  };

  // Wallet 1-Touch Handler
  const handleWalletExpressPay = (walletName: "Apple Pay" | "Google Pay" | "PayPal") => {
    const networkMap = {
      "Apple Pay": "Apple Pay Secure Enclave",
      "Google Pay": "Google Pay Tokenized Route",
      "PayPal": "PayPal Europe S.à r.l.",
    };
    setAuthData({
      authCode: `WLT${Math.floor(1000 + Math.random() * 9000)}`,
      refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
      network: networkMap[walletName],
      issuer: `${walletName} Instant Settlement`,
      methodLabel: walletName,
      cardLast4: "7749",
    });
    setIsProcessing(true);
  };

  // Invoked upon successful completion of the approved PaymentScene animation
  const handleOrderComplete = () => {
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const deliveryDays = Math.floor(Math.random() * 4) + 3;
    const estimatedDelivery = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const recipient = deliveryInfo || {
      name: cardForm.cardName || "Valued Customer",
      email: "order@shipnest.com",
      phone: "+420 777 000 111",
      address: "Celetna 12",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      zip: "110 00",
      deliveryMethod: "standard",
      countryCode: "+420",
      apartment: "",
    };

    const newOrder = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        address: recipient.address + (recipient.apartment ? `, ${recipient.apartment}` : ""),
        city: recipient.city,
        state: recipient.state,
        country: recipient.country,
        zip: recipient.zip,
      },
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        price: i.unitPrice !== undefined ? i.unitPrice : i.product.price || 0,
        qty: i.qty,
        selectedColor: i.selectedColor,
        selectedStorage: i.selectedStorage,
      })),
      subtotal,
      tax,
      total,
      status: "Processing",
      estimatedDelivery,
      placedAt: new Date().toISOString(),
      notes: "Priority Insured Air Express Freight · White-Glove Dispatch",
      paymentMethod: authData?.methodLabel || "Credit Card",
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(recipient.city, recipient.state, recipient.country),
    };

    // Store in context & clear sessionStorage delivery info
    addOrder(newOrder);
    try {
      sessionStorage.removeItem("shipnest-delivery-info");
    } catch {
      // Ignore
    }
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">No Pending Order</h1>
        <p className="text-[14px] text-muted-foreground">
          Your shopping bag is empty. Please select an item to begin checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-foreground/85 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground py-6 sm:py-10 lg:py-12 w-full">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Navigation & Gateway Top Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div className="flex items-center gap-4">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border/80 transition-all shadow-2xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Delivery</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-medium text-muted-foreground">
                Order Reference:
              </span>
              <span className="text-[12px] font-mono font-bold text-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
                #{orderRef}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Total Payable Amount
              </span>
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
                  ${total.toFixed(2)}
                </span>
                <span className="text-[12px] font-semibold text-muted-foreground">
                  (incl. 20% VAT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Razorpay Usability + European Architecture Layout */}
        <form onSubmit={handlePaymentSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN (5 cols on Desktop): Payment Method Navigation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h2 className="text-[15px] font-bold text-foreground tracking-tight">
                      Payment Options
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      Select your preferred settlement method
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> EU Regulated
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Category 1: Cards */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory("card")}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activeCategory === "card"
                        ? "border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs"
                        : "border-border/70 hover:border-foreground/30 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          activeCategory === "card"
                            ? "bg-foreground text-background"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-foreground">
                            Credit / Debit Cards
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Visa, Mastercard, Amex, Cartes Bancaires
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <Visa className="h-4 w-auto" />
                      <Mastercard className="h-4 w-auto" />
                    </div>
                  </button>

                  {/* Category 2: SEPA Direct Debit */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory("sepa")}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activeCategory === "sepa"
                        ? "border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs"
                        : "border-border/70 hover:border-foreground/30 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          activeCategory === "sepa"
                            ? "bg-foreground text-background"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-foreground">
                            SEPA Direct Debit
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                            Eurozone
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Direct European IBAN transfer with 8-week refund protection
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 pl-2">
                      <SepaIcon className="h-4 w-auto" />
                    </div>
                  </button>

                  {/* Category 3: European Regional Banking (iDEAL, Bancontact, BLIK) */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory("regional")}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activeCategory === "regional"
                        ? "border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs"
                        : "border-border/70 hover:border-foreground/30 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          activeCategory === "regional"
                            ? "bg-foreground text-background"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-foreground">
                            Online Banking
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                            NL / BE / PL
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          iDEAL, Bancontact, BLIK code
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <IdealIcon className="h-4 w-auto" />
                      <BlikIcon className="h-4 w-auto" />
                    </div>
                  </button>

                  {/* Category 4: Digital Wallets */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory("wallets")}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activeCategory === "wallets"
                        ? "border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs"
                        : "border-border/70 hover:border-foreground/30 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          activeCategory === "wallets"
                            ? "bg-foreground text-background"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-foreground">
                            Digital Wallets
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded">
                            1-Touch
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Apple Pay, Google Pay, PayPal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <ApplePay className="h-4 w-auto" />
                      <PayPalIcon className="h-4 w-auto" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Destination Mini Summary */}
              {deliveryInfo && (
                <div className="bg-card border border-border/70 rounded-2xl p-4 text-[12px] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-semibold text-foreground">Deliver To:</span>
                    <Link
                      to="/checkout"
                      className="text-primary hover:underline text-[11px] font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                  <p className="font-medium text-foreground truncate">{deliveryInfo.name}</p>
                  <p className="text-muted-foreground truncate">
                    {deliveryInfo.address}
                    {deliveryInfo.apartment ? `, ${deliveryInfo.apartment}` : ""}, {deliveryInfo.city} {deliveryInfo.zip}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {deliveryInfo.deliveryMethod === "priority"
                      ? "Priority White-Glove Courier"
                      : "Insured Air Express Freight"}
                  </p>
                </div>
              )}

              {/* Trust & European Compliance Badges */}
              <div className="p-4 rounded-2xl border border-border/60 bg-secondary/30 space-y-2 text-[11px] text-muted-foreground">
                <div className="grid grid-cols-2 gap-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PCI-DSS Level 1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>256-bit SSL TLS 1.3</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>3D Secure 2.0 (SCA)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>GDPR Compliant</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                  Transactions processed in accordance with European Payment Services Directive (PSD2).
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols on Desktop): Active Payment Form */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-6">
                {/* 1. CREDIT / DEBIT CARDS FORM */}
                {activeCategory === "card" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-foreground tracking-tight">
                          Credit or Debit Card
                        </h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          Direct encrypted clearing via European acquirer
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleFillDemoCard}
                        className="text-[11px] font-semibold text-primary hover:underline bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-full transition-colors"
                      >
                        Fill Demo Card
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          required
                          value={cardForm.cardName}
                          onChange={(e) =>
                            setCardForm((prev) => ({ ...prev, cardName: e.target.value.toUpperCase() }))
                          }
                          placeholder="ALEX VANCE"
                          className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      {/* Card Number with Brand Badge */}
                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            required
                            value={cardForm.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4532 0123 4567 8910"
                            maxLength={19}
                            className="w-full h-12 pl-3.5 pr-14 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            {detectedBrand === "visa" && <Visa className="h-4 w-auto" />}
                            {detectedBrand === "mc" && <Mastercard className="h-4 w-auto" />}
                            {detectedBrand === "amex" && <Amex className="h-4 w-auto" />}
                            {detectedBrand === "unknown" && (
                              <CreditCard className="w-5 h-5 text-muted-foreground/60" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            Expiry (MM/YY) *
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            required
                            value={cardForm.expiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            CVV / CVC *
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="cvv"
                              required
                              value={cardForm.cvv}
                              onChange={(e) =>
                                setCardForm((prev) => ({
                                  ...prev,
                                  cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                                }))
                              }
                              placeholder="•••"
                              maxLength={4}
                              className="w-full h-12 pl-3.5 pr-9 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                            />
                            <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="saveCardCheckbox"
                          checked={cardForm.saveCard}
                          onChange={(e) =>
                            setCardForm((prev) => ({ ...prev, saveCard: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                        />
                        <label
                          htmlFor="saveCardCheckbox"
                          className="text-[12px] text-muted-foreground cursor-pointer select-none"
                        >
                          Save this card securely with tokenized EMV credentials for faster checkout
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SEPA DIRECT DEBIT FORM */}
                {activeCategory === "sepa" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-foreground tracking-tight">
                          SEPA Direct Debit Mandate
                        </h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          Eurozone interbank settlement via EPC Core Direct Debit Scheme
                        </p>
                      </div>
                      <SepaIcon className="h-6 w-auto" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          Bank Account Holder Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={sepaForm.accountName}
                          onChange={(e) =>
                            setSepaForm((prev) => ({ ...prev, accountName: e.target.value }))
                          }
                          placeholder="Alex Vance"
                          className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          IBAN (International Bank Account Number) *
                        </label>
                        <input
                          type="text"
                          required
                          value={sepaForm.iban}
                          onChange={handleIbanChange}
                          placeholder="DE89 3704 0044 0532 0130 00"
                          className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                        <span className="text-[11px] text-muted-foreground mt-1 block">
                          Supported in all 27 EU member states, EEA, UK, and Switzerland.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          BIC / SWIFT Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={sepaForm.bic}
                          onChange={(e) =>
                            setSepaForm((prev) => ({ ...prev, bic: e.target.value.toUpperCase() }))
                          }
                          placeholder="DEUTDEDBFXX"
                          maxLength={11}
                          className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      {/* Official SEPA Core Mandate Disclaimer */}
                      <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="sepaMandateCheck"
                            required
                            checked={sepaForm.acceptMandate}
                            onChange={(e) =>
                              setSepaForm((prev) => ({ ...prev, acceptMandate: e.target.checked }))
                            }
                            className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-border shrink-0"
                          />
                          <label
                            htmlFor="sepaMandateCheck"
                            className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
                          >
                            <span className="font-semibold text-foreground block mb-0.5">
                              SEPA Direct Debit Mandate Acceptance (Creditor ID: CZ49ZZZ918234)
                            </span>
                            By confirming this payment, you authorize ShipNest Europe s.r.o. to send
                            instructions to your bank to debit your account and your bank to debit
                            your account in accordance with the instructions from ShipNest Europe
                            s.r.o. As part of your rights, you are entitled to a refund from your bank
                            under the terms and conditions of your agreement with your bank. A refund
                            must be claimed within 8 weeks starting from the date on which your
                            account was debited.
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EUROPEAN ONLINE BANKING FORM */}
                {activeCategory === "regional" && (
                  <div className="space-y-5">
                    <div className="border-b border-border/60 pb-3">
                      <h3 className="text-[16px] font-bold text-foreground tracking-tight">
                        European Regional Online Banking
                      </h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Instant payment through your home country's banking system
                      </p>
                    </div>

                    {/* Regional Sub-Selector (Tabs) */}
                    <div className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-xl border border-border/60">
                      <button
                        type="button"
                        onClick={() => setActiveRegionalMethod("ideal")}
                        className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          activeRegionalMethod === "ideal"
                            ? "bg-background text-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <IdealIcon className="h-3.5 w-auto" />
                        <span>iDEAL (NL)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRegionalMethod("bancontact")}
                        className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          activeRegionalMethod === "bancontact"
                            ? "bg-background text-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <BancontactIcon className="h-3.5 w-auto" />
                        <span>Bancontact (BE)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRegionalMethod("blik")}
                        className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          activeRegionalMethod === "blik"
                            ? "bg-background text-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <BlikIcon className="h-3.5 w-auto" />
                        <span>BLIK (PL)</span>
                      </button>
                    </div>

                    {/* iDEAL Bank Selector */}
                    {activeRegionalMethod === "ideal" && (
                      <div className="space-y-4 pt-1">
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            Select Dutch Bank *
                          </label>
                          <select
                            value={idealBank}
                            onChange={(e) => setIdealBank(e.target.value)}
                            className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          >
                            {DUTCH_BANKS.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 text-[12px] text-muted-foreground flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            You will be redirected securely to your bank's authenticated environment
                            to complete the direct transfer.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bancontact BE */}
                    {activeRegionalMethod === "bancontact" && (
                      <div className="space-y-4 pt-1">
                        <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 text-center space-y-2">
                          <BancontactIcon className="h-8 w-auto mx-auto" />
                          <h4 className="text-[14px] font-bold text-foreground">
                            Bancontact QR or Mobile App
                          </h4>
                          <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
                            Authorize via your Belgian bank application (Belfius, KBC, BNP Paribas
                            Fortis, ING) or by scanning the Payconiq QR code.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* BLIK PL */}
                    {activeRegionalMethod === "blik" && (
                      <div className="space-y-4 pt-1">
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            6-Digit BLIK Code *
                          </label>
                          <input
                            type="text"
                            value={blikCode}
                            onChange={(e) =>
                              setBlikCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            placeholder="748 192"
                            maxLength={6}
                            className="w-full h-12 px-3.5 text-center rounded-xl border border-border bg-background text-[20px] font-mono font-bold tracking-[0.3em] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                        </div>
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 text-[12px] text-muted-foreground flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>
                            Open your mobile banking app, copy the 6-digit BLIK code, and confirm
                            the authorization prompt within 2 minutes.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. DIGITAL WALLETS FORM */}
                {activeCategory === "wallets" && (
                  <div className="space-y-5">
                    <div className="border-b border-border/60 pb-3">
                      <h3 className="text-[16px] font-bold text-foreground tracking-tight">
                        Express Digital Wallets
                      </h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Biometric one-touch authorization via your connected device
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Apple Pay Button */}
                      <button
                        type="button"
                        onClick={() => handleWalletExpressPay("Apple Pay")}
                        className="w-full h-13 rounded-xl bg-black text-white hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                      >
                        <ApplePay className="h-5 w-auto" />
                      </button>

                      {/* Google Pay Button */}
                      <button
                        type="button"
                        onClick={() => handleWalletExpressPay("Google Pay")}
                        className="w-full h-13 rounded-xl bg-white text-neutral-800 border border-border hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                      >
                        <GPay className="h-5 w-auto" />
                      </button>

                      {/* PayPal Button */}
                      <button
                        type="button"
                        onClick={() => handleWalletExpressPay("PayPal")}
                        className="w-full h-13 rounded-xl bg-[#003087] text-white hover:bg-[#00256c] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                      >
                        <PayPalIcon className="h-5 w-auto" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Submit Action Button (Razorpay style prominent pay button) */}
                {activeCategory !== "wallets" && (
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-14 rounded-full bg-foreground text-background font-semibold text-[15px] sm:text-[16px] hover:bg-foreground/85 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {activeCategory === "card" && `Pay $${total.toFixed(2)}`}
                        {activeCategory === "sepa" &&
                          `Authorize & Pay $${total.toFixed(2)}`}
                        {activeCategory === "regional" &&
                          `Pay $${total.toFixed(2)} with ${
                            activeRegionalMethod === "ideal"
                              ? "iDEAL"
                              : activeRegionalMethod === "blik"
                              ? "BLIK"
                              : "Bancontact"
                          }`}
                      </span>
                    </button>
                    <p className="text-[11px] text-center text-muted-foreground mt-2.5">
                      Encrypted with TLS 1.3 · Strong Customer Authentication (3D Secure 2.0)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Realistic Card-To-Terminal Processing Scene Animation (APPROVED & PRESERVED) */}
      <AnimatePresence>
        {isProcessing && authData && (
          <PaymentScene
            total={total}
            cardName={cardForm.cardName || deliveryInfo?.name || "CARDHOLDER"}
            cardNumber={cardForm.cardNumber}
            cardLast4={authData.cardLast4}
            expiry={cardForm.expiry || "12/28"}
            brand={detectedBrand}
            network={authData.network}
            issuer={authData.issuer}
            authCode={authData.authCode}
            refCode={authData.refCode}
            onDone={handleOrderComplete}
            onCancel={() => setIsProcessing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
