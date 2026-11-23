# Instructor guide: rehearse before delivery

[Contents](../../README.en.md) | [日本語](../ja/instructor.md)

Container Apps is the default. Rehearse provisioning, SQL, application use and cleanup in the delivery environment, with the required region, permissions, quotas and organizational policies.

Verify subscription, budget, permissions, region, two-vCore capacity and AI Model Management eligibility. In the actual environment, confirm `azure_ai >= 2.5.6`, native `ai.search` with `ctid` output, six extensions and three models. Configurations requiring unpublished Build-demo helpers are out of scope.

On an empty dedicated cluster, execute SQL 01–07 and inspect 08. Expect 18 embeddings of 1536 dimensions, both indexes, a completed pipeline with three output rows and 18 graph products. Check Health, then actually click Design My Room and verify six live trace stages, model responses, prices within budget and no mock-success behavior on failures.

Rehearse venue-network TLS, database firewalls, application IP restrictions, fixed NAT egress and private Key Vault connectivity. Run `azd up` from an empty environment, then `azd down --purge`; verify the dedicated group, Container Apps-managed group and deleted vault are gone. For teaching, use `azd provision` → SQL exercises → `azd deploy`, with npm preparation completed beforehand. Measure creation, restarts, model readiness, deployment and inference.

Keep a **separate instructor-owned lab cluster** ready for provisioning overruns. Do not claim participants completed deployment if switching to it. Never run participant DDL concurrently against a shared schema; use an instructor read-only demonstration or separate environments. Resolve unavailable AI capabilities before delivery rather than substituting mocks. If only app deployment is slow, use the local frontend/backend while verifying Azure completion separately later.

Regional prices, quotas and response times vary. Assign someone to monitor resource deletion until completion.

For repository changes, run:

```bash
npm install
npm test
npm run prepare:zava
node --test zava/tests/deployment.test.mjs
az bicep build --file zava/infra/main.bicep --stdout >/dev/null
```

There are eight standard-SQL/application/link tests and eight deployment-helper tests. Also verify the React build, Bicep, azd configuration/packages and live environment. [Sources and pinned version](../references.md)
