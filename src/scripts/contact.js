/**
 * 1VOYSY — Contact Module with Supabase PostgreSQL Integration
 * - Secure anonymous submissions via Row Level Security (RLS)
 * - Validation of required fields and email formatting
 * - Honeypot spam prevention
 * - Loading and double-submission protection
 * - Only shows SUCCESS after Supabase confirms insert succeeded
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

export async function sendInquiry(payload) {
  // 1. If Supabase is configured with valid URL & anon key
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: payload.name,
          email: payload.email,
          telegram_phone: payload.telegram_phone || null,
          discipline_reason: payload.discipline_reason || 'Freelance project / Collaboration',
          message: payload.message
        }
      ]);

    if (error) {
      throw error;
    }

    return { success: true, mode: 'supabase', data };
  }

  // 2. Fallback when environment variables are not yet provided in .env
  console.warn(
    '⚠️ Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );

  return {
    success: false,
    needsConfig: true,
    message: 'Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  };
}

export function initContact() {
  const form = document.getElementById('contact-form');
  const feedbackBox = document.getElementById('form-feedback');
  const copyBtn = document.getElementById('copy-email-btn');

  // 1. Copy Email to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = 'askar270819@gmail.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        copyBtn.textContent = '[ COPIED ✓ ]';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.textContent = '[ COPY ]';
          copyBtn.classList.remove('is-copied');
        }, 2200);
      } catch (err) {
        copyBtn.textContent = '[ COPIED ✓ ]';
        setTimeout(() => {
          copyBtn.textContent = '[ COPY ]';
        }, 2000);
      }
    });
  }

  // 2. Form Submission with Validation and Double-Submission Prevention
  if (form && feedbackBox) {
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Prevent double submission
      if (isSubmitting) return;

      const hpInput = form.querySelector('input[name="company_hp"]');
      if (hpInput && hpInput.value.trim() !== '') {
        // Honeypot spam trap triggered: silently ignore bot submission
        form.reset();
        return;
      }

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const telegramInput = document.getElementById('contact-telegram');
      const reasonInput = document.getElementById('contact-reason');
      const messageInput = document.getElementById('contact-message');
      const submitBtn = form.querySelector('.contact-submit-btn');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const telegram_phone = telegramInput ? telegramInput.value.trim() : '';
      const discipline_reason = reasonInput ? reasonInput.value.trim() : 'Freelance project / Collaboration';
      const message = messageInput ? messageInput.value.trim() : '';

      // Validate required fields
      if (!name) {
        showFeedback(feedbackBox, 'error', '[ NOTICE ]', 'Please enter your name.');
        if (nameInput) nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFeedback(feedbackBox, 'error', '[ NOTICE ]', 'Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!message || message.length < 3) {
        showFeedback(feedbackBox, 'error', '[ NOTICE ]', 'Please provide a message for your inquiry.');
        if (messageInput) messageInput.focus();
        return;
      }

      const consentInput = document.getElementById('contact-consent');
      if (consentInput && !consentInput.checked) {
        showFeedback(
          feedbackBox,
          'error',
          '[ СОГЛАСИЕ ]',
          'Пожалуйста, подтвердите согласие на обработку персональных данных для отправки формы.'
        );
        consentInput.focus();
        return;
      }

      const payload = {
        name,
        email,
        telegram_phone,
        discipline_reason,
        message
      };

      // Loading state & lock submission
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending Details...</span>`;
      }

      try {
        const result = await sendInquiry(payload);

        if (result.needsConfig) {
          // Credentials not yet provided in .env
          feedbackBox.classList.remove('is-success');
          feedbackBox.classList.add('is-visible', 'is-error');
          feedbackBox.innerHTML = `
            <div class="form-feedback-header">
              <span class="feedback-badge">[ CONFIG PENDING ]</span>
              <span>Supabase environment variables are missing. Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.</span>
            </div>
          `;
          return;
        }

        // Only show SUCCESS after Supabase confirms the database insert succeeded
        feedbackBox.classList.remove('is-error');
        feedbackBox.classList.add('is-visible', 'is-success');
        feedbackBox.innerHTML = `
          <div class="form-feedback-header">
            <span class="feedback-badge">[ ✓ TRANSMITTED ]</span>
            <span class="feedback-title">Thank you, <strong>${escapeHtml(payload.name)}</strong>.</span>
          </div>
          <p class="feedback-body">Your message has been saved to the database. A direct reply will be sent to <strong>${escapeHtml(payload.email)}</strong> shortly.</p>
        `;

        form.reset();
      } catch (err) {
        console.error('Supabase submission error:', err);
        feedbackBox.classList.remove('is-success');
        feedbackBox.classList.add('is-visible', 'is-error');
        feedbackBox.innerHTML = `
          <div class="form-feedback-header">
            <span class="feedback-badge">[ ERROR ]</span>
            <span>Failed to send. Please write directly to <a href="mailto:askar270819@gmail.com">askar270819@gmail.com</a>.</span>
          </div>
        `;
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Details</span> <span class="submit-arrow">&rarr;</span>`;
        }
      }
    });
  }
}

function showFeedback(box, type, badge, text) {
  box.classList.remove('is-success', 'is-error');
  box.classList.add('is-visible', type === 'error' ? 'is-error' : 'is-success');
  box.innerHTML = `
    <div class="form-feedback-header">
      <span class="feedback-badge">${badge}</span>
      <span>${escapeHtml(text)}</span>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
