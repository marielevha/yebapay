import { getDeviceItem, setDeviceItem } from '@/lib/storage/device-storage';

const ONBOARDING_STORAGE_KEY = 'yebapay.onboarding.seen.v1';

export async function readHasSeenOnboarding() {
  const value = await getDeviceItem(ONBOARDING_STORAGE_KEY);
  return value === '1';
}

export async function persistHasSeenOnboarding() {
  await setDeviceItem(ONBOARDING_STORAGE_KEY, '1');
}
