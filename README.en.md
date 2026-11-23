# Azure HorizonDB workshop

[日本語 (primary)](README.md) | English (secondary)

**Explore PostgreSQL basics and an AI furniture recommendation app in about 60 minutes.** Start HorizonDB deployment first and use the wait for the technical briefing. Complete the [prerequisites](docs/en/prerequisites.md) before starting.

## Contents / ToC

| Order and time | Content | Outcome |
| --- | --- | --- |
| 1 · 00–05 min | [Deploy HorizonDB](docs/en/01-deploy.md) | Start provisioning |
| Wait · 05–20 min | [Technical briefing](docs/en/architecture.md) | Understand compute/storage separation and AI through SQL |
| 2 · 20–28 min | [Connect with psql and check PostgreSQL](docs/en/02-postgresql.md) | Execute SQL, JOINs, JSONB and transactions |
| 3 · 28–45 min | [AI capabilities](docs/en/03-ai.md) | Embeddings, vector/full-text/hybrid search, reranking, generation, extraction, evaluation, pipelines and graphs |
| 4 · 45–58 min | [Deploy and use Zava Designer Agent](docs/en/04-zava.md) | Deploy to Azure using the same data and inspect real SQL traces |
| 5 · 58–60 min | [Clean up](docs/en/05-cleanup.md) | Delete billable resources |

Times are a guide. Resource creation, deletion and managed-model preparation can take more than 15 minutes, depending on Azure service conditions.

## Prerequisites

You need an Azure subscription with resource-creation and RBAC-assignment permissions, `psql` 17+, Azure CLI (`az`), Azure Developer CLI (`azd`) 1.39.1+, Node.js 24+, npm and Git. See [prerequisites](docs/en/prerequisites.md) for installation, authentication and workshop setup.

Start with `azd provision` to create the database and application infrastructure, then run `azd deploy` after the SQL exercises. For a standalone demo, run `azd up` in the prepared local `zava/` fork.

**Azure Container Apps is the default host.** Azure Container Registry builds the image remotely; local Docker is unnecessary. The [application chapter](docs/en/04-zava.md) also explains how to select App Service.

## Included data and application

The repository includes [18 fictional furniture products](data/products.csv) and [executable SQL](sql/01-postgresql.sql): six categories, three styles and USD prices. Ratings are invented, not endorsements. Search descriptions are English; display names are Japanese and English.

Zava reuses the React UI from the [Microsoft Build 2026 repository](https://github.com/microsoft/Build26-DEM364-simplify-app-dev-with-cloud-native-postgresql-in-azure-horizondb). The [workshop backend](app/agent.mjs) calls real HorizonDB functions and managed models, combining vectors, full-text search and graph data in one database. Read the [differences and limitations](docs/en/04-zava.md#upstream-differences-and-demo-limitations).

## License and references

Workshop Markdown, code, fictional data and the sample SVG are [MIT licensed](LICENSE). Upstream code and assets retain their own licenses. [Official references](docs/references.md) / [Instructor guide](docs/en/instructor.md). Specifications checked: **2026-11-23**.
