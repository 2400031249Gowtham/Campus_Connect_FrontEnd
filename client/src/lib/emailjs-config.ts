// ═══════════════════════════════════════════════════════════════
// EmailJS Configuration — Real OTP Email Delivery
// ═══════════════════════════════════════════════════════════════
//
// To set up EmailJS (free — 200 emails/month):
//
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an Email Service:
//    - Click "Email Services" → "Add New Service"
//    - Choose Gmail → Connect your Gmail account → Save
//    - Copy the SERVICE_ID (e.g., "service_abc123")
// 3. Create an Email Template:
//    - Click "Email Templates" → "Create New Template"
//    - Set Subject: "CampusConnect — Your Verification Code: {{otp_code}}"
//    - Set Body (HTML):
//      <h2>CampusConnect Verification</h2>
//      <p>Hello!</p>
//      <p>Your verification code is:</p>
//      <h1 style="letter-spacing: 8px; color: #FFD700; font-size: 36px;">{{otp_code}}</h1>
//      <p>This code expires in 60 seconds. Do not share it with anyone.</p>
//      <br>
//      <p>— CampusConnect Team</p>
//    - Set "To Email": {{to_email}}
//    - Save → Copy the TEMPLATE_ID (e.g., "template_xyz789")
// 4. Get your Public Key:
//    - Click "Account" → "General" tab
//    - Copy the "Public Key" (e.g., "user_ABC123xyz")
// 5. Paste all three values below:
// ═══════════════════════════════════════════════════════════════

export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_goi6loi",
  TEMPLATE_ID: "template_xy44mu4",
  PUBLIC_KEY: "oVEtEA9NpfClmyChU",
};

// Template variables sent to EmailJS:
// {{email}}     — recipient's email address
// {{passcode}}  — the 6-digit verification code

export function isEmailJSConfigured(): boolean {
  return (
    EMAILJS_CONFIG.SERVICE_ID !== "service_xxxxxxx" &&
    EMAILJS_CONFIG.TEMPLATE_ID !== "template_xxxxxxx" &&
    EMAILJS_CONFIG.PUBLIC_KEY !== "xxxxxxxxxxxxxxx"
  );
}
