import nodemailer from 'nodemailer';

const hasEmailConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL);

const transporter = hasEmailConfig()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;

export const sendLeadNotification = async (lead) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: fromAddress,
    to: process.env.ADMIN_EMAIL,
    subject: `New Bespoke Lead: ${lead.fullName}`,
    html: `<h2>New Lead Received</h2>
      <p><strong>Name:</strong> ${lead.fullName}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Event Type:</strong> ${lead.eventType}</p>
      <p><strong>Guests:</strong> ${lead.guests}</p>
      <p><strong>Preferred Date:</strong> ${lead.preferredDate || 'N/A'}</p>
      <p><strong>Budget:</strong> ${lead.budgetRange || 'N/A'}</p>
      <p><strong>Message:</strong> ${lead.message}</p>`
  });
};

export const sendLeadAutoReply = async (lead) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: fromAddress,
    to: lead.email,
    subject: 'We received your request',
    html: `<h2>Thank you, ${lead.fullName}</h2>
      <p>We received your bespoke dining request and our team will contact you shortly.</p>
      <p>Restaurang Venus</p>`
  });
};
