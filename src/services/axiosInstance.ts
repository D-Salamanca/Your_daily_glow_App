type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

export interface AxiosRequestConfig {
  url?: string;
  method?: Method;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: unknown;
  timeout?: number;
}

export interface AxiosError<T = unknown> extends Error {
  response?: AxiosResponse<T>;
  request?: AxiosRequestConfig;
  isAxiosError: boolean;
}

type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
type ResponseInterceptor<T = unknown> = (response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
type ErrorInterceptor = (error: AxiosError) => unknown;

interface Interceptors {
  request: { use: (onFulfilled: RequestInterceptor, onRejected?: ErrorInterceptor) => void };
  response: { use: (onFulfilled: ResponseInterceptor, onRejected?: ErrorInterceptor) => void };
}

class AxiosInstance {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private requestInterceptors: { onFulfilled: RequestInterceptor; onRejected?: ErrorInterceptor }[] = [];
  private responseInterceptors: { onFulfilled: ResponseInterceptor; onRejected?: ErrorInterceptor }[] = [];

  interceptors: Interceptors = {
    request: {
      use: (onFulfilled, onRejected) => {
        this.requestInterceptors.push({ onFulfilled, onRejected });
      },
    },
    response: {
      use: (onFulfilled, onRejected) => {
        this.responseInterceptors.push({ onFulfilled, onRejected });
      },
    },
  };

  constructor(config: AxiosRequestConfig = {}) {
    this.baseURL = config.baseURL ?? "";
    this.defaultHeaders = { "Content-Type": "application/json", ...config.headers };
    this.timeout = config.timeout ?? 10000;
  }

  private buildURL(url: string, params?: Record<string, string | number>): string {
    const fullURL = `${this.baseURL}${url}`;
    if (!params || Object.keys(params).length === 0) return fullURL;
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return `${fullURL}?${query}`;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    let resolvedConfig = { ...config, headers: { ...this.defaultHeaders, ...config.headers } };

    for (const interceptor of this.requestInterceptors) {
      resolvedConfig = await interceptor.onFulfilled(resolvedConfig) as AxiosRequestConfig;
    }

    const url = this.buildURL(resolvedConfig.url ?? "", resolvedConfig.params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchResponse = await fetch(url, {
        method: resolvedConfig.method ?? "GET",
        headers: resolvedConfig.headers,
        body: resolvedConfig.data != null ? JSON.stringify(resolvedConfig.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => { responseHeaders[key] = value; });

      const text = await fetchResponse.text();
      const data = text ? (JSON.parse(text) as T) : ({} as T);

      let axiosResponse: AxiosResponse<T> = {
        data,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        config: resolvedConfig,
      };

      if (!fetchResponse.ok) {
        const err = Object.assign(new Error(`Request failed with status ${fetchResponse.status}`), {
          response: axiosResponse,
          request: resolvedConfig,
          isAxiosError: true,
        }) as AxiosError<T>;
        throw err;
      }

      for (const interceptor of this.responseInterceptors) {
        axiosResponse = (await interceptor.onFulfilled(axiosResponse)) as AxiosResponse<T>;
      }

      return axiosResponse;
    } catch (error) {
      clearTimeout(timer);
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onRejected) {
          await interceptor.onRejected(error as AxiosError);
        }
      }
      throw error;
    }
  }

  get<T>(url: string, config?: Omit<AxiosRequestConfig, "url" | "method">): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  post<T>(url: string, data?: unknown, config?: Omit<AxiosRequestConfig, "url" | "method" | "data">): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: "POST", data });
  }

  put<T>(url: string, data?: unknown, config?: Omit<AxiosRequestConfig, "url" | "method" | "data">): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: "PUT", data });
  }

  patch<T>(url: string, data?: unknown, config?: Omit<AxiosRequestConfig, "url" | "method" | "data">): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: "PATCH", data });
  }

  delete<T>(url: string, config?: Omit<AxiosRequestConfig, "url" | "method">): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

export function createAxiosInstance(config?: AxiosRequestConfig): AxiosInstance {
  return new AxiosInstance(config);
}

const axiosInstance = createAxiosInstance({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  console.log(`[HTTP] ${config.method} ${config.baseURL ?? ""}${config.url}`);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[HTTP] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("[HTTP Error]", (error as Error).message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
