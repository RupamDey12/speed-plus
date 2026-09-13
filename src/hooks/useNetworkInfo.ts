import { useState, useCallback, useEffect } from 'react';
import { ClientNetworkInfo } from '../types';
import { detectClientNetworkInfo, INITIAL_NETWORK_INFO } from '../services/networkDetection';

export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<ClientNetworkInfo>(INITIAL_NETWORK_INFO);

  const refreshNetworkInfo = useCallback(async () => {
    const detected = await detectClientNetworkInfo();
    setNetworkInfo((prev) => ({
      ...prev,
      ...detected,
    }));
  }, []);

  const addTransferredBytes = useCallback((downloadDelta: number, uploadDelta: number) => {
    setNetworkInfo((prev) => ({
      ...prev,
      rawBytesDownloaded: prev.rawBytesDownloaded + downloadDelta,
      rawBytesUploaded: prev.rawBytesUploaded + uploadDelta,
    }));
  }, []);

  useEffect(() => {
    refreshNetworkInfo();
  }, [refreshNetworkInfo]);

  return {
    networkInfo,
    refreshNetworkInfo,
    addTransferredBytes,
  };
}
