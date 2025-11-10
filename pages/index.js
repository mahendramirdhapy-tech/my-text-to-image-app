import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState('512x512');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('promptHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImage('');

    const [width, height] = size.split('x').map(Number);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, width, height }),
    });

    const data = await res.json();
    setImage(data.url);
    setLoading(false);

    const newHistory = [
      { prompt, image: data.url, date: new Date().toLocaleString() },
      ...history.slice(0, 9)
    ];
    setHistory(newHistory);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">AI Image Generator</h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full p-3 border rounded-lg mb-3"
            required
          />

          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          >
            <option value="512x512">512x512</option>
            <option value="768x768">768x768</option>
            <option value="1024x1024">1024x1024</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </form>

        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {image && (
          <div className="mt-6">
            <img src={image} alt="Generated" className="w-full rounded-lg" />
            <div className="mt-3 flex justify-center">
              <a
                href={image}
                download="ai-image.png"
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Download
              </a>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Prompts</h2>
          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((item, index) => (
                <li key={index} className="p-2 border-b text-sm">
                  <p className="font-medium truncate">{item.prompt}</p>
                  <p className="text-gray-500 text-xs">{item.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No history yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
