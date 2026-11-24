# 公式資料・出典 / References

[日本語の目次](../README.md) | [English contents](../README.en.md)

仕様確認日 / Specification research date: **2026-11-23**.

| 資料 / Source | 確認事項 / Used for |
| --- | --- |
| [HorizonDB overview](https://learn.microsoft.com/azure/horizondb/overview/overview) | Compute/storage separation, database-as-a-log, endpoints |
| [Create a cluster](https://learn.microsoft.com/azure/horizondb/configure-maintain/quickstart-create-cluster) | Portal settings, PostgreSQL 17, Enable AI features, provisioning estimate |
| [Connect and query](https://learn.microsoft.com/azure/horizondb/connectivity/how-to-connect-query-guide) | PostgreSQL clients, writer and reader endpoints |
| [TLS certificates](https://learn.microsoft.com/azure/horizondb/security/security-tls-how-to-connect) | verify-full, Microsoft RSA 2017 and DigiCert G2 roots |
| [Create parameter groups](https://learn.microsoft.com/azure/horizondb/parameters/how-to-parameter-groups-create) | Custom groups |
| [Load libraries](https://learn.microsoft.com/azure/horizondb/extensions/how-to-load-libraries) | Preload settings and restart semantics |
| [Allow extensions](https://learn.microsoft.com/azure/horizondb/extensions/how-to-allow-extensions) | Extension allow list |
| [AI Model Management](https://learn.microsoft.com/azure/horizondb/ai/ai-model-management) | Preview, managed aliases, endpoints, billing, post-creation Portal enablement and terms acceptance (rechecked 2026-11-24) |
| [AI functions](https://learn.microsoft.com/azure/horizondb/ai/ai-functions) | embed / rank / generate / extract / is_true signatures |
| [AI API migration](https://learn.microsoft.com/azure/horizondb/ai/migrate-ai-schema) | azure_ai 2.5.6 and direct inference versus step builders |
| [Native AI search](https://learn.microsoft.com/azure/horizondb/ai/ai-search) | ctid output, BM25/vector indexes, RRF, reranking, post-filters |
| [Semantic search tutorial](https://learn.microsoft.com/azure/horizondb/ai/build-semantic-search-app) | Embeddings, DiskANN, reranking |
| [Full-text search](https://learn.microsoft.com/azure/horizondb/ai/full-text-search) | pg_textsearch and BM25 |
| [Hybrid SQL patterns](https://learn.microsoft.com/azure/horizondb/ai/hybrid-search) | Filtering during retrieval |
| [AI pipelines](https://learn.microsoft.com/azure/horizondb/ai/ai-pipelines) | Steps, incremental column, asynchronous status, chunk IDs |
| [Apache AGE](https://learn.microsoft.com/azure/horizondb/graph/age-overview) | age preload and Cypher |
| [Container Apps networking](https://learn.microsoft.com/azure/container-apps/networking) | Workload profiles environment, VNet integration and NAT egress |
| [Container Apps managed identity image pull](https://learn.microsoft.com/azure/container-apps/managed-identity-image-pull) | Private ACR images and registry-scoped AcrPull |
| [Key Vault Private Link](https://learn.microsoft.com/azure/key-vault/general/private-link-service) | Private endpoint and private DNS |
| [App Service Key Vault references](https://learn.microsoft.com/azure/app-service/app-service-key-vault-references) | Optional host: managed identity and network-restricted vault access |
| [App Service ZIP deploy](https://learn.microsoft.com/azure/app-service/deploy-zip) | Build automation and ZIP publishing |
| [Node.js App Service quickstart](https://learn.microsoft.com/azure/app-service/quickstart-nodejs) | Node runtime and startup |
| [Configure Node.js on App Service](https://learn.microsoft.com/azure/app-service/configure-language-nodejs) | Linux dependency/build sequence, PORT and npm start |
| [App Service access restrictions](https://learn.microsoft.com/azure/app-service/app-service-ip-restrictions) | Restrict browser/API access to participant IPs |

## Zava upstream / 上流

[Microsoft Build 2026 DEM364 repository](https://github.com/microsoft/Build26-DEM364-simplify-app-dev-with-cloud-native-postgresql-in-azure-horizondb), revision:

```text
74d448cde1066defc62bb17ae999f68ab1cfa9f2
```

[Pinned server source](https://github.com/microsoft/Build26-DEM364-simplify-app-dev-with-cloud-native-postgresql-in-azure-horizondb/blob/74d448cde1066defc62bb17ae999f68ab1cfa9f2/src/zava-designer-agent-ui-demo/server.js)とReact画面のAPI契約を参照しました。教材の説明は新規に作成しています。上流の`LICENSE`はコード用MIT、`LICENSE-DOCS`は文書用CC BY-SA 4.0です。上流の説明文書・商品CSVは教材に転載しません。取得した画面のライセンスを生成アプリ内に`LICENSE-UPSTREAM`として保持します。

The pinned server and React API contract informed the adaptation. Workshop prose and furniture data are original. Upstream code uses MIT; upstream documentation uses CC BY-SA 4.0. Upstream documentation and product CSV are not reproduced. The preparation helper retains the upstream code license as `LICENSE-UPSTREAM`.
