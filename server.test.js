import { unpack } from 'msgpackr';

async function run() {
  const res = await fetch('http://localhost:3000/api/msgpack');
  const buf = await res.arrayBuffer();
  const decoded = unpack(new Uint8Array(buf));

  console.log('Payload decoded from server!', decoded.records.length);
}

run().catch(console.error);
