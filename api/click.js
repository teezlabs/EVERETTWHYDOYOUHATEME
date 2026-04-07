const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const count = await redis.incr('hate_count');
  const lastClicked = new Date().toISOString();
  await redis.set('hate_last_clicked', lastClicked);
  res.json({ count, lastClicked });
};
