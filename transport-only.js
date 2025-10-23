import {pack} from 'msgpackr';
import {generatePayload} from '../data.js';
import express from 'express';
import avro from 'avsc';

const app = express();
const port = 3000;

const payload = generatePayload(100_000);
const avroSchema = {
  "type": "record",
  "name": "RecordsPayload",
  "namespace": "com.example",
  "fields": [
    {
      "name": "generatedAt",
      "type": {
        "type": "string",
        "logicalType": "timestamp-millis"
      }
    },
    {
      "name": "records",
      "type": {
        "type": "array",
        "items": {
          "name": "RecordItem",
          "type": "record",
          "fields": [
            { "name": "id", "type": "int" },
            { "name": "title", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "score", "type": "int" },
            { "name": "active", "type": "boolean" }
          ]
        }
      }
    }
  ]
};
const avroType = avro.Type.forSchema(avroSchema);
const avroPackedPayload = avroType.toBuffer(payload);
const msgPackrPackedPayload = pack(payload);

function performanceMIddleware(req, res, next) {
    const start = process.hrtime.bigint();
    req.requestTime = new Date();
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(`[${req.method}] ${req.originalUrl} - Started at: ${req.requestTime.toISOString()}, Finished at: ${new Date().toISOString()}, Duration: ${durationMs.toFixed(2)} ms`);
    });
    next(); 
}

app.use(performanceMIddleware);

app.use(express.json());

app.get('/api/avro', (req, res) => {
    res.setHeader('Content-Type', 'application/avro');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(avroPackedPayload);
});

app.get('/api/msgpack', (req, res) => {
    res.setHeader('Content-Type', 'application/msgpack');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(msgPackrPackedPayload);
});

app.get('/api/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(payload);
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});