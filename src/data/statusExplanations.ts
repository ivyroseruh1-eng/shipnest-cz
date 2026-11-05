// One-line plain-English explainers shown under the current tracking step and in transactional emails.
export const statusExplanations: Record<string, string> = {
  "Order Received": "We've received your order and are reviewing your details. Once confirmed, we'll begin preparing your items for shipment and send you an update.",
  "Order Placed": "We've received your order and are reviewing your details. Once confirmed, we'll begin preparing your items for shipment and send you an update.",
  "Order Confirmed": "Your order details and payment have been confirmed. Your items are being prepared for dispatch.",
  "Payment Confirmed": "Your payment has been successfully authorized and confirmed. Your order is now queued in our fulfillment system, and preparation will begin shortly.",
  "Processing": "Your order is currently being prepared at our fulfillment facility. Each item is inspected and packaged carefully before being handed over to the carrier.",
  "Processing at Warehouse": "Your items are currently being gathered, inspected, and packaged for handover to the carrier.",
  "Packed": "Your items have been securely packed and labeled for transport. The package is now staged at our facility awaiting scheduled carrier collection.",
  "Shipment Created": "A shipping label and tracking number have been generated for your order. Carrier tracking events will begin updating as soon as the package receives its initial scan.",
  "Departed Origin": "Your shipment has departed our dispatch facility and is now in transit with the carrier. It is on its way to the next transport hub on its route.",
  "Departed from Prague": "Your shipment has departed the Prague dispatch facility and is on its way to the next transport hub.",
  "In Transit": "Your package is traveling through the carrier transit network toward your destination region. Progress is steady and tracking updates continue as checkpoints are reached.",
  "In Transit to Istanbul": "Your shipment is in transit on its flight connection to Istanbul.",
  "Arrived at Istanbul Hub": "Your package has arrived at the Istanbul transit hub and is awaiting connecting transport.",
  "In Transit to Beijing": "Your shipment is in transit on its flight connection to Beijing.",
  "Arrived at Beijing Hub": "Your package has arrived at the Beijing transit hub and is preparing for onward transit.",
  "In Transit to New Delhi": "Your shipment is in transit on its flight connection to New Delhi.",
  "Customs": "Your shipment has arrived at the destination customs facility for standard regulatory clearance. Once completed, your package will transfer directly to the local carrier.",
  "Arrived at New Delhi": "Your package has arrived in New Delhi and is undergoing standard inbound processing.",
  "Received at Local Warehouse": "Your package has cleared customs and arrived at the local delivery facility.",
  "Regional Hub": "Your package has arrived at the regional distribution facility serving your region. It is being sorted for transport to the local delivery station in your area.",
  "Moving to Regional Hub": "Your package is in transit to the regional distribution facility serving your area.",
  "Arrived at Regional Hub": "Your package has arrived at the regional distribution facility and is being sorted for local dispatch.",
  "Local Hub": "Your package has arrived at the local delivery center nearest your address. It is being sorted onto a delivery route for final dispatch.",
  "Arrived at Local Delivery Hub": "Your package has arrived at the local delivery center and is being prepared for courier dispatch.",
  "Out for Delivery": "A courier has loaded your package and is out for delivery today. Please ensure someone is available at the delivery address to receive the package.",
  "Delivered": "Your package has been delivered to your destination address. If you need any assistance with your items, our concierge support team is ready to help.",
  "Cancelled": "This order has been cancelled. Any temporary authorization hold on your payment method will be released by your card issuer according to their standard policy.",
};

export const explainStatus = (status: string): string | undefined => {
  if (statusExplanations[status]) return statusExplanations[status];
  if (status.startsWith("Dispatched to")) return "Your package is in transit to the delivery facility in your city.";
  if (status.includes("Cancelled")) return "This order was cancelled. Any temporary authorization hold on your payment method will be released by your bank.";
  if (status.startsWith("Return:")) return "Your return shipment is in transit back to our fulfillment center.";
  return undefined;
};
