# Performance report: product-search-local-quick-baseline

- Status: partial — the 60-second request workload completed, but k6 was stopped while exporting dashboard summary data.
- Verdict: baseline; no SLO verdict.
- Target: loopback fixture through `POST /api/products/search`.

| Samples | Mean | p50 | p95 | p99 | Min | Max | Throughput/s | Error rate |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 191,751 | 0.578 ms | 0.520 ms | 0.833 ms | 1.445 ms | 0.381 ms | 9.107 ms | 3,195.85 | 0% |

The p99 is not exploratory because the run captured more than 1,000 successful samples. Host CPU and memory were not collected. The saved dashboard export is available as a separate HTML artifact.
