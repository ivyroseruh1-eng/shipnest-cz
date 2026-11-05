import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import TrackPage from "@/pages/TrackPage";
import MacroMilestoneStepper from "@/components/MacroMilestoneStepper";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const REQUIRED_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE 1st gen (320px)" },
  { width: 375, height: 667, name: "iPhone SE / 8 (375px)" },
  { width: 390, height: 844, name: "iPhone 14 / 15 / 16 (390px)" },
  { width: 768, height: 1024, name: "iPad Mini / Tablet (768px)" },
  { width: 1024, height: 768, name: "Desktop Small (1024px)" },
];

function renderWithRoute(initialUrl: string, ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[initialUrl]}>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <OrderProvider>
                  <Routes>
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/track" element={<TrackPage />} />
                    <Route path="/track/:id" element={<TrackPage />} />
                  </Routes>
                </OrderProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("Redesigned Order Confirmation & Tracking Visual Systems", () => {
  beforeEach(() => {
    window.scrollTo = () => {};
  });

  describe("Macro Milestone Stepper", () => {
    it("renders 4 macro stages in confirmation mode", () => {
      const { container } = render(
        <MacroMilestoneStepper isConfirmationPage={true} />
      );
      expect(container.textContent).toContain("Order Confirmed");
      expect(container.textContent).toContain("Processing & Packed");
      expect(container.textContent).toContain("In Flight Transit");
      expect(container.textContent).toContain("Delivered");
    });

    it("displays cancellation alert when status is Cancelled", () => {
      const { container } = render(
        <MacroMilestoneStepper status="Cancelled" />
      );
      expect(container.textContent).toContain("Order Consignment Cancelled");
    });
  });

  describe("Order Confirmation Page", () => {
    it("renders order confirmation with customer name, tracking reference, and PIN", async () => {
      const { container } = renderWithRoute(
        "/order-confirmation/SN1037910513",
        <OrderConfirmationPage />
      );

      // Verify customer greeting
      expect(container.textContent).toContain("Thank you, Kenji");

      // Verify Tracking ID
      expect(container.textContent).toContain("SNX1037910");

      // Verify Estimated Delivery Window
      expect(container.textContent).toContain("Estimated Delivery Window");

      // Verify Doorstep Verification PIN
      expect(container.textContent).toContain("7134");
      expect(container.textContent).toContain("Doorstep Verification PIN");

      // Verify Itemized Invoice
      expect(container.textContent).toContain("Itemized Invoice");
      expect(container.textContent).toContain("Samsung Galaxy S25 Ultra");

      // Verify Actions
      expect(container.textContent).toContain("Live Consignment Tracking");
      expect(container.textContent).toContain("Print Official Invoice");
    });

    it("handles non-existent order gracefully with clean fallback", () => {
      const { container } = renderWithRoute(
        "/order-confirmation/SN9999999999",
        <OrderConfirmationPage />
      );
      expect(container.textContent).toContain("Order Not Found");
      expect(container.textContent).toContain("Return to Store");
    });
  });

  describe("Shipment Tracking Page", () => {
    it("renders active consignment with AWB, ETA, Checkpoints, and Doorstep PIN", () => {
      const { container } = renderWithRoute(
        "/track/SNX1037910",
        <TrackPage />
      );

      // Verify tracking reference
      expect(container.textContent).toContain("SNX1037910");

      // Verify Air Carrier and AWB
      expect(container.textContent).toContain("ShipNest Express");
      expect(container.textContent).toContain("Air Waybill");

      // Verify Milestone Stepper
      expect(container.textContent).toContain("Order Confirmed");
      expect(container.textContent).toContain("Delivered");

      // Verify Latest Milestone banner
      expect(container.textContent).toContain("Latest Milestone");

      // Verify Checkpoint History
      expect(container.textContent).toContain("Checkpoint Log & Scans");
      expect(container.textContent).toContain("Prague");

      // Verify Doorstep PIN
      expect(container.textContent).toContain("7134");
      expect(container.textContent).toContain("Doorstep Verification PIN");

      // Verify Item Breakdown
      expect(container.textContent).toContain("Samsung Galaxy S25 Ultra");
    });

    it("renders search portal when visiting /track without parameters", () => {
      const { container } = renderWithRoute(
        "/track",
        <TrackPage />
      );

      expect(container.textContent).toContain("Track your consignment");
      expect(container.textContent).toContain("Track Consignment");
      expect(container.textContent).toContain("Central PRG Cargo Gateway");
      expect(container.textContent).toContain("PIN-Protected Handover");
    });
  });

  describe("Responsive Geometry & Viewport Adaptability", () => {
    REQUIRED_VIEWPORTS.forEach(({ width, height, name }) => {
      it(`renders OrderConfirmationPage without overflow at ${name}`, () => {
        Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
        Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

        const { container } = renderWithRoute(
          "/order-confirmation/SN1037910513",
          <OrderConfirmationPage />
        );
        expect(container).toBeDefined();
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
      });

      it(`renders TrackPage active shipment without overflow at ${name}`, () => {
        Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
        Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

        const { container } = renderWithRoute(
          "/track/SNX1037910",
          <TrackPage />
        );
        expect(container).toBeDefined();
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
      });

      it(`renders TrackPage search portal without overflow at ${name}`, () => {
        Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
        Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
        Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

        const { container } = renderWithRoute(
          "/track",
          <TrackPage />
        );
        expect(container).toBeDefined();
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
      });
    });
  });
});
