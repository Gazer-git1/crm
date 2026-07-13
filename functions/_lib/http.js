export function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch (e) {
    return {};
  }
}
