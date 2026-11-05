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

interface AppleStepDetails {
  eyebrow: string;
  title: string;
  subject: string;
  stepperIndex: number; // 0: Placed, 1: Prepared, 2: In Transit, 3: Delivered
}

const APPLE_STATUS_DETAILS: Record<string, AppleStepDetails> = {
  "Order Received": {
    eyebrow: "Order Confirmed",
    title: "We've received your order.",
    subject: "We've received your order",
    stepperIndex: 0,
  },
  "Order Placed": {
    eyebrow: "Order Confirmed",
    title: "We've received your order.",
    subject: "We've received your order",
    stepperIndex: 0,
  },
  "Order Confirmed": {
    eyebrow: "Order Confirmed",
    title: "We've received your order.",
    subject: "We've received your order",
    stepperIndex: 0,
  },
  "Payment Confirmed": {
    eyebrow: "Payment Authorized",
    title: "Payment confirmed.",
    subject: "Payment confirmed for your order",
    stepperIndex: 0,
  },
  "Processing": {
    eyebrow: "Prague Gateway",
    title: "Your order is being prepared.",
    subject: "Your order is being prepared",
    stepperIndex: 1,
  },
  "Processing at Warehouse": {
    eyebrow: "Prague Gateway",
    title: "Your order is being prepared.",
    subject: "Your order is being prepared",
    stepperIndex: 1,
  },
  "Packed": {
    eyebrow: "Packaging Complete",
    title: "Your order is packed and ready.",
    subject: "Your order is packed and ready",
    stepperIndex: 1,
  },
  "Shipment Created": {
    eyebrow: "Air Waybill Assigned",
    title: "Shipment details created.",
    subject: "Shipment details created for your order",
    stepperIndex: 1,
  },
  "Departed Origin": {
    eyebrow: "Prague Airport (PRG)",
    title: "Your shipment has departed Prague.",
    subject: "Your shipment has departed Prague",
    stepperIndex: 2,
  },
  "Departed from Prague": {
    eyebrow: "Prague Airport (PRG)",
    title: "Your shipment has departed Prague.",
    subject: "Your shipment has departed Prague",
    stepperIndex: 2,
  },
  "In Transit": {
    eyebrow: "Air Cargo",
    title: "Your shipment is on its way.",
    subject: "Your shipment is on its way",
    stepperIndex: 2,
  },
  "Customs": {
    eyebrow: "Import Clearance",
    title: "Customs clearance in progress.",
    subject: "Customs clearance update for your order",
    stepperIndex: 2,
  },
  "Regional Hub": {
    eyebrow: "Regional Gateway",
    title: "Arrived at regional hub.",
    subject: "Your shipment arrived at the regional hub",
    stepperIndex: 2,
  },
  "Local Hub": {
    eyebrow: "Local Facility",
    title: "Arrived at your local facility.",
    subject: "Your shipment arrived at your local facility",
    stepperIndex: 2,
  },
  "Out for Delivery": {
    eyebrow: "Out for Delivery",
    title: "Arriving today.",
    subject: "Your package is out for delivery today",
    stepperIndex: 3,
  },
  "Delivered": {
    eyebrow: "Delivered",
    title: "Your package has been delivered.",
    subject: "Your package has been delivered",
    stepperIndex: 3,
  },
  "Cancelled": {
    eyebrow: "Order Cancelled",
    title: "Your order was cancelled.",
    subject: "Cancellation notice for your order",
    stepperIndex: 0,
  },
};

/**
 * Generates a strictly mobile-first, minimal Apple-style transactional HTML email.
 * - Fluid 100% outer container with 560px maximum desktop content width.
 * - Email-compatible HTML tables and inline CSS (Gmail iOS/Android and Apple Mail).
 * - Light and dark mode support with system fonts.
 * - Reliable production HTTPS image asset resolution.
 * - Real dynamic tracking links: https://shipnest.getvoroa.com/track/:trackingId.
 * - Complete plain-text counterpart.
 * - Zero emoji decorations.
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
    subject: `Update on order #${order.orderId}`,
    stepperIndex: 1,
  };

  const explanation =
    explainStatus(currentStep) ||
    "Your package is moving through the ShipNest air cargo pipeline.";

  // Subject and preheader without emojis
  const subject = `ShipNest: ${stepDetails.subject} #${order.orderId}`;
  const preheader = order.deliveryPin
    ? `${stepDetails.title} Order #${order.orderId} · Verification PIN: ${order.deliveryPin}`
    : `${stepDetails.title} Order #${order.orderId} · Tracking: ${order.trackingId}`;

  const placedDate = new Date(order.placedAt || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Canonical tracking link using real order.trackingId
  const trackUrl = `${origin}/track/${encodeURIComponent(order.trackingId)}`;
  const logoUrl = normalizeEmailImageUrl("/assets/brand/shipnest-logo.png", origin);

  // Sensitive data handling: only render when actually present
  const hasDeliveryPin = Boolean(order.deliveryPin && order.deliveryPin.trim());
  const hasPaymentMethod = Boolean(order.paymentMethod && order.paymentMethod.trim());

  // Items list HTML - Minimal Apple style with normalized images
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
          <td style="padding: 16px 0; border-bottom: 1px solid #E5E5E7; width: 64px; vertical-align: top;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="56">
              <tr>
                <td class="apple-thumb-bg" style="width: 56px; height: 56px; background-color: #F5F5F7; border-radius: 12px; text-align: center; vertical-align: middle;">
                  <img src="${imgUrl}" alt="${item.name}" width="56" height="56" style="display: block; width: 56px; height: 56px; border-radius: 12px; object-fit: contain; border: 0; outline: none;" />
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #E5E5E7; vertical-align: top;">
            <div class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F; line-height: 1.35; margin-bottom: 3px;">
              ${item.name}
            </div>
            <div class="apple-text-secondary" style="font-size: 12px; color: #86868B; line-height: 1.4;">
              ${specDetails}${specDetails ? " · " : ""}Qty ${item.qty}
            </div>
          </td>
          <td align="right" style="padding: 16px 0; border-bottom: 1px solid #E5E5E7; text-align: right; vertical-align: top; white-space: nowrap;">
            <div class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F;">
              $${(item.price * item.qty).toLocaleString()}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Minimal 4-stage Apple stepper: Placed → Prepared → In Transit → Delivered
  const stepsList = ["Placed", "Prepared", "In Transit", "Delivered"];
  const currentStepperIdx = stepDetails.stepperIndex;

  const stepperHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 18px; margin-bottom: 4px;">
      <tr>
        ${stepsList
          .map((label, idx) => {
            const isCompleted = idx <= currentStepperIdx;
            const isCurrent = idx === currentStepperIdx;
            const dotColor = isCompleted ? "#1D1D1F" : "#D2D2D7";
            const labelColor = isCompleted ? "#1D1D1F" : "#86868B";
            const fontWt = isCurrent ? "600" : isCompleted ? "500" : "400";
            return `
              <td style="text-align: center; width: 25%; vertical-align: top; padding: 0 2px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom: 6px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor}; line-height: 8px; font-size: 8px;">&nbsp;</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <span class="${isCompleted ? "apple-text-primary" : "apple-text-secondary"}" style="font-size: 10px; font-weight: ${fontWt}; color: ${labelColor}; text-transform: uppercase; letter-spacing: 0.05em; display: block; line-height: 1.2;">
                        ${label.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            `;
          })
          .join("")}
      </tr>
    </table>
  `;

  // Delivery verification PIN block (only rendered when PIN exists)
  const deliveryPinHtml = hasDeliveryPin
    ? `
      <tr>
        <td style="padding-bottom: 22px;">
          <div class="apple-box" style="background-color: #F5F5F7; border: 1px solid #E5E5E7; border-radius: 14px; padding: 16px 20px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <div class="apple-text-secondary" style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 2px;">
                    Delivery Verification PIN
                  </div>
                  <div class="apple-text-secondary" style="font-size: 12px; color: #515154;">
                    Present this code to your courier upon delivery
                  </div>
                </td>
                <td align="right" style="vertical-align: middle;">
                  <div class="apple-text-primary" style="font-size: 24px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Mono', 'Courier New', monospace; letter-spacing: 5px; color: #1D1D1F; text-align: right;">
                    ${order.deliveryPin}
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

  // Minimalist Mobile-First HTML Email (Gmail App & Apple Mail Ready)
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
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; padding: 20px 16px !important; }
      .mobile-title { font-size: 24px !important; line-height: 1.2 !important; }
      .mobile-btn { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .email-canvas { background-color: #000000 !important; color: #F5F5F7 !important; }
      .apple-box { background-color: #1C1C1E !important; border-color: #2C2C2E !important; }
      .apple-text-primary { color: #F5F5F7 !important; }
      .apple-text-secondary { color: #8E8E93 !important; }
      .apple-text-muted { color: #636366 !important; }
      .apple-border { border-color: #2C2C2E !important; }
      .apple-thumb-bg { background-color: #1C1C1E !important; }
      .apple-btn { background-color: #FFFFFF !important; color: #000000 !important; }
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
          
          <!-- Apple Minimalist Header with Verified ShipNest Logo -->
          <tr>
            <td class="apple-border" style="padding-bottom: 20px; border-bottom: 1px solid #E5E5E7;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${origin}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="ShipNest" width="112" height="30" style="display: block; width: 112px; max-width: 112px; height: auto; border: 0; outline: none;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="apple-text-secondary" style="font-size: 11px; font-weight: 500; color: #86868B; text-transform: uppercase; letter-spacing: 0.05em;">
                      Prague Hub
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Eyebrow & Hero Title -->
          <tr>
            <td style="padding-top: 28px; padding-bottom: 4px;">
              <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 6px;">
                ${stepDetails.eyebrow}
              </div>
              <h1 class="mobile-title apple-text-primary" style="margin: 0 0 6px 0; font-size: 28px; line-height: 1.15; font-weight: 600; letter-spacing: -0.025em; color: #1D1D1F;">
                ${stepDetails.title}
              </h1>
              <div class="apple-text-secondary" style="font-size: 13px; color: #86868B; margin-bottom: 22px;">
                Order #${order.orderId} · Placed on ${placedDate}
              </div>
            </td>
          </tr>

          <!-- Apple Minimal Status Card with 4-Stage Progress Stepper -->
          <tr>
            <td style="padding-bottom: 22px;">
              <div class="apple-box" style="background-color: #F5F5F7; border-radius: 16px; padding: 18px 20px;">
                <div class="apple-text-primary" style="font-size: 14px; font-weight: 600; color: #1D1D1F; margin-bottom: 3px;">
                  ${currentStep}
                </div>
                <div class="apple-text-secondary" style="font-size: 13px; color: #515154; line-height: 1.45;">
                  ${explanation}
                </div>
                ${stepperHtml}
              </div>
            </td>
          </tr>

          ${deliveryPinHtml}

          <!-- Items Ordered Section -->
          <tr>
            <td style="padding-top: 4px; padding-bottom: 4px;">
              <div class="apple-text-secondary apple-border" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; padding-bottom: 8px; border-bottom: 1px solid #E5E5E7;">
                Items in Consignment (${order.items.reduce((s, i) => s + i.qty, 0)})
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Order Summary Table (Subtotal, Air Freight, Tax, Total) -->
          <tr>
            <td class="apple-border" style="padding-top: 14px; padding-bottom: 24px; border-bottom: 1px solid #E5E5E7;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">Subtotal</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0;">$${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">Priority Air Express (PRG Cargo)</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0;">Complimentary</td>
                </tr>
                <tr>
                  <td class="apple-text-secondary" style="font-size: 13px; color: #86868B; padding: 4px 0;">VAT & Insurance (20%)</td>
                  <td align="right" class="apple-text-primary" style="font-size: 13px; color: #1D1D1F; padding: 4px 0;">$${order.tax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="apple-text-primary" style="font-size: 15px; font-weight: 600; color: #1D1D1F; padding-top: 12px;">Total Paid</td>
                  <td align="right" class="apple-text-primary" style="font-size: 16px; font-weight: 700; color: #1D1D1F; padding-top: 12px;">$${order.total.toLocaleString()}</td>
                </tr>
                ${paymentMethodRowHtml}
              </table>
            </td>
          </tr>

          <!-- Shipping Details & Estimated Delivery -->
          <tr>
            <td style="padding-top: 22px; padding-bottom: 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: top; width: 50%; padding-right: 12px;">
                    <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 4px;">
                      Ship To
                    </div>
                    <div class="apple-text-primary" style="font-size: 13px; font-weight: 600; color: #1D1D1F; margin-bottom: 2px;">
                      ${order.customer.name}
                    </div>
                    <div class="apple-text-secondary" style="font-size: 12px; color: #515154; line-height: 1.4;">
                      ${order.customer.address}<br />
                      ${order.customer.city}, ${order.customer.state} ${order.customer.zip}<br />
                      ${order.customer.country}
                    </div>
                  </td>
                  <td style="vertical-align: top; width: 50%; padding-left: 12px;">
                    <div class="apple-text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #86868B; margin-bottom: 4px;">
                      Estimated Arrival
                    </div>
                    <div class="apple-text-primary" style="font-size: 13px; font-weight: 600; color: #1D1D1F; margin-bottom: 2px;">
                      ${order.estimatedDelivery}
                    </div>
                    <div class="apple-text-secondary" style="font-size: 12px; color: #86868B; font-family: monospace;">
                      Tracking: ${order.trackingId}
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
                Questions? Visit ShipNest Support or contact <a href="mailto:concierge@shipnest.getvoroa.com" style="color: #1D1D1F; text-decoration: underline;">concierge@shipnest.getvoroa.com</a>
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
    ? `\nDelivery Verification PIN: ${order.deliveryPin}`
    : "";
  const paymentTextLine = hasPaymentMethod
    ? `\nPayment: ${order.paymentMethod}`
    : "";

  const plainText = `
ShipNest
Order Update: ${stepDetails.title}

Dear ${order.customer.name},

${explanation}

ORDER DETAILS:
Order Number: #${order.orderId}
Order Date: ${placedDate}
Tracking Number: ${order.trackingId}${pinTextLine}
Estimated Arrival: ${order.estimatedDelivery}

ITEMS ORDERED:
${order.items.map((i) => `* ${i.name} (${i.brand}) x${i.qty} - $${(i.price * i.qty).toLocaleString()}`).join("\n")}

SUMMARY:
Subtotal: $${order.subtotal.toLocaleString()}
Priority Air Express: Complimentary
VAT & Insurance (20%): $${order.tax.toLocaleString()}
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
