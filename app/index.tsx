import { Redirect } from 'expo-router';
import { storage, StorageKeys } from '@/lib/storage';

export default function IndexRedirect() {
  const homeCurrency = storage.getString(StorageKeys.HOME_CURRENCY);

  if (!homeCurrency) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/travel" />;
}
