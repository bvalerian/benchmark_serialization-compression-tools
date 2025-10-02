const express = require('express');
const { pack } = require('msgpackr');

const app = express();
const port = 3000;

// Pre-generate a deterministic dataset to avoid recalculating for every request
const recordsCount = 100_000;
const records = Array.from({ length: recordsCount }, (_, index) => ({
    id: index + 1,
    title: `Record ${index + 1}`,
    category: `Category ${index % 10}`,
    score: (index * 13) % 997,
    active: index % 2 === 0
}));
const packedPayload = pack({
    generatedAt: new Date().toISOString(),
    records
});

// Performance middleware
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    req.requestTime = new Date();
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(`[${req.method}] ${req.originalUrl} - Started at: ${req.requestTime.toISOString()}, Finished at: ${new Date().toISOString()}, Duration: ${durationMs.toFixed(2)} ms`);
    });
    next();
});

app.use(express.json());

app.get('/api/records', (req, res) => {
    res.setHeader('Content-Type', 'application/msgpack');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(packedPayload);
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
