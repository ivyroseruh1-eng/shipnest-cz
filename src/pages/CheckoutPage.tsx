import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Lock,
  X,
  CheckCircle,
  Shield,
  Truck,
  Sparkles,
  ChevronRight,
  Info,
  AlertTriangle,
  Loader2,
  Globe,
  Landmark,
  QrCode,
  Wallet,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import {
  Visa,
  Mastercard,
  Amex,
  ApplePay,
  GPay,
  PayPalIcon,
  KlarnaIcon,
  IdealIcon,
  AlipayIcon,
  WeChatPayIcon,
  PayPayIcon,
  JcbIcon,
} from "@/components/PaymentIcons";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { useCart } from "@/context/CartContext";
import {
  useOrders,
  generateOrderId,
  generateTrackingId,
  createDefaultTrackingSteps,
} from "@/context/OrderContext";
import { lookupPincode } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
import PaymentScene from "@/components/payment/PaymentScene";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PaymentScene from "@/components/payment/PaymentScene";

type PaymentCategory = "card" | "usa" | "europe" | "china" | "japan";

interface AlternativePaymentOption {
  id: string;
  name: string;
  category: PaymentCategory;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
  providerName: string;
  errorCode: string;
  errorMessage: string;
}

const ALTERNATIVE_PAYMENTS: AlternativePaymentOption[] = [
  // USA FOCUS
  {
    id: "apple_pay",
    name: "Apple Pay",
    category: "usa",
    subtitle: "One-touch biometric authorization via Secure Enclave",
    badge: "USA / iOS",
    icon: <ApplePay />,
    providerName: "Apple Pay",
    errorCode: "AP_ERR_REGIONAL_TOKEN_MISMATCH",
    errorMessage:
      "Apple Pay biometric token was declined by the merchant gateway due to regional acquiring restrictions for insured Air Express freight. Please proceed with Credit/Debit Card.",
  },
  {
    id: "google_pay",
    name: "Google Pay",
    category: "usa",
    subtitle: "Fast checkout using saved Google Wallet cards",
    badge: "USA / Global",
    icon: <GPay />,
    providerName: "Google Pay",
    errorCode: "GPAY_ERR_MERCHANT_SETTLEMENT_403",
    errorMessage:
      "Google Pay tokenized settlement route is temporarily unavailable for this merchant tier. Please complete order using Credit/Debit Card.",
  },
  {
    id: "paypal",
    name: "PayPal & Venmo",
    category: "usa",
    subtitle: "Pay via PayPal balance, bank account, or Venmo",
    badge: "USA / UK",
    icon: <PayPalIcon />,
    providerName: "PayPal",
    errorCode: "PP_ERR_10417_CROSSBORDER_FAIL",
    errorMessage:
      "PayPal cross-border authorization timed out (Error 10417). The transaction could not be settled in this currency. Please use standard Credit/Debit Card.",
  },
  {
    id: "cashapp",
    name: "Cash App Pay",
    category: "usa",
    subtitle: "Instant debit from your Cash App balance or $cashtag",
    badge: "USA",
    icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
    providerName: "Cash App Pay",
    errorCode: "CAP_ERR_LOGISTICS_ROUTE_INVALID",
    errorMessage:
      "Cash App Pay clearing network rejected transaction: Merchant category does not support debit voucher settlement. Please use Credit/Debit Card.",
  },

  // UK & EUROPE FOCUS
  {
    id: "klarna",
    name: "Klarna (Pay in 3)",
    category: "europe",
    subtitle: "Slice into 3 interest-free monthly installments or Pay in 30 days",
    badge: "Europe / UK",
    icon: <KlarnaIcon />,
    providerName: "Klarna AB",
    errorCode: "KLARNA_ERR_CROSSBORDER_DECLINED",
    errorMessage:
      "Klarna instant financing is unavailable for cross-border high-value electronics shipments. Please complete purchase with Credit/Debit Card.",
  },
  {
    id: "ideal",
    name: "iDEAL (Netherlands)",
    category: "europe",
    subtitle: "Direct online banking via ABN AMRO, ING, Rabobank",
    badge: "Netherlands",
    icon: <IdealIcon />,
    providerName: "iDEAL Gateway",
    errorCode: "IDEAL_ERR_ISSUER_TIMEOUT_0504",
    errorMessage:
      "iDEAL inter-bank connection timed out while routing to Currence clearing switch (iDEAL-0504). Please pay with Credit/Debit Card.",
  },
  {
    id: "bancontact",
    name: "Bancontact (Belgium)",
    category: "europe",
    subtitle: "Real-time debit via Belgian bank cards and mobile app",
    badge: "Belgium",
    icon: <Landmark className="w-5 h-5 text-blue-600" />,
    providerName: "Bancontact Payconiq",
    errorCode: "BC_AUTH_FAILED_3DS_TIMEOUT",
    errorMessage:
      "Bancontact 3D Secure authentication session was interrupted by the issuing bank. Please use standard Credit/Debit Card.",
  },
  {
    id: "sofort",
    name: "Sofort / Giropay",
    category: "europe",
    subtitle: "Direct bank transfer for Germany, Austria, and Switzerland",
    badge: "DACH / EU",
    icon: <Landmark className="w-5 h-5 text-indigo-600" />,
    providerName: "Sofort Banking",
    errorCode: "SOFORT_CLEARING_ROUTE_OFFLINE",
    errorMessage:
      "Direct bank transfer channel is undergoing scheduled maintenance by the clearing agency. Please proceed with Credit/Debit Card.",
  },
  {
    id: "revolut",
    name: "Revolut Pay",
    category: "europe",
    subtitle: "One-click approval via Revolut mobile app",
    badge: "UK & EU",
    icon: <Wallet className="w-5 h-5 text-cyan-600" />,
    providerName: "Revolut Pay",
    errorCode: "REV_TOKEN_SIGNATURE_REJECTED",
    errorMessage:
      "Revolut payment token could not be verified by the merchant acquirer. Please complete payment using Credit/Debit Card.",
  },

  // CHINA FOCUS
  {
    id: "alipay",
    name: "Alipay (支付宝)",
    category: "china",
    subtitle: "Ant Group cross-border mobile wallet payment via QR code",
    badge: "China / Asia",
    icon: <AlipayIcon />,
    providerName: "Alipay Cross-Border",
    errorCode: "ALI_ERR_FX_ROUTE_602_UNAVAILABLE",
    errorMessage:
      "Cross-border FX settlement channel is temporarily unavailable for CNY conversion (ERR_ALIPAY_602). Please use International Credit Card.",
  },
  {
    id: "wechat",
    name: "WeChat Pay (微信支付)",
    category: "china",
    subtitle: "Tencent Quick Pay authorization via WeChat scan",
    badge: "China / Asia",
    icon: <WeChatPayIcon />,
    providerName: "WeChat Pay",
    errorCode: "WXPAY_ERR_SETTLE_ROUTE_404",
    errorMessage:
      "WeChat Pay merchant cross-border settlement channel is offline for this region. Please proceed with International Credit Card.",
  },

  // JAPAN FOCUS
  {
    id: "paypay",
    name: "PayPay (ペイペイ)",
    category: "japan",
    subtitle: "SoftBank & Yahoo! Japan QR smartphone barcode payment",
    badge: "Japan",
    icon: <PayPayIcon />,
    providerName: "PayPay Corporation",
    errorCode: "JPY_PAYPAY_ERR_ACQUIRER_4001",
    errorMessage:
      "PayPay digital wallet merchant gateway rejected JPY cross-border transaction route (JPY-ERR-4001). Please use Credit/Debit Card.",
  },
  {
    id: "konbini",
    name: "Konbini (コンビニ決済)",
    category: "japan",
    subtitle: "Cash voucher payment at 7-Eleven, Lawson, and FamilyMart",
    badge: "Japan",
    icon: <QrCode className="w-5 h-5 text-amber-600" />,
    providerName: "Konbini Settlement",
    errorCode: "KB_VOUCHER_UNAVAILABLE_EXPRESS",
    errorMessage:
      "Cash vouchers are not permitted for international priority air freight requiring continuous custody tracking. Please pay via Credit/Debit Card.",
  },
  {
    id: "linepay",
    name: "LINE Pay (Japan)",
    category: "japan",
    subtitle: "Mobile payment via LINE Messenger app balance",
    badge: "Japan / Asia",
    icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
    providerName: "LINE Pay API",
    errorCode: "LP_API_HANDSHAKE_TIMEOUT_504",
    errorMessage:
      "LINE Pay API authentication handshake timed out. Please complete order using Credit/Debit Card.",
  },
];

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { location } = useLocation();
  const navigate = useNavigate();

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  // Prefill from saved location
  useEffect(() => {
    if (location && !form.zip) {
      setForm((f) => ({
        ...f,
        zip: location.pincode,
        city: f.city || location.city,
        state: f.state || location.state,
        country: f.country || location.country,
      }));
    }
  }, []);

  const handleZipBlur = async () => {
    const zip = form.zip.trim();
    if (!zip || (form.city && form.country)) return;
    const result = await lookupPincode(zip);
    if (result) {
      setForm((f) => ({
        ...f,
        city: f.city || result.city,
        state: f.state || result.state,
        country: f.country || result.country,
      }));
      toast.success(`Location detected: ${result.city}, ${result.country}`);
    }
  };

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [refCode, setRefCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [network, setNetwork] = useState("");
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [detectedBrand, setDetectedBrand] = useState<"visa" | "mc" | "amex" | "unknown">("unknown");

  // Payment method selection & failure simulation state
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("card");
  const [selectedAltMethod, setSelectedAltMethod] = useState<AlternativePaymentOption | null>(null);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
  const [failureError, setFailureError] = useState<{
    title: string;
    code: string;
    message: string;
  } | null>(null);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateCard = (field: string, value: string) => setCardForm((prev) => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 16);
    if (/^4/.test(nums)) setDetectedBrand("visa");
    else if (/^(5[1-5]|2[2-7])/.test(nums)) setDetectedBrand("mc");
    else if (/^3[47]/.test(nums)) setDetectedBrand("amex");
    else setDetectedBrand("unknown");
    return nums.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 4);
    if (nums.length >= 3) return nums.slice(0, 2) + "/" + nums.slice(2);
    return nums;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.city || !form.country) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    if (!cardForm.cardName && form.name) {
      setCardForm((c) => ({ ...c, cardName: form.name }));
    }
    setFailureError(null);
    setIsSimulatingFailure(false);
    setShowPaymentModal(true);
  };

  const luhnCheck = (num: string) => {
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (exp: string) => {
    const match = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt("20" + match[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month);
    return expDate > now;
  };

  const fillTestCard = () => {
    setCardForm({
      cardName: form.name || "Alex Vance",
      cardNumber: "4532 0123 4567 8910",
      expiry: "12/28",
      cvv: "382",
    });
    setDetectedBrand("visa");
    toast.info("Express checkout payment details populated");
  };

  const handlePayment = () => {
    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv || !cardForm.cardName) {
      toast.error("Please complete all card fields");
      return;
    }
    if (!luhnCheck(cardForm.cardNumber)) {
      toast.error("Invalid card number. Please check card number.");
      return;
    }
    if (!validateExpiry(cardForm.expiry)) {
      toast.error("Card expiry date is invalid or expired.");
      return;
    }
    if (cardForm.cvv.replace(/\D/g, "").length < 3) {
      toast.error("Invalid CVV length.");
      return;
    }

    setShowPaymentModal(false);

    const issuers = [
      "Česká spořitelna",
      "Komerční banka",
      "Chase International",
      "Barclays Private",
      "HSBC Premier",
    ];
    const networkLabel =
      detectedBrand === "visa"
        ? "VisaNet Europe"
        : detectedBrand === "mc"
        ? "Mastercard Worldwide"
        : detectedBrand === "amex"
        ? "Amex Global"
        : "Card Network";
    setIssuer(issuers[Math.floor(Math.random() * issuers.length)]);
    setNetwork(networkLabel);
    setAuthCode(Math.random().toString(36).slice(2, 8).toUpperCase());
    setRefCode(String(Math.floor(1000000 + Math.random() * 9000000)));

    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const deliveryDays = Math.floor(Math.random() * 6) + 5;
    const estimatedDelivery = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const order = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zip: form.zip,
      },
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        price: i.product.price || 0,
        qty: i.qty,
      })),
      subtotal,
      tax,
      total,
      status: "Order Placed",
      estimatedDelivery,
      placedAt: new Date().toISOString(),
      notes: "",
      paymentMethod: "Credit Card",
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(form.city, form.state, form.country),
    };

    setPendingOrder(order);
    setShowProcessingAnimation(true);
  };

  // Handles intentional failure simulation for non-card payment options
  const handleAlternativePaymentAttempt = (option: AlternativePaymentOption) => {
    setFailureError(null);
    setIsSimulatingFailure(true);

    setTimeout(() => {
      setIsSimulatingFailure(false);
      setFailureError({
        title: `${option.name} Authorization Declined`,
        code: option.errorCode,
        message: option.errorMessage,
      });
      toast.error(`${option.name} payment route failed. Please use Credit/Debit Card.`);
    }, 1800);
  };

  const handleSwitchToCard = () => {
    setActiveCategory("card");
    setSelectedAltMethod(null);
    setFailureError(null);
    setIsSimulatingFailure(false);
    if (!cardForm.cardName && form.name) {
      setCardForm((c) => ({ ...c, cardName: form.name }));
    }
  };

  const handlePaymentSceneDone = () => {
    if (!pendingOrder) return;
    addOrder(pendingOrder);
    clearCart();
    setShowProcessingAnimation(false);
    navigate(`/order-confirmation/${pendingOrder.orderId}`);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass =
    "w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-[14px] transition-all";

  const categoryOptions = [
    { key: "card" as PaymentCategory, label: "Credit Card", badge: "Instant" },
    { key: "usa" as PaymentCategory, label: "USA Wallets", badge: "Apple / PayPal" },
    { key: "europe" as PaymentCategory, label: "UK / Europe", badge: "Klarna / iDEAL" },
    { key: "china" as PaymentCategory, label: "China", badge: "Alipay / WeChat" },
    { key: "japan" as PaymentCategory, label: "Japan", badge: "PayPay / Konbini" },
  ];

  const filteredAlternatives = ALTERNATIVE_PAYMENTS.filter(
    (opt) => opt.category === activeCategory
  );

  return (
    <div className="bg-background min-h-screen text-foreground py-10 lg:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-4">
          <Link to="/cart" className="hover:text-foreground transition-colors">
            Bag
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-8">
          Express Checkout
        </h1>

        {/* Security Notice */}
        <div className="mb-8 p-4 bg-secondary/40 border border-border rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Secure Checkout Protection:</span> All
            transactions are protected by end-to-end 256-bit encryption. Card details are tokenized
            securely with zero raw data stored on external servers.
          </div>
        </div>

        <form onSubmit={handleAddressSubmit} className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">
                  1. Delivery Address
                </h2>
                <span className="text-[12px] text-primary font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Air Express Included
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="receipts@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="+420 739 123 456"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karlova 256/1, Flat 4B"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 11000"
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      onBlur={handleZipBlur}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">
                      Country *
                    </label>
                    <input
                      type="text"
                      placeholder="United States"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-card/70 border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-[12px] text-muted-foreground">
                <p className="font-semibold text-foreground">Verified Direct EU Custody</p>
                <p>
                  Every device is insured against loss or damage until final delivery PIN
                  confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-foreground tracking-tight">Order Review</h2>

              {/* Items preview list */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-border/60">
                {items.map((item) => (
                  <div key={item.product.id} className="pt-3.5 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl bg-secondary/50 p-1 border border-border/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.qty} · Sealed Box</p>
                    </div>
                    <span className="text-[14px] font-semibold text-foreground tabular-nums">
                      {item.product.price !== null
                        ? `$${(item.product.price * item.qty).toFixed(2)}`
                        : "Upon Inquiry"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-border pt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Worldwide Air Express</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT & Customs (20%)</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-3.5 flex justify-between items-baseline text-foreground">
                  <span className="text-[16px] font-bold">Total</span>
                  <span className="text-2xl font-bold tracking-tight tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Payment Action */}
              <button
                type="submit"
                className="w-full bg-foreground text-background py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/85 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Proceed to Payment (${total.toFixed(2)})
              </button>

              <div className="pt-2 text-center text-[11px] text-muted-foreground space-y-1">
                <p>Zero risk · 30-day return guarantee from date of delivery</p>
              </div>
            </div>
          </div>
        </form>

        {/* Global Multi-Region Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-5 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground">Select Payment Method</h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      Total due:{" "}
                      <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
                    aria-label="Close payment modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Regional Category Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.key);
                        setSelectedAltMethod(null);
                        setFailureError(null);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeCategory === cat.key
                          ? "bg-foreground text-background shadow-xs font-semibold"
                          : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {cat.label}
                      {cat.key === "card" && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded-full uppercase">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Failure Banner (When non-card method fails) */}
                {failureError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[13px]">{failureError.title}</p>
                        <p className="font-mono text-[10px] text-destructive/80 mt-0.5">
                          Error Code: {failureError.code}
                        </p>
                        <p className="text-[12px] text-foreground/80 mt-1 leading-relaxed">
                          {failureError.message}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchToCard}
                      className="w-full mt-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      Switch to Credit / Debit Card (Instant Approval) <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* VIEW 1: Credit / Debit Card (Working) */}
                {activeCategory === "card" && (
                  <div className="space-y-4">
                    {/* Express Autofill Bar */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Instant Demo Autofill:</span> Quick fill verified card
                      </div>
                      <button
                        type="button"
                        onClick={fillTestCard}
                        className="bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                      >
                        Fill Test Card
                      </button>
                    </div>

                    {/* Card Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-foreground mb-1 block">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardForm.cardName}
                          onChange={(e) => updateCard("cardName", e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-foreground">
                            Card Number
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                detectedBrand !== "unknown"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {detectedBrand !== "unknown"
                                ? detectedBrand.toUpperCase()
                                : "Global Card"}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="16-digit card number"
                            value={cardForm.cardNumber}
                            onChange={(e) => updateCard("cardNumber", formatCardNumber(e.target.value))}
                            className={`${inputClass} font-mono`}
                            maxLength={19}
                          />
                          <CreditCard className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-foreground mb-1 block">
                            Expiry
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardForm.expiry}
                            onChange={(e) => updateCard("expiry", formatExpiry(e.target.value))}
                            className={`${inputClass} font-mono`}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-foreground mb-1 block">
                            Security CVV
                          </label>
                          <input
                            type="password"
                            placeholder="3 or 4 digits"
                            value={cardForm.cvv}
                            onChange={(e) =>
                              updateCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            className={`${inputClass} font-mono`}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      {/* Card Brands */}
                      <div className="flex items-center justify-center gap-2 pt-1 opacity-70">
                        <Visa />
                        <Mastercard />
                        <Amex />
                        <JcbIcon />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handlePayment}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold text-[14px] hover:bg-primary/90 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" /> Authorize & Place Order (${total.toFixed(2)})
                      </button>
                      <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> End-to-end 256-bit encrypted card acquiring
                      </p>
                    </div>
                  </div>
                )}

                {/* VIEW 2: Regional Alternative Payment Methods (Simulated Failure) */}
                {activeCategory !== "card" && (
                  <div className="space-y-4">
                    <p className="text-[12px] text-muted-foreground">
                      Select your preferred regional provider below:
                    </p>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {filteredAlternatives.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedAltMethod(opt);
                            setFailureError(null);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedAltMethod?.id === opt.id
                              ? "border-primary bg-primary/5 shadow-xs"
                              : "border-border/70 hover:border-foreground/30 bg-card hover:bg-secondary/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                              {opt.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-foreground">
                                  {opt.name}
                                </span>
                                {opt.badge && (
                                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {opt.subtitle}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              selectedAltMethod?.id === opt.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {selectedAltMethod?.id === opt.id && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedAltMethod && (
                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          disabled={isSimulatingFailure}
                          onClick={() => handleAlternativePaymentAttempt(selectedAltMethod)}
                          className="w-full bg-foreground text-background py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/85 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isSimulatingFailure ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Connecting to {selectedAltMethod.providerName}...
                            </>
                          ) : (
                            <>
                              Pay ${total.toFixed(2)} with {selectedAltMethod.name}
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-center text-muted-foreground">
                          Cross-border regional settlement provided by {selectedAltMethod.providerName}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Processing Sequence (Card Success) */}
        <AnimatePresence>
          {showProcessingAnimation && (
            <PaymentScene
              total={total}
              method="card"
              brand={detectedBrand}
              cardLast4={cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242"}
              issuer={issuer}
              network={network}
              authCode={authCode}
              refCode={refCode}
              onDone={handlePaymentSceneDone}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;
