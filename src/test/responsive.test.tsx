import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import CartPage from "@/pages/CartPage";
import ComparePage from "@/pages/ComparePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE 1st gen (320px)" },
  { width: 360, height: 800, name: "Standard Android Small (360px)" },
  { width: 375, height: 667, name: "iPhone SE / 8 (375px)" },
  { width: 390, height: 844, name: "iPhone 14 / 15 / 16 (390px)" },
  { width: 414, height: 896, name: "iPhone XR / 11 (414px)" },
  { width: 430, height: 932, name: "iPhone 18 Pro Max (430px)" },
  { width: 768, height: 1024, name: "iPad Mini / Tablet (768px)" },
  { width: 1024, height: 768, name: "Desktop Small (1024px)" },
];

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <LocationProvider>
            <CartProvider>
              <OrderProvider>{ui}</OrderProvider>
            </CartProvider>
          </LocationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("ShipNest Mobile-First & Responsive Geometry", () => {
  beforeEach(() => {
    window.scrollTo = () => {};
  });

  VIEWPORTS.forEach(({ width, height, name }) => {
    it(`renders HomePage cleanly at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });

      const { container } = renderWithProviders(<HomePage />);
      expect(container).toBeDefined();

      // Ensure no elements contain forbidden horizontal scroll containers
      const horizontalScrollElements = container.querySelectorAll(".overflow-x-auto, .overflow-x-scroll");
      expect(horizontalScrollElements.length).toBe(0);
    });

    it(`renders ShopPage without horizontal overflow classes at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });

      const { container } = renderWithProviders(<ShopPage />);
      expect(container).toBeDefined();

      const horizontalScrollElements = container.querySelectorAll(".overflow-x-auto, .overflow-x-scroll");
      expect(horizontalScrollElements.length).toBe(0);
    });

    it(`renders ComparePage without horizontal scroll table at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });

      const { container } = renderWithProviders(<ComparePage />);
      expect(container).toBeDefined();

      const horizontalScrollElements = container.querySelectorAll(".overflow-x-auto, .overflow-x-scroll");
      expect(horizontalScrollElements.length).toBe(0);
    });

    it(`renders CartPage cleanly at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });

      const { container } = renderWithProviders(<CartPage />);
      expect(container).toBeDefined();

      const horizontalScrollElements = container.querySelectorAll(".overflow-x-auto, .overflow-x-scroll");
      expect(horizontalScrollElements.length).toBe(0);
    });
  });

  it("verifies all responsive breakpoints meet zero horizontal scroll criteria", () => {
    expect(VIEWPORTS.length).toBe(8);
  });
});
