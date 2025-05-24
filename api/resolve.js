import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Método no permitido');
  }

  const { data } = req.query;

  if (!data) {
    return res.status(400).json({ error: 'Parámetro "data" requerido' });
  }

  const API_URL = `https://apiresolve.bancoroela.com.ar/api/resolve?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiIyNDVjMWM3ZjM5YjU0ODVkYjk1Yjc1ZTJlNjRlZjgzZCJ9.uHq5WX21kF-S--0DqZz0R311_HsXufzBQaKBgbz_fWI&data=${encodeURIComponent(data)}`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error en la API externa' });
    }
    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error al consultar API externa:', err);
    return res.status(500).json({ error: 'Error al consultar API externa' });
  }
}
