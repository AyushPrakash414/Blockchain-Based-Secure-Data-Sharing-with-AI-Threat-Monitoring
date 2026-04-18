export function shortAddress(address, head = 6, tail = 4) {
  if (!address) return '--';
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getDateValue(value) {
  if (!value) return NaN;
  if (typeof value === 'number') return value;

  const direct = value instanceof Date ? value : new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct.getTime();

  if (typeof value === 'string' && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    const assumedUtc = new Date(`${value}Z`);
    if (!Number.isNaN(assumedUtc.getTime())) return assumedUtc.getTime();
  }

  return NaN;
}

export function formatDateTime(value) {
  const timestamp = getDateValue(value);
  if (Number.isNaN(timestamp)) return '--';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

export function formatChartTime(value) {
  const timestamp = getDateValue(value);
  if (Number.isNaN(timestamp)) return '--';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

export function parseIpfsCid(value) {
  if (!value) return '--';
  if (value.startsWith('ipfs://')) return value.replace('ipfs://', '');
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || value;
  } catch {
    return value.slice(-46);
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
