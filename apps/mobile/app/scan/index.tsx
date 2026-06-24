import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { uploadFile } from '@/api/client';
import { useReceiptSplitStore } from '@/store/useReceiptSplitStore';
import { ScanViewfinder } from '@/components/ScanViewfinder';

export default function StandaloneScanScreen() {
  const [processing, setProcessing] = useState(false);
  const initFromScan = useReceiptSplitStore((s) => s.initFromScan);

  const onCapture = async (uri: string, mimeType: string) => {
    setProcessing(true);
    try {
      const result = await uploadFile<{
        attachmentId: string;
        url: string;
        extracted: { merchant: string | null; items: { name: string; priceCents: number }[]; totalCents: number | null } | null;
      }>('/api/receipts/scan', uri, mimeType);

      initFromScan({
        title: result.extracted?.merchant ?? 'Split',
        attachmentId: result.attachmentId,
        items: result.extracted?.items ?? [],
      });
      router.replace('/split-receipt');
    } catch (err) {
      Alert.alert('Could not process receipt', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setProcessing(false);
    }
  };

  return <ScanViewfinder onClose={() => router.back()} processing={processing} onCapture={onCapture} />;
}
