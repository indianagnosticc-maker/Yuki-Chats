export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Yuki, a sharp cyberpunk terminal AI. Reply strictly in 1 or 2 short sentences. Do not give long explanations.\n\nUser: ${message}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 60,
            temperature: 0.4
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', response.status, errText);
      return res.status(500).json({ error: 'Neural link unstable. Retry transmission.' });
    }

    const data = await response.json();
    
    let reply = '…';
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    console.error('Yuki Internal Error:', err);
    return res.status(500).json({ error: 'Neural link unstable. Retry transmission.' });
  }
}
