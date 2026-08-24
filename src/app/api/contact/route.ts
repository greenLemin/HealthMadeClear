import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientIp } from "@/lib/rateLimit";
import { checkRateLimitDistributed } from "@/lib/rateLimitDistributed";
import { reportServerError } from "@/lib/errorReporting";
import { EMAIL_REGEX } from "@/lib/validation";

// Field length limits to prevent spam and DoS
const LIMITS = {
  name: 100,
  email: 200,
  subject: 100,
  message: 5000,
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

/**
 * CSRF protection: check the Origin header against the site's origin.
 * If Origin is missing or doesn't match, reject the request.
 * This is effective for unauthenticated endpoints because browsers
 * always send the Origin header for cross-origin POST requests.
 */
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    // Strict origin check (protocol + hostname + port) to prevent protocol downgrade
    // and subdomain spoofing; e.g., https vs http mismatch blocked.
    if (originUrl.origin === requestUrl.origin) return true;
    // Dev exception: localhost with different ports — keep port-agnostic for local dev
    // where request URL may be http://localhost:3000 and origin http://localhost:3000 (already matched above)
    // or http://localhost vs http://localhost:3000; allow if both are localhost/127.0.0.1 and protocol matches.
    const isLocalhost = (h: string) => h === "localhost" || h === "127.0.0.1";
    if (
      isLocalhost(originUrl.hostname) &&
      isLocalhost(requestUrl.hostname) &&
      originUrl.protocol === requestUrl.protocol
    ) {
      return true;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      const site = new URL(siteUrl);
      if (originUrl.origin === site.origin) return true;
      if (
        isLocalhost(originUrl.hostname) &&
        isLocalhost(site.hostname) &&
        originUrl.protocol === site.protocol
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // CSRF check
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const limit = await checkRateLimitDistributed("contact", ip, MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${limit.retryAfterSeconds} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot — any truthy value (including whitespace-only) indicates a bot
    // that filled the hidden field. Empty string / undefined is user intent clear.
    if (typeof website === "string" ? website !== "" : Boolean(website)) {
      return NextResponse.json({ success: true });
    }

    // Required field presence check (trim-aware)
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Type check
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
    }

    // Trim before length validation to avoid bypass via trailing spaces
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedSubject = typeof subject === "string" ? subject.trim() : "";

    // Length validation
    if (trimmedName.length > LIMITS.name) {
      return NextResponse.json({ error: "Name is too long (max 100 characters)" }, { status: 400 });
    }
    if (trimmedEmail.length > LIMITS.email) {
      return NextResponse.json({ error: "Email is too long (max 200 characters)" }, { status: 400 });
    }
    if (trimmedMessage.length > LIMITS.message) {
      return NextResponse.json({ error: "Message is too long (max 5000 characters)" }, { status: 400 });
    }
    if (trimmedSubject.length > LIMITS.subject) {
      return NextResponse.json({ error: "Subject is too long (max 100 characters)" }, { status: 400 });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Use service role key to insert, so we can lock down the table
    // and prevent attackers from bypassing the rate limits by using the anon key directly.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      reportServerError(new Error("Supabase env vars not configured"), { route: "contact" });
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("contact_submissions").insert({
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject || "general",
      message: trimmedMessage,
    });

    if (error) {
      reportServerError(error, { route: "contact", phase: "insert" });
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    reportServerError(err, { route: "contact" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
