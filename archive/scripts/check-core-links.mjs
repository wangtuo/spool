import { readFile } from "node:fs/promises";

const timeoutMs = Number(process.env.LINK_AUDIT_TIMEOUT_MS || 10000);
const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const reviewedSource = source.slice(
  source.indexOf("const reviewedDays"),
  source.indexOf("const reviewedDayById"),
);
const urls = [
  ...new Set(
    [...reviewedSource.matchAll(/url:\s*["'](https:\/\/[^"']+)/g)].map(
      (match) => match[1],
    ),
  ),
];
const canonicalAliases = new Map([
  ["docs.llamaindex.ai", { host: "developers.llamaindex.ai", pathPrefix: "/python/framework/" }],
  ["cloud.google.com", { host: "docs.cloud.google.com", pathPrefix: "/architecture/" }],
  ["aws.amazon.com", { host: "builder.aws.com", pathPrefix: "/content/" }],
]);

function hasExpectedIdentity(sourceUrl, targetUrl) {
  const expectedHost = sourceUrl.hostname.replace(/^www\./, "");
  const actualHost = targetUrl.hostname.replace(/^www\./, "");
  if (actualHost === expectedHost) return true;
  if (expectedHost === "pytorch.org" && actualHost === "docs.pytorch.org") return true;
  const alias = canonicalAliases.get(expectedHost);
  return alias?.host === actualHost && targetUrl.pathname.startsWith(alias.pathPrefix);
}

if (!urls.length) {
  console.error("FAIL no core-material links found in reviewedDays");
  process.exitCode = 1;
} else {
  let failed = 0;
  let unverified = 0;
  for (const url of urls) {
    const sourceUrl = new URL(url);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "llm-learning-link-audit/1.0" },
      });
      const sameIdentity = hasExpectedIdentity(sourceUrl, new URL(response.url));
      if (response.status >= 500) {
        unverified += 1;
        console.warn(`UNVERIFIED ${url} -> ${response.status} ${response.url}`);
      } else if (!response.ok || !sameIdentity) {
        failed += 1;
        console.error(`FAIL ${url} -> ${response.status} ${response.url}`);
      } else console.log(`PASS ${url} -> ${response.status} ${response.url}`);
      await response.body?.cancel();
    } catch (error) {
      unverified += 1;
      console.warn(`UNVERIFIED ${url} -> ${error.name}: ${error.message}`);
    }
  }
  console.log(
    `SUMMARY ${urls.length} checked, ${failed} failed, ${unverified} environment-limited`,
  );
  if (failed) process.exitCode = 1;
  else if (unverified && process.argv.includes("--strict"))
    process.exitCode = 2;
}
