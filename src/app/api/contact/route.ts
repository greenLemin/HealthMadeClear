import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clearRateLimitStore, getClientIp } from "@/lib/rateLimit";
import { reportServerError } from "@/lib/errorReporting";

export { clearRateLimitStore };

// Field length limits to prevent spam and DoS
const LIMITS = {
  name: 100,
  email: 200,
  subject: 100,
  message: 5000,
};

// Basic email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit("contact", ip, MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

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

    // Use service role key to insert, so we can lock down the table
    // and prevent attackers from bypassing the rate limits by using the anon key directly.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      reportServerError(new Error("Supabase env vars not configured"), { route: "contact" });
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
      reportServerError(error, { route: "contact", phase: "insert" });
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    reportServerError(err, { route: "contact" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
