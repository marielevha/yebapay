export function sanitizePhoneNumber(value: string) {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^0-9]/g, '').slice(0, 15);

  if (!digits) {
    return hasLeadingPlus ? '+' : '';
  }

  return hasLeadingPlus ? `+${digits}` : digits;
}

export function sanitizePin(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 6);
}

export function sanitizeOtpCode(value: string, length = 6) {
  return value.replace(/[^0-9]/g, '').slice(0, length);
}
