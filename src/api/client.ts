import {fetch as nitroFetch} from 'react-native-nitro-fetch';

export async function apiGet<T>(url: string): Promise<T> {
  const response = await nitroFetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function buildUrl(baseUrl: string, params: Record<string, string>) {
  return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}
