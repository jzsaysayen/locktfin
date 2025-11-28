// lib/idGenerator.ts

/**
 * Generate a unique track ID for orders
 * Format: LL-TIMESTAMP-RANDOM (e.g., LL-MFEG2HV-H31L)
 * Uses base36 timestamp + random string for uniqueness
 */
export function generateTrackId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `TRK-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique reservation ID
 * Format: RES-TIMESTAMP-RANDOM (e.g., RES-MFEG2HV-H31L)
 */
export function generateReservationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `RES-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generic ID generator with custom prefix
 * @param prefix - The prefix for the ID (e.g., 'LL', 'RES', 'ORD')
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

// Example outputs:
// generateTrackId()        → 'LL-MFEG2HV-H31L'
// generateReservationId()  → 'RES-MFEG2HV-K9P2'
// generateId('ORD')        → 'ORD-MFEG2HV-X7Y1'