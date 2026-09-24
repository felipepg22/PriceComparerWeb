# Performance test plan: product-search-local-quick-baseline

## Canonical plan

```json
{
  "applicableRules": [
    "rules/core.md",
    "rules/planning.md",
    "rules/security.md",
    "rules/verification.md"
  ],
  "application": {
    "configurationEvidence": [
      "server/Properties/launchSettings.json",
      "server/appsettings.Development.json",
      "server/Program.cs"
    ],
    "configurationProfile": "Development with loopback ProductSearch__SearXngBaseUrl override",
    "dirty": true,
    "revision": "686db7e69fc0e0b57ec688e02512a6d6f9301e2b"
  },
  "artifacts": {
    "canonicalRun": "docs/performance-tests/.artifacts/product-search/run.json",
    "logs": "docs/performance-tests/.artifacts/product-search",
    "raw": "docs/performance-tests/.artifacts/product-search/raw.json",
    "reports": [
      "docs/performance-tests/reports/product-search-local-quick-baseline.md",
      "docs/performance-tests/reports/product-search-local-quick-baseline.html"
    ],
    "root": "docs/performance-tests"
  },
  "cases": [
    {
      "functionalChecks": [
        "status 200",
        "application/json response",
        "query is iPhone 15 128GB and currency is BRL",
        "three offers, three attempted sources, and warnings array are present"
      ],
      "id": "product-search-loopback-fixture",
      "mutatesBusinessData": false,
      "operation": "POST /api/products/search",
      "readOnlyEvidence": [
        "server/Program.cs maps the request to IProductSearchService.SearchAsync without persistence or email",
        "server/Services/ProductSearchService.cs reads search candidates and pages, then returns ProductSearchResponse",
        "docs/performance-tests/scripts/product-search-fixture-server.mjs serves only fixed loopback GET responses"
      ],
      "secretEnvironmentVariables": [],
      "testDataRefs": [
        "docs/performance-tests/scripts/product-search-fixture-server.mjs: fixed iPhone 15 128GB / BRL search with three local product pages"
      ]
    }
  ],
  "commands": {
    "cleanup": [
      "test -f docs/performance-tests/.artifacts/product-search/api.pid && kill $(cat docs/performance-tests/.artifacts/product-search/api.pid) || true; test -f docs/performance-tests/.artifacts/product-search/fixture.pid && kill $(cat docs/performance-tests/.artifacts/product-search/fixture.pid) || true"
    ],
    "report": [
      "node docs/performance-tests/scripts/render-product-search-report.mjs --summary docs/performance-tests/.artifacts/product-search/run/summary.json --raw docs/performance-tests/.artifacts/product-search/raw.json --output docs/performance-tests/.artifacts/product-search/run.json --markdown docs/performance-tests/reports/product-search-local-quick-baseline.md --fingerprint $APPROVED_PLAN_FINGERPRINT --run-id $GENERATED_RUN_ID --revision 686db7e69fc0e0b57ec688e02512a6d6f9301e2b --k6-version 2.2.0"
    ],
    "run": [
      "env PLAN_ID=product-search-local-quick-baseline PLAN_FINGERPRINT=$APPROVED_PLAN_FINGERPRINT RUN_ID=$GENERATED_RUN_ID CASE_ID=product-search-loopback-fixture TARGET_URL=http://127.0.0.1:5235/api/products/search TARGET_LOCALITY=loopback HTTP_METHOD=POST OPERATION_NAME='POST /api/products/search' APPROVED_HTTP_METHODS=POST HTTP_BODY='{\"query\":\"iPhone 15 128GB\",\"currency\":\"BRL\"}' EXECUTOR=constant-vus SCENARIO_NAME=baseline SCENARIO_CONFIG='{\"executor\":\"constant-vus\",\"vus\":2,\"duration\":\"60s\"}' EXPECTED_STATUSES=200 AUTH_MODE=none SAFETY_ERROR_RATE=0.2 SAFETY_DELAY_ABORT_EVAL=10s K6_RESULTS_DIR=docs/performance-tests/.artifacts/product-search/run K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=docs/performance-tests/reports/product-search-local-quick-baseline.html K6_WEB_DASHBOARD_PORT=5665 perl -e 'alarm 90; exec @ARGV' k6 run --out json=docs/performance-tests/.artifacts/product-search/raw.json docs/performance-tests/k6/product-search.js"
    ],
    "smoke": [
      "env PLAN_ID=product-search-local-quick-baseline PLAN_FINGERPRINT=$APPROVED_PLAN_FINGERPRINT RUN_ID=$GENERATED_RUN_ID CASE_ID=product-search-loopback-fixture TARGET_URL=http://127.0.0.1:5235/api/products/search TARGET_LOCALITY=loopback HTTP_METHOD=POST OPERATION_NAME='POST /api/products/search' APPROVED_HTTP_METHODS=POST HTTP_BODY='{\"query\":\"iPhone 15 128GB\",\"currency\":\"BRL\"}' EXECUTOR=shared-iterations SCENARIO_NAME=smoke SCENARIO_CONFIG='{\"executor\":\"shared-iterations\",\"vus\":1,\"iterations\":1,\"maxDuration\":\"30s\"}' EXPECTED_STATUSES=200 AUTH_MODE=none SAFETY_ERROR_RATE=0.2 SAFETY_DELAY_ABORT_EVAL=10s K6_RESULTS_DIR=docs/performance-tests/.artifacts/product-search/smoke perl -e 'alarm 45; exec @ARGV' k6 run docs/performance-tests/k6/product-search.js"
    ],
    "start": [
      "mkdir -p docs/performance-tests/.artifacts/product-search/smoke docs/performance-tests/.artifacts/product-search/run docs/performance-tests/reports && node docs/performance-tests/scripts/product-search-fixture-server.mjs > docs/performance-tests/.artifacts/product-search/fixture.log 2>&1 & echo $! > docs/performance-tests/.artifacts/product-search/fixture.pid; ASPNETCORE_URLS=http://127.0.0.1:5235 ASPNETCORE_ENVIRONMENT=Development ProductSearch__SearXngBaseUrl=http://127.0.0.1:18080 dotnet run --project server/PriceComparerWeb.Api.csproj --no-launch-profile > docs/performance-tests/.artifacts/product-search/api.log 2>&1 & echo $! > docs/performance-tests/.artifacts/product-search/api.pid"
    ]
  },
  "downloads": [],
  "environmentBindings": {
    "report": [
      {
        "id": "product-search-report",
        "values": {}
      }
    ],
    "run": [
      {
        "caseId": "product-search-loopback-fixture",
        "id": "product-search-baseline-r1",
        "repetition": 1,
        "scenario": "baseline",
        "values": {
          "APPROVED_HTTP_METHODS": "POST",
          "AUTH_MODE": "none",
          "CASE_ID": "product-search-loopback-fixture",
          "EXECUTOR": "constant-vus",
          "EXPECTED_STATUSES": "200",
          "HTTP_BODY": "{\"query\":\"iPhone 15 128GB\",\"currency\":\"BRL\"}",
          "HTTP_METHOD": "POST",
          "K6_RESULTS_DIR": "docs/performance-tests/.artifacts/product-search/run",
          "K6_WEB_DASHBOARD": "true",
          "K6_WEB_DASHBOARD_EXPORT": "docs/performance-tests/reports/product-search-local-quick-baseline.html",
          "K6_WEB_DASHBOARD_PORT": "5665",
          "OPERATION_NAME": "POST /api/products/search",
          "PLAN_FINGERPRINT": "$APPROVED_PLAN_FINGERPRINT",
          "PLAN_ID": "product-search-local-quick-baseline",
          "RUN_ID": "$GENERATED_RUN_ID",
          "SAFETY_DELAY_ABORT_EVAL": "10s",
          "SAFETY_ERROR_RATE": "0.2",
          "SCENARIO_CONFIG": "{\"executor\":\"constant-vus\",\"vus\":2,\"duration\":\"60s\"}",
          "SCENARIO_NAME": "baseline",
          "TARGET_LOCALITY": "loopback",
          "TARGET_URL": "http://127.0.0.1:5235/api/products/search"
        }
      }
    ],
    "smoke": [
      {
        "caseId": "product-search-loopback-fixture",
        "id": "product-search-smoke",
        "values": {
          "APPROVED_HTTP_METHODS": "POST",
          "AUTH_MODE": "none",
          "CASE_ID": "product-search-loopback-fixture",
          "EXECUTOR": "shared-iterations",
          "EXPECTED_STATUSES": "200",
          "HTTP_BODY": "{\"query\":\"iPhone 15 128GB\",\"currency\":\"BRL\"}",
          "HTTP_METHOD": "POST",
          "K6_RESULTS_DIR": "docs/performance-tests/.artifacts/product-search/smoke",
          "OPERATION_NAME": "POST /api/products/search",
          "PLAN_FINGERPRINT": "$APPROVED_PLAN_FINGERPRINT",
          "PLAN_ID": "product-search-local-quick-baseline",
          "RUN_ID": "$GENERATED_RUN_ID",
          "SAFETY_DELAY_ABORT_EVAL": "10s",
          "SAFETY_ERROR_RATE": "0.2",
          "SCENARIO_CONFIG": "{\"executor\":\"shared-iterations\",\"vus\":1,\"iterations\":1,\"maxDuration\":\"30s\"}",
          "SCENARIO_NAME": "smoke",
          "TARGET_LOCALITY": "loopback",
          "TARGET_URL": "http://127.0.0.1:5235/api/products/search"
        }
      }
    ]
  },
  "environmentVariables": [
    "PLAN_ID",
    "PLAN_FINGERPRINT",
    "RUN_ID",
    "CASE_ID",
    "TARGET_URL",
    "TARGET_LOCALITY",
    "HTTP_METHOD",
    "OPERATION_NAME",
    "APPROVED_HTTP_METHODS",
    "HTTP_BODY",
    "EXECUTOR",
    "SCENARIO_NAME",
    "SCENARIO_CONFIG",
    "EXPECTED_STATUSES",
    "AUTH_MODE",
    "SAFETY_ERROR_RATE",
    "SAFETY_DELAY_ABORT_EVAL",
    "K6_RESULTS_DIR",
    "K6_WEB_DASHBOARD",
    "K6_WEB_DASHBOARD_EXPORT",
    "K6_WEB_DASHBOARD_PORT"
  ],
  "excludedOperations": [
    {
      "evidence": [
        "server/Program.cs maps this operation to IOfferEmailSender.SendAsync"
      ],
      "operation": "POST /api/offers/email",
      "reason": "Sends email through SMTP and therefore mutates an external system."
    },
    {
      "evidence": [
        "server/Program.cs maps this operation to IPageScraper.FetchDocumentAsync"
      ],
      "operation": "POST /api/scrape",
      "reason": "Accepts arbitrary user URLs and is not the product-search behavior under test."
    },
    {
      "evidence": [
        "server/Services/ProductSearchProvider.cs derives candidate URLs from SearXNG JSON results",
        "server/Services/PageScraper.cs fetches every selected candidate URL"
      ],
      "operation": "POST /api/products/search using normal SearXNG results",
      "reason": "Normal SearXNG candidates can direct the API to public retailer pages; a writable remote dependency cannot be ruled out."
    }
  ],
  "generatedFiles": [
    {
      "bindingIds": [
        "product-search-smoke",
        "product-search-baseline-r1"
      ],
      "kind": "k6-entrypoint",
      "path": "docs/performance-tests/k6/product-search.js",
      "sha256": "0d7abf3a5ad53b90c730d7486992f0d212e0cf1eb45e6ae99f6986872b7bbf78"
    },
    {
      "bindingIds": [],
      "kind": "support",
      "path": "docs/performance-tests/k6/lib/reporter.js",
      "sha256": "8f199066e163eece85c2ddd7f146bee9f524178ca757d8c3c07b7200408d8084"
    },
    {
      "bindingIds": [],
      "kind": "support",
      "path": "docs/performance-tests/scripts/product-search-fixture-server.mjs",
      "sha256": "9c0d6bf6ef475ae32fd0fce26bf2d1b1bddec656c42347702d29a63538b8b889"
    },
    {
      "bindingIds": [],
      "kind": "support",
      "path": "docs/performance-tests/scripts/render-product-search-report.mjs",
      "sha256": "08853b035aba1eb1cb8a2173e4cb729899049049ddcf0797c7b35a0f7d1108a0"
    }
  ],
  "id": "product-search-local-quick-baseline",
  "measurements": [
    "response behavior"
  ],
  "originatingRequirement": "User request: test the performance of the search product behavior.",
  "protocol": "http",
  "reports": [
    "markdown",
    "local-dashboard"
  ],
  "safety": {
    "effectiveConfigurationEvidence": [
      "The approved start command overrides ProductSearch__SearXngBaseUrl to http://127.0.0.1:18080",
      "The loopback fixture returns only 127.0.0.1 candidate URLs",
      "No email or arbitrary scrape operation is invoked"
    ],
    "expectedSideEffects": [
      "Creates local logs, raw k6 output, and reports under docs/performance-tests/.artifacts and docs/performance-tests/reports",
      "Binds the k6 dashboard to localhost:5665 for the measured run and exports a self-contained HTML report",
      "Starts two loopback processes and terminates them during cleanup"
    ],
    "remoteWritableDependenciesVerifiedAbsent": true,
    "stops": [
      {
        "action": "abort the active scenario and retain partial artifacts",
        "id": "runaway-errors",
        "implementation": "k6 threshold with abortOnFail after 10s",
        "observable": "operation_failed rate",
        "threshold": "20%"
      },
      {
        "action": "terminate k6 and retain partial artifacts",
        "id": "maximum-duration",
        "implementation": "executor supervisor: Perl alarm limits the 60s k6 run to 90s",
        "observable": "measured run wall-clock time",
        "threshold": "90s"
      }
    ]
  },
  "schemaVersion": 1,
  "secretEnvironmentVariables": [],
  "slos": [],
  "target": {
    "address": "http://127.0.0.1:5235/api/products/search",
    "containerNetwork": null,
    "containerService": null,
    "daemonVerified": false,
    "environment": "local",
    "locality": "loopback",
    "localityEvidence": [
      "server/Properties/launchSettings.json binds the HTTP profile to localhost:5235; the approved command binds ASPNETCORE_URLS to 127.0.0.1:5235"
    ]
  },
  "targetType": "endpoint",
  "toolVersions": {
    "k6": "2.2.0"
  },
  "workload": {
    "arrivalRate": null,
    "compositeWeights": null,
    "duration": "60s",
    "executor": "constant-vus",
    "model": "closed",
    "repetitions": 1,
    "scenario": "baseline",
    "stages": [
      {
        "duration": "60s",
        "name": "steady",
        "target": 2
      }
    ],
    "vus": 2
  }
}
```

---

Plan fingerprint: `sha256:9b8bd0e4f2ac0b346b9ae7a2bd292c078270131902dd173ff24739096b1a97d4`
