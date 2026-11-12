import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or browser local storage
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('bankitis_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('bankitis_supabase_key') || '' : '';

  const url = (localUrl || envUrl).trim();
  const key = (localKey || envKey).trim();

  return { url, key, isConfigured: Boolean(url && key) };
}

let supabaseInstance = null;
let lastUsedConfig = '';

export function getSupabaseClient() {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) {
    return null;
  }

  const configSignature = `${url}:${key}`;
  if (supabaseInstance && lastUsedConfig === configSignature) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
    lastUsedConfig = configSignature;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseCredentials(url, key) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('bankitis_supabase_url', url.trim());
      localStorage.setItem('bankitis_supabase_key', key.trim());
    } else {
      localStorage.removeItem('bankitis_supabase_url');
      localStorage.removeItem('bankitis_supabase_key');
    }
    supabaseInstance = null;
    lastUsedConfig = '';
  }
}
