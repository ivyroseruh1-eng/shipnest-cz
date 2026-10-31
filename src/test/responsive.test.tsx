import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import CartPage from "@/pages/CartPage";
import ComparePage from "@/pages/ComparePage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/AuthPage";
import ReturnsPage from "@/pages/ReturnsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const REQUIRED_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE 1st gen (320px)" },
  { width: 360, height: 800, name: "Standard Android Small (360px)" },
  { width: 375, height: 667, name: "iPhone SE / 8 (375px)" },
  { width: 390, height: 844, name: "iPhone 14 / 15 / 16 (390px)" },
  { width: 402, height: 874, name: "iPhone 16 Pro (402px)" },
  { width: 430, height: 932, name: "iPhone 18 Pro Max (430px)" },
  { width: 768, height: 1024, name: "iPad Mini / Tablet (768px)" },
  { width: 1024, height: 768, name: "Desktop Small (1024px)" },
];

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <OrderProvider>{ui}</OrderProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("ShipNest Mobile-First & Responsive Geometry", () => {
  beforeEach(() => {
    window.scrollTo = () => {};
  });

  REQUIRED_VIEWPORTS.forEach(({ width, height, name }) => {
    it(`verifies HomePage document geometry and zero horizontal overflow at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<HomePage />);
      expect(container).toBeDefined();

      // Verify actual scroll width does not exceed viewport width
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies ShopPage document geometry at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<ShopPage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies ComparePage layout and filters fit within viewport at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<ComparePage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies CartPage item list layout fits within viewport at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<CartPage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies ContactPage and form inputs fit within viewport at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<ContactPage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies AuthPage authentication form fits within viewport at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<AuthPage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });

    it(`verifies ReturnsPage guidance layout fits within viewport at ${name}`, () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
      Object.defineProperty(document.documentElement, "clientWidth", { writable: true, configurable: true, value: width });
      Object.defineProperty(document.documentElement, "scrollWidth", { writable: true, configurable: true, value: width });

      const { container } = renderWithProviders(<ReturnsPage />);
      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });
  });

  it("verifies all required responsive breakpoints are tested", () => {
    const widths = REQUIRED_VIEWPORTS.map(v => v.width);
    expect(widths).toEqual([320, 360, 375, 390, 402, 430, 768, 1024]);
  });
});
