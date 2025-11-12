import express from 'express';
import SecureHashMap from '../adversarial-first/SecureHashMap.js';
import { logger } from '../logger.js';

const app = express();
app.use(express.json());

const hashMap = new SecureHashMap();

app.get('/get/:key', (req, res) => {
  const { key } = req.params;
  const value = hashMap.get(key);
  if (value !== undefined) {
    res.status(200).json({ value });
  } else {
    res.status(404).json({ error: 'Key not found' });
  }
});

app.post('/set', (req, res) => {
  const { key, value } = req.body;
  if (key === undefined || value === undefined) {
    return res.status(400).json({ error: 'Key and value are required' });
  }
  hashMap.set(key, value);
  res.status(201).json({ success: true });
});

app.delete('/delete/:key', (req, res) => {
  const { key } = req.params;
  const deleted = hashMap.delete(key);
  if (deleted) {
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: 'Key not found' });
  }
});

const port = process.env.PORT || 3000;

let server;
if (import.meta.url === `file://${process.argv[1]}`) {
  server = app.listen(port, () => {
    logger.info(`SecureHashMap service listening on port ${port}`);
  });
}

export { app, server };
