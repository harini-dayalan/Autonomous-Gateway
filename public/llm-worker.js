import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

env.allowLocalModels = false;
env.useBrowserCache = true;

let generator = null;

const SYSTEM_CONTEXT = `You are Sentinel AI, the privacy intelligence assistant embedded in the Sentinel Zero-Trust Privacy Gateway. 
You help security teams understand PII risks, explain tokenization results, and answer compliance questions about GDPR, CCPA, and SOC2. 
Keep answers concise and technical. Always emphasize data privacy best practices.`;

self.addEventListener('message', async (e) => {
  const { type, text } = e.data;

  if (type === 'load') {
    try {
      self.postMessage({ type: 'status', message: 'Downloading Sentinel AI model (first time only ~80MB)...' });
      generator = await pipeline('text2text-generation', 'Xenova/flan-t5-base', {
        progress_callback: (p) => {
          if (p.status === 'downloading') {
            const pct = p.loaded && p.total ? Math.round((p.loaded / p.total) * 100) : 0;
            self.postMessage({ type: 'progress', pct, message: `Loading model: ${pct}%` });
          }
        }
      });
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }

  if (type === 'generate') {
    try {
      const prompt = `${SYSTEM_CONTEXT}\n\nQuestion: ${text}\n\nAnswer:`;
      const out = await generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        repetition_penalty: 1.3,
      });
      self.postMessage({ type: 'result', text: out[0].generated_text });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }
});
