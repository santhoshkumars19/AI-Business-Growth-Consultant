"""
Email service for GrowthIQ AI.
Uses Python's smtplib with Gmail SMTP (or any SMTP configured via .env).
Falls back to logging when email is not configured (dev mode).
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL    = os.getenv("FROM_EMAIL", SMTP_USER or "noreply@growthiq.ai")
FROM_NAME     = os.getenv("FROM_NAME", "GrowthIQ AI")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _send(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASSWORD:
        # Dev-mode: just log the email content
        logger.warning(
            "[EMAIL DEV MODE] Would send to %s\nSubject: %s\n\n%s",
            to_email, subject, html_body
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        logger.info("[EMAIL] Sent '%s' to %s", subject, to_email)
        return True
    except Exception as exc:
        logger.error("[EMAIL] Failed to send to %s: %s", to_email, exc)
        return False


def send_password_reset_email(to_email: str, user_name: str, reset_token: str) -> bool:
    """Send the password-reset link email."""
    reset_url = f"{FRONTEND_URL}/auth/reset-password?token={reset_token}"
    subject   = "Reset your GrowthIQ AI password"

    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#161b22;border-radius:16px;border:1px solid #30363d;overflow:hidden;max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);padding:32px 40px;text-align:center;">
              <div style="font-size:2.5rem;margin-bottom:8px;">⚡</div>
              <h1 style="color:#fff;font-size:1.5rem;font-weight:800;margin:0;letter-spacing:-0.3px;">
                GrowthIQ <span style="opacity:0.85;">AI</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#e6edf3;font-size:1.25rem;font-weight:700;margin:0 0 12px;">
                Hi {user_name}, reset your password 🔐
              </h2>
              <p style="color:#8b949e;font-size:0.9375rem;line-height:1.6;margin:0 0 24px;">
                We received a request to reset the password for your GrowthIQ AI account.
                Click the button below to choose a new password. This link expires in
                <strong style="color:#e6edf3;">15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="{reset_url}"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                          color:#fff;text-decoration:none;font-weight:700;font-size:1rem;
                          padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                  Reset My Password →
                </a>
              </div>

              <p style="color:#8b949e;font-size:0.8125rem;line-height:1.6;margin:0 0 8px;">
                If the button doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="word-break:break-all;color:#6366f1;font-size:0.8rem;margin:0 0 24px;">
                {reset_url}
              </p>

              <hr style="border:none;border-top:1px solid #30363d;margin:24px 0;" />

              <p style="color:#6e7681;font-size:0.8125rem;line-height:1.6;margin:0;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.<br/><br/>
                Need help? Reply to this email or contact
                <a href="mailto:support@growthiq.ai" style="color:#6366f1;">support@growthiq.ai</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d1117;padding:20px 40px;text-align:center;
                       border-top:1px solid #30363d;">
              <p style="color:#484f58;font-size:0.75rem;margin:0;">
                © 2026 GrowthIQ AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return _send(to_email, subject, html_body)
