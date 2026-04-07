const express = require('express');
const path = require('path');
const { Redis } = require('@upstash/redis');

const app = express();

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

app.use(express.static(__dirname));

app.get('/api/count', async (req, res) => {
  const count = (await redis.get('hate_count')) ?? 0;
  const lastClicked = await redis.get('hate_last_clicked');
  res.json({ count, lastClicked });
});

app.post('/api/click', async (req, res) => {
  const count = await redis.incr('hate_count');
  const lastClicked = new Date().toISOString();
  await redis.set('hate_last_clicked', lastClicked);
  res.json({ count, lastClicked });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
