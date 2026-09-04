# llm-learning
Notes, experiments, and resources for learning about large language models

## Browser checks

The acceptance flow runs against the complete static page in Chromium:

```sh
npm install
npx playwright install chromium
npm test
```

The browser suite checks rendered structure, interaction, persistence, and deterministic submission completeness. It does not constitute a human technical review of the curriculum or verify external learner artifacts.

Core-material links can be probed separately with `npm run audit:links`. The command makes HTTP requests and verifies that redirects retain the declared host identity. Network, DNS, TLS, and timeout errors are reported as `UNVERIFIED`, not passed; add `-- --strict` when environment-limited results should fail the command.
