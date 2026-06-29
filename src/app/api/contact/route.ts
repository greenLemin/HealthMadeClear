import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Field length limits to prevent spam and DoS
const LIMITS = {
  name: 100,
  email: 200,
  subject: 100,
  message: 5000,
};

// Basic email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit store for IP addresses
export const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
export function clearRateLimitStore() {
  rateLimitStore.clear();
}
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      "127.0.0.1";

    const now = Date.now();
    // Prune expired entries to prevent memory leak
    for (const [key, value] of rateLimitStore.entries()) {
      if (now >= value.resetAt) {
        rateLimitStore.delete(key);
      }
    }

    const limitRecord = rateLimitStore.get(ip);

    if (limitRecord && now < limitRecord.resetAt) {
      if (limitRecord.count >= MAX_REQUESTS) {
        const retryAfter = Math.ceil((limitRecord.resetAt - now) / 1000);
        return NextResponse.json(
          { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
            },
          }
        );
      }
      limitRecord.count += 1;
    } else {
      rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot — bots fill hidden fields
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Required field presence check
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Type check
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
    }

    // Length validation
    if (name.length > LIMITS.name) {
      return NextResponse.json({ error: "Name is too long (max 100 characters)" }, { status: 400 });
    }
    if (email.length > LIMITS.email) {
      return NextResponse.json({ error: "Email is too long (max 200 characters)" }, { status: 400 });
    }
    if (message.length > LIMITS.message) {
      return NextResponse.json({ error: "Message is too long (max 5000 characters)" }, { status: 400 });
    }
    if (subject && typeof subject === "string" && subject.length > LIMITS.subject) {
      return NextResponse.json({ error: "Subject is too long (max 100 characters)" }, { status: 400 });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Use anon key — the contact_submissions INSERT policy uses WITH CHECK (true),
    // so the anon role can insert without needing the service role.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("[Contact] Supabase env vars not configured");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      subject: (typeof subject === "string" ? subject.trim() : null) || "general",
      message: message.trim(),
    });

    if (error) {
      console.error("[Contact] DB insert error:", error);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
