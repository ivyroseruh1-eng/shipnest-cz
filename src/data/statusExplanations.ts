// One-line plain-English explainers shown under the current tracking step.
export const statusExplanations: Record<string, string> = {
  "Order Received": "We've received your order and our logistics team is preparing it for dispatch.",
  "Order Placed": "We've received your order and our logistics team is preparing it for dispatch.",
  "Payment Confirmed": "Your payment has been successfully authorized and verified by our European gateway.",
  "Processing": "Your package is being picked, inspected, and verified against factory serial records.",
  "Processing at Warehouse": "Your package is being picked, inspected, and securely sealed at our warehouse.",
  "Packed": "Your order is sealed in tamper-evident packaging and assigned an international flight barcode.",
  "Shipment Created": "International cargo manifest and air waybill (AWB) generated at Prague PRG Gateway.",
  "Departed Origin": "Your shipment has cleared Prague airport cargo security and departed on its flight.",
  "Departed from Prague": "Your package has cleared outbound cargo dispatch and is on its international flight.",
  "In Transit": "Your sealed consignment is in international air transit toward the destination hub.",
  "In Transit to Istanbul": "Your shipment is mid-air on the outbound international transit leg.",
  "Arrived at Istanbul Hub": "Cleared the Istanbul transit hub and is awaiting the next outbound flight.",
  "In Transit to Beijing": "Currently on the Istanbul → Beijing long-haul leg. No scans during flight.",
  "Arrived at Beijing Hub": "Arrived at the Beijing consolidation hub for the final India-bound flight.",
  "In Transit to New Delhi": "On the final international leg into Indira Gandhi International (DEL).",
  "Customs": "Arrived at destination customs facility for import inspection and clearance processing.",
  "Arrived at New Delhi": "Landed in New Delhi. Customs clearance and inbound scanning is in progress.",
  "Received at Local Warehouse": "Cleared customs and handed to our India last-mile partner.",
  "Regional Hub": "Consignment sorted and transferring through the regional logistics gateway.",
  "Moving to Regional Hub": "Moving overland to the regional sorting hub nearest your delivery address.",
  "Arrived at Regional Hub": "Sorted and routed for the final dispatch leg to your city.",
  "Local Hub": "Arrived at your local delivery centre. Last-mile dispatch scheduled within 24 hours.",
  "Arrived at Local Delivery Hub": "At the local delivery centre. Out for delivery typically within 24 hours.",
  "Out for Delivery": "A courier is on the way to your address today. Please have your 4-digit PIN ready.",
  "Delivered": "Package delivered and verified with your 4-digit PIN. Enjoy your authentic device.",
};

export const explainStatus = (status: string): string | undefined => {
  if (statusExplanations[status]) return statusExplanations[status];
  if (status.startsWith("Dispatched to")) return "Loaded onto the final outbound truck heading to your city.";
  if (status.includes("Cancelled")) return "This order was cancelled. Refund will appear on your statement within 5–7 business days.";
  if (status.startsWith("Return:")) return "Your return is in transit back to our central Prague warehouse.";
  return undefined;
};
