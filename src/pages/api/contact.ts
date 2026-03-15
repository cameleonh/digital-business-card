import type { APIRoute } from "astro";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

type ContactRecord = {
  name: string;
  email: string;
  message: string;
  source: string;
  user_agent: string | null;
  referrer: string | null;
  submitted_at: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const isFilledString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getSupabaseConfig = () => {
  const url = import.meta.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = import.meta.env.SUPABASE_CONTACT_TABLE || "contact_messages";

  if (!url || !key) {
    return null;
  }

  return { url, key, table };
};

export const GET: APIRoute = async () => {
  const supabase = getSupabaseConfig();

  return json(200, {
    ok: true,
    service: "contact",
    provider: supabase ? "supabase" : "unconfigured",
    configured: Boolean(supabase),
  });
};

export const POST: APIRoute = async ({ request }) => {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return json(400, {
      ok: false,
      error: "invalid_json",
    });
  }

  const { name, email, message } = payload;

  if (!isFilledString(name) || !isFilledString(email) || !isFilledString(message)) {
    return json(400, {
      ok: false,
      error: "missing_fields",
      fields: ["name", "email", "message"],
    });
  }

  const normalized = {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    message: String(message).trim(),
  };

  if (!isValidEmail(normalized.email)) {
    return json(400, {
      ok: false,
      error: "invalid_email",
    });
  }

  const supabase = getSupabaseConfig();

  if (!supabase) {
    return json(503, {
      ok: false,
      error: "backend_not_configured",
      message: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist contact submissions.",
    });
  }

  const record: ContactRecord = {
    ...normalized,
    source: "digital-business-card",
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
    submitted_at: new Date().toISOString(),
  };

  const response = await fetch(`${supabase.url}/rest/v1/${encodeURIComponent(supabase.table)}`, {
    method: "POST",
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([record]),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    return json(502, {
      ok: false,
      error: "storage_failed",
      detail,
    });
  }

  const inserted = (await response.json().catch(() => [])) as Array<Record<string, unknown>>;
  const row = inserted[0];

  return json(201, {
    ok: true,
    provider: "supabase",
    id: row?.id ?? null,
  });
};
