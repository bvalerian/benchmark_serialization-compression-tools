import {pack} from 'msgpackr';
import {generatePayload} from './data.js';
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
    const avroType = avro.Type.forSchema(avroSchema);
    const avroPackedPayload = avroType.toBuffer(payload);
    const unpacked = avroType.fromBuffer(avroPackedPayload);
    const packedAgain = avroType.toBuffer(unpacked)

    res.setHeader('Content-Type', 'application/avro');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(packedAgain);
});

app.get('/api/msgpack', (req, res) => {
    const msgPackrPackedPayload = pack(payload); // getting data from external source
    const unpackedPayload = unpack(msgPackrPackedPayload); // unpacking
    const packedAgain = pack(unpackedPayload); // packing again before response

    res.setHeader('Content-Type', 'application/msgpack');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(packedAgain);
});

app.get('/api/json', (req, res) => {
    const toString = JSON.stringify(payload); // getting data from external source
    const parsed = JSON.parse(toString); // unpacking
    const toStringAgain = JSON.stringify(parsed); // packing again before response

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(toStringAgain);
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});