import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider, DEMO_SEED_ORDERS } from "@/context/OrderContext";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderAdminPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <OrderProvider>
                  <AdminPage />
                </OrderProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function authenticateAdmin() {
  const input = screen.getByPlaceholderText("Enter admin passcode");
  fireEvent.change(input, { target: { value: "shipnest2024" } });
  fireEvent.click(screen.getByText("Authenticate Session"));
}

describe("Admin Panel Full Customer Info & India Arrival Email", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("displays full customer details including phone number, email, and complete address on Dashboard and Orders tabs", () => {
    const { container } = renderAdminPage();
    authenticateAdmin();

    const demoOrder = DEMO_SEED_ORDERS[0];

    // Dashboard tab shows full customer info
    expect(container.textContent).toContain(demoOrder.customer.name);
    expect(container.textContent).toContain(demoOrder.customer.phone);
    expect(container.textContent).toContain(demoOrder.customer.email);
    expect(container.textContent).toContain(demoOrder.customer.address);
    expect(container.textContent).toContain(demoOrder.customer.city);
    expect(container.textContent).toContain(demoOrder.customer.state);
    expect(container.textContent).toContain(demoOrder.customer.zip);
    expect(container.textContent).toContain(demoOrder.customer.country);

    // Switch to Orders tab
    fireEvent.click(screen.getByText(`Orders (${DEMO_SEED_ORDERS.length})`));
    expect(container.textContent).toContain(demoOrder.customer.phone);
    expect(container.textContent).toContain(demoOrder.customer.email);
    expect(container.textContent).toContain(demoOrder.customer.address);
    expect(container.textContent).toContain(demoOrder.customer.state);
    expect(container.textContent).toContain(demoOrder.customer.zip);

    // Search by phone number works
    const searchInput = screen.getByPlaceholderText(/Search by Order ID, Customer, Phone/i);
    fireEvent.change(searchInput, { target: { value: "98765" } });
    expect(container.textContent).toContain(demoOrder.orderId);
  });

  it("includes State/Province and Phone Number in Edit Dispatch Record modal", () => {
    const { container } = renderAdminPage();
    authenticateAdmin();

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(container.textContent).toContain("Customer & Destination Details");
    expect(container.textContent).toContain("Phone");
    expect(container.textContent).toContain("State / Province");

    const stateInput = screen.getByPlaceholderText("State / Province") as HTMLInputElement;
    expect(stateInput.value).toBe(DEMO_SEED_ORDERS[0].customer.state);
  });

  it("shows full customer details including phone number and 'Arrived in India' email template in Customer Emails tab", () => {
    const { container } = renderAdminPage();
    authenticateAdmin();

    fireEvent.click(screen.getByText("Customer Emails"));

    const demoOrder = DEMO_SEED_ORDERS[0];
    expect(container.textContent).toContain(demoOrder.customer.phone);
    expect(container.textContent).toContain(demoOrder.customer.email);
    expect(container.textContent).toContain(demoOrder.customer.address);

    const indiaPill = screen.getByRole("button", { name: /Arrived in India/i });
    fireEvent.click(indiaPill);

    expect(container.textContent).toContain(`Arrived in India: ShipNest #${demoOrder.orderId}`);
  });
});
