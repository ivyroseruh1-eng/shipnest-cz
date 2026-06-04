import { MapPin, Plane, Package } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import PincodeInput from "@/components/location/PincodeInput";
import Reveal from "@/components/Reveal";

const DeliveryEstimator = () => {
  const { location } = useLocation();

  return (
    <section className="py-16 bg-secondary/40 border-y border-border">
      <div className="max-w-[980px] mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <Reveal>
          <div>
            <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2">Delivery</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              See where we ship.
            </h2>
            <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
              Enter your postal code and we'll confirm your city, region and country —
              then route your order via our express partners DHL, FedEx and local last-mile carriers.
            </p>

            <div className="mt-6 max-w-md">
              <PincodeInput size="md" />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Ships from Prague</span>
              <span className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> Express worldwide</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 60+ countries</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="bg-background rounded-3xl border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-4">
              <span>Delivery preview</span>
              <span className="text-success font-medium">● Live</span>
            </div>

            {!location ? (
              <div className="text-center py-8">
                <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto" strokeWidth={1.4} />
                <p className="text-[14px] text-muted-foreground mt-3">
                  Enter a postal code to see your delivery preview.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">From</p>
                    <p className="text-[15px] font-semibold text-foreground mt-1">Prague, CZ</p>
                    <p className="text-[11px] text-muted-foreground">ShipNest Hub 01</p>
                  </div>
                  <div className="flex-1 mx-4 relative h-px bg-border">
                    <Plane className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 text-primary rotate-45" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">To</p>
                    <p className="text-[15px] font-semibold text-foreground mt-1">{location.city}</p>
                    <p className="text-[11px] text-muted-foreground">{location.country}</p>
                  </div>
                </div>

                <div className="bg-secondary/60 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-foreground font-medium">ShipNest Express</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Region</span>
                    <span className="text-foreground font-medium">{location.state}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Postal code</span>
                    <span className="text-foreground font-mono">{location.pincode}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="text-foreground font-medium">Up to $5,000</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  Final delivery date confirmed at checkout.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default DeliveryEstimator;