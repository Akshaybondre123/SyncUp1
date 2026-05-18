const DEFAULT_API = "http://localhost:4000";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API;

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || API_URL;
