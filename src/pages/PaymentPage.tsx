import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  Building2,
  Smartphone,
  Wallet,
  RefreshCw,
  QrCode,
  Info,
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
import { isIndiaDestination, calculateEstimatedDeliveryDate } from "@/lib/shipping";
import { ProductImage } from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";

// Razorpay-style European Payment Gateway Categories
export type PaymentCategory = "card" | "netbanking" | "sepa" | "wallets";
export type NetbankingMethod = "ideal" | "bancontact" | "blik";

export interface GatewayFailure {
  method: string;
  code: string;
  title: string;
  message: string;
  timestamp: string;
}

const DUTCH_BANKS = [
  "Select your Dutch bank...",
  "ABN AMRO",
  "ASN Bank",
  "bunq",
  "ING Bank",
  "Knab",
  "Rabobank",
  "RegioBank",
  "SNS Bank",
  "Triodos Bank",
  "Van Lanschot Kempen",
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
  const cardInputRef = useRef<HTMLInputElement>(null);

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  // Retrieve delivery info saved during Step 1 (/checkout)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [orderRef] = useState(() => `SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentDuration, setPaymentDuration] = useState<number>(() => Math.floor(Math.random() * 2200) + 3600);
  const isIndia = useMemo(() => isIndiaDestination(deliveryInfo), [deliveryInfo]);

  // Razorpay-style active payment category
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("card");
  const [activeNetbanking, setActiveNetbanking] = useState<NetbankingMethod>("ideal");

  // In-flight processing state & failure simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | null>(null);
  const [failureState, setFailureState] = useState<GatewayFailure | null>(null);

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    saveCard: false,
  });

  // SEPA Direct Debit form state
  const [sepaForm, setSepaForm] = useState({
    accountName: "",
    iban: "",
    bic: "",
    acceptMandate: false,
  });

  // Online banking specific states
  const [idealBank, setIdealBank] = useState("");
  const [blikCode, setBlikCode] = useState("");
  const [bancontactMode, setBancontactMode] = useState<"payconiq" | "card">("payconiq");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shipnest-delivery-info");
      if (saved) {
        const parsed: DeliveryInfo = JSON.parse(saved);
        setDeliveryInfo(parsed);
        if (parsed.name) {
          setCardForm((prev) => ({ ...prev, cardName: prev.cardName || parsed.name.toUpperCase() }));
          setSepaForm((prev) => ({ ...prev, accountName: prev.accountName || parsed.name }));
        }
      } else if (items.length > 0) {
        // Direct navigation without delivery details redirects back to checkout
        toast.error("Please enter your delivery address first.");
        navigate("/checkout");
      }
    } catch {
      navigate("/checkout");
    }
  }, [items.length, navigate]);

  // 3D Terminal Scene states (approved card animation)
  const [authData, setAuthData] = useState<{
    authCode: string;
    refCode: string;
    network: string;
    issuer: string;
    methodLabel: string;
    cardLast4: string;
  } | null>(null);

  const detectedBrand = useMemo(() => detectCardBrand(cardForm.cardNumber), [cardForm.cardNumber]);

  // Auto-format card number with 4-digit grouping
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
    if (failureState) setFailureState(null);
  };

  // Auto-format expiry date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardForm((prev) => ({ ...prev, expiry: raw }));
    if (failureState) setFailureState(null);
  };

  // Auto-format IBAN with 4-character grouping
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 34);
    const formatted = raw.replace(/(.{4})(?=.)/g, "$1 ").trim();
    setSepaForm((prev) => ({ ...prev, iban: formatted }));
    if (failureState) setFailureState(null);
  };

  // Auto-format BLIK 6-digit code
  const handleBlikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    const formatted = raw.length > 3 ? `${raw.slice(0, 3)} ${raw.slice(3)}` : raw;
    setBlikCode(formatted);
    if (failureState) setFailureState(null);
  };

  // Switch to card payment smoothly
  const handleSwitchToCard = () => {
    setFailureState(null);
    setActiveCategory("card");
    setTimeout(() => {
      cardInputRef.current?.focus();
    }, 150);
  };

  // =========================================================================
  // CARD PAYMENT: Successful path with 3D Terminal Animation
  // =========================================================================
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setFailureState(null);

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
      unknown: "Card Network",
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
      methodLabel: `${detectedBrand === "unknown" ? "Card" : detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4)}`,
      cardLast4: cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242",
    });

    // Generate randomized duration per attempt (3.6s–5.8s)
    setPaymentDuration(Math.floor(Math.random() * 2200) + 3600);
    setIsProcessing(true);
    setProcessingLabel("Connecting to Card Clearing Network...");
  };

  // Invoked upon successful completion of the approved PaymentScene animation
  const handleOrderComplete = () => {
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const placedAt = new Date().toISOString();
    const isIndianOrder = isIndiaDestination(deliveryInfo);
    const estimatedDelivery = calculateEstimatedDeliveryDate(
      placedAt,
      isIndianOrder,
      "standard",
      orderId
    );

    const recipient = deliveryInfo || (isIndianOrder ? {
      name: cardForm.cardName || "Valued Customer",
      email: "order@shipnest.com",
      phone: "+91 98765 43210",
      address: "Circular Road",
      city: "Dimapur",
      state: "Nagaland",
      country: "India",
      zip: "797112",
      deliveryMethod: "standard",
      countryCode: "+91",
      apartment: "",
    } : {
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
    });

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
      status: "In Transit",
      estimatedDelivery,
      placedAt,
      notes: isIndianOrder
        ? "Express Priority Air Cargo PRG → DEL · 20–30 Days Guaranteed"
        : "Priority Insured Air Express Freight · White-Glove Dispatch",
      paymentMethod: authData?.methodLabel || `${detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242"}`,
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

  // =========================================================================
  // NON-CARD PAYMENT: Authentic Failure Behaviour (All other methods fail)
  // =========================================================================
  const triggerGatewayFailure = (failure: GatewayFailure) => {
    setIsProcessing(true);
    setProcessingLabel(`Connecting to ${failure.method} gateway...`);
    setFailureState(null);

    // Realistic banking network timeout / decline simulation
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingLabel(null);
      setFailureState(failure);
      toast.error(`${failure.method} transaction failed: ${failure.title}`);
    }, 1800);
  };

  const handleIdealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idealBank || idealBank === DUTCH_BANKS[0]) {
      toast.error("Please select your Dutch issuing bank.");
      return;
    }
    triggerGatewayFailure({
      method: "iDEAL",
      code: "CUR-IDEAL-504",
      title: "Bank Authorization Gateway Timeout",
      message: `Your selected institution (${idealBank}) did not return a valid authentication token within the security clearing window. No funds have been debited from your account.`,
      timestamp: new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) + " CET",
    });
  };

  const handleBancontactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerGatewayFailure({
      method: "Bancontact",
      code: "BC-PAYCONIQ-TIMEOUT",
      title: "Mobile App Authorization Timeout",
      message: "The authentication session was not confirmed on your Bancontact or Payconiq banking app within the required verification window.",
      timestamp: new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) + " CET",
    });
  };

  const handleBlikSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = blikCode.replace(/\D/g, "");
    if (clean.length !== 6) {
      toast.error("Please enter a valid 6-digit BLIK code from your banking app.");
      return;
    }
    triggerGatewayFailure({
      method: "BLIK",
      code: "PSP-BLIK-102",
      title: "BLIK Code Expired or Rejected",
      message: "The 6-digit code was not authorized in your mobile banking app within the 120-second validity period. Please generate a fresh code or use Card payment.",
      timestamp: new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) + " CET",
    });
  };

  const handleSepaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sepaForm.accountName.trim()) {
      toast.error("Please enter the bank account holder's name.");
      return;
    }
    const cleanIban = sepaForm.iban.replace(/\s/g, "");
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      toast.error("Please enter a valid Eurozone IBAN.");
      return;
    }
    if (!sepaForm.acceptMandate) {
      toast.error("You must accept the SEPA Direct Debit mandate to proceed.");
      return;
    }
    triggerGatewayFailure({
      method: "SEPA Direct Debit",
      code: "EPC-SEPA-R01",
      title: "Direct Debit Mandate Settlement Declined",
      message: `The automated interbank clearing system could not establish a pre-authorized debtor mandate for IBAN ${cleanIban.slice(0, 4)}••••${cleanIban.slice(-4)}. Please complete your purchase using Credit / Debit Card.`,
      timestamp: new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) + " CET",
    });
  };

  const handleWalletSubmit = (walletName: "Apple Pay" | "Google Pay" | "PayPal") => {
    triggerGatewayFailure({
      method: walletName,
      code: "WALLET-AUTH-CANCELLED",
      title: `${walletName} Credential Token Declined`,
      message: `The digital wallet authorization session was declined by the identity broker or user canceled. No payment has been processed.`,
      timestamp: new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) + " CET",
    });
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
        {/* Navigation & Header Top Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
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
                Order Ref:
              </span>
              <span className="text-[12px] font-mono font-bold text-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
                #{orderRef}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Total Payable
              </span>
              <div className="flex items-baseline sm:justify-end gap-1.5">
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

        {/* Main Gateway Grid (Razorpay Style Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PRIMARY COLUMN (7 cols): Razorpay-Style Payment Method Selector & Interactive Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xs overflow-hidden">
              {/* Gateway Brand Header */}
              <div className="px-5 sm:px-6 py-4 bg-secondary/35 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-[13px]">
                    SN
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-foreground tracking-tight">
                      ShipNest European Gateway
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Encrypted multi-currency settlement & clearing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit TLS</span>
                </div>
              </div>

              {/* Mobile Tab Selector Bar (Horizontal scroll-free tabs on mobile screens) */}
              <div className="md:hidden border-b border-border/70 p-2 bg-secondary/20">
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("card");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      activeCategory === "card"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("netbanking");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      activeCategory === "netbanking"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("sepa");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      activeCategory === "sepa"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <SepaIcon className="h-3.5 w-auto" />
                    <span>SEPA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("wallets");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      activeCategory === "wallets"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Wallets</span>
                  </button>
                </div>
              </div>

              {/* Desktop Razorpay 2-Column Split: Methods Navigation (Left) + Interaction Area (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                {/* Desktop Left Sidebar Navigation */}
                <div className="hidden md:block md:col-span-5 border-r border-border/70 bg-secondary/15 p-3 sm:p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 pt-2 block">
                    Payment Options
                  </span>

                  {/* 1. Credit / Debit Cards Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("card");
                      setFailureState(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      activeCategory === "card"
                        ? "bg-background border-foreground shadow-xs text-foreground ring-1 ring-foreground/15"
                        : "border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        activeCategory === "card"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">
                          Credit / Debit Card
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                          Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Visa, Mastercard, Amex
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Visa className="h-3 w-auto" />
                        <Mastercard className="h-3 w-auto" />
                        <Amex className="h-3 w-auto" />
                      </div>
                    </div>
                  </button>

                  {/* 2. European Online Banking Option (iDEAL, Bancontact, BLIK) */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("netbanking");
                      setFailureState(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      activeCategory === "netbanking"
                        ? "bg-background border-foreground shadow-xs text-foreground ring-1 ring-foreground/15"
                        : "border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        activeCategory === "netbanking"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">
                          Online Banking
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground">
                          NL / BE / PL
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        iDEAL, Bancontact, BLIK
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <IdealIcon className="h-3 w-auto" />
                        <BancontactIcon className="h-3 w-auto" />
                        <BlikIcon className="h-3 w-auto" />
                      </div>
                    </div>
                  </button>

                  {/* 3. SEPA Direct Debit Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("sepa");
                      setFailureState(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      activeCategory === "sepa"
                        ? "bg-background border-foreground shadow-xs text-foreground ring-1 ring-foreground/15"
                        : "border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        activeCategory === "sepa"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      <SepaIcon className="h-3.5 w-auto" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">
                          SEPA Direct Debit
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground">
                          Eurozone
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        IBAN Bank Transfer
                      </p>
                      <div className="mt-1.5">
                        <SepaIcon className="h-2.5 w-auto opacity-80" />
                      </div>
                    </div>
                  </button>

                  {/* 4. Digital Wallets Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("wallets");
                      setFailureState(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      activeCategory === "wallets"
                        ? "bg-background border-foreground shadow-xs text-foreground ring-1 ring-foreground/15"
                        : "border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        activeCategory === "wallets"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">
                          Digital Wallets
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded">
                          1-Touch
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Apple Pay, Google Pay, PayPal
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <ApplePay className="h-3 w-auto" />
                        <GPay className="h-3 w-auto" />
                        <PayPalIcon className="h-3 w-auto" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Right Interactive Panel for Selected Method */}
                <div className="md:col-span-7 p-5 sm:p-7 relative">
                  {/* In-Flight Processing Spinner Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                      <RefreshCw className="w-8 h-8 text-foreground animate-spin mb-3" />
                      <p className="text-[14px] font-bold text-foreground">
                        {processingLabel || "Processing Payment Handshake..."}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-1 max-w-xs">
                        Establishing secure handshake with European clearing authority...
                      </p>
                    </div>
                  )}

                  {/* Gateway Failure Alert (Rendered when a non-card payment fails) */}
                  {failureState && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-foreground space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold text-rose-700 dark:text-rose-400">
                              {failureState.title}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded">
                              {failureState.code}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                            {failureState.message}
                          </p>
                          <div className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>Declined at: {failureState.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Immediate Fallback Actions */}
                      <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSwitchToCard}
                          className="px-4 py-2 rounded-xl bg-foreground text-background text-[12.5px] font-semibold hover:bg-foreground/85 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay with Credit / Debit Card Instead</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFailureState(null)}
                          className="px-3.5 py-2 rounded-xl bg-secondary text-foreground text-[12px] font-medium hover:bg-secondary/80 border border-border/80 transition-all text-center"
                        >
                          Try Again
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ================================================================= */}
                  {/* VIEW 1: Credit / Debit Card Form (Successful Path with 3D Terminal) */}
                  {/* ================================================================= */}
                  {activeCategory === "card" && (
                    <form onSubmit={handleCardSubmit} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <h3 className="text-[15px] font-bold text-foreground">
                            Card Information
                          </h3>
                          <p className="text-[12px] text-muted-foreground">
                            Direct encrypted clearing via European acquirer
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Visa className="h-3.5 w-auto" />
                          <Mastercard className="h-3.5 w-auto" />
                          <Amex className="h-3.5 w-auto" />
                        </div>
                      </div>

                      {/* Name on Card */}
                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          Name on Card *
                        </label>
                        <input
                          ref={cardInputRef}
                          type="text"
                          name="cardName"
                          required
                          value={cardForm.cardName}
                          onChange={(e) =>
                            setCardForm((prev) => ({ ...prev, cardName: e.target.value.toUpperCase() }))
                          }
                          placeholder="CARDHOLDER NAME"
                          className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] text-foreground font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      {/* Card Number with Real-Time Brand Recognition */}
                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="cardNumber"
                            required
                            value={cardForm.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="•••• •••• •••• ••••"
                            maxLength={19}
                            className="w-full h-11 pl-3.5 pr-14 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            {detectedBrand === "visa" && <Visa className="h-4 w-auto" />}
                            {detectedBrand === "mc" && <Mastercard className="h-4 w-auto" />}
                            {detectedBrand === "amex" && <Amex className="h-4 w-auto" />}
                            {detectedBrand === "unknown" && (
                              <CreditCard className="w-4 h-4 text-muted-foreground/60" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                            <span>Security Code *</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {detectedBrand === "amex" ? "4 digits" : "3 digits"}
                            </span>
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
                                  cvv: e.target.value.replace(/\D/g, "").slice(0, detectedBrand === "amex" ? 4 : 3),
                                }))
                              }
                              placeholder={detectedBrand === "amex" ? "••••" : "•••"}
                              maxLength={detectedBrand === "amex" ? 4 : 3}
                              className="w-full h-11 pl-3.5 pr-9 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] font-mono text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                            />
                            <Lock className="w-3.5 h-3.5 text-muted-foreground/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Save Card Checkbox */}
                      <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={cardForm.saveCard}
                          onChange={(e) =>
                            setCardForm((prev) => ({ ...prev, saveCard: e.target.checked }))
                          }
                          className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground/20"
                        />
                        <span className="text-[12px] text-muted-foreground">
                          Save card securely for future purchases
                        </span>
                      </label>

                      {/* Submit Action Button */}
                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-12 rounded-full bg-foreground text-background font-semibold text-[15px] hover:bg-foreground/85 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Pay ${total.toFixed(2)}</span>
                        </button>
                        <p className="text-[11px] text-center text-muted-foreground mt-2">
                          End-to-End TLS 1.3 Encryption · 3D Secure Authenticated
                        </p>
                      </div>
                    </form>
                  )}

                  {/* ================================================================= */}
                  {/* VIEW 2: European Online Banking (iDEAL, Bancontact, BLIK) */}
                  {/* ================================================================= */}
                  {activeCategory === "netbanking" && (
                    <div className="space-y-4">
                      {/* Sub-Tabs for European National Payment Networks */}
                      <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl border border-border/60">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNetbanking("ideal");
                            setFailureState(null);
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            activeNetbanking === "ideal"
                              ? "bg-background text-foreground shadow-xs border border-border/80"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <IdealIcon className="h-3.5 w-auto" />
                          <span>iDEAL (NL)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveNetbanking("bancontact");
                            setFailureState(null);
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            activeNetbanking === "bancontact"
                              ? "bg-background text-foreground shadow-xs border border-border/80"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <BancontactIcon className="h-3.5 w-auto" />
                          <span>Bancontact (BE)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveNetbanking("blik");
                            setFailureState(null);
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            activeNetbanking === "blik"
                              ? "bg-background text-foreground shadow-xs border border-border/80"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <BlikIcon className="h-3.5 w-auto" />
                          <span>BLIK (PL)</span>
                        </button>
                      </div>

                      {/* 2A. Currence iDEAL Form */}
                      {activeNetbanking === "ideal" && (
                        <form onSubmit={handleIdealSubmit} className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                              <h3 className="text-[14px] font-bold text-foreground">
                                iDEAL Direct Bank Transfer
                              </h3>
                              <p className="text-[11.5px] text-muted-foreground">
                                Netherlands interbank protocol
                              </p>
                            </div>
                            <IdealIcon className="h-4.5 w-auto" />
                          </div>

                          <div>
                            <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                              Choose your Dutch Bank *
                            </label>
                            <select
                              value={idealBank}
                              onChange={(e) => {
                                setIdealBank(e.target.value);
                                if (failureState) setFailureState(null);
                              }}
                              required
                              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all cursor-pointer"
                            >
                              {DUTCH_BANKS.map((b) => (
                                <option key={b} value={b} disabled={b === DUTCH_BANKS[0]}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="p-3.5 bg-secondary/40 rounded-xl border border-border/70 text-[12px] text-muted-foreground space-y-1">
                            <p className="flex items-center gap-1.5 font-medium text-foreground">
                              <Info className="w-3.5 h-3.5 text-primary" />
                              <span>How iDEAL works:</span>
                            </p>
                            <p className="leading-relaxed">
                              You will be redirected to your chosen Dutch banking portal to authenticate with your bank token or mobile banking app.
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-12 rounded-full bg-[#cc0066] hover:bg-[#b30059] text-white font-semibold text-[14.5px] disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Pay ${total.toFixed(2)} with iDEAL</span>
                          </button>
                        </form>
                      )}

                      {/* 2B. Bancontact Payconiq Form */}
                      {activeNetbanking === "bancontact" && (
                        <form onSubmit={handleBancontactSubmit} className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                              <h3 className="text-[14px] font-bold text-foreground">
                                Bancontact / Payconiq
                              </h3>
                              <p className="text-[11.5px] text-muted-foreground">
                                Belgium debit card and mobile app
                              </p>
                            </div>
                            <BancontactIcon className="h-4.5 w-auto" />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setBancontactMode("payconiq")}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                bancontactMode === "payconiq"
                                  ? "border-foreground bg-secondary/50 font-semibold text-foreground ring-1 ring-foreground/15"
                                  : "border-border text-muted-foreground hover:bg-secondary/30"
                              }`}
                            >
                              <QrCode className="w-4 h-4 mx-auto mb-1 text-primary" />
                              <span className="text-[12px] block">Payconiq App (QR)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setBancontactMode("card")}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                bancontactMode === "card"
                                  ? "border-foreground bg-secondary/50 font-semibold text-foreground ring-1 ring-foreground/15"
                                  : "border-border text-muted-foreground hover:bg-secondary/30"
                              }`}
                            >
                              <CreditCard className="w-4 h-4 mx-auto mb-1 text-primary" />
                              <span className="text-[12px] block">Bancontact Card</span>
                            </button>
                          </div>

                          <div className="p-3.5 bg-secondary/40 rounded-xl border border-border/70 text-[12px] text-muted-foreground">
                            {bancontactMode === "payconiq" ? (
                              <p className="leading-relaxed">
                                A dynamic Payconiq QR code will be generated for scanning with your Belgian banking app (Belfius, BNP Paribas Fortis, KBC, ING Belgium).
                              </p>
                            ) : (
                              <p className="leading-relaxed">
                                Enter your Belgian Bancontact debit card credentials for Digipass or itsme hardware token authorization.
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-12 rounded-full bg-[#004a99] hover:bg-[#003d80] text-white font-semibold text-[14.5px] disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Pay ${total.toFixed(2)} with Bancontact</span>
                          </button>
                        </form>
                      )}

                      {/* 2C. BLIK Mobile Form */}
                      {activeNetbanking === "blik" && (
                        <form onSubmit={handleBlikSubmit} className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                              <h3 className="text-[14px] font-bold text-foreground">
                                BLIK Mobile Payment
                              </h3>
                              <p className="text-[11.5px] text-muted-foreground">
                                Polski Standard Płatności (6-digit code)
                              </p>
                            </div>
                            <BlikIcon className="h-4.5 w-auto" />
                          </div>

                          <div>
                            <label className="block text-[12px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                              <span>Enter 6-digit BLIK Code *</span>
                              <span className="text-[11px] text-primary font-mono font-semibold">
                                Valid 120s
                              </span>
                            </label>
                            <input
                              type="tel"
                              value={blikCode}
                              onChange={handleBlikChange}
                              maxLength={7}
                              placeholder="123 456"
                              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-[20px] font-mono font-bold tracking-widest text-center text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                            />
                          </div>

                          <div className="p-3.5 bg-secondary/40 rounded-xl border border-border/70 text-[12px] text-muted-foreground space-y-1">
                            <p className="flex items-center gap-1.5 font-medium text-foreground">
                              <Smartphone className="w-3.5 h-3.5 text-primary" />
                              <span>Instruction:</span>
                            </p>
                            <p className="leading-relaxed">
                              Open your Polish mobile banking app (mBank, PKO, Santander, ING, etc.), generate a 6-digit BLIK code, and confirm authorization on your phone.
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-12 rounded-full bg-[#eb1b2d] hover:bg-[#d41425] text-white font-semibold text-[14.5px] disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Confirm BLIK Payment (${total.toFixed(2)})</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* VIEW 3: SEPA Direct Debit (Eurozone IBAN Transfer) */}
                  {/* ================================================================= */}
                  {activeCategory === "sepa" && (
                    <form onSubmit={handleSepaSubmit} className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <h3 className="text-[14px] font-bold text-foreground">
                            SEPA Direct Debit
                          </h3>
                          <p className="text-[11.5px] text-muted-foreground">
                            European Payments Council (EPC) Euro Clearing
                          </p>
                        </div>
                        <SepaIcon className="h-4.5 w-auto" />
                      </div>

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
                          placeholder="Firstname Lastname"
                          className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                          <span>IBAN (International Bank Account Number) *</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Eurozone (DE, FR, NL, CZ, etc.)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={sepaForm.iban}
                          onChange={handleIbanChange}
                          placeholder="DE89 3704 0044 0532 0130 00"
                          maxLength={38}
                          className="w-full h-11 px-3.5 rounded-xl border border-border bg-background font-mono text-[14px] tracking-wider text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            BIC / SWIFT Code
                          </label>
                          <input
                            type="text"
                            value={sepaForm.bic}
                            onChange={(e) =>
                              setSepaForm((prev) => ({ ...prev, bic: e.target.value.toUpperCase() }))
                            }
                            placeholder="DEUTDEDDFXX"
                            maxLength={11}
                            className="w-full h-11 px-3.5 rounded-xl border border-border bg-background font-mono text-[13px] uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                            Settlement Currency
                          </label>
                          <div className="h-11 px-3.5 rounded-xl border border-border bg-secondary/50 font-mono text-[13px] font-semibold flex items-center text-foreground">
                            EUR (€) / USD ($)
                          </div>
                        </div>
                      </div>

                      {/* Official SEPA Creditor Mandate Agreement */}
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={sepaForm.acceptMandate}
                          onChange={(e) =>
                            setSepaForm((prev) => ({ ...prev, acceptMandate: e.target.checked }))
                          }
                          className="mt-0.5 w-4 h-4 rounded border-border text-foreground focus:ring-foreground/20"
                        />
                        <span className="text-[11px] text-muted-foreground leading-relaxed">
                          By confirming this order, you authorize ShipNest CZ s.r.o. to send instructions to your bank to debit your account in accordance with the SEPA Core Direct Debit Scheme.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full h-12 rounded-full bg-[#0a3a60] hover:bg-[#082e4d] text-white font-semibold text-[14.5px] disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Authorize & Pay ${total.toFixed(2)} via SEPA</span>
                      </button>
                    </form>
                  )}

                  {/* ================================================================= */}
                  {/* VIEW 4: Digital Wallets (Apple Pay, Google Pay, PayPal) */}
                  {/* ================================================================= */}
                  {activeCategory === "wallets" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <h3 className="text-[14px] font-bold text-foreground">
                            1-Touch Digital Wallets
                          </h3>
                          <p className="text-[11.5px] text-muted-foreground">
                            Biometric tokenized authorization
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ApplePay className="h-4 w-auto" />
                          <GPay className="h-4 w-auto" />
                          <PayPalIcon className="h-4 w-auto" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Apple Pay Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("Apple Pay")}
                          className="w-full h-12 rounded-xl bg-black text-white hover:bg-neutral-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] border border-black"
                        >
                          <ApplePay className="h-5 w-auto" />
                        </button>

                        {/* Google Pay Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("Google Pay")}
                          className="w-full h-12 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] border border-border"
                        >
                          <GPay className="h-5 w-auto" />
                        </button>

                        {/* PayPal Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("PayPal")}
                          className="w-full h-12 rounded-xl bg-[#003087] text-white hover:bg-[#00256c] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                        >
                          <PayPalIcon className="h-5 w-auto" />
                        </button>
                      </div>

                      <p className="text-[11.5px] text-center text-muted-foreground pt-2">
                        Tokenized payments are authenticated via your device passkey, Face ID, or Touch ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY COLUMN (5 cols on Desktop): Delivery & Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Delivery Destination Summary */}
            {deliveryInfo && (
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2.5">
                  <span className="text-[13px] font-bold text-foreground">Delivery Destination</span>
                  <Link
                    to="/checkout"
                    className="text-primary hover:underline text-[12px] font-semibold"
                  >
                    Edit
                  </Link>
                </div>
                <div className="text-[12.5px] space-y-1">
                  <p className="font-semibold text-foreground">{deliveryInfo.name}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {deliveryInfo.address}
                    {deliveryInfo.apartment ? `, ${deliveryInfo.apartment}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {deliveryInfo.city}, {deliveryInfo.state ? `${deliveryInfo.state}, ` : ""}
                    {deliveryInfo.zip}
                  </p>
                  <p className="font-medium text-foreground">{deliveryInfo.country}</p>
                  {deliveryInfo.phone && (
                    <p className="text-muted-foreground font-mono text-[11.5px] pt-0.5">
                      {deliveryInfo.countryCode || "+91"} {deliveryInfo.phone}
                    </p>
                  )}
                </div>

                {isIndia ? (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11.5px] text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Guaranteed 20–30 Days Delivery to India (Insured Air Freight)</span>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11.5px] text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Worldwide Priority Express Dispatch</span>
                  </div>
                )}
              </div>
            )}

            {/* Order Items & Cost Breakdown */}
            <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-[13px] font-bold text-foreground">
                  Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
                <Link to="/cart" className="text-primary hover:underline text-[12px] font-semibold">
                  View Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl border border-border/60 p-1 flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: getProductImageBackground(item.product) }}
                    >
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-[12.5px]">
                      <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Qty: {item.qty} {item.selectedStorage ? `· ${item.selectedStorage}` : ""}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground tabular-nums">
                      ${((item.unitPrice ?? item.product.price) * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-border/60 pt-3 space-y-2 text-[12.5px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Worldwide Express Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated VAT (20%)</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-2.5 flex justify-between items-baseline">
                  <span className="text-[14px] font-bold text-foreground">Total Payable</span>
                  <span className="text-[18px] font-bold text-foreground tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            durationMs={paymentDuration}
            onDone={handleOrderComplete}
            onCancel={() => {
              setIsProcessing(false);
              setProcessingLabel(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
