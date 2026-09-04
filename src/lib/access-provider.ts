/**
 * Access control abstraction.
 *
 * No physical access vendor is connected yet. Everything in the product talks
 * to this interface, so a real provider (Salto, Nuki, Kisi, …) can be dropped
 * in later without touching booking, account or admin code.
 */

export type AccessMethod = "qr" | "pin" | "nfc" | "apple_wallet" | "google_wallet" | "mobile_web";

export interface AccessCredential {
  id: string;
  bookingId: string;
  method: AccessMethod;
  value: string | null;
  validFrom: Date;
  validUntil: Date;
  status: "issued" | "active" | "revoked" | "expired";
}

export interface CreateCredentialInput {
  bookingId: string;
  userId: string;
  spaceId: string;
  startsAt: Date;
  endsAt: Date;
  method?: AccessMethod;
}

export interface AccessProvider {
  readonly id: string;
  createCredential(input: CreateCredentialInput): Promise<AccessCredential>;
  revokeCredential(credentialId: string): Promise<void>;
  getCredential(credentialId: string): Promise<AccessCredential | null>;
  unlock(credentialId: string): Promise<{ ok: boolean; message: string }>;
  checkAccessStatus(credentialId: string): Promise<AccessCredential["status"]>;
}

/** Access opens 15 minutes before and closes 15 minutes after a booking. */
export const ACCESS_LEAD_MINUTES = 15;

export function accessWindow(startsAt: Date, endsAt: Date) {
  return {
    validFrom: new Date(startsAt.getTime() - ACCESS_LEAD_MINUTES * 60_000),
    validUntil: new Date(endsAt.getTime() + ACCESS_LEAD_MINUTES * 60_000),
  };
}

/** Placeholder provider used until a real system is connected. */
export const demoAccessProvider: AccessProvider = {
  id: "demo",
  async createCredential(input) {
    const { validFrom, validUntil } = accessWindow(input.startsAt, input.endsAt);
    return {
      id: crypto.randomUUID(),
      bookingId: input.bookingId,
      method: input.method ?? "pin",
      value: null,
      validFrom,
      validUntil,
      status: "issued",
    };
  },
  async revokeCredential() {},
  async getCredential() {
    return null;
  },
  async unlock() {
    return { ok: false, message: "Digital access is not connected yet." };
  },
  async checkAccessStatus() {
    return "issued";
  },
};
