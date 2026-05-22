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

  const isValidJsonSuccess = payload && typeof payload === 'object' && payload.success === true;

  if (!response.ok || payload?.success === false || !isValidJsonSuccess) {
    const error = new Error(
      payload?.message
      || 'The contact service returned an unexpected response. Please try again in a moment.'
    );
    error.status = response.status;
    error.errors = payload?.errors || {};

    throw error;
  }

  return payload;
}
