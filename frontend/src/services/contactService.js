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

  const contentType = response.headers.get('content-type') || '';
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
    const responseLooksLikeHtml = contentType.includes('text/html');
    const message = responseLooksLikeHtml
      ? 'The contact endpoint is misconfigured in production and returned HTML instead of the API response.'
      : payload?.message
        || `The contact service returned an unexpected response (status ${response.status}). Please try again in a moment.`;

    const error = new Error(
      message
    );
    error.status = response.status;
    error.errors = payload?.errors || {};

    throw error;
  }

  return payload;
}
