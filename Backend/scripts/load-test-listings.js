const autocannon = require("autocannon");

const target = process.env.LOAD_TEST_URL || "http://localhost:5000/api/properties?limit=20&page=1";

const instance = autocannon({
  url: target,
  connections: Number(process.env.LOAD_TEST_CONNECTIONS) || 60,
  pipelining: Number(process.env.LOAD_TEST_PIPELINING) || 1,
  duration: Number(process.env.LOAD_TEST_DURATION_SEC) || 30,
  timeout: 10,
  headers: {
    Accept: "application/json",
  },
});

autocannon.track(instance, { renderProgressBar: true });

instance.on("done", (result) => {
  const output = {
    target,
    requestsPerSecAverage: result.requests.average,
    requestsPerSecP99: result.requests.p99,
    latencyMsAverage: result.latency.average,
    latencyMsP95: result.latency.p95,
    latencyMsP99: result.latency.p99,
    throughputBytesPerSecAverage: result.throughput.average,
    non2xxResponses: result.non2xx,
    errors: result.errors,
    timeouts: result.timeouts,
  };

  console.log("\nLoad test summary:");
  console.log(JSON.stringify(output, null, 2));

  if (result.errors > 0 || result.timeouts > 0) {
    process.exitCode = 1;
  }
});
