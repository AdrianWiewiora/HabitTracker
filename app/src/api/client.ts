const BASE_URL = "http://localhost:5000/api";

interface RequestConfig extends RequestInit {
    body?: any;
}

export const client = async <T>(endpoint: string, { body, ...customConfig }: RequestConfig = {}): Promise<T> => {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await window.fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
        return data as T;
    } else {
        return Promise.reject(data);
    }
};