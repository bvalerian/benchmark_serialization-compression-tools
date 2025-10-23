import autocannon from 'autocannon';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';

function printResults(title, result) {
  const rps = result.requests.average.toFixed(0);
  const latency = result.latency.average.toFixed(2);
  const throughput = prettyBytes(result.throughput.average) + '/s';
  const errors = result.errors || 0;
  const status = Object.keys(result.statusCodeStats)
    .map((s) => `${s}: ${result.statusCodeStats[s].count}`)
    .join(', ');

  console.log(chalk.bold.cyan('\n📊 ' + title));
  console.log(chalk.gray('──────────────────────────────'));
  console.log(`${chalk.yellow('URL:')} ${result.url}`);
  console.log(`${chalk.yellow('Connections:')} ${result.connections}`);
  console.log(`${chalk.yellow('Duration:')} ${result.duration.toFixed(2)}s`);
  console.log('');
  console.log(`${chalk.green('✔ Requests/sec:')} ${chalk.bold(rps)}`);
  console.log(`${chalk.green('✔ Throughput:')} ${chalk.bold(throughput)}`);
  console.log(`${chalk.green('✔ Avg Latency:')} ${chalk.bold(latency)} ms`);
  console.log('');
  console.log(`${chalk.blue('Status Codes:')} ${status}`);
  console.log(`${chalk.red('Errors:')} ${errors}`);
  console.log(chalk.gray('──────────────────────────────\n'));
}

async function runBenchmark(url, title) {
  const result = await autocannon({
    title,
    url,
    connections: 10,  // number of concurrent clients
    duration: 10,    // seconds
    pipelining: 1,
  });

  printResults(title, result);
//   autocannon.printResult(result);
}

async function main() {
    console.log(chalk.bold.magenta('🚀 Starting benchmarks...\n'));
    await runBenchmark('http://localhost:3000/api/json', 'JSON endpoint');
    await runBenchmark('http://localhost:3000/api/msgpack', 'MsgPack endpoint');
    await runBenchmark('http://localhost:3000/api/avro', 'Avro endpoint');
    console.log(chalk.bold.magenta('\n🏁 Benchmarks completed!'));
}

main();