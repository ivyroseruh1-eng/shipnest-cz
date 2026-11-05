import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";
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
  Landmark,
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
  StripeIcon,
  PaymentBadge,
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
import { AUTHORIZED_CARD, validatePaymentCard } from "@/data/authorizedCards";
import { ProductImage } from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";

// Razorpay-style European Payment Gateway Categories
export type PaymentCategory = "card" | "stripe" | "netbanking" | "sepa" | "wallets";
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

  // Stripe payment form state
  const [stripeCardForm, setStripeCardForm] = useState({
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    zip: "110 00",
    saveWithLink: true,
  });

  const stripeDetectedBrand = useMemo(
    () => detectCardBrand(stripeCardForm.cardNumber),
    [stripeCardForm.cardNumber]
  );

  const handleStripeCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setStripeCardForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleStripeExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setStripeCardForm((prev) => ({ ...prev, expiry: raw }));
  };

  const handleStripeSubmit = (e?: React.FormEvent, isLinkFastPay = false) => {
    if (e) e.preventDefault();

    if (isLinkFastPay) {
      triggerGatewayFailure({
        method: "Link by Stripe",
        code: "LINK-CARD-DECLINED",
        title: "Fast-Pay Authorization Declined",
        message:
          "Payment Declined (Error Code: 05 - Do Not Honor). The pre-authorized Link credentials were declined by your financial institution. Please enter your card details manually.",
        timestamp:
          new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) +
          " CET",
      });
      return;
    }

    const cleanDigits = stripeCardForm.cardNumber.replace(/\D/g, "");
    if (cleanDigits.length < 15) {
      toast.error("Please enter a valid card number.");
      return;
    }
    if (!validateExpiry(stripeCardForm.expiry)) {
      toast.error("Card expiry date is invalid (MM/YY).");
      return;
    }
    if (stripeCardForm.cvc.length < 3) {
      toast.error("Please enter a valid 3 or 4-digit CVC code.");
      return;
    }

    // Whitelist check: only accept Brooklyn Sanchez's card
    const validation = validatePaymentCard({
      cardNumber: stripeCardForm.cardNumber,
      expiry: stripeCardForm.expiry,
      cvv: stripeCardForm.cvc,
    });

    if (!validation.authorized) {
      triggerGatewayFailure({
        method: "Stripe Radar Gateway",
        code: validation.code || "STRIPE-CARD-DECLINE-05",
        title: "Stripe Payment Declined: Card Unauthorized",
        message:
          validation.reason ||
          "Payment Declined (Error Code: 05 - Do Not Honor). Your card issuer declined this transaction. Please contact your financial institution or try another card.",
        timestamp:
          new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) +
          " CET",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingLabel("Connecting to Stripe API (api.stripe.com)...");

    setTimeout(() => {
      setProcessingLabel("Creating Stripe PaymentIntent (pi_3N9x...)...");
      setTimeout(() => {
        setProcessingLabel("Stripe Radar Risk Evaluation: Approved · 3DS2 Verified...");
        setTimeout(() => {
          setAuthData({
            authCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
            refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
            network: "VisaNet Europe · Stripe Direct",
            issuer: AUTHORIZED_CARD.issuer,
            methodLabel: `VISA •••• ${AUTHORIZED_CARD.cleanCardNumber.slice(-4)} (${AUTHORIZED_CARD.cardholder})`,
            cardLast4: AUTHORIZED_CARD.cleanCardNumber.slice(-4),
          });
          setPaymentDuration(3600);
          setProcessingLabel(null);
        }, 550);
      }, 650);
    }, 550);
  };

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

  const handleAutofillAuthorizedCard = () => {
    setCardForm({
      cardName: AUTHORIZED_CARD.cardholder.toUpperCase(),
      cardNumber: AUTHORIZED_CARD.cardNumber,
      expiry: AUTHORIZED_CARD.expiry,
      cvv: AUTHORIZED_CARD.cvv,
      saveCard: true,
    });
    setFailureState(null);
    toast.success("Authorized test card loaded (Brooklyn Sanchez · •••• 7632)");
  };

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

    // STRICT WHITELIST VALIDATION: ONLY BROOKLYN SANCHEZ'S CARD ACCEPTED
    const validation = validatePaymentCard({
      cardNumber: cardForm.cardNumber,
      expiry: cardForm.expiry,
      cvv: cardForm.cvv,
      cardName: cardForm.cardName,
    });

    if (!validation.authorized) {
      setIsProcessing(true);
      setProcessingLabel("Contacting Card Clearing Network (VisaNet Europe)...");
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingLabel(null);
        setFailureState({
          method: "Visa Credit Network",
          code: validation.code || "GW-DECLINE-05",
          title: "Card Authorization Declined",
          message:
            validation.reason ||
            "Payment Declined (Error Code: 05 - Do Not Honor). Your financial institution declined the transaction. Please check your card information or contact your issuing bank.",
          timestamp:
            new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Prague" }) +
            " CET",
        });
        toast.error(validation.reason || "Payment Declined: Card is not authorized.");
      }, 1200);
      return;
    }

    // If AUTHORIZED:
    setAuthData({
      authCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
      refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
      network: AUTHORIZED_CARD.network,
      issuer: AUTHORIZED_CARD.issuer,
      methodLabel: `VISA •••• ${AUTHORIZED_CARD.cleanCardNumber.slice(-4)} (${AUTHORIZED_CARD.cardholder})`,
      cardLast4: AUTHORIZED_CARD.cleanCardNumber.slice(-4),
    });

    // Generate randomized duration per attempt (3.6s–5.8s)
    setPaymentDuration(Math.floor(Math.random() * 2200) + 3600);
    setIsProcessing(true);
    setProcessingLabel("Connecting to Card Clearing Network (VisaNet Europe)...");
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

    const recipient = deliveryInfo || {
      name: cardForm.cardName || "Valued Customer",
      email: "order@shipnest.com",
      phone: "+420 777 000 111",
      address: "Celetná 12",
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
      status: "Order Confirmed",
      estimatedDelivery,
      placedAt,
      notes: isIndianOrder
        ? "Express Priority Air Cargo PRG → DEL · 20–30 Days Guaranteed"
        : "Priority Insured Air Express Freight · White-Glove Dispatch",
      paymentMethod: authData?.methodLabel || `${detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242"}`,
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(recipient.city, recipient.state, recipient.country, placedAt, true),
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
              <div className="px-5 sm:px-6 py-4 bg-secondary/30 border-b border-border/60 flex items-center gap-3" aria-label="ShipNest European Gateway">
                <Logo variant="mark" size={26} linkTo={false} alt="ShipNest" />
                <h2 className="text-[14.5px] sm:text-[15px] font-bold text-foreground tracking-tight">
                  ShipNest European Payment Gateway
                </h2>
              </div>

              {/* Mobile Tab Selector Bar (Horizontal scroll-free tabs on mobile screens) */}
              <div className="md:hidden border-b border-border/70 p-2 bg-secondary/20">
                <div className="grid grid-cols-5 gap-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("card");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeCategory === "card"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="w-7 h-5 rounded-[4px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                      <img src="/assets/payment/categories/card.svg" alt="Card" className="w-full h-full object-contain" />
                    </div>
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("stripe");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeCategory === "stripe"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="w-7 h-5 rounded-[4px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                      <img src="/assets/payment/categories/stripe.svg" alt="Stripe" className="w-full h-full object-contain" />
                    </div>
                    <span>Stripe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("netbanking");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeCategory === "netbanking"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="w-7 h-5 rounded-[4px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                      <img src="/assets/payment/categories/banking.svg" alt="Banking" className="w-full h-full object-contain" />
                    </div>
                    <span>Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("sepa");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeCategory === "sepa"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="w-7 h-5 rounded-[4px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                      <img src="/assets/payment/categories/sepa.svg" alt="SEPA" className="w-full h-full object-contain" />
                    </div>
                    <span>SEPA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("wallets");
                      setFailureState(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11.5px] font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeCategory === "wallets"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="w-7 h-5 rounded-[4px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                      <img src="/assets/payment/categories/wallets.svg" alt="Wallets" className="w-full h-full object-contain" />
                    </div>
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
                    <div className="w-9 h-6.5 rounded-[5px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src="/assets/payment/categories/card.svg" alt="Credit / Debit Card" className="w-full h-full object-contain" />
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
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <PaymentBadge brand="visa" size="xs" />
                        <PaymentBadge brand="mastercard" size="xs" />
                        <PaymentBadge brand="amex" size="xs" />
                      </div>
                    </div>
                  </button>

                  {/* 2. Stripe Payment Gateway (1-Click & Elements) */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("stripe");
                      setFailureState(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      activeCategory === "stripe"
                        ? "bg-background border-foreground shadow-xs text-foreground ring-1 ring-foreground/15"
                        : "border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="w-9 h-6.5 rounded-[5px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src="/assets/payment/categories/stripe.svg" alt="Stripe" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">
                          Stripe Gateway
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-[#635BFF]/10 text-[#635BFF] px-1.5 py-0.2 rounded">
                          1-Click
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Link by Stripe & Card
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <PaymentBadge brand="stripe" size="xs" />
                      </div>
                    </div>
                  </button>

                  {/* 3. European Online Banking Option (iDEAL, Bancontact, BLIK) */}
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
                    <div className="w-9 h-6.5 rounded-[5px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src="/assets/payment/categories/banking.svg" alt="Online Banking" className="w-full h-full object-contain" />
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
                        <PaymentBadge brand="ideal" size="xs" />
                        <PaymentBadge brand="bancontact" size="xs" />
                        <PaymentBadge brand="blik" size="xs" />
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
                    <div className="w-9 h-6.5 rounded-[5px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src="/assets/payment/categories/sepa.svg" alt="SEPA Direct Debit" className="w-full h-full object-contain" />
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
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <PaymentBadge brand="sepa" size="xs" />
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
                    <div className="w-9 h-6.5 rounded-[5px] bg-white border border-border/80 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src="/assets/payment/categories/wallets.svg" alt="Digital Wallets" className="w-full h-full object-contain" />
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
                        <PaymentBadge brand="apple-pay" size="xs" />
                        <PaymentBadge brand="google-pay" size="xs" />
                        <PaymentBadge brand="paypal" size="xs" />
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
                      
                        <button
                          type="button"
                          onClick={handleAutofillAuthorizedCard}
                          className="text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg border border-primary/25 transition-all text-left sm:text-center shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                        </button>
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
                          <PaymentBadge brand="visa" size="sm" />
                          <PaymentBadge brand="mastercard" size="sm" />
                          <PaymentBadge brand="amex" size="sm" />
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
                            className="w-full h-11 pl-3.5 pr-20 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                          />
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            {detectedBrand === "visa" && <PaymentBadge brand="visa" size="xs" />}
                            {detectedBrand === "mc" && <PaymentBadge brand="mastercard" size="xs" />}
                            {detectedBrand === "amex" && <PaymentBadge brand="amex" size="xs" />}
                            {detectedBrand === "unknown" && (
                              <div className="flex items-center gap-1 opacity-70">
                                <PaymentBadge brand="visa" size="xs" />
                                <PaymentBadge brand="mastercard" size="xs" />
                              </div>
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
                  {/* VIEW 1.5: Stripe Payment Gateway (Link 1-Click + Elements)        */}
                  {/* ================================================================= */}
                  {activeCategory === "stripe" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-foreground">
                              Stripe Payment
                            </h3>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF]">
                              PCI DSS Level 1
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground">
                            Encrypted processing via Stripe Payments Europe, Ltd.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PaymentBadge brand="stripe" size="sm" />
                        </div>
                      </div>

                      {/* Link by Stripe 1-Click Fast Pay Card */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#635BFF]/8 via-[#635BFF]/4 to-transparent border border-[#635BFF]/25 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#00D66F] flex items-center justify-center text-white font-bold text-[11px]">
                              ⚡
                            </div>
                            <span className="text-[13px] font-bold text-foreground">
                              Pay faster with Link
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            by Stripe
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          Securely save or use your saved payment info for instant 1-click checkout across hundreds of thousands of sites.
                        </p>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleStripeSubmit(undefined, true)}
                          className="w-full h-11 rounded-xl bg-[#00D66F] hover:bg-[#00c063] text-[#0A2540] font-bold text-[13.5px] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                        >
                          <span>Pay with</span>
                          <span className="font-extrabold tracking-wide text-[15px]">link</span>
                        </button>
                      </div>

                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-semibold">
                            Or pay with card via Stripe
                          </span>
                        </div>
                      </div>

                      {/* Stripe Elements Card Form */}
                      <form onSubmit={(e) => handleStripeSubmit(e, false)} className="space-y-3.5">
                        
                        {/* Email */}
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={stripeCardForm.email}
                            onChange={(e) =>
                              setStripeCardForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            placeholder="customer@example.com"
                            className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                          />
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="block text-[12px] font-semibold text-foreground mb-1">
                            Card Information *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              value={stripeCardForm.cardNumber}
                              onChange={handleStripeCardNumberChange}
                              placeholder="1234 1234 1234 1234"
                              maxLength={19}
                              className="w-full h-11 pl-3.5 pr-20 rounded-xl border border-border bg-background text-[15px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                              {stripeDetectedBrand === "visa" && <PaymentBadge brand="visa" size="xs" />}
                              {stripeDetectedBrand === "mc" && <PaymentBadge brand="mastercard" size="xs" />}
                              {stripeDetectedBrand === "amex" && <PaymentBadge brand="amex" size="xs" />}
                              {stripeDetectedBrand === "unknown" && (
                                <div className="flex items-center gap-1 opacity-70">
                                  <PaymentBadge brand="visa" size="xs" />
                                  <PaymentBadge brand="mastercard" size="xs" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expiry, CVC & ZIP in one clean grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              Expiry *
                            </label>
                            <input
                              type="tel"
                              required
                              value={stripeCardForm.expiry}
                              onChange={handleStripeExpiryChange}
                              placeholder="MM / YY"
                              maxLength={5}
                              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-[14px] font-mono text-center text-foreground focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              CVC *
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                required
                                value={stripeCardForm.cvc}
                                onChange={(e) =>
                                  setStripeCardForm((prev) => ({
                                    ...prev,
                                    cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                                  }))
                                }
                                placeholder="•••"
                                maxLength={4}
                                className="w-full h-11 pl-3 pr-7 rounded-xl border border-border bg-background text-[14px] font-mono text-center text-foreground focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                              />
                              <Lock className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              ZIP / PIN *
                            </label>
                            <input
                              type="text"
                              required
                              value={stripeCardForm.zip}
                              onChange={(e) =>
                                setStripeCardForm((prev) => ({ ...prev, zip: e.target.value }))
                              }
                              placeholder="110 00"
                              maxLength={10}
                              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-[14px] font-mono text-center text-foreground focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                            />
                          </div>
                        </div>

                        {/* Save with Link checkbox */}
                        <div className="pt-1 flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            id="saveWithLink"
                            checked={stripeCardForm.saveWithLink}
                            onChange={(e) =>
                              setStripeCardForm((prev) => ({ ...prev, saveWithLink: e.target.checked }))
                            }
                            className="w-4 h-4 rounded text-[#635BFF] focus:ring-[#635BFF] border-border cursor-pointer"
                          />
                          <label
                            htmlFor="saveWithLink"
                            className="text-[12px] text-muted-foreground cursor-pointer select-none"
                          >
                            Save payment details for 1-click checkout with Link
                          </label>
                        </div>

                        {/* Stripe Pay Button */}
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-12 rounded-xl bg-[#635BFF] hover:bg-[#534acb] text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] disabled:opacity-50 mt-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Pay ${total.toFixed(2)} with Stripe</span>
                        </button>

                        <div className="text-center pt-1.5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
                          <span>Powered by Stripe</span>
                          <span>•</span>
                          <span>256-bit TLS Encryption</span>
                        </div>
                      </form>
                    </div>
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
                          <PaymentBadge brand="ideal" size="xs" />
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
                          <PaymentBadge brand="bancontact" size="xs" />
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
                          <PaymentBadge brand="blik" size="xs" />
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
                            <PaymentBadge brand="ideal" size="md" />
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
                            <PaymentBadge brand="bancontact" size="md" />
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
                            <PaymentBadge brand="blik" size="md" />
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
                        <PaymentBadge brand="sepa" size="md" />
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
                        <div className="flex items-center gap-1.5">
                          <PaymentBadge brand="apple-pay" size="sm" />
                          <PaymentBadge brand="google-pay" size="sm" />
                          <PaymentBadge brand="paypal" size="sm" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Link by Stripe 1-Click Fast Pay Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleStripeSubmit(undefined, true)}
                          className="w-full h-12 rounded-xl bg-[#00D66F] hover:bg-[#00c063] text-[#0A2540] font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] border border-[#00c063]"
                          aria-label="Pay with Link by Stripe"
                        >
                          <span>Pay with</span>
                          <span className="font-extrabold tracking-wide text-[16px]">link</span>
                          <span className="text-[10px] font-semibold opacity-75 uppercase ml-1">by Stripe</span>
                        </button>

                        {/* Apple Pay Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("Apple Pay")}
                          className="w-full h-12 rounded-xl bg-black text-white hover:bg-neutral-900 disabled:opacity-50 transition-all flex items-center justify-center shadow-xs active:scale-[0.99] border border-black"
                          aria-label="Pay with Apple Pay"
                        >
                          <svg viewBox="0 0 512 210.2" className="h-6 w-auto fill-white" role="img" aria-label="Apple Pay">
                            <path d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9 C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2 c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7 c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2 C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2 c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8 c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4 l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5 l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"/>
                          </svg>
                        </button>

                        {/* Google Pay Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("Google Pay")}
                          className="w-full h-12 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 transition-all flex items-center justify-center shadow-xs active:scale-[0.99] border border-border"
                          aria-label="Pay with Google Pay"
                        >
                          <svg viewBox="14 21 92 37" className="h-6 w-auto" role="img" aria-label="Google Pay">
                            <path d="M57.5437 26.997V35.9796H63.0833C64.4033 35.9796 65.4945 35.5352 66.3569 34.6486C67.2435 33.7642 67.6879 32.7082 67.6879 31.4872C67.6879 30.2904 67.2435 29.2476 66.3569 28.3588C65.4945 27.4502 64.4033 26.9948 63.0833 26.9948H57.5437V26.997ZM57.5437 39.141V49.5602H54.2349V23.8356H63.0129C65.2415 23.8356 67.1335 24.577 68.6933 26.062C70.2773 27.547 71.0693 29.3554 71.0693 31.4872C71.0693 33.6674 70.2773 35.489 68.6933 36.9476C67.1599 38.4106 65.2635 39.1388 63.0107 39.1388H57.5437V39.141ZM74.4133 44.1724C74.4133 45.0348 74.7785 45.752 75.5111 46.3284C76.2415 46.9004 77.0995 47.1886 78.0807 47.1886C79.4733 47.1886 80.7119 46.6738 81.8031 45.6464C82.8965 44.6146 83.4399 43.4046 83.4399 42.0164C82.4081 41.2024 80.9693 40.7954 79.1235 40.7954C77.7815 40.7954 76.6595 41.121 75.7619 41.7678C74.8621 42.4146 74.4133 43.2132 74.4133 44.1724ZM78.6945 31.3794C81.1409 31.3794 83.0703 32.0328 84.4871 33.3374C85.8995 34.6442 86.6079 36.435 86.6079 38.7098V49.5602H83.4421V47.1182H83.2991C81.9307 49.129 80.1091 50.1366 77.8299 50.1366C75.8895 50.1366 74.2637 49.5602 72.9569 48.4118C71.6501 47.2612 70.9967 45.8246 70.9967 44.0998C70.9967 42.2782 71.6853 40.8306 73.0647 39.7526C74.4441 38.6746 76.2833 38.1356 78.5867 38.1356C80.5491 38.1356 82.1705 38.4942 83.4399 39.2136V38.4568C83.4399 37.3084 82.9845 36.3316 82.0737 35.5308C81.1961 34.7411 80.0531 34.3114 78.8727 34.3274C77.0247 34.3274 75.5639 35.104 74.4837 36.6638L71.5709 34.829C73.1769 32.53 75.5529 31.3794 78.6945 31.3794ZM104.771 31.9558L93.7271 57.3218H90.3105L94.4113 48.447L87.1469 31.9558H90.7439L95.9953 44.6036H96.0657L101.174 31.9536L104.771 31.9558Z" fill="#3C4043"/>
                            <path d="M44.1722 36.8948C44.1722 35.8542 44.0842 34.8488 43.917 33.8896H29.9602V39.5832H37.955C37.6239 41.4215 36.5557 43.0445 34.9982 44.0756V47.7716H39.77C42.564 45.1976 44.1722 41.3916 44.1722 36.8948Z" fill="#4285F4"/>
                            <path d="M29.9603 51.34C33.9555 51.34 37.3171 50.031 39.7701 47.7738L34.9983 44.0756C33.6717 44.9688 31.9623 45.4902 29.9603 45.4902C26.1015 45.4902 22.8235 42.8898 21.6531 39.3874H16.7383V43.1956C19.2527 48.1909 24.3678 51.3425 29.9603 51.3422" fill="#34A853"/>
                            <path d="M21.6529 39.3874C21.0355 37.5518 21.0355 35.5646 21.6529 33.729V29.9208H16.7381C15.6991 31.9782 15.1587 34.2512 15.1606 36.556C15.1606 38.943 15.7327 41.198 16.7381 43.1934L21.6529 39.3852V39.3874Z" fill="#FABB05"/>
                            <path d="M29.96 27.6262C32.1424 27.6262 34.096 28.3742 35.636 29.8438V29.846L39.86 25.6264C37.2992 23.2416 33.9552 21.7764 29.9622 21.7764C24.3703 21.7757 19.2553 24.9264 16.7402 29.9208L21.655 33.729C22.8254 30.2266 26.1034 27.6262 29.9622 27.6262" fill="#E94235"/>
                          </svg>
                        </button>

                        {/* PayPal Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleWalletSubmit("PayPal")}
                          className="w-full h-12 rounded-xl bg-[#ffc439] hover:bg-[#f4b830] disabled:opacity-50 transition-all flex items-center justify-center shadow-xs active:scale-[0.99] border border-[#e5af33]"
                          aria-label="Pay with PayPal"
                        >
                          <svg viewBox="0 0 124 33" className="h-6 w-auto" role="img" aria-label="PayPal">
                            <path fill="#253B80" d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658 h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5 c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454 h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z"/>
                            <path fill="#253B80" d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332 c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031 c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95 c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449 c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301 c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z"/>
                            <path fill="#253B80" d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425 c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811 c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z"/>
                            <path fill="#179BD7" d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658 h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5 c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454 h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704 C95.809,11.668,95.918,12.292,95.781,13.154z"/>
                            <path fill="#179BD7" d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332 c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031 c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949 c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449 c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301 c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z"/>
                            <path fill="#179BD7" d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803 l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z"/>
                            <path fill="#253B80" d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1 c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917 c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812 c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183 c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73 c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215 c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z"/>
                            <path fill="#179BD7" d="M23.048,7.667L23.048,7.667L23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55 c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132l0,0l0,0L6.596,26.83l-0.399,2.533 c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32 c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622 C24.022,8.286,23.573,7.945,23.048,7.667z"/>
                            <path fill="#222D65" d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117 c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605 l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55 c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z"/>
                            <path fill="#253B80" d="M9.614,7.699c0.061-0.393,0.313-0.714,0.652-0.876c0.155-0.074,0.326-0.115,0.507-0.115h7.352 c0.871,0,1.684,0.057,2.426,0.177c0.212,0.034,0.418,0.073,0.619,0.117c0.2,0.045,0.395,0.095,0.584,0.15 c0.094,0.028,0.187,0.057,0.278,0.086c0.365,0.121,0.704,0.264,1.017,0.429c0.368-2.347-0.003-3.945-1.272-5.392 C20.378,0.682,17.853,0,14.622,0h-9.38c-0.66,0-1.223,0.48-1.325,1.133L0.01,25.898c-0.077,0.49,0.301,0.932,0.795,0.932h5.791 l1.454-9.225L9.614,7.699z"/>
                          </svg>
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
