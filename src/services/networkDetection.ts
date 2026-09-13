import { ClientNetworkInfo } from '../types';

export const INITIAL_NETWORK_INFO: ClientNetworkInfo = {
  ip: 'Probing network...',
  isp: 'Detecting ISP...',
  city: 'Detecting...',
  country: 'Global',
  countryCode: 'GL',
  region: '',
  asn: 'AS-Pending',
  colo: 'Edge PoP',
  isIpv6: false,
  rawBytesDownloaded: 0,
  rawBytesUploaded: 0,
};

/**
 * Performs multi-stage real network detection:
 * 1. Cloudflare Edge direct headers (PoP colo, public IP, ASN)
 * 2. IPWHO.IS public geo & ASN lookup
 * 3. SpeedPulse backend gateway (/api/client-info)
 */
export async function detectClientNetworkInfo(): Promise<Partial<ClientNetworkInfo>> {
  let detectedIp = '';
  let detectedIsp = '';
  let detectedCity = '';
  let detectedCountry = '';
  let detectedAsn = '';
  let detectedColo = '';

  // Probe 1: Browser direct Cloudflare Edge probe (extracts edge PoP and IP headers)
  try {
    const cfRes = await fetch('https://speed.cloudflare.com/__down?bytes=0', {
      cache: 'no-store',
    });
    if (cfRes.ok) {
      const cfColo = cfRes.headers.get('cf-meta-colo') || cfRes.headers.get('colo');
      const cfIp = cfRes.headers.get('cf-meta-ip');
      const cfCity = cfRes.headers.get('cf-meta-city');
      const cfCountry = cfRes.headers.get('cf-meta-country');
      const cfAsn = cfRes.headers.get('cf-meta-asn');

      if (cfColo) detectedColo = cfColo;
      if (cfIp) detectedIp = cfIp;
      if (cfCity) detectedCity = cfCity;
      if (cfCountry) detectedCountry = cfCountry;
      if (cfAsn) detectedAsn = `AS${cfAsn}`;
    }
  } catch {
    // Continue to next probe
  }

  // Probe 2: Browser direct IPWHO.IS lookup for ISP & AS name
  if (!detectedIsp || !detectedCity) {
    try {
      const whoisRes = await fetch('https://ipwho.is/?fields=ip,city,country,connection', {
        cache: 'no-store',
      });
      if (whoisRes.ok) {
        const whoData = await whoisRes.json();
        if (whoData.ip) detectedIp = detectedIp || whoData.ip;
        if (whoData.city) detectedCity = detectedCity || whoData.city;
        if (whoData.country) detectedCountry = detectedCountry || whoData.country;
        if (whoData.connection) {
          detectedIsp = whoData.connection.isp || whoData.connection.org || '';
          if (whoData.connection.asn) detectedAsn = detectedAsn || `AS${whoData.connection.asn}`;
        }
      }
    } catch {
      // Continue to server API fallback
    }
  }

  // Probe 3: SpeedPulse Express backend API
  if (!detectedIp || !detectedIsp) {
    try {
      const apiRes = await fetch('/api/client-info');
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.ip) detectedIp = detectedIp || apiData.ip;
        if (apiData.isp) detectedIsp = detectedIsp || apiData.isp;
        if (apiData.location) {
          detectedCity = detectedCity || apiData.location.split(',')[0]?.trim();
          detectedCountry = detectedCountry || apiData.location.split(',')[1]?.trim() || '';
        }
      }
    } catch {
      // Handled below
    }
  }

  const isIpv6 = detectedIp.includes(':');

  return {
    ip: detectedIp || 'Public Gateway Active',
    isp: detectedIsp || 'Broadband Network Provider',
    city: detectedCity || 'Detected Region',
    country: detectedCountry || 'Global',
    asn: detectedAsn || 'AS-Edge',
    colo: detectedColo || 'Edge PoP',
    isIpv6,
  };
}
