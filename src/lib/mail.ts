import "server-only";

type SendMailInput = { to: string; subject: string; text: string };

// Minimal Resend integration via fetch — no SDK dependency. Falls back to a
// server-log line when RESEND_API_KEY isn't set, so password resets keep
// working in dev/before email is configured, without ever putting the new
// password in an HTTP response (that would let anyone reset anyone's
// password just by knowing their email).
export async function sendMail({ to, subject, text }: SendMailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.log(`[mail:dev-fallback] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    console.error("Failed to send email via Resend:", await res.text());
  }
}
