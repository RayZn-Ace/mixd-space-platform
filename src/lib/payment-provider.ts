/**
 * Payment abstraction.
 *
 * No payment provider is connected yet, so checkout runs through the mock
 * provider below and marks bookings as pending payment. Connecting Stripe
 * later means implementing this interface — no changes in the booking flow.
 */

export interface ChargeInput {
  bookingId: string;
  amountCents: number;
  currency: string;
  description: string;
}

export interface ChargeResult {
  provider: string;
  reference: string;
  status: "pending" | "paid" | "failed";
  message: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly live: boolean;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(reference: string, amountCents: number): Promise<{ ok: boolean }>;
}

export const mockPaymentProvider: PaymentProvider = {
  id: "mock",
  live: false,
  async charge(input) {
    return {
      provider: "mock",
      reference: `MOCK-${input.bookingId.slice(0, 8).toUpperCase()}`,
      status: "pending",
      message: "No payment provider connected. The booking is reserved and payable on site.",
    };
  },
  async refund() {
    return { ok: true };
  },
};

export const paymentProvider: PaymentProvider = mockPaymentProvider;
