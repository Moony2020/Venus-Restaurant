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

// Escape HTML entities to prevent XSS in email bodies
const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const sendInquiryNotification = async (inquiry) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: fromAddress,
    to: process.env.ADMIN_EMAIL,
    subject: `New Bespoke Inquiry: ${escapeHtml(inquiry.fullName)}`,
    html: `<h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${escapeHtml(inquiry.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
      <p><strong>Event Type:</strong> ${escapeHtml(inquiry.eventType)}</p>
      <p><strong>Guests:</strong> ${escapeHtml(inquiry.guests)}</p>
      <p><strong>Preferred Date:</strong> ${escapeHtml(inquiry.preferredDate) || 'N/A'}</p>
      <p><strong>Budget:</strong> ${escapeHtml(inquiry.budgetRange) || 'N/A'}</p>
      <p><strong>Message:</strong> ${escapeHtml(inquiry.message)}</p>`
  });
};

export const sendInquiryAutoReply = async (inquiry) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: fromAddress,
    to: inquiry.email,
    subject: 'We received your request',
    html: `<h2>Thank you, ${escapeHtml(inquiry.fullName)}</h2>
      <p>We received your bespoke dining request and our team will contact you shortly.</p>
      <p>Restaurang Venus</p>`
  });
};

export const sendOrderConfirmation = async (order) => {
  if (!transporter) return;

  const itemsHtml = (order.items || []).map((item) => {
    let line = `<li>${escapeHtml(item.name)} × ${item.quantity} — ${item.price * item.quantity} kr`;
    if (item.optionSummary) line += `<br/><small style="color:#999">Tillägg: ${escapeHtml(item.optionSummary)}</small>`;
    if (item.notes) line += `<br/><small style="color:#999">Önskemål: ${escapeHtml(item.notes)}</small>`;
    line += '</li>';
    return line;
  }).join('');

  await transporter.sendMail({
    from: fromAddress,
    to: order.email,
    subject: `Orderbekräftelse — ${order.trackingCode}`,
    html: `<h2>Tack för din beställning!</h2>
      <p><strong>Spårningskod:</strong> ${escapeHtml(order.trackingCode)}</p>
      <p><strong>Leveranssätt:</strong> ${order.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</p>
      <p><strong>Beräknad tid:</strong> ${escapeHtml(order.etaText)}</p>
      <h3>Produkter</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Totalt:</strong> ${Math.round(order.totalAmount)} kr</p>
      <p style="margin-top:20px;color:#999">Restaurang Venus</p>`
  });
};

export const sendBookingConfirmation = async (booking) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: fromAddress,
    to: booking.email,
    subject: `Bokningsbekräftelse — ${escapeHtml(booking.date)}`,
    html: `<h2>Din bokning är mottagen</h2>
      <p><strong>Datum:</strong> ${escapeHtml(booking.date)}</p>
      <p><strong>Tid:</strong> ${escapeHtml(booking.time)}</p>
      <p><strong>Antal gäster:</strong> ${booking.guests}</p>
      <p><strong>Namn:</strong> ${escapeHtml(booking.name)}</p>
      ${booking.notes ? `<p><strong>Önskemål:</strong> ${escapeHtml(booking.notes)}</p>` : ''}
      <p>Vi bekräftar din bokning inom kort.</p>
      <p style="margin-top:20px;color:#999">Restaurang Venus</p>`
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  if (!transporter) {
    return { deliveredToSmtp: false, reason: 'smtp_not_configured' };
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to: user.email,
    subject: 'Reset your password',
    html: `<h2>Hello ${escapeHtml(user.fullName || 'there')},</h2>
      <p>We received a request to reset your password.</p>
      <p><a href="${escapeHtml(resetUrl)}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <p style="margin-top:20px;color:#999">Restaurang Venus</p>`
  });

  return {
    deliveredToSmtp: true,
    messageId: info?.messageId || null,
    accepted: info?.accepted || [],
    rejected: info?.rejected || [],
    response: info?.response || null
  };
};
