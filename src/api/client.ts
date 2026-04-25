import {fetch as nitroFetch} from 'react-native-nitro-fetch';

const defaultTimeoutMs = 12000;

async function fetchWithTimeout(url: string, timeoutMs = defaultTimeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await nitroFetch(url, {signal: controller.signal});

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet<T>(url: string, timeoutMs?: number): Promise<T> {
  const response = await fetchWithTimeout(url, timeoutMs);
  return response.json() as Promise<T>;
}

export async function apiText(url: string, timeoutMs?: number): Promise<string> {
  const response = await fetchWithTimeout(url, timeoutMs);
  return response.text();
}

export function buildUrl(
  baseUrl: string,
  params: Record<string, number | string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return `${baseUrl}?${searchParams.toString()}`;
}
