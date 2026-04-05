export function sanitizeTransferWalletNumber(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 50);
}

export function sanitizeTransferAmountInput(value: string) {
  const compact = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  const [integerPart = '', ...decimalParts] = compact.split('.');
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
  const mergedDecimal = decimalParts.join('').slice(0, 2);

  if (compact.includes('.')) {
    return `${normalizedInteger || '0'}.${mergedDecimal}`;
  }

  return normalizedInteger;
}

export function parseTransferAmount(value: string) {
  const normalized = value.replace(/,/g, '.').trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function sanitizeTransferDescription(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, 255);
}

export function sanitizeTransferPin(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 6);
}

export function createTransferIdempotencyKey() {
  return `p2p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
