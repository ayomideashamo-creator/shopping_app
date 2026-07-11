// Storage utilities with scoped access by owner

function parseStored(raw: string | null, fallback: any = null): any {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function buildScopedStorageKey(key: string, ownerId: string | null): string {
  const normalizedOwnerId = ownerId ? String(ownerId).trim() : '';
  return normalizedOwnerId ? `${key}:${normalizedOwnerId}` : key;
}

interface StorageOptions {
  ownerId?: string;
  shopOwnerId?: string;
  scope?: string;
  sessionFallback?: boolean;
  alsoSession?: boolean;
}

function getStorageKey(key: string, options: StorageOptions = {}): string {
  return buildScopedStorageKey(key, options.ownerId || options.shopOwnerId || options.scope || null);
}

export function loadStored(key: string, fallback: any = null, options: StorageOptions = {}): any {
  const useSessionFallback = options.sessionFallback === true;
  const storageKey = getStorageKey(key, options);
  try {
    const raw = localStorage.getItem(storageKey);
    const value = parseStored(raw, null);
    if (value !== null) return value;
  } catch (e) {
    // ignore storage access errors
  }

  if (useSessionFallback) {
    try {
      const raw = sessionStorage.getItem(storageKey);
      const value = parseStored(raw, null);
      if (value !== null) return value;
    } catch (e) {
      // ignore session storage errors
    }
  }

  return fallback;
}

export function saveStored(key: string, value: any, options: StorageOptions = {}): boolean {
  const storageKey = getStorageKey(key, options);
  const payload = JSON.stringify(value);
  let ok = true;
  try {
    localStorage.setItem(storageKey, payload);
  } catch (e) {
    ok = false;
  }
  if (options.alsoSession === true) {
    try {
      sessionStorage.setItem(storageKey, payload);
    } catch (e) {
      ok = false;
    }
  }
  return ok;
}

export function removeStored(key: string, options: StorageOptions = {}): boolean {
  const storageKey = getStorageKey(key, options);
  let ok = true;
  try {
    localStorage.removeItem(storageKey);
  } catch (e) {
    ok = false;
  }
  if (options.alsoSession === true) {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (e) {
      ok = false;
    }
  }
  return ok;
}

export function clearStored(options: StorageOptions = {}): boolean {
  let ok = true;
  if (options.ownerId || options.shopOwnerId || options.scope) {
    const ownerId = options.ownerId || options.shopOwnerId || options.scope;
    const prefix = `${ownerId}:`;
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      ok = false;
    }
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes(prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      ok = false;
    }
    return ok;
  }

  try {
    localStorage.clear();
  } catch (e) {
    ok = false;
  }
  if (options.alsoSession === true) {
    try {
      sessionStorage.clear();
    } catch (e) {
      ok = false;
    }
  }
  return ok;
}

export function loadStoredForOwner(key: string, fallback: any = null, ownerId: string, options: StorageOptions = {}): any {
  const scopedValue = loadStored(key, null, { ...options, ownerId });
  if (scopedValue !== null) return scopedValue;
  const legacyValue = loadStored(key, null, options);
  return legacyValue === null ? fallback : legacyValue;
}

export function saveStoredForOwner(key: string, value: any, ownerId: string, options: StorageOptions = {}): boolean {
  return saveStored(key, value, { ...options, ownerId });
}

export function removeStoredForOwner(key: string, ownerId: string, options: StorageOptions = {}): boolean {
  return removeStored(key, { ...options, ownerId });
}

export function escapeHtml(value: any): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}
