"""
Email service for GrowthIQ AI.
Uses Python's smtplib with SMTP configured via .env.
If SMTP_USER or SMTP_PASSWORD is not configured, it automatically provisions
a temporary test email account using Ethereal Email (ethereal.email) and caches
the credentials locally to ensure seamless out-of-the-box password resets.
"""

import os
import json
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import httpx

load_dotenv()

logger = logging.getLogger(__name__)

SMTP_HOST     = os.getenv("SMTP_HOST", "")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL    = os.getenv("FROM_EMAIL", "")
FROM_NAME     = os.getenv("FROM_NAME", "GrowthIQ AI Support")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:3000")

CACHE_FILE = "ethereal_account.json"

def _get_smtp_credentials() -> dict:
    """
    Get configured SMTP credentials from .env, or provision an Ethereal test account.
    """
    # 1. Check if user configured their own SMTP server in .env
    if SMTP_USER and SMTP_PASSWORD:
        return {
            "host": SMTP_HOST or "smtp.gmail.com",
            "port": SMTP_PORT,
            "user": SMTP_USER,
            "pass": SMTP_PASSWORD,
            "from": FROM_EMAIL or SMTP_USER,
            "is_ethereal": False
        }

    # 2. Otherwise, check cached Ethereal account
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                cached = json.load(f)
                if cached.get("user") and cached.get("pass"):
                    logger.info("[EMAIL] Using cached Ethereal Email test account: %s", cached["user"])
                    return {
                        "host": cached["smtp"]["host"],
                        "port": cached["smtp"]["port"],
                        "user": cached["user"],
                        "pass": cached["pass"],
                        "from": cached["user"],
                        "web": cached.get("web"),
                        "is_ethereal": True
                    }
        except Exception as e:
            logger.warning("[EMAIL] Failed to read cached Ethereal credentials: %s", e)

    # 3. Provision a new Ethereal test account if no cache exists
    logger.info("[EMAIL] No SMTP credentials configured. Provisioning test account on ethereal.email...")
    try:
        response = httpx.post(
            "https://api.nodemailer.com/user",
            json={"requestor": "growthiq", "version": "1.0.0"},
            timeout=10.0
        )
        if response.status_code != 200:
            raise RuntimeError(f"Ethereal API returned status code {response.status_code}")
        
        data = response.json()
        if data.get("status") != "success":
            raise RuntimeError(f"Ethereal API failed: {data.get('error')}")

        # Save to cache file
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f, indent=2)

        logger.info("[EMAIL] Successfully provisioned new Ethereal account: %s", data["user"])
        logger.info("[EMAIL] Ethereal Web Inbox: %s", data.get("web"))

        return {
            "host": data["smtp"]["host"],
            "port": data["smtp"]["port"],
            "user": data["user"],
            "pass": data["pass"],
            "from": data["user"],
            "web": data.get("web"),
            "is_ethereal": True
        }
    except Exception as exc:
        raise RuntimeError(
            f"Failed to auto-configure Ethereal test mailer. "
            f"Please configure SMTP_USER and SMTP_PASSWORD in your .env file. Error: {str(exc)}"
        )

def _send(to_email: str, subject: str, html_body: str) -> None:
    """
    Sends an HTML email using SMTP. Raises an exception if connection/sending fails.
    """
    creds = _get_smtp_credentials()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{FROM_NAME} <{creds['from']}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        logger.info("[EMAIL] Connecting to SMTP server %s:%s...", creds["host"], creds["port"])
        with smtplib.SMTP(creds["host"], creds["port"], timeout=15) as server:
            server.ehlo()
            if creds["port"] == 587:
                server.starttls()
                server.ehlo()
            server.login(creds["user"], creds["pass"])
            server.sendmail(creds["from"], to_email, msg.as_string())
        
        logger.info("[EMAIL] Successfully sent email to %s", to_email)
        if creds.get("is_ethereal"):
            # Log the exact location of the ethereal inbox so the developer can access it
            logger.info("[ETHEREAL INBOX] View sent reset emails at: %s", creds.get("web"))
            try:
                print(f"\n[TEST EMAIL SENT] View reset link at: {creds.get('web')}\n")
            except Exception:
                pass
    except Exception as exc:
        logger.error("[EMAIL] SMTP operation failed: %s", exc)
        raise RuntimeError(f"SMTP error: {str(exc)}")

def send_password_reset_email(to_email: str, user_name: str, reset_token: str) -> None:
    """
    Send the password-reset link email. Raises RuntimeError on failure.
    """
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
    _send(to_email, subject, html_body)
