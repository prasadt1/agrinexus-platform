/**
 * Parse pasted/CSV text from the "Add farmers" box into enrollable farmers.
 *
 * One farmer per line. Each line may be:
 *   "+91 98765 43210"          -> { phone }
 *   "+919876543210, Ramesh"    -> { phone, name }
 *   "Ramesh Patil, +919876..." -> { phone, name }   (order-agnostic)
 *
 * The comma-separated part with the most digits (>= 10) is treated as the phone;
 * the remaining part(s) become the name. Lines without a >=10-digit part are
 * skipped. The phone is normalized to digits (leading "+" stripped) to match the
 * engine's storage format.
 */
export type ParsedFarmer = { phone: string; name?: string };

function digitCount(s: string): number {
  return (s.match(/\d/g) || []).length;
}

function normalizePhone(s: string): string {
  return s.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export function parseFarmerLines(text: string): ParsedFarmer[] {
  const out: ParsedFarmer[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    // The part with the most digits is the phone candidate.
    const phonePart = [...parts].sort((a, b) => digitCount(b) - digitCount(a))[0];
    if (digitCount(phonePart) < 10) continue; // no usable phone on this line

    const name = parts.filter((p) => p !== phonePart).join(', ').trim();
    const phone = normalizePhone(phonePart);

    out.push(name ? { phone, name } : { phone });
  }

  return out;
}
