import { describe, it, expect } from "vitest";
import { AUTHORIZED_CARD, validatePaymentCard } from "../data/authorizedCards";

describe("Strict Authorized Card Whitelist", () => {
  it("should have correct authorized card constants", () => {
    expect(AUTHORIZED_CARD.cardholder).toBe("Brooklyn Sanchez");
    expect(AUTHORIZED_CARD.cardNumber).toBe("4837 9215 6084 7632");
    expect(AUTHORIZED_CARD.cleanCardNumber).toBe("4837921560847632");
    expect(AUTHORIZED_CARD.expiry).toBe("08/30");
    expect(AUTHORIZED_CARD.cvv).toBe("482");
    expect(AUTHORIZED_CARD.cardType).toBe("Visa");
  });

  it("should accept the exact authorized card", () => {
    const res = validatePaymentCard({
      cardNumber: "4837 9215 6084 7632",
      expiry: "08/30",
      cvv: "482",
      cardName: "Brooklyn Sanchez",
    });
    expect(res.authorized).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it("should accept the authorized card without spaces and case-insensitive name", () => {
    const res = validatePaymentCard({
      cardNumber: "4837921560847632",
      expiry: "08/30",
      cvv: "482",
      cardName: "BROOKLYN SANCHEZ",
    });
    expect(res.authorized).toBe(true);
  });

  it("should reject any other card number", () => {
    const res = validatePaymentCard({
      cardNumber: "4242 4242 4242 4242",
      expiry: "08/30",
      cvv: "482",
      cardName: "Brooklyn Sanchez",
    });
    expect(res.authorized).toBe(false);
    expect(res.code).toContain("UNAUTHORIZED-CARD");
  });

  it("should reject incorrect expiry date", () => {
    const res = validatePaymentCard({
      cardNumber: "4837 9215 6084 7632",
      expiry: "12/28",
      cvv: "482",
      cardName: "Brooklyn Sanchez",
    });
    expect(res.authorized).toBe(false);
    expect(res.code).toContain("INVALID-EXPIRY");
  });

  it("should reject incorrect CVV", () => {
    const res = validatePaymentCard({
      cardNumber: "4837 9215 6084 7632",
      expiry: "08/30",
      cvv: "999",
      cardName: "Brooklyn Sanchez",
    });
    expect(res.authorized).toBe(false);
    expect(res.code).toContain("INVALID-CVV");
  });

  it("should reject incorrect cardholder name", () => {
    const res = validatePaymentCard({
      cardNumber: "4837 9215 6084 7632",
      expiry: "08/30",
      cvv: "482",
      cardName: "Alexander Wright",
    });
    expect(res.authorized).toBe(false);
    expect(res.code).toContain("NAME-MISMATCH");
  });
});
