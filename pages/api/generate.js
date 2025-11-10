export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://aihorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.HORDE_API_KEY, // Set your API key in Vercel environment
      },
      body: JSON.stringify({
        prompt: prompt,
        params: {
          height: 512,
          width: 512,
          steps: 20,
        },
      }),
    });

    const data = await response.json();
    const id = data.id;

    // Poll for result
    let result;
    while (true) {
      const check = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`);
      const status = await check.json();
      if (status.done) {
        const fetchResult = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`);
        result = await fetchResult.json();
        break;
      }
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
    }

    const imageUrl = result.generations[0]?.img;
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
