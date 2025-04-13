import type { APIRoute } from 'astro';
export const prerender = false;

const SECRET_KEY = import.meta.env.SECRET_KEY; // guardada en .env

export const GET: APIRoute = async () => {
  const encoder = new TextEncoder();
  const timestamp = Math.floor(Date.now() / 1000); // segundos
  const message = `${timestamp}`;

  const keyData = encoder.encode(SECRET_KEY);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  const token = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return new Response(
    JSON.stringify({ token, timestamp }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};