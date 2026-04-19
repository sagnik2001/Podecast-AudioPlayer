import {fetch as nitroFetch} from 'react-native-nitro-fetch';

export async function apiGet<T>(url: string): Promise<T> {
  const response = await nitroFetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiText(url: string): Promise<string> {
  const response = await nitroFetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

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
