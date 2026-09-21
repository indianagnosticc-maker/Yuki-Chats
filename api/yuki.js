export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('API key not configured in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'gemini-3.6-flash',
          input: message
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      return res.status(500).json({ error: 'AI service error', details: errText });
    }

    const data = await response.json();
    
    // Interactions API response structure parsing
    let reply = '…';
    if (data.model_output && data.model_output.text) {
      reply = data.model_output.text;
    } else if (data.output && typeof data.output === 'string') {
      reply = data.output;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (Array.isArray(data)) {
      const textPart = data.find(x => x.model_output || x.type === 'text');
      if (textPart?.model_output?.text) reply = textPart.model_output.text;
      else if (textPart?.text) reply = textPart.text;
    } else {
      reply = typeof data === 'string' ? data : JSON.stringify(data);
    }
    
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Yuki API error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
