const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  const count = (await redis.get('hate_count')) ?? 0;
  const lastClicked = await redis.get('hate_last_clicked');
  res.json({ count, lastClicked });
};
