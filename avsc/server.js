import express from 'express';
import avro from 'avsc';

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
const payload = {
    generatedAt: new Date().toISOString(),
    records
};

const schema = {
  type: 'record',
  name: 'Payload',
  fields: [
    { name: 'message', type: 'string' },
    { name: 'numbers', type: { type: 'array', items: 'int' } },
    { name: 'nested', type: {
      type: 'record',
      name: 'Nested',
      fields: [
        { name: 'foo', type: 'string' },
        { name: 'baz', type: 'int' },
        { name: 'bool', type: 'boolean' }
      ]
    }}
  ]
};
const avroType = avro.Type.forSchema(schema);
const packedPayload = avroType.toBuffer(payload);

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
    res.setHeader('Content-Type', 'application/avro');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(packedPayload);
});

app.get('/', (req, res) => {
    res.send('AVSC server is running. Access /api/records for data.');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
