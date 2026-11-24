# 1. Deploy HorizonDB first

[Contents](../../README.en.md) | [日本語](../ja/01-deploy.md)

**Allow two minutes to start and approximately 15 minutes or more to wait.** Complete [prerequisites](prerequisites.md), start database creation, then listen to the [technical briefing](architecture.md). First-time model terms acceptance and any configuration retry take additional time. Managed-model preparation can extend the wait.

## Start Bicep provisioning

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

Confirm the environment, subscription and region. A dedicated resource group contains HorizonDB PostgreSQL 17, one two-vCore writer, Container Apps, ACR, Key Vault, Log Analytics and networking. HA is disabled for this temporary exercise. This is not PostgreSQL Flexible Server.

`azd up` performs creation, initialization and deployment together. **For learning, stop after `azd provision`, execute SQL yourself, then use `azd deploy` in the application chapter.** Do not modify the same environment concurrently from another terminal.

## First-time HorizonDB deployment

**Creating the cluster and starting to use managed AI models are separate stages.** For first-time use, accept model terms in Azure portal after cluster creation. Existing users must also complete this step whenever consent is requested. Neither `azd` nor the workshop hooks automatically accept terms.

After the first `azd provision` finishes, complete the following on the new cluster. Infrastructure creation can succeed while AI Model Management enablement in `postprovision` fails. This does not mean another cluster must be created.

1. Open the newly created HorizonDB cluster in Azure portal.
2. Select **AI Model Manager**, check **Enable managed models**, then select **Save**.
3. Review the displayed terms and accept according to your organization's policy. If acceptance is not approved, do not proceed with AI exercises or Zava.

See the [official enablement procedure](https://learn.microsoft.com/azure/horizondb/ai/ai-model-management#enable-ai-model-management). After acceptance, the service automatically provisions the embedding, chat and reranking models.

**If the first configuration hook failed**, retry in the same azd environment after acceptance. Repeating without accepting terms does not resolve the issue. Do not recreate the environment or delete partially provisioned resources.

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

If you have confirmed that infrastructure creation completed and only the `postprovision` configuration failed, you can instead resume just that work with `node scripts/hooks.mjs configure`.

**Two `azd provision` runs are not inherently required.** If the first run completed successfully and only model preparation remains, wait rather than reprovision. Enablement and model readiness are also separate; check all three model registrations and statuses before the AI exercises.

## While waiting: technical briefing

Bicep and azd hooks automate these settings; do not duplicate resources through the portal.

| Setting | Automation |
| --- | --- |
| Extension allowlist | `azure_ai,vector,pg_diskann,pg_textsearch,pg_durable,age` |
| Preload | `pg_textsearch,pg_durable,age` |
| Parameter assignment | Associate after creation; Restart only for pending static changes |
| AI Model Management | Enable via update API; accept terms manually in portal; use managed embedding/chat/reranker aliases |
| Database firewall | Execution environment's `AZURE_CLIENT_IP` and fixed NAT Gateway outbound IPv4 only |
| Application access | Execution environment and browser `AZURE_HTTP_CLIENT_IP` allowed; HTTPS only |
| Key Vault connectivity | VNet, private endpoint and private DNS; public access disabled |
| Endpoint | Read the service-generated cluster ReadWrite hostname |
| Credentials | Private azd environment and Key Vault; app identity reads only its own secret |

Database access is not opened to every IP/Azure service, and TLS validation stays enabled. This configuration requires public database access from the local terminal or Cloud Shell and public application access from the browser.

## Gate for the next chapter

Continue after infrastructure creation and configuration hooks complete successfully. If first-time consent interrupted the hook, complete the recovery above. Hooks prepare the cluster/pool, apply parameters, enable managed models and configure connectivity. PostgreSQL basics can proceed while models prepare, but check all three registrations and statuses before the [AI exercises](03-ai.md#1-check-extensions-and-models-2-minutes).

Resolve reported errors before retrying. Perform [cleanup](05-cleanup.md) when finishing, including after a partially completed deployment.

Next: [2. Connect with psql](02-postgresql.md)
