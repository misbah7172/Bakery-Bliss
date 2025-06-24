import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Legacy token getter - kept for compatibility but not used with session auth
let getToken: () => string | null = () => null;

export const setTokenGetter = (getter: () => string | null) => {
  getToken = getter;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async (url: string, method: string = "GET", data?: any) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include", // Include session cookies
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
      headers: Object.fromEntries(response.headers.entries())
    });
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Include session cookies
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
