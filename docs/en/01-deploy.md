# 1. Deploy HorizonDB first

[Contents](../../README.en.md) | [日本語](../ja/01-deploy.md)

**Allow two minutes to start and approximately 15 minutes or more to wait.** Complete [prerequisites](prerequisites.md), start database creation, then listen to the [technical briefing](architecture.md). Initial managed-model preparation can extend the wait.

## Start Bicep provisioning

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

Confirm the environment, subscription and region. A dedicated resource group contains HorizonDB PostgreSQL 17, one two-vCore writer, Container Apps, ACR, Key Vault, Log Analytics and networking. HA is disabled for this temporary exercise. This is not PostgreSQL Flexible Server.

`azd up` performs creation, initialization and deployment together. **For learning, stop after `azd provision`, execute SQL yourself, then use `azd deploy` in the application chapter.** Do not modify the same environment concurrently from another terminal.

## While waiting: technical briefing

Bicep and azd hooks automate these settings; do not duplicate resources through the portal.

| Setting | Automation |
| --- | --- |
| Extension allowlist | `azure_ai,vector,pg_diskann,pg_textsearch,pg_durable,age` |
| Preload | `pg_textsearch,pg_durable,age` |
| Parameter assignment | Associate after creation; Restart only for pending static changes |
| AI Model Management | Enable via update API; use managed embedding/chat/reranker aliases |
| Database firewall | Client IPv4 and fixed NAT Gateway outbound IPv4 only |
| Application access | Client IP restriction and HTTPS |
| Key Vault connectivity | VNet, private endpoint and private DNS; public access disabled |
| Endpoint | Read the service-generated cluster ReadWrite hostname |
| Credentials | Private azd environment and Key Vault; app identity reads only its own secret |

Database access is not opened to every IP/Azure service, and TLS validation stays enabled. This configuration requires permitted public client access to the database and application.

## Gate for the next chapter

Continue after successful command completion. Hooks prepare the cluster/pool, apply parameters, enable managed models and configure connectivity. Subsequent SQL exercises check model registration.

Resolve reported errors before retrying. Perform [cleanup](05-cleanup.md) when finishing, including after a partially completed deployment.

Next: [2. Connect with psql](02-postgresql.md)
