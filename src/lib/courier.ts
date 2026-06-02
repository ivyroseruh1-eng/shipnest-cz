// Deterministic courier metadata derived from trackingId so every order
// looks like a real, traceable shipment with carrier name + AWB + weight.

const couriers = [
  { name: "DHL Express", code: "DHL", awbPrefix: "JJD", facility: "Prague — Václav Havel Airport (PRG) Gateway" },
  { name: "FedEx International Priority", code: "FX", awbPrefix: "7791", facility: "Prague — Stará Boleslav Hub" },
  { name: "UPS Worldwide Express", code: "UPS", awbPrefix: "1Z6X4F", facility: "Prague — Rudná Distribution Center" },
  { name: "Aramex Global", code: "ARX", awbPrefix: "4391", facility: "Prague — Horoměřice Sort Facility" },
];

const indiaHandover = [
  { name: "Blue Dart Express", facility: "New Delhi — IGI Cargo Terminal 2" },
  { name: "DTDC Cargo Lite", facility: "Mumbai — Sahar Cargo Complex" },
  { name: "Delhivery Surface Express", facility: "Gurugram — Tauru Road Mega Gateway" },
  { name: "India Post Speed Post", facility: "New Delhi — Foreign Post Office, Kotla Road" },
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export interface ShipmentMeta {
  courier: string;
  awb: string;
  weightKg: string;
  dimensions: string;
  serviceLevel: string;
  originFacility: string;
  indiaCourier: string;
  indiaFacility: string;
  insured: string;
  declaredValue: string;
}

export const getShipmentMeta = (trackingId: string, total: number): ShipmentMeta => {
  const h = hash(trackingId);
  const c = couriers[h % couriers.length];
  const ic = indiaHandover[(h >> 3) % indiaHandover.length];
  const weight = (0.48 + ((h % 73) / 100)).toFixed(2);
  const dims = [
    18 + (h % 6),
    12 + ((h >> 2) % 4),
    4 + ((h >> 4) % 3),
  ];
  const awbDigits = String(100000000 + (h % 899999999));
  return {
    courier: c.name,
    awb: `${c.awbPrefix} ${awbDigits.slice(0, 4)} ${awbDigits.slice(4, 8)}`,
    weightKg: `${weight} kg`,
    dimensions: `${dims[0]} × ${dims[1]} × ${dims[2]} cm`,
    serviceLevel: "International Priority · Signature Required",
    originFacility: c.facility,
    indiaCourier: ic.name,
    indiaFacility: ic.facility,
    insured: `Up to $${Math.max(500, Math.round(total * 1.1))} (ShipNest Protect)`,
    declaredValue: `$${total.toFixed(2)} USD`,
  };
};