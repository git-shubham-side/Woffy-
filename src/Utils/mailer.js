const nodemailer = require("nodemailer");
const dns = require("node:dns");

// Optimize DNS lookup for cloud platforms (Railway, Render, AWS) by prioritizing IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com";

/**
 * Get sanitized email credentials
 */
const getCredentials = () => {
  let user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  let pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";

  // Strip leading and trailing quotes from Railway / cloud dashboards
  user = user.replace(/^["']+|["']+$/g, "").replace(/\s+/g, "");
  pass = pass.replace(/^["']+|["']+$/g, "").replace(/\s+/g, "");

  return { user, pass };
};

// Reusable warm connection pool (avoids reconnecting & TLS handshakes on every single email)
let warmPoolTransporter = null;

const getWarmTransporter = () => {
  const { user, pass } = getCredentials();
  if (!user || !pass) return null;

  if (!warmPoolTransporter) {
    warmPoolTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Direct SSL
      pool: true, // Keep socket alive in background
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 5,
      rateDelta: 1000,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return warmPoolTransporter;
};

/**
 * Send an email with warm socket pooling and fast automatic fallback
 */
const sendMailFast = async (mailOptions) => {
  const { user, pass } = getCredentials();

  if (!user || !pass) {
    console.warn(
      "⚠️ [Mailer Warning]: EMAIL_USER or EMAIL_PASS environment variables are missing on the server."
    );
    return false;
  }

  const options = {
    ...mailOptions,
    from: mailOptions.from || `"Woofy" <${user}>`,
  };

  // 1. Primary Attempt: Reusable Warm Socket Pool (Sub-2 second delivery)
  try {
    const pool = getWarmTransporter();
    if (pool) {
      const info = await pool.sendMail(options);
      console.log(`⚡ [Mailer Fast] Email dispatched via Warm Pool: ${info.messageId}`);
      return true;
    }
  } catch (err) {
    console.warn(
      `⚠️ [Mailer] Warm pool attempt warning (${err.code || err.message}). Retrying via direct connection...`
    );
    warmPoolTransporter = null; // reset pool
  }

  // 2. Fallback Attempt: Direct Port 587 STARTTLS
  try {
    const direct587 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: { ciphers: "SSLv3", rejectUnauthorized: false },
      connectionTimeout: 10000,
    });
    const info = await direct587.sendMail(options);
    console.log(`✅ [Mailer] Email dispatched via Port 587: ${info.messageId}`);
    return true;
  } catch (err2) {
    console.warn(`⚠️ [Mailer] Port 587 attempt failed (${err2.message}). Trying standard service...`);
  }

  // 3. Fallback Attempt: Standard Service
  try {
    const serviceTransport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    const info = await serviceTransport.sendMail(options);
    console.log(`✅ [Mailer] Email dispatched via Gmail Service: ${info.messageId}`);
    return true;
  } catch (fatalErr) {
    console.error("❌ [Mailer Fatal Error] All transport strategies failed:", fatalErr);
    return false;
  }
};

/**
 * Send contact inquiry email to the admin
 * @param {Object} data - { name, email, message, subject }
 * @returns {Promise<boolean>}
 */
const sendContactEmail = async ({ name, email, message, subject }) => {
  const { user } = getCredentials();
  const emailSubject = subject || `New Contact Message on Woofy from ${name}`;

  const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.02em;">Woofy.</h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">New Contact Us Notification</p>
      </div>
      <div style="padding: 30px 24px; color: #1e293b; line-height: 1.6;">
        <h2 style="font-size: 18px; margin-top: 0; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
          Message Details
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px; font-weight: 600;">Sender Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Sender Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Received Date:</td>
            <td style="padding: 8px 0; color: #334155;">${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} (IST)</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin-top: 15px;">
          <strong style="display: block; color: #0f172a; margin-bottom: 6px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message:</strong>
          <p style="margin: 0; white-space: pre-wrap; color: #334155; font-size: 15px;">${message}</p>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(emailSubject)}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; font-size: 14px;">
            Reply to ${name}
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        This notification was automatically generated by Woofy Pet Care Management platform.
      </div>
    </div>
  `;

  return await sendMailFast({
    from: `"${name} (via Woofy)" <${user || ADMIN_EMAIL}>`,
    replyTo: email,
    to: ADMIN_EMAIL,
    subject: emailSubject,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: htmlContent,
  });
};

/**
 * Send automated vaccination & deworming reminder email to Pet Parent
 * @param {Object} data - { userEmail, userName, petName, petId, vaccines }
 * @returns {Promise<boolean>}
 */
const sendVaccinationReminderEmail = async ({
  userEmail,
  userName,
  petName,
  petId,
  vaccines,
}) => {
  if (!userEmail || !vaccines || vaccines.length === 0) return false;

  const { user } = getCredentials();
  const petDisplayName = petName || "Your Pet";
  const emailSubject = `💉 Vaccination Reminder: Immunization Due for ${petDisplayName}`;

  const vaccineRowsHtml = vaccines
    .map((v) => {
      const isOverdue = v.status === "Overdue";
      const badgeBg = isOverdue ? "#fee2e2" : "#fef3c7";
      const badgeColor = isOverdue ? "#b91c1c" : "#92400e";
      const formattedDate = new Date(v.dueDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; font-weight: 600; color: #0f172a;">
            ${v.vaccineName}
            <div style="font-size: 12px; font-weight: normal; color: #64748b;">${v.category || "Immunization"}</div>
          </td>
          <td style="padding: 12px 8px; color: #334155;">${formattedDate}</td>
          <td style="padding: 12px 8px; text-align: right;">
            <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
              ${v.status}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const appBaseUrl = process.env.BASE_URL || "https://woffy.up.railway.app";
  const scheduleUrl = `${appBaseUrl}/api/vaccinations/${petId || ""}`;

  const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Woofy<span style="color: #6366f1;">.</span></h1>
        <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Automated Pet Healthcare & Vaccination Engine</p>
      </div>

      <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${userName || "Pet Parent"}</strong>,</p>
        <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">
          This is an automated reminder that upcoming vaccinations / deworming doses are due for <strong>${petDisplayName}</strong>. Timely immunization protects your pet against deadly viral diseases.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
            Due Immunizations
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 8px;">Vaccine / Cycle</th>
                <th style="padding: 8px;">Due Date</th>
                <th style="padding: 8px; text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${vaccineRowsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px; margin-bottom: 28px; font-size: 14px; color: #1e40af;">
          💡 <strong>Vet Tip:</strong> Ensure your pet is active and fever-free before administering vaccines. Always carry your pet's vaccination record card to the clinic.
        </div>

        <div style="text-align: center; margin-top: 10px;">
          <a href="${scheduleUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
            Open ${petDisplayName}'s Vaccine Hub &rarr;
          </a>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Sent with ❤️ by Woofy Pet Care Management. You received this because you are registered as a pet parent.
      </div>
    </div>
  `;

  return await sendMailFast({
    from: `"Woofy Health Reminders" <${user || ADMIN_EMAIL}>`,
    to: userEmail,
    subject: emailSubject,
    html: htmlContent,
  });
};

/**
 * Send secure password reset email with 1-Click Link and 6-Digit OTP
 * @param {Object} data - { userEmail, userName, resetUrl, otp }
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async ({
  userEmail,
  userName,
  resetUrl,
  otp,
}) => {
  if (!userEmail) return false;

  const { user } = getCredentials();
  const emailSubject = `🔐 Password Reset Request for Your Woofy Account`;

  const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Woofy<span style="color: #6366f1;">.</span></h1>
        <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Account Security & Password Recovery</p>
      </div>

      <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${userName || "Pet Parent"}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">
          We received a request to reset your password for your <strong>Woofy</strong> account. You can use either the <strong>6-digit OTP</strong> below or the secure <strong>1-Click Reset Link</strong>.
        </p>

        <!-- OTP Highlight Box -->
        <div style="background-color: #f8fafc; border: 2px dashed #6366f1; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Your 6-Digit Verification OTP</span>
          <span style="font-family: monospace, monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #4f46e5;">
            ${otp}
          </span>
          <span style="display: block; font-size: 12px; color: #94a3b8; margin-top: 6px;">Valid for 15 minutes</span>
        </div>

        <div style="text-align: center; margin: 28px 0 20px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
            Reset Password with 1-Click &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request a password reset, please ignore this email or contact support. Your password will remain unchanged.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Sent securely by Woofy Pet Care Management Authentication System.
      </div>
    </div>
  `;

  return await sendMailFast({
    from: `"Woofy Security" <${user || ADMIN_EMAIL}>`,
    to: userEmail,
    subject: emailSubject,
    html: htmlContent,
  });
};

module.exports = {
  sendContactEmail,
  sendVaccinationReminderEmail,
  sendPasswordResetEmail,
  ADMIN_EMAIL,
};
