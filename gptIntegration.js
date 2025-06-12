export async function sendPrompt(prompt) {
  try {
    const res = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('GPT integration error:', err);
    return null;
  }
}
