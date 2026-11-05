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

const STEP_ICONS: Record<string, string> = {
  "Order Received": "📦",
  "Order Placed": "📦",
  "Order Confirmed": "✅",
  "Payment Confirmed": "💳",
  "Processing": "🏭",
  "Processing at Warehouse": "🏭",
  "Packed": "📦",
  "Shipment Created": "🏷️",
  "Departed Origin": "✈️",
  "Departed from Prague": "✈️",
  "In Transit": "🌍",
  "Customs": "🔍",
  "Regional Hub": "🚚",
  "Local Hub": "🏪",
  "Out for Delivery": "🛵",
  "Delivered": "🏠",
  "Cancelled": "❌",
};

const STEP_TITLES: Record<string, string> = {
  "Order Received": "Consignment Order Received · Preparing for Prague Hub Dispatch",
  "Payment Confirmed": "Payment Verified & Allocated to Prague Central Gateway",
  "Processing": "Quality Inspection & Serial Verification in Progress",
  "Packed": "Consignment Sealed in Tamper-Evident Luxury Packaging",
  "Shipment Created": "International Cargo Manifest & Air Waybill (AWB) Created",
  "Departed Origin": "Air Cargo Flight Cleared Václav Havel Airport Prague (PRG)",
  "In Transit": "Consignment in International Air Transit",
  "Customs": "Destination Customs Inspection & Clearance Processing",
  "Regional Hub": "Consignment Arrived at Regional Logistics Gateway",
  "Local Hub": "Arrived at Local Hub · Scheduled for Courier Last-Mile Dispatch",
  "Out for Delivery": "Out for Doorstep Delivery Today · Have Your 4-Digit PIN Ready",
  "Delivered": "Consignment Successfully Delivered & PIN Verified",
  "Cancelled": "Order Cancelled · Refund Authorized to Origin Payment Method",
};

const getStepColor = (status: string): { bg: string; text: string; border: string; accent: string } => {
  if (status === "Delivered") {
    return { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", accent: "#10B981" };
  }
  if (status === "Out for Delivery") {
    return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", accent: "#F59E0B" };
  }
  if (status.includes("Transit") || status.includes("Departed") || status.includes("Shipment")) {
    return { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", accent: "#3B82F6" };
  }
  if (status === "Cancelled") {
    return { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", accent: "#EF4444" };
  }
  return { bg: "#F8FAFC", text: "#334155", border: "#E2E8F0", accent: "#6366F1" };
};

/**
 * Generates an authentic, responsive HTML email for a given order and tracking step.
 * Uses official ShipNest logos, assets, delivery PIN, product images, and Prague HQ branding.
 */
export const generateOrderEmail = (
  order: Order,
  targetStepStatus?: string,
  customOrigin?: string
): GeneratedEmail => {
  const origin =
    customOrigin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://shipnest.com");

  const currentStep = targetStepStatus || order.status || "Order Received";
  const icon = STEP_ICONS[currentStep] || "📦";
  const title = STEP_TITLES[currentStep] || `Order Status Update: ${currentStep}`;
  const explanation =
    explainStatus(currentStep) ||
    "Your package is moving along the ShipNest white-glove air cargo pipeline.";
  const colors = getStepColor(currentStep);

  const subject = `[ShipNest] ${icon} ${currentStep}: Order #${order.orderId} (${order.customer.name})`;
  const preheader = `${title} · Reference #${order.orderId} · PIN: ${order.deliveryPin || "••••"}`;

  // Formatted date
  const placedDate = new Date(order.placedAt || Date.now()).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const trackUrl = `${origin}/track?id=${encodeURIComponent(order.orderId)}`;
  const logoUrl = `${origin}/assets/brand/shipnest-logo.png`;
  const paymentMethodLabel = order.paymentMethod || "Visa •••• 7632 (Brooklyn Sanchez)";
  const deliveryPin = order.deliveryPin || "4829";

  // Items table HTML
  const itemsHtml = order.items
    .map((item) => {
      const imgUrl = item.image.startsWith("http")
        ? item.image
        : `${origin}${item.image.startsWith("/") ? "" : "/"}${item.image}`;

      const variants = [
        item.brand,
        item.selectedStorage,
        item.selectedColor,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #E2E8F0; width: 72px; vertical-align: top;">
            <img src="${imgUrl}" alt="${item.name}" width="64" height="64" style="border-radius: 10px; object-fit: cover; border: 1px solid #CBD5E1; display: block; background-color: #F8FAFC;" />
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #E2E8F0; vertical-align: top;">
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.3;">${item.name}</p>
            <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: 500;">${variants}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94A3B8; font-family: monospace;">SKU: ${item.productId.slice(0, 8).toUpperCase()} · Qty: ${item.qty}</p>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #E2E8F0; text-align: right; vertical-align: top; white-space: nowrap;">
            <span style="font-size: 14px; font-weight: 700; color: #0F172A; font-family: monospace;">$${(item.price * item.qty).toLocaleString()}</span>
          </td>
        </tr>
      `;
    })
    .join("");

  // Stepper milestones
  const milestones = [
    { label: "Placed", active: true },
    { label: "Hub Sourcing", active: currentStep !== "Order Received" },
    {
      label: "Air Transit",
      active: [
        "In Transit",
        "Departed Origin",
        "Customs",
        "Regional Hub",
        "Local Hub",
        "Out for Delivery",
        "Delivered",
      ].includes(currentStep),
    },
    {
      label: "Out for Delivery",
      active: ["Out for Delivery", "Delivered"].includes(currentStep),
    },
    { label: "Delivered", active: currentStep === "Delivered" },
  ];

  const stepperHtml = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 10px 0;">
      <tr>
        ${milestones
          .map((m) => {
            const circleBg = m.active ? "#0F172A" : "#E2E8F0";
            const textColor = m.active ? "#0F172A" : "#94A3B8";
            const fontWt = m.active ? "700" : "500";
            return `
            <td style="text-align: center; width: 20%;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${circleBg}; margin: 0 auto 6px auto;"></div>
              <span style="font-size: 10px; font-weight: ${fontWt}; color: ${textColor}; text-transform: uppercase; letter-spacing: 0.5px; display: block;">${m.label}</span>
            </td>
          `;
          })
          .join("")}
      </tr>
    </table>
  `;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .content-padding { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; color: #F1F5F9;">
    ${preheader}
  </div>

  <!-- Main Email Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9;">
    <tr>
      <td align="center" style="padding: 0 12px;">
        <table role="presentation" class="container" width="620" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02); border: 1px solid #E2E8F0; max-width: 620px;">
          
          <!-- Top Obsidian Brand Banner -->
          <tr>
            <td style="background-color: #0A0D14; padding: 24px 32px; border-bottom: 2px solid #1E293B;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <img src="${logoUrl}" alt="ShipNest" width="128" style="display: block; width: 128px; max-width: 128px; height: auto;" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 10px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; background-color: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); padding: 4px 10px; rounded-md; display: inline-block;">
                      PRG Airport Hub Live
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Status Alert Box -->
          <tr>
            <td class="content-padding" style="padding: 32px 32px 20px 32px;">
              <div style="background-color: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 18px; padding: 22px; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width: 44px; vertical-align: top; font-size: 30px; line-height: 1;">
                      ${icon}
                    </td>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 11px; font-weight: 800; color: ${colors.accent}; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">
                        Logistics Milestone · ${currentStep}
                      </span>
                      <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A; line-height: 1.3;">
                        ${title}
                      </h1>
                      <p style="margin: 8px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
                        ${explanation}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Step Progress Track -->
                ${stepperHtml}
              </div>

              <!-- Greeting & Reference -->
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0F172A;">
                Dear ${order.customer.name},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.5;">
                We have registered an update regarding your order <strong style="color: #0F172A;">#${order.orderId}</strong> dispatched from the ShipNest central European cargo terminal at Václav Havel Airport Prague (PRG).
              </p>

              <!-- Doorstep PIN Card (Crucial Security Asset) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; border-radius: 16px; margin-bottom: 24px; color: #FFFFFF; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; display: block; margin-bottom: 4px;">
                            🔒 Doorstep Verification Code
                          </span>
                          <span style="font-size: 12px; color: #E2E8F0;">
                            Share this PIN only with your courier upon delivery
                          </span>
                        </td>
                        <td align="right">
                          <div style="background-color: #1E293B; border: 1px solid #334155; padding: 8px 16px; border-radius: 12px; font-size: 24px; font-weight: 800; letter-spacing: 6px; color: #38BDF8; font-family: monospace; display: inline-block;">
                            ${deliveryPin}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipment Key Metrics Grid -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-right: 1px solid #E2E8F0; width: 50%;">
                    <span style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                      Tracking Number
                    </span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A; font-family: monospace;">
                      ${order.trackingId}
                    </span>
                  </td>
                  <td style="padding: 16px 20px; width: 50%;">
                    <span style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                      Estimated Arrival
                    </span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">
                      ${order.estimatedDelivery}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Items in Consignment -->
              <h2 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 1px;">
                Consignment Items (${order.items.reduce((s, i) => s + i.qty, 0)})
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <!-- Financial Summary & Invoiced Amount -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; color: #64748B; padding: 4px 0;">Items Subtotal</td>
                  <td style="font-size: 12px; font-weight: 600; color: #0F172A; text-align: right; font-family: monospace;">$${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #64748B; padding: 4px 0;">Priority Air Cargo & Insurance (20% VAT)</td>
                  <td style="font-size: 12px; font-weight: 600; color: #0F172A; text-align: right; font-family: monospace;">$${order.tax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: 800; color: #0F172A; padding: 10px 0 4px 0; border-top: 1px solid #E2E8F0;">Total Invoiced Amount</td>
                  <td style="font-size: 16px; font-weight: 800; color: #0F172A; text-align: right; font-family: monospace; padding: 10px 0 4px 0; border-top: 1px solid #E2E8F0;">$${order.total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size: 11px; color: #94A3B8; padding-top: 6px;">
                    Paid via: <strong style="color: #475569;">${paymentMethodLabel}</strong> · Order placed on ${placedDate}
                  </td>
                </tr>
              </table>

              <!-- Delivery Address Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 20px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                      Final Consignment Destination
                    </span>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0F172A;">
                      ${order.customer.name}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569; line-height: 1.4;">
                      ${order.customer.address}<br />
                      ${order.customer.city}, ${order.customer.state} ${order.customer.zip}<br />
                      ${order.customer.country} · Tel: ${order.customer.phone}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Primary Call To Action Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${trackUrl}" target="_blank" style="background-color: #0F172A; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 50px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.25);">
                  Track Consignment Telemetry Live →
                </a>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #94A3B8;">
                  Live satellite telemetry · No login required
                </p>
              </div>

            </td>
          </tr>

          <!-- Official ShipNest Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                ShipNest s.r.o. · Prague Central Freight Logistics Hub
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748B; line-height: 1.5;">
                Na Příkopě 859/22, 110 00 Nové Město, Prague 1, Czech Republic<br />
                Václav Havel Airport Prague (PRG) · Cargo Freight Terminal 3<br />
                VAT ID: CZ84920194 · AIG Underwriting Certificate #CZ-PRG-88219
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Need assistance? Reply directly to this email or contact <a href="mailto:concierge@shipnest.com" style="color: #0F172A; text-decoration: underline; font-weight: 600;">concierge@shipnest.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text counterpart
  const plainText = `
SHIPNEST LOGISTICS · CENTRAL EUROPEAN AIR GATEWAY (PRAGUE)
============================================================

Dear ${order.customer.name},

${title}
Status: ${currentStep}
${explanation}

ORDER DETAILS:
- Order Reference: #${order.orderId}
- Tracking Number: ${order.trackingId}
- Doorstep Verification PIN: ${deliveryPin}
- Estimated Arrival: ${order.estimatedDelivery}
- Order Date: ${placedDate}

CONSIGNMENT ITEMS:
${order.items.map((i) => `* ${i.name} (${i.brand}) x${i.qty} - $${(i.price * i.qty).toLocaleString()}`).join("\n")}

FINANCIAL SUMMARY:
- Subtotal: $${order.subtotal.toLocaleString()}
- Priority Air Cargo & VAT (20%): $${order.tax.toLocaleString()}
- Total: $${order.total.toLocaleString()}
- Payment: ${paymentMethodLabel}

DELIVERY DESTINATION:
${order.customer.name}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.zip}
${order.customer.country}
Phone: ${order.customer.phone}

TRACK YOUR CONSIGNMENT LIVE:
${trackUrl}

--
ShipNest s.r.o. | Na Příkopě 859/22, 110 00 Prague, Czech Republic
Václav Havel Airport Prague (PRG) Freight Terminal 3
Concierge Desk: concierge@shipnest.com
`.trim();

  return {
    stepStatus: currentStep,
    stepIcon: icon,
    subject,
    preheader,
    html,
    plainText,
    recipientName: order.customer.name,
    recipientEmail: order.customer.email,
  };
};
