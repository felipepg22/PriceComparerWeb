import { readFile, writeFile } from "node:fs/promises";

const args = parseArgs(process.argv.slice(2));
const summary = JSON.parse(await readFile(required(args, "summary"), "utf8"));
const raw = await readFile(required(args, "raw"), "utf8");
const output = required(args, "output");
const markdown = required(args, "markdown");
const planId = "product-search-local-quick-baseline";
const fingerprint = required(args, "fingerprint");
const runId = required(args, "run-id");
const endedAt = new Date();
const durationMs = 60_000;
const durationMetric = metric(summary, "GET__api_products_search_duration");
const requestMetric = metric(summary, "operation_requests");
const failureMetric = metric(summary, "operation_failed");
const samples = number(durationMetric.values.count, 0);
const durationSamples = raw.split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((entry) => entry.metric === "GET__api_products_search_duration" && entry.data?.type === "Point")
  .map((entry) => entry.data.value)
  .filter((value) => typeof value === "number" && Number.isFinite(value));

const record = {
  schemaVersion: 1,
  plan: { id: planId, fingerprint },
  run: {
    id: runId,
    status: samples > 0 ? "complete" : "partial",
    startedAt: new Date(endedAt.getTime() - durationMs).toISOString(),
    endedAt: endedAt.toISOString(),
    wallClockMs: durationMs,
    scenarioDurationMs: durationMs,
    incompleteCoverage: samples > 0 ? [] : ["No successful product-search latency samples were recorded."],
  },
  environment: {
    gitRevision: required(args, "revision"),
    gitDirty: true,
    os: "darwin",
    cpu: "not collected",
    memoryBytes: 0,
    applicationProfile: "Development with loopback ProductSearch__SearXngBaseUrl override",
    target: "http://127.0.0.1:5235/api/products/search",
    k6Version: required(args, "k6-version"),
    containerLimits: null,
  },
  workload: {
    scenario: "baseline",
    model: "closed",
    executor: "constant-vus",
    stages: [{ name: "steady", duration: "60s", target: 2 }],
    concurrency: 2,
    arrivalRate: null,
    repetition: 1,
    dataVolume: "one fixed query with three fixture product pages",
    streamCompletionSemantics: null,
  },
  metrics: [{
    case: "product-search-loopback-fixture",
    operation: "POST /api/products/search",
    scenario: "baseline",
    unit: "ms",
    successfulSamples: samples,
    sampleCount: samples,
    mean: statistic(durationMetric, "avg", samples),
    p50Median: statistic(durationMetric, "med", samples),
    p95: statistic(durationMetric, "p(95)", samples),
    p99: statistic(durationMetric, "p(99)", samples),
    min: statistic(durationMetric, "min", samples),
    max: statistic(durationMetric, "max", samples),
    standardDeviation: standardDeviation(durationSamples),
    throughputPerSecond: number(requestMetric.values.rate, 0),
    errorRate: number(failureMetric.values.rate, 0),
    p99Exploratory: samples < 1000,
  }],
  functionalChecks: ["status 200", "JSON response", "query and currency preserved", "three comparable offers and attempted sources"],
  slos: [],
  safetyStops: [],
  excludedOperations: ["POST /api/offers/email", "POST /api/scrape", "normal search against non-loopback SearXNG/candidate pages"],
  instrumentationGaps: ["Host CPU and memory were not collected."],
  artifacts: { summary: args.summary, raw: args.raw, report: markdown },
  analysis: { observations: [], correlations: [], hypotheses: [], confirmedCauses: [] },
};

await writeFile(output, `${JSON.stringify(record, null, 2)}\n`);
await writeFile(markdown, renderMarkdown(record));

function metric(data, name) {
  return data.metrics?.[name] || { values: {} };
}

function statistic(entry, key, samples) {
  return samples > 0 ? number(entry.values[key], 0) : null;
}

function number(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function standardDeviation(values) {
  if (values.length === 0) return null;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.sqrt(values.reduce((total, value) => total + ((value - mean) ** 2), 0) / values.length);
}

function required(values, name) {
  if (!values[name]) throw new Error(`--${name} is required`);
  return values[name];
}

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 2) result[values[index]?.replace(/^--/, "")] = values[index + 1];
  return result;
}

function renderMarkdown(value) {
  const metricRow = value.metrics[0];
  return `# Performance report: ${value.plan.id}\n\n- Run: ${value.run.id}\n- Status: ${value.run.status}\n- Plan fingerprint: ${value.plan.fingerprint}\n- Verdict: baseline; no SLO verdict\n\n| Case | Samples | Mean | p50 | p95 | p99 | Throughput/s | Error rate |\n|---|---:|---:|---:|---:|---:|---:|---:|\n| ${metricRow.case} | ${metricRow.sampleCount} | ${metricRow.mean ?? "—"} | ${metricRow.p50Median ?? "—"} | ${metricRow.p95 ?? "—"} | ${metricRow.p99 ?? "—"} | ${metricRow.throughputPerSecond} | ${metricRow.errorRate} |\n`;
}
