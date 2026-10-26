// A static preview or unavailable gateway may return an empty body or HTML.
// Never turn those responses into a success or expose a JSON parser error.
export async function readNewsletterResponse(response, unavailableMessage) {
  let result;
  try {
    result = JSON.parse(await response.text());
  } catch {
    throw new Error(unavailableMessage);
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(unavailableMessage);
  }
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' && result.error.trim() ? result.error : unavailableMessage);
  }
  if (typeof result.message !== 'string' || !result.message.trim()) {
    throw new Error(unavailableMessage);
  }
  return result;
}

const confirmations = new Map();

// Share an in-flight confirmation across React Strict Mode effect replays.
export function requestNewsletterConfirmation(token, unavailableMessage) {
  if (confirmations.has(token)) return confirmations.get(token);
  const request = fetch('/api/newsletter/confirm', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
  }).then(response => readNewsletterResponse(response, unavailableMessage));
  confirmations.set(token, request);
  const clear = () => confirmations.delete(token);
  request.then(clear, clear);
  return request;
}
