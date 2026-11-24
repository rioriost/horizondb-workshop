# 4. Deploy and use Zava Designer Agent

[Contents](../../README.en.md) | [日本語](../ja/04-zava.md)

**Allow 13 minutes.** Finish the 18-product catalog, embeddings, both indexes and AGE graph first. Reuse the HorizonDB and hosting created at the beginning.

## Deploy with azd

Exit psql with `\q`, then:

```bash
cd "$WORKSHOP_ROOT/zava"
azd deploy
```

Initialization reuses the catalog, embeddings and graph from the SQL exercises and configures a non-admin application role. If no data exists yet, it creates the 18-product catalog, embeddings, indexes and graph.

**Container Apps is the default host.** ACR builds the image and deploys the React UI and Express API; no local Docker or manual image push is needed. Post-deployment hooks check the UI, database and real six-stage design request. Resolve reported errors before retrying.

For a standalone demonstration starting from an empty environment, run **`azd up`** in the fork. It also initializes the catalog, search indexes and graph automatically.

## Allow browser HTTPS access

When the command environment and browser have different network addresses, as with Cloud Shell, allow the browser's IPv4 separately. Open the [IPv4 lookup page](https://api.ipify.org) **in the browser that will use Zava**, then set the returned address:

```bash
cd "$WORKSHOP_ROOT/zava"
azd env set AZURE_HTTP_CLIENT_IP '<browser-source-IPv4>'
azd provision
```

Skip this additional step if configured before initial provisioning. After deployment, `azd env set` alone does not update the actual access restrictions; apply with `azd provision`, then reopen the URL. Enter only the IPv4 address; `/32` is added automatically.

To configure access manually in Azure portal, edit `workshop-browser` or add it if absent:

| Host | Portal location | Allow rule |
| --- | --- | --- |
| Container Apps | App → Networking → Ingress → IP Restrictions | `workshop-browser`, Allow, browser IPv4 `/32` |
| App Service | Web App → Networking → Public network access → Access Restrictions (main site) | `workshop-browser`, Allow, priority 101, browser IPv4 `/32` |

Select **Save** after editing in the portal. Also save the same address in `AZURE_HTTP_CLIENT_IP` so the next provision does not revert a portal edit. Keep `workshop-client` for post-deployment checks and deny unmatched IPs. Never open `0.0.0.0/0`. The browser address does not need a database firewall rule.

## Use the application

Open the reported URL from the permitted browser network. For HTTP 403, check the HTTPS restrictions above and the browser's current IPv4. Click **Design My Room**, then inspect **Agent Details**.

| Stage | Actual operation |
| --- | --- |
| 1 | `ai.generate` creates a structured text-only room brief |
| 2 | PostgreSQL catalog inspection |
| 3 | `ai.search` combines BM25 and DiskANN |
| 4 | AGE traversal expands `SIMILAR_TO` neighbors |
| 5 | SQL filters categories, prices and ratings |
| 6 | `ai.rank` reranks; final selection stays within budget with at most one product per category |

Change theme, budget and priorities, then Redesign. Inspect the six-stage response, product IDs and total prices; retrieve matching prices with psql. An insufficient budget or failed model request produces an error.

## Why “almost only HorizonDB”

Products, vectors, BM25, graph, AI functions and the preceding Durable Pipeline share PostgreSQL. No separate vector database, search service or graph database needs synchronization.

React/Node.js run on Container Apps, credentials use Key Vault, and managed services perform model inference. ACR stores images and Log Analytics stores logs. LLMs do not run on the database CPU. Node.js controls SQL stages and final budget selection without direct model SDK calls.

## Upstream differences and demo limitations

The independent editable local fork starts at `74d448cde1066defc62bb17ae999f68ab1cfa9f2`. Reconstruct it using `npm run prepare:zava` and the included source patch. No GitHub-hosted fork or upstream push is necessary.

The [workshop backend](../../app/agent.mjs) uses current `ai.*` APIs and included data rather than unpublished upstream SQL. Product candidates and execution traces come from actual database operations.

The catalog has 18 fictional products. Photos and illustrations are static. Photo analysis, image embeddings/generation, 100K data, brand filtering and purchases are not implemented. Architecture explanations are distinct from actual returned traces.

## Selecting App Service

App Service is optional. After creating the environment during prerequisites, set this **before the first `azd provision` or `azd up`**:

```bash
azd env set AZURE_HOSTING_TARGET appservice
```

The remaining commands are unchanged. This creates a Linux B1 plan and Web App and publishes Node.js source instead of a container. B1 provisioning quota is required. Private Key Vault connectivity and fixed-egress networking are created for this option too.

An already provisioned environment cannot change hosts. Use a new environment name and configure its subscription/region to switch. The explicit Container Apps value is `containerapp`.

Next: [5. Cleanup](05-cleanup.md)
