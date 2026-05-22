export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_API_URL || '/api/contact';

export async function sendContactMessage(formData) {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const payload = await response.json().catch(() => null);

  if (import.meta.env.DEV) {
    console.info('Contact API response', {
      endpoint: CONTACT_ENDPOINT,
      ok: response.ok,
      status: response.status,
      payload,
    });
  }

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || 'Unable to send your message right now.');
    error.status = response.status;
    error.errors = payload?.errors || {};

    throw error;
  }

  return payload || {
    success: true,
    message: 'Thanks, your message has been sent.',
  };
}
