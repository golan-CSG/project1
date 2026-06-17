// Build a wa.me link from an Israeli phone number.
// wa.me needs the full international number (country code, no leading 0).
export function waLink(phone?: string | null): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) {
    // already international
  } else if (digits.startsWith("0")) {
    digits = "972" + digits.slice(1);
  } else {
    // assume Israeli number missing the leading 0
    digits = "972" + digits;
  }
  return `https://wa.me/${digits}`;
}
