'use strict';

const { Resend } = require('resend');
const { verifyToken } = require('./_lib/otp');
const { json, readBody } = require('./_lib/http');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPIC_LABELS = {
  leasing: 'Leasing a Home',
  investing: 'Investing',
  partnership: 'Partnership',
  other: 'Something Else'
};

/* Phone verification is only enforced when Twilio is actually configured on
   this deployment — until then the form stays usable with email verification
   alone instead of being permanently blocked on a provider that isn't set up. */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const body = readBody(event);
  const topic = TOPIC_LABELS[body.topic] ? body.topic : 'leasing';
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();
  const property = body.property && typeof body.property === 'object' ? body.property : {};

  if (!name || !email || !EMAIL_RE.test(email)) {
    return json(400, { error: 'Please provide your name and a valid email.' });
  }
  if (topic === 'leasing' && !property.title && !property.url) {
    return json(400, { error: 'Please select a property before submitting.' });
  }

  const secret = process.env.OTP_SIGNING_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  if (!secret || !resendKey) {
    return json(500, { error: 'Applications are not accepting submissions right now. Please try again shortly.' });
  }

  const emailProof = verifyToken(body.emailProof, secret);
  if (!emailProof || emailProof.purpose !== 'email-verified' || emailProof.email !== email) {
    return json(400, { error: 'Please verify your email before submitting.' });
  }

  const smsConfigured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
  let phoneVerified = false;
  if (smsConfigured) {
    const phoneProof = verifyToken(body.phoneProof, secret);
    if (!phoneProof || phoneProof.purpose !== 'phone-verified' || phoneProof.phone !== phone) {
      return json(400, { error: 'Please verify your phone number before submitting.' });
    }
    phoneVerified = true;
  }

  const resend = new Resend(resendKey);
  const fromAddress = process.env.APPLICATION_FROM_EMAIL || 'onboarding@resend.dev';
  const notifyList = (process.env.APPLICATION_NOTIFY_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const propertyLines = [
    property.title ? `Property: ${property.title}` : null,
    property.price ? `Price: ${property.price}` : null,
    property.url ? `Link: ${property.url}` : null
  ].filter(Boolean).join('\n');

  const topicLabel = TOPIC_LABELS[topic];
  const phoneStatus = phoneVerified ? ' (verified)' : smsConfigured ? '' : ' (verification not yet enabled)';
  const notifyText = [
    `New application from ${name}`,
    `Interested in: ${topicLabel}`,
    `Email: ${email} (verified)`,
    `Phone: ${phone || 'not provided'}${phoneStatus}`,
    '',
    propertyLines,
    '',
    message ? `Message:\n${message}` : ''
  ].filter(Boolean).join('\n');

  try {
    if (notifyList.length) {
      await resend.emails.send({
        from: `Investors' Angels Applications <${fromAddress}>`,
        to: notifyList,
        subject: `New ${topicLabel} inquiry: ${name}${property.title ? ' — ' + property.title : ''}`,
        text: notifyText
      });
    }

    await resend.emails.send({
      from: `Investors' Angels <${fromAddress}>`,
      to: email,
      subject: 'We received your application',
      text: `Hi ${name},\n\nThanks for reaching out — our team will review your submission and get back to you shortly.\n\n${propertyLines}`
    });
  } catch (err) {
    return json(502, { error: 'Could not send your application. Please try again.' });
  }

  return json(200, { success: true });
};
