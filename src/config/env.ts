type EnvKey = "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY";

function required(key: EnvKey): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  SUPABASE_URL: required("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: required("VITE_SUPABASE_ANON_KEY"),
  WEBSOCKET_URL: (import.meta.env.VITE_WEBSOCKET_URL as string | undefined)?.trim(),
  API_URL: (import.meta.env.VITE_API_URL as string | undefined)?.trim(),
  BUILD_SHIP_API_URL: (import.meta.env.VITE_BUILDSHIP_API_URL as string | undefined)?.trim(),
};

