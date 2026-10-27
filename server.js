const express = require('express');
const path = require('path');
const { Redis } = require('@upstash/redis');

const app = express();

// Fall back to an in-memory store when Upstash isn't configured (e.g. local dev)
const hasRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const memory = { hate_count: 0, hate_last_clicked: null };

const store = hasRedis
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    })
    : {
        get: async (key) => memory[key],
        set: async (key, value) => { memory[key] = value; },
        incr: async (key) => ++memory[key],
    };

if (!hasRedis) {
    console.warn('KV_REST_API_URL / KV_REST_API_TOKEN not set, using in-memory counter');
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/count', async (req, res) => {
    try {
        const count = (await store.get('hate_count')) ?? 0;
        const lastClicked = await store.get('hate_last_clicked');
        res.json({ count, lastClicked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read count' });
    }
});

app.post('/api/click', async (req, res) => {
    try {
        const count = await store.incr('hate_count');
        const lastClicked = new Date().toISOString();
        await store.set('hate_last_clicked', lastClicked);
        res.json({ count, lastClicked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register click' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
