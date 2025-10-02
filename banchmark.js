import { Suite } from 'benchmark';
import { pack, unpack } from 'msgpackr';
import avro from 'avsc';

const payload = {
  message: 'Benchmark payload testing serialization formats',
  numbers: Array.from({ length: 1000 }, (_, i) => i),
  nested: { foo: 'bar', baz: 42, bool: true }
};

// ----- AVRO setup -----
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

// ----- Encode upfront -----
const jsonEncoded = Buffer.from(JSON.stringify(payload));
const msgpackEncoded = pack(payload);
const avroEncoded = avroType.toBuffer(payload);

// ----- Print sizes -----
console.log('Payload sizes:');
console.log('JSON:', jsonEncoded.length, 'bytes');
console.log('msgpackr:', msgpackEncoded.length, 'bytes');
console.log('Avro:', avroEncoded.length, 'bytes');
console.log('--- Benchmarking ---');

// ----- Benchmark suite -----
const suite = new Suite();

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
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is', this.filter('fastest').map('name'));
  })
  .run({ async: true });
