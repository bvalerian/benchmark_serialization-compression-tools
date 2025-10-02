import fetch from 'node-fetch';
import { unpack } from 'msgpackr';

async function run() {
  const res = await fetch('http://localhost:3000/data');
  const buf = await res.arrayBuffer();
  const decoded = unpack(new Uint8Array(buf));

  console.log('Decoded payload from server:');
  console.log(decoded);
}

run().catch(console.error);
