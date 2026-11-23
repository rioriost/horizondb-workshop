# 5. Cleanup

[Contents](../../README.en.md) | [日本語](../ja/05-cleanup.md)

**Allow two minutes to start; completion takes longer.** Closing the application does not stop charges.

Exit psql with `\q`. Confirm the selected azd environment and that only the new dedicated group is targeted. For Container Apps, also record the managed resource group name with `azd env get-value AZURE_CONTAINER_INFRASTRUCTURE_GROUP`.

```bash
cd "$WORKSHOP_ROOT/zava"
RG="rg-$(azd env get-value AZURE_ENV_NAME)"
SUBSCRIPTION="$(azd env get-value AZURE_SUBSCRIPTION_ID)"
azd down --purge
az group exists --name "$RG" --subscription "$SUBSCRIPTION"
```

Read and approve the deletion prompt, then confirm `false`. Owned resources include HorizonDB, Container Apps, ACR, Log Analytics, Key Vault, NAT Gateway, static IPv4, VNet, Private Endpoint and Private DNS. The optional App Service plan/Web App are also removed if selected.

Verify that the Container Apps-managed group (`ME-...`) disappears too, using the portal or:

```bash
az group exists --name '<recorded-managed-resource-group>' --subscription "$SUBSCRIPTION"
```

Deletion may take additional time. Clean partial resources after a failed deployment too; never delete shared/existing resources.

`--purge` handles Key Vault soft deletion. If organizational policy, locks, authorization or MFA blocks deletion/purge, report the error and retained state to an administrator. Never disable protection policies to bypass them. Check AI Model Management-related resources and billing cessation; cost reporting can lag.

Keep the local fork and source. Treat remaining `zava/.azure/` files as private; never include credentials in source control, logs or screenshots. Do not reuse temporary passwords elsewhere.
