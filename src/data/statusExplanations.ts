// One-line plain-English explainers shown under the current tracking step.
export const statusExplanations: Record<string, string> = {
  "Order Placed": "We've received your order and our Prague team is preparing it for dispatch.",
  "Processing at Warehouse": "Your package is being picked, inspected, and securely sealed at our Prague warehouse.",
  "Departed from Prague": "Your package has left Václav Havel Airport and is on its first international flight.",
  "In Transit to Istanbul": "Your shipment is mid-air on the Prague → Istanbul leg.",
  "Arrived at Istanbul Hub": "Cleared the Istanbul transit hub and is awaiting the next outbound flight.",
  "In Transit to Beijing": "Currently on the Istanbul → Beijing long-haul leg. No scans during flight.",
  "Arrived at Beijing Hub": "Arrived at the Beijing consolidation hub for the final India-bound flight.",
  "In Transit to New Delhi": "On the final international leg into Indira Gandhi International (DEL).",
  "Arrived at New Delhi": "Landed in New Delhi. Customs clearance and inbound scanning is in progress.",
  "Received at Local Warehouse": "Cleared customs and handed to our India last-mile partner.",
  "Moving to Regional Hub": "Moving overland to the regional sorting hub nearest your delivery address.",
  "Arrived at Regional Hub": "Sorted and routed for the final dispatch leg to your city.",
  "Arrived at Local Delivery Hub": "At the local delivery centre. Out for delivery typically within 24 hours.",
  "Out for Delivery": "A courier is on the way to your address today between 9 AM and 6 PM.",
  "Delivered": "Package delivered and verified with your 4-digit PIN. Enjoy.",
};

export const explainStatus = (status: string): string | undefined => {
  if (statusExplanations[status]) return statusExplanations[status];
  if (status.startsWith("Dispatched to")) return "Loaded onto the final outbound truck heading to your city.";
  if (status.includes("Cancelled")) return "This order was cancelled. Refund will appear on your statement within 5–7 business days.";
  if (status.startsWith("Return:")) return "Your return is in transit back to our Prague warehouse.";
  return undefined;
};