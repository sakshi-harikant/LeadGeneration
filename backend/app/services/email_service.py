import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import asyncio
import aiosmtplib

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        
        if not self.smtp_user or not self.smtp_password:
            print("⚠️ SMTP credentials not configured. Email sending will be disabled.")
            self.enabled = False
        else:
            self.enabled = True
    
    async def send_reset_password_email(self, to_email: str, reset_token: str):
        """Send password reset email"""
        if not self.enabled:
            print(f"📧 Email disabled. Reset token for {to_email}: {reset_token}")
            return False
        
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        
        subject = "Password Reset Request - LeadGen"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">🔐 LeadGen</h1>
                <p style="color: #93c5fd; margin: 5px 0 0;">Password Reset</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
                <p style="color: #475569; line-height: 1.6;">
                    You requested to reset your password for your LeadGen account.
                    Click the button below to set a new password.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background: #2563eb; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 6px; font-weight: bold;
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link in your browser:<br>
                    <span style="color: #2563eb; word-break: break-all;">{reset_link}</span>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        plain_text = f"""
        Reset Your Password
        
        You requested to reset your password for your LeadGen account.
        
        Click the link below to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        If you didn't request this, please ignore this email.
        """
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email
            
            # Attach both plain text and HTML versions
            part1 = MIMEText(plain_text, "plain")
            part2 = MIMEText(html_body, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )
            
            print(f"✅ Password reset email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            return False

# Create a single instance
email_service = EmailService()