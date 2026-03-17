import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem("shopnow_token");
    if (token) {
      init = init || {};
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return originalFetch(input, init);
  };
}
