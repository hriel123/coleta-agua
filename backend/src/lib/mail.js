// Password reset email, sent through the Brevo HTTPS API (Render's free plan
// blocks outbound SMTP). Without BREVO_API_KEY and MAIL_FROM (a sender
// verified in Brevo), password reset stays off.
const { BREVO_API_KEY, MAIL_FROM } = process.env;

export const mailConfigured = Boolean(BREVO_API_KEY && MAIL_FROM);

export async function sendMail({ to, subject, text, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'Coleta de Água', email: MAIL_FROM }, to: [{ email: to }], subject, textContent: text, htmlContent: html }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`brevo ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
