import { pack, unpack } from 'msgpackr';
import avro from 'avsc';
import Benchmark from 'benchmark';
import chalk from 'chalk';
import {generatePayload} from '../data.js';

const payload = generatePayload(1000);

// ----- AVRO setup -----
const schema = {
  "type": "record",
  "name": "RecordsPayload",
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
const avroType = avro.Type.forSchema(schema);

// ----- Encode upfront -----
const jsonEncoded = Buffer.from(JSON.stringify(payload));
const msgpackEncoded = pack(payload);
const avroEncoded = avroType.toBuffer(payload);

console.log(chalk.bold.cyan('\n📊 ' + 'Payload sizes'));
console.log(chalk.gray('──────────────────────────────'));
console.log(`${chalk.yellow('JSON:')} ${jsonEncoded.length} bytes`);
console.log(`${chalk.yellow('msgpackr:')} ${msgpackEncoded.length} bytes`);
console.log(`${chalk.yellow('AVSC:')} ${avroEncoded.length} bytes`);

console.log(chalk.bold.cyan('\n📊 ' + 'Benchmarking'));
console.log(chalk.gray('──────────────────────────────'));
// ----- Benchmark suite -----
const suite = new Benchmark.Suite;

suite
  .add('JSON encode', () => {
    JSON.stringify(payload);
  })
  .add('JSON decode', () => {
    JSON.parse(jsonEncoded.toString());
  })
  .add('msgpackr encode', () => {
    pack(payload);
  })
  .add('msgpackr decode', () => {
    unpack(msgpackEncoded);
  })
  .add('Avro encode', () => {
    avroType.toBuffer(payload);
  })
  .add('Avro decode', () => {
    avroType.fromBuffer(avroEncoded);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));2
  })
  .on('complete', function () {
    console.log('Fastest is', this.filter('fastest').map('name'));
  })
  .run({ async: true });
