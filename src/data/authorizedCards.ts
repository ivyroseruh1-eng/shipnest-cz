export interface AuthorizedCard {
  cardholder: string;
  cardNumber: string;
  cleanCardNumber: string;
  expiry: string;
  cvv: string;
  cardType: string;
  brand: "visa";
  network: string;
  issuer: string;
  currency: string;
  tier: string;
  status: "Active & Whitelisted";
  description: string;
}

export const AUTHORIZED_CARD: AuthorizedCard = {
  cardholder: "Brooklyn Sanchez",
  cardNumber: "4837 9215 6084 7632",
  cleanCardNumber: "4837921560847632",
  expiry: "08/30",
  cvv: "482",
  cardType: "Visa",
  brand: "visa",
  network: "VisaNet Europe",
  issuer: "BNP Paribas Wealth Management",
  currency: "USD / EUR / CZK",
  tier: "Visa Infinite / Priority Clearing",
  status: "Active & Whitelisted",
  description:
    "Sole authorized payment card for ShipNest Luxury Checkout. All other payment methods and cards are rejected by gateway security policy.",
};

export interface CardValidationResult {
  authorized: boolean;
  code?: string;
  reason?: string;
}

/**
 * Validates a payment attempt strictly against the authorized whitelist card.
 * Only card number 4837 9215 6084 7632, expiry 08/30, CVV 482, and
 * cardholder Brooklyn Sanchez are accepted. Everything else is rejected.
 * Error messages use authentic, professional banking decline descriptions (no fake-sounding text).
 */
export const validatePaymentCard = (input: {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName?: string;
}): CardValidationResult => {
  const cleanNumber = input.cardNumber.replace(/\D/g, "");
  const targetClean = AUTHORIZED_CARD.cleanCardNumber;

  if (cleanNumber !== targetClean) {
    return {
      authorized: false,
      code: "GW-DECLINE-05-UNAUTHORIZED-CARD",
      reason: `Payment Declined (Error Code: 05 - Do Not Honor). Your financial institution declined the transaction for card ending in ••••${
        cleanNumber.slice(-4) || "0000"
      }. Please check your card number or contact your card issuer.`,
    };
  }

  // Validate expiry
  const cleanExpiry = input.expiry.trim();
  if (cleanExpiry !== AUTHORIZED_CARD.expiry) {
    return {
      authorized: false,
      code: "GW-DECLINE-54-INVALID-EXPIRY",
      reason: "Payment Declined (Error Code: 54 - Invalid Expiration Date). The expiration date entered does not match your card issuer's records. Please verify the expiry date on your card.",
    };
  }

  // Validate CVV
  const cleanCvv = input.cvv.trim();
  if (cleanCvv !== AUTHORIZED_CARD.cvv) {
    return {
      authorized: false,
      code: "GW-DECLINE-82-INVALID-CVV",
      reason: "Payment Declined (Error Code: 82 - Security Code Mismatch). Card security code (CVV) verification failed. Please check the 3-digit code on the back of your card.",
    };
  }

  // Validate Cardholder Name
  if (input.cardName && input.cardName.trim()) {
    const normalizedInputName = input.cardName.trim().toLowerCase().replace(/\s+/g, " ");
    const normalizedTargetName = AUTHORIZED_CARD.cardholder.toLowerCase();
    if (normalizedInputName !== normalizedTargetName) {
      return {
        authorized: false,
        code: "GW-DECLINE-NAME-MISMATCH",
        reason: "Payment Declined (Error Code: 57 - Cardholder Verification Failure). The cardholder name entered could not be authenticated by the issuing bank.",
      };
    }
  }

  return {
    authorized: true,
  };
};
