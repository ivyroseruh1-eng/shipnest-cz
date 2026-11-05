import { Order } from "@/types";
import { explainStatus } from "@/data/statusExplanations";

export interface GeneratedEmail {
  stepStatus: string;
  stepIcon: string;
  subject: string;
  preheader: string;
  html: string;
  plainText: string;
  recipientName: string;
  recipientEmail: string;
}

export const ALL_TRACKING_STEPS = [
  "Order Received",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipment Created",
  "Departed Origin",
  "In Transit",
  "Customs",
  "Regional Hub",
  "Local Hub",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export type TrackingStepName = typeof ALL_TRACKING_STEPS[number];

/**
 * Canonical production site origin.
 * Transactional customer emails must strictly use this canonical URL and
 * NEVER contain localhost, 127.0.0.1, preview deployment domains, shipnest.com,
 * or relative tracking paths.
 */
export const CANONICAL_PRODUCTION_SITE_URL = "https://shipnest.getvoroa.com";

/**
 * Returns the canonical public website URL, honoring VITE_PUBLIC_SITE_URL when set,
 * but safely falling back to https://shipnest.getvoroa.com and rejecting localhost/preview URLs.
 */
export const getCanonicalSiteUrl = (customOrigin?: string): string => {
  if (customOrigin && typeof customOrigin === "string") {
    const trimmed = customOrigin.trim().replace(/\/+$/, "");
    const lower = trimmed.toLowerCase();
    const isForbidden =
      lower.includes("localhost") ||
      lower.includes("127.0.0.1") ||
      lower.includes("shipnest.com") ||
      lower.includes("vercel.app") ||
      lower.includes("netlify.app") ||
      lower.includes("github.dev");

    if (!isForbidden && (lower.startsWith("https://") || lower.startsWith("http://"))) {
      return trimmed;
    }
  }

  // Vite environment variable configuration
  const envUrl =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_PUBLIC_SITE_URL;

  if (envUrl && typeof envUrl === "string") {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    const lower = trimmed.toLowerCase();
    const isForbidden =
      lower.includes("localhost") ||
      lower.includes("127.0.0.1") ||
      lower.includes("shipnest.com");

    if (!isForbidden && (lower.startsWith("https://") || lower.startsWith("http://"))) {
      return trimmed;
    }
  }

  return CANONICAL_PRODUCTION_SITE_URL;
};

/**
 * Reliable image URL normalization helper for transactional emails.
 * - Converts local /assets/... and public/assets/... into absolute production URLs.
 * - Vite rule: Files inside public/assets/ are served from /assets/, NOT /public/assets/.
 * - Preserves valid, publicly accessible HTTPS URLs.
 * - Rejects localhost, blob:, file:, data: and temporary browser-only image URLs.
 */
export const normalizeEmailImageUrl = (
  imagePath?: string,
  siteUrl?: string
): string => {
  const base = getCanonicalSiteUrl(siteUrl);
  const fallback = `${base}/assets/brand/shipnest-mark.png`;

  if (!imagePath || typeof imagePath !== "string") {
    return fallback;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return fallback;

  const lower = trimmed.toLowerCase();

  // Reject local/browser-only/invalid protocols
  if (
    lower.startsWith("blob:") ||
    lower.startsWith("file:") ||
    lower.startsWith("data:") ||
    lower.includes("localhost") ||
    lower.includes("127.0.0.1")
  ) {
    return fallback;
  }

  // If already absolute HTTP / HTTPS
  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    if (lower.includes("shipnest.com")) {
      // Legacy domain rewrite
      const pathPart = trimmed.replace(/^https?:\/\/[^/]+/i, "");
      return normalizeEmailImageUrl(pathPart, base);
    }
    // Clean up accidental /public/assets/ inside absolute URL
    if (trimmed.includes("/public/assets/")) {
      return trimmed.replace("/public/assets/", "/assets/");
    }
    return trimmed;
  }

  // Normalize local paths
  let clean = trimmed.replace(/^\.?\/+/, ""); // strip leading / or ./
  if (clean.toLowerCase().startsWith("public/")) {
    clean = clean.slice(7).replace(/^\/+/, "");
  }
  if (!clean.toLowerCase().startsWith("assets/")) {
    clean = `assets/${clean}`;
  }

  return `${base}/${clean}`;
};

export interface AppleStepDetails {
  eyebrow: string;
  title: string;
  subjectPrefix: string;
  preheader: string;
  explanation: string;
  stepperIndex: number; // 0: Placed, 1: Prepared, 2: In Transit, 3: Delivered
}

export const APPLE_STATUS_DETAILS: Record<string, AppleStepDetails> = {
  "Order Received": {
    eyebrow: "Order Received",
    title: "We've received your order.",
    subjectPrefix: "We've received your order",
    preheader: "We're reviewing your items and will notify you when preparation starts.",
    explanation:
      "We've received your order and are reviewing your details. Once confirmed, we'll begin preparing your items for shipment and send you an update.",
    stepperIndex: 0,
  },
  "Order Placed": {
    eyebrow: "Order Received",
    title: "We've received your order.",
    subjectPrefix: "We've received your order",
    preheader: "We're reviewing your items and will notify you when preparation starts.",
    explanation:
      "We've received your order and are reviewing your details. Once confirmed, we'll begin preparing your items for shipment and send you an update.",
    stepperIndex: 0,
  },
  "Order Confirmed": {
    eyebrow: "Order Confirmed",
    title: "Your order is confirmed.",
    subjectPrefix: "Order confirmed",
    preheader: "Your order details and payment are verified. Preparation begins shortly.",
    explanation:
      "Your order details and payment have been confirmed. Your items are being prepared for dispatch.",
    stepperIndex: 0,
  },
  "Payment Confirmed": {
    eyebrow: "Payment Confirmed",
    title: "Payment confirmed.",
    subjectPrefix: "Payment confirmed",
    preheader: "Your payment was authorized and your order is queued for fulfillment.",
    explanation:
      "Your payment has been successfully authorized and confirmed. Your order is now queued in our fulfillment system, and preparation will begin shortly.",
    stepperIndex: 0,
  },
  "Processing": {
    eyebrow: "Fulfillment",
    title: "Your order is being prepared.",
    subjectPrefix: "Preparing your items",
    preheader: "We're carefully inspecting and packaging your items for dispatch.",
    explanation:
      "Your order is currently being prepared at our fulfillment facility. Each item is inspected and packaged carefully before being handed over to the carrier.",
    stepperIndex: 1,
  },
  "Processing at Warehouse": {
    eyebrow: "Fulfillment",
    title: "Your order is being prepared.",
    subjectPrefix: "Preparing your items",
    preheader: "We're carefully inspecting and packaging your items for dispatch.",
    explanation:
      "Your items are currently being gathered, inspected, and packaged for handover to the carrier.",
    stepperIndex: 1,
  },
  "Packed": {
    eyebrow: "Packaging Complete",
    title: "Your order is packed.",
    subjectPrefix: "Your order is packed",
    preheader: "Your items are securely packaged and awaiting carrier collection.",
    explanation:
      "Your items have been securely packed and labeled for transport. The package is now staged at our facility awaiting scheduled carrier collection.",
    stepperIndex: 1,
  },
  "Shipment Created": {
    eyebrow: "Shipment Created",
    title: "Shipping details created.",
    subjectPrefix: "Shipment details ready",
    preheader: "Your tracking number is registered and ready for initial scanning.",
    explanation:
      "A shipping label and tracking number have been generated for your order. Carrier tracking events will begin updating as soon as the package receives its initial scan.",
    stepperIndex: 1,
  },
  "Departed Origin": {
    eyebrow: "Departure",
    title: "Your shipment has departed.",
    subjectPrefix: "Shipment departed",
    preheader: "Your package has left our Prague facility and is traveling to your region.",
    explanation:
      "Your shipment has departed our dispatch facility and is now in transit with the carrier. It is on its way to the next transport hub on its route.",
    stepperIndex: 2,
  },
  "Departed from Prague": {
    eyebrow: "Departure",
    title: "Your shipment has departed Prague.",
    subjectPrefix: "Shipment departed",
    preheader: "Your package has left our Prague facility and is traveling to your region.",
    explanation:
      "Your shipment has departed the Prague dispatch facility and is on its way to the next transport hub.",
    stepperIndex: 2,
  },
  "In Transit": {
    eyebrow: "In Transit",
    title: "Your shipment is on the way.",
    subjectPrefix: "Shipment on the way",
    preheader: "Your parcel is moving through the transport network toward your destination.",
    explanation:
      "Your package is traveling through the carrier transit network toward your destination region. Progress is steady and tracking updates continue as checkpoints are reached.",
    stepperIndex: 2,
  },
  "Customs": {
    eyebrow: "Customs Clearance",
    title: "Customs clearance in progress.",
    subjectPrefix: "Customs clearance",
    preheader: "Your shipment has arrived at destination customs for standard processing.",
    explanation:
      "Your shipment has arrived at the destination customs facility for standard regulatory clearance. Once completed, your package will transfer directly to the local carrier.",
    stepperIndex: 2,
  },
  "Regional Hub": {
    eyebrow: "Regional Facility",
    title: "Arrived at regional facility.",
    subjectPrefix: "At regional facility",
    preheader: "Your package has reached the regional sorting center serving your territory.",
    explanation:
      "Your package has arrived at the regional distribution facility serving your region. It is being sorted for transport to the local delivery station in your area.",
    stepperIndex: 2,
  },
  "Local Hub": {
    eyebrow: "Local Delivery Station",
    title: "Arrived at your local facility.",
    subjectPrefix: "At local facility",
    preheader: "Your parcel is at the local distribution station closest to your address.",
    explanation:
      "Your package has arrived at the local delivery center nearest your address. It is being sorted onto a delivery route for final dispatch.",
    stepperIndex: 2,
  },
  "Out for Delivery": {
    eyebrow: "Out for Delivery",
    title: "Out for delivery today.",
    subjectPrefix: "Out for delivery today",
    preheader: "Your courier is on route today. Please ensure someone is available.",
    explanation:
      "A courier has loaded your package and is out for delivery today. Please ensure someone is available at the delivery address to receive the package.",
    stepperIndex: 3,
  },
  "Delivered": {
    eyebrow: "Delivered",
    title: "Your package was delivered.",
    subjectPrefix: "Package delivered",
    preheader: "Your package was delivered to your address. Thank you for choosing ShipNest.",
    explanation:
      "Your package has been delivered to your destination address. If you need any assistance with your items, our concierge support team is ready to help.",
    stepperIndex: 3,
  },
  "Cancelled": {
    eyebrow: "Order Cancelled",
    title: "Your order was cancelled.",
    subjectPrefix: "Order cancelled",
    preheader: "Your order has been cancelled. Any authorization hold will be released.",
    explanation:
      "This order has been cancelled. Any temporary authorization hold on your payment method will be released by your card issuer according to their standard policy.",
    stepperIndex: 0,
  },
};

/**
 * Generates an authentic, mobile-first, minimal Apple-style transactional HTML email.
 * - Fluid 100% outer container with 560px maximum desktop content width.
 * - Responsive stacking tables for mobile viewports (down to 320px).
 * - Segmented 4-stage Apple progress tracker with active stage emphasis.
 * - DHL/Amazon-grade doorstep delivery PIN verification block with tabular monospace numerals.
 * - Light and dark mode support with automatic white-logo switching.
 * - Email-compatible HTML tables and inline CSS (tested for Gmail iOS/Android, Apple Mail, Outlook).
 * - Reliable production HTTPS image asset resolution.
 * - Real dynamic tracking links: https://shipnest.getvoroa.com/track/:trackingId.
 * - Complete plain-text counterpart.
 * - Zero emoji decorations, zero marketing fluff.
 */
export const generateOrderEmail = (
  order: Order,
  targetStepStatus?: string,
  customOrigin?: string
): GeneratedEmail => {
  const origin = getCanonicalSiteUrl(customOrigin);
  const currentStep = targetStepStatus || order.status || "Order Received";

  const stepDetails = APPLE_STATUS_DETAILS[currentStep] || {
    eyebrow: "Order Update",
    title: `Status: ${currentStep}`,
    subjectPrefix: "Order update",
    preheader: `Here is the latest update on your ShipNest order #${order.orderId}.`,
    explanation:
      explainStatus(currentStep) ||
      "Your order is currently being processed through the ShipNest network.",
    stepperIndex: 1,
  };

  const explanation =
    explainStatus(currentStep) ||
    stepDetails.explanation ||
    "Your order is currently being processed through the ShipNest network.";

  // Subject line: strictly <= 50 chars, important info first, zero emojis, clean brand attribution
  const subject = `${stepDetails.subjectPrefix}: ShipNest #${order.orderId}`;

  // Preheader: complementary context without repeating subject or exposing verification PIN
  const preheader = stepDetails.preheader;

  const firstName =
    (order.customer.name && order.customer.name.trim().split(/\s+/)[0]) ||
    order.customer.name ||
    "there";

  const placedDate = new Date(order.placedAt || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Canonical tracking link using real order.trackingId
  const trackUrl = `${origin}/track/${encodeURIComponent(order.trackingId)}`;
  const logoUrl = normalizeEmailImageUrl("/assets/brand/shipnest-logo.png", origin);
  const logoWhiteUrl = normalizeEmailImageUrl("/assets/brand/shipnest-logo-white.png", origin);

  // Sensitive data handling: only render when actually present
  const hasDeliveryPin = Boolean(order.deliveryPin && order.deliveryPin.trim());
  const hasPaymentMethod = Boolean(order.paymentMethod && order.paymentMethod.trim());

  // Items list HTML - Refined Apple item rows with high-res thumbnails & tabular alignment
  const itemsHtml = order.items
    .map((item) => {
      const imgUrl = normalizeEmailImageUrl(item.image, origin);
      const specDetails = [
        item.brand,
        item.selectedColor,
        item.selectedStorage,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td class="apple-border" style="padding: 18px 0; border-bottom: 1px solid #E5E5E7; width: 64px; vertical-align: top;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="60">
              <tr>
                <td class="apple-thumb-bg apple-border" style="width: 60px; height: 60px; background-color: #F5F5F7; border: 1px solid #E5E5E7; border-radius: 12px; text-align: center; vertical-align: middle;">
                  <img src="${imgUrl}" alt="${item.name}" width="60" height="60" style="display: block; width: 60px; height: 60px; max-width: 60px; max-height: 60px; border-radius: 10px; object-fit: contain; border: 0; outline: none; margin: 0 auto;" />
                </td>
              </tr>
            </table>
          </td>
          <td class="apple-border" style="padding: 18px 14px; border-bottom: 1px solid #E5E5E7; vertical-align: top;">
            <div class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F; line-height: 1.35; margin-bottom: 3px;">
              ${item.name}
            </div>
            <div class="apple-text-secondary" style="font-size: 12px; color: #86868B; line-height: 1.4;">
              ${specDetails}${specDetails ? " · " : ""}Qty ${item.qty}
            </div>
          </td>
          <td align="right" class="apple-border" style="padding: 18px 0; border-bottom: 1px solid #E5E5E7; text-align: right; vertical-align: top; white-space: nowrap;">
            <div class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F; font-variant-numeric: tabular-nums;">
              $${(item.price * item.qty).toLocaleString()}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Apple 4-Stage Segmented Stepper: Placed → Prepared → In Transit → Delivered
  const stepsList = ["Placed", "Prepared", "In Transit", "Delivered"];
  const currentStepperIdx = stepDetails.stepperIndex;

  const stepperHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 14px; margin-bottom: 2px;">
      <tr>
        ${stepsList
          .map((label, idx) => {
            const isCompleted = idx <= currentStepperIdx;
            const barColor = isCompleted ? "#1D1D1F" : "#E5E5E7";
            return `
              <td style="width: 25%; padding: 0 2px;">
                <div class="apple-step-bar ${isCompleted ? "apple-bar-active" : "apple-bar-inactive"}" style="height: 4px; border-radius: 2px; background-color: ${barColor}; font-size: 1px; line-height: 1px;">&nbsp;</div>
              </td>
            `;
          })
          .join("")}
      </tr>
      <tr>
        ${stepsList
          .map((label, idx) => {
            const isCompleted = idx <= currentStepperIdx;
            const isCurrent = idx === currentStepperIdx;
            const fontWt = isCurrent ? "600" : isCompleted ? "500" : "400";
            const textColor = isCompleted ? "#1D1D1F" : "#86868B";
            const align = idx === 0 ? "left" : idx === stepsList.length - 1 ? "right" : "center";
            return `
              <td align="${align}" style="width: 25%; padding-top: 8px;">
                <span class="${isCompleted ? "apple-text-primary" : "apple-text-secondary"}" style="font-size: 10px; font-weight: ${fontWt}; color: ${textColor}; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; line-height: 1.2;">
                  ${label.toUpperCase()}
                </span>
              </td>
            `;
          })
          .join("")}
      </tr>
    </table>
  `;

  // Delivery verification PIN block (DHL/Amazon high-security standard, rendered ONLY when PIN exists)
  const pinDigits = hasDeliveryPin ? order.deliveryPin!.trim().split("") : [];
  const deliveryPinHtml = hasDeliveryPin
    ? `
      <tr>
        <td style="padding-bottom: 22px;">
          <div class="apple-box" style="background-color: #F5F5F7; border: 1px solid #E5E5E7; border-radius: 16px; padding: 18px 20px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 8px;">
                    Delivery Verification PIN
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="display: none; font-size: 0px; line-height: 0px; max-height: 0px; mso-hide: all;">${order.deliveryPin}</span>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 4px 0 10px 0;">
                    <tr>
                      ${pinDigits
                        .map(
                          (digit) => `
                        <td align="center" class="apple-pin-cell apple-border" style="width: 38px; height: 44px; background-color: #FFFFFF; border: 1px solid #D2D2D7; border-radius: 8px; text-align: center; vertical-align: middle; padding: 0 4px;">
                          <span class="apple-text-primary" style="font-size: 22px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Mono', monospace; color: #1D1D1F; line-height: 44px;">
                            ${digit}
                          </span>
                        </td>
                        <td style="width: 6px;"></td>
                      `
                        )
                        .join("")}
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="apple-text-secondary" style="font-size: 12px; color: #515154; line-height: 1.45;">
                    Present this 4-digit code in person to your courier upon delivery. For your security, never share this PIN by phone, text, or prior to package handover.
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    `
    : "";

  // Payment method summary row (only rendered when available)
  const paymentMethodRowHtml = hasPaymentMethod
    ? `
      <tr>
        <td colspan="2" class="apple-text-secondary" style="font-size: 12px; color: #86868B; padding-top: 6px;">
          Payment: ${order.paymentMethod}
        </td>
      </tr>
    `
    : "";

  // Minimalist Mobile-First HTML Email (Gmail App, Apple Mail, Outlook Tested)
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no, url=no" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1D1D1F; }
    
    @media only screen and (max-width: 520px) {
      .email-container { width: 100% !important; max-width: 100% !important; padding: 20px 16px !important; }
      .mobile-title { font-size: 24px !important; line-height: 1.2 !important; }
      .mobile-btn { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
      .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
      .mobile-stack-bottom { padding-top: 18px !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .email-canvas { background-color: #000000 !important; color: #F5F5F7 !important; }
      .apple-box { background-color: #1C1C1E !important; border-color: #2C2C2E !important; }
      .apple-pin-cell { background-color: #2C2C2E !important; border-color: #3A3A3C !important; }
      .apple-text-primary { color: #F5F5F7 !important; }
      .apple-text-secondary { color: #8E8E93 !important; }
      .apple-text-muted { color: #636366 !important; }
      .apple-border { border-color: #2C2C2E !important; }
      .apple-thumb-bg { background-color: #1C1C1E !important; border-color: #2C2C2E !important; }
      .apple-bar-active { background-color: #F5F5F7 !important; }
      .apple-bar-inactive { background-color: #38383A !important; }
      .apple-btn { background-color: #FFFFFF !important; color: #000000 !important; }
      .light-logo-wrap { display: none !important; }
      .dark-logo-wrap { display: block !important; width: 112px !important; max-height: none !important; line-height: normal !important; overflow: visible !important; float: none !important; visibility: visible !important; }
      .dark-logo { display: block !important; width: 112px !important; max-width: 112px !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF;">
  <!-- Gmail Clip Prevention & Invisible Preheader Snippet -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #FFFFFF; opacity: 0; mso-hide: all;">
    ${preheader}
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Main Mobile-First Outer Canvas -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-canvas" style="background-color: #FFFFFF; width: 100%;">
    <tr>
      <td align="center" style="padding: 12px 0;">
        <!-- Single Column Fluid Container (Max 560px for Apple-style typography) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 560px; width: 100%; margin: 0 auto; padding: 24px 20px;">
          
          <!-- Apple Minimalist Header with Verified ShipNest Logo (Light/Dark Switchable) -->
          <tr>
            <td class="apple-border" style="padding-bottom: 20px; border-bottom: 1px solid #E5E5E7;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${origin}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <div class="light-logo-wrap">
                        <img src="${logoUrl}" alt="ShipNest" width="112" height="30" class="light-logo" style="display: block; width: 112px; max-width: 112px; height: auto; border: 0; outline: none;" />
                      </div>
                      <!--[if !mso]><!-->
                      <div class="dark-logo-wrap" style="display: none; overflow: hidden; float: left; width: 0px; max-height: 0px; line-height: 0px; visibility: hidden;">
                        <img src="${logoWhiteUrl}" alt="ShipNest" width="112" height="30" class="dark-logo" style="display: none; width: 112px; max-width: 112px; height: auto; border: 0; outline: none;" />
                      </div>
                      <!--<![endif]-->
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="apple-text-secondary" style="font-size: 11px; font-weight: 500; color: #86868B; text-transform: uppercase; letter-spacing: 0.08em;">
                      Prague Hub
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Eyebrow, Hero Title & Personal Greeting -->
          <tr>
            <td style="padding-top: 28px; padding-bottom: 4px;">
              <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 6px;">
                ${stepDetails.eyebrow}
              </div>
              <h1 class="mobile-title apple-text-primary" style="margin: 0 0 6px 0; font-size: 28px; line-height: 1.15; font-weight: 600; letter-spacing: -0.025em; color: #1D1D1F;">
                ${stepDetails.title}
              </h1>
              <div class="apple-text-secondary" style="font-size: 13px; color: #86868B; margin-bottom: 18px;">
                Order #${order.orderId} · Placed on ${placedDate}
              </div>
              <p class="apple-text-primary" style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #1D1D1F;">
                Hello ${firstName},
              </p>
              <p class="apple-text-secondary" style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5; color: #515154;">
                ${explanation}
              </p>
            </td>
          </tr>

          <!-- Apple Minimal Status Card with 4-Stage Segmented Progress Tracker -->
          <tr>
            <td style="padding-bottom: 22px;">
              <div class="apple-box" style="background-color: #F5F5F7; border: 1px solid #E5E5E7; border-radius: 16px; padding: 18px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="left" style="vertical-align: middle;">
                      <span class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F;">
                        ${currentStep}
                      </span>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span class="apple-text-secondary" style="font-size: 12px; color: #86868B;">
                        ${order.estimatedDelivery ? `Est. ${order.estimatedDelivery}` : ""}
                      </span>
                    </td>
                  </tr>
                </table>
                ${stepperHtml}
              </div>
            </td>
          </tr>

          ${deliveryPinHtml}

          <!-- Items Ordered Section -->
          <tr>
            <td style="padding-top: 4px; padding-bottom: 4px;">
              <div class="apple-text-secondary apple-border" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; padding-bottom: 8px; border-bottom: 1px solid #E5E5E7;">
                Items in Your Order (${order.items.reduce((s, i) => s + i.qty, 0)})
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Order Summary Table (Subtotal, Shipping, Tax, Total) -->
          <tr>
            <td class="apple-border" style="padding-top: 14px; padding-bottom: 24px; border-bottom: 1px solid #E5E5E7;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">Subtotal</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0; font-variant-numeric: tabular-nums;">$${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">Express Shipping</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0;">Complimentary</td>
                </tr>
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">Estimated Tax (20%)</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0; font-variant-numeric: tabular-nums;">$${order.tax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="apple-text-primary" style="font-size: 15px; font-weight: 600; color: #1D1D1F; padding-top: 12px;">Total Paid</td>
                  <td align="right" class="apple-text-primary" style="font-size: 16px; font-weight: 700; color: #1D1D1F; padding-top: 12px; font-variant-numeric: tabular-nums;">$${order.total.toLocaleString()}</td>
                </tr>
                ${paymentMethodRowHtml}
              </table>
            </td>
          </tr>

          <!-- Shipping Details & Estimated Delivery (Responsive Stacking) -->
          <tr>
            <td style="padding-top: 22px; padding-bottom: 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="mobile-stack" style="vertical-align: top; width: 50%; padding-right: 14px;">
                    <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 4px;">
                      Ship To
                    </div>
                    <div class="apple-text-primary" style="font-size: 13px; font-weight: 600; color: #1D1D1F; margin-bottom: 2px;">
                      ${order.customer.name}
                    </div>
                    <div class="apple-text-secondary" style="font-size: 12px; color: #515154; line-height: 1.45;">
                      ${order.customer.address}<br />
                      ${order.customer.city}, ${order.customer.state} ${order.customer.zip}<br />
                      ${order.customer.country}
                    </div>
                  </td>
                  <td class="mobile-stack mobile-stack-bottom" style="vertical-align: top; width: 50%; padding-left: 14px;">
                    <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 4px;">
                      Estimated Arrival
                    </div>
                    <div class="apple-text-primary" style="font-size: 13px; font-weight: 600; color: #1D1D1F; margin-bottom: 2px;">
                      ${order.estimatedDelivery}
                    </div>
                    <div class="apple-text-secondary" style="font-size: 12px; color: #86868B; line-height: 1.45;">
                      Carrier: ShipNest Express Worldwide<br />
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', monospace; font-size: 11px;">Tracking: ${order.trackingId}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Apple Minimalist Pill CTA Button pointing to Production Tracking Route -->
          <tr>
            <td align="center" style="padding-bottom: 34px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${trackUrl}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="50%" stroke="f" fillcolor="#000000">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:500;">Track Shipment</center>
              </v:roundrect>
              <![endif]-->
              <a href="${trackUrl}" target="_blank" class="mobile-btn apple-btn" style="mso-hide:all; background-color: #000000; color: #FFFFFF; font-size: 14px; font-weight: 500; text-decoration: none; padding: 13px 38px; border-radius: 980px; display: inline-block; -webkit-text-size-adjust: none; text-align: center;">
                Track Shipment
              </a>
            </td>
          </tr>

          <!-- Apple Minimal Footer -->
          <tr>
            <td class="apple-border" style="border-top: 1px solid #E5E5E7; padding-top: 24px; text-align: center;">
              <p class="apple-text-secondary" style="margin: 0 0 6px 0; font-size: 11px; color: #86868B; line-height: 1.5;">
                ShipNest s.r.o. · Václav Havel Airport Prague (PRG) · Na Příkopě 859/22, 110 00 Prague 1
              </p>
              <p class="apple-text-secondary" style="margin: 0 0 6px 0; font-size: 11px; color: #86868B; line-height: 1.5;">
                Questions? Visit ShipNest Support or contact <a href="mailto:concierge@shipnest.getvoroa.com" style="color: #1D1D1F; text-decoration: underline;" class="apple-text-primary">concierge@shipnest.getvoroa.com</a>
              </p>
              <p class="apple-text-secondary" style="margin: 0; font-size: 11px; color: #86868B;">
                Copyright © 2026 ShipNest s.r.o. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Clean Plain-Text Counterpart (Apple tone, zero emojis, exact production tracking link)
  const pinTextLine = hasDeliveryPin
    ? `\nDelivery Verification PIN: ${order.deliveryPin}\n(Present this 4-digit code in person to your courier upon delivery)`
    : "";
  const paymentTextLine = hasPaymentMethod
    ? `\nPayment: ${order.paymentMethod}`
    : "";

  const plainText = `
ShipNest
${stepDetails.title}

Hello ${firstName},

${explanation}

STATUS:
${currentStep}
Estimated Arrival: ${order.estimatedDelivery}

ORDER DETAILS:
Order Number: #${order.orderId}
Order Date: ${placedDate}
Tracking Number: ${order.trackingId}${pinTextLine}

ITEMS IN YOUR ORDER:
${order.items.map((i) => `* ${i.name}${i.brand ? ` (${i.brand})` : ""} x${i.qty} - $${(i.price * i.qty).toLocaleString()}`).join("\n")}

SUMMARY:
Subtotal: $${order.subtotal.toLocaleString()}
Express Shipping: Complimentary
Estimated Tax (20%): $${order.tax.toLocaleString()}
Total: $${order.total.toLocaleString()}${paymentTextLine}

SHIP TO:
${order.customer.name}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.zip}
${order.customer.country}

TRACK YOUR SHIPMENT:
${trackUrl}

--
ShipNest s.r.o. · Václav Havel Airport Prague (PRG) · Na Příkopě 859/22, 110 00 Prague 1
Concierge Support: concierge@shipnest.getvoroa.com
`.trim();

  return {
    stepStatus: currentStep,
    stepIcon: "",
    subject,
    preheader,
    html,
    plainText,
    recipientName: order.customer.name,
    recipientEmail: order.customer.email,
  };
};
