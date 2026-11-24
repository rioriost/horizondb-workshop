# Prerequisites — before attending

[Contents](../../README.en.md) | [日本語](../ja/prerequisites.md)

The hour excludes account creation, tool installation and npm downloads. Commands use Bash; WSL2 is recommended on Windows. Obtain administrator approval before installing on a shared machine.

## Azure, permissions and costs

Use a subscription/region offering HorizonDB PostgreSQL 17, two-vCore capacity and AI Model Management (preview) for embedding, chat and reranking. Review and accept model terms. Managed models require no separate model deployment or API-key setup.

Resource creation/deletion and managed-identity RBAC assignment require Owner, or Contributor plus RBAC administration. Use an organization-approved environment. Database/application public access is restricted to permitted source IPs; Key Vault uses a private endpoint.

HorizonDB, inference, Container Apps, ACR, Log Analytics, NAT Gateway, static IPv4, Private Endpoint and Private DNS have their respective charges. **NAT Gateway, ACR and other infrastructure still incur charges at zero application replicas.** Free allowances may not cover the workshop. Check your budget and perform [cleanup](05-cleanup.md).

## Tools

| Tool | Purpose / installation |
| --- | --- |
| `psql` 16.15+ | PostgreSQL client; [download](https://www.postgresql.org/download/) |
| Azure CLI (`az`) | Authentication/ARM operations; [install](https://learn.microsoft.com/cli/azure/install-azure-cli) |
| Azure Developer CLI (`azd`) 1.37.1+ | Bicep provisioning, deployment and deletion; [install](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) |
| Node.js 24+ / npm | Application and initialization hooks; [install](https://nodejs.org/en/download) |
| Git | Workshop and editable local fork |
| Browser | Use the application |

On macOS with [Homebrew](https://brew.sh/) already installed, install the required CLI tools together:

```bash
brew update
brew install libpq azure-cli node@24 git
brew install azure/azd/azd
export PATH="$(brew --prefix libpq)/bin:$(brew --prefix node@24)/bin:$PATH"
```

Node.js includes npm. Both `libpq` and `node@24` need PATH entries. To keep them available in new terminal sessions, add the same `export` line to your shell configuration file (`~/.zshrc` for zsh).

On WSL2/Ubuntu, install `postgresql-client git`; use the official instructions if the distribution client is older than 16.15. No local PostgreSQL server or Docker is required; ACR builds containers in Azure.

```bash
psql --version
az version
azd version
node --version
npm --version
git --version
az login
azd auth login
```

Authenticate both CLIs with the same account. Configure the environment rather than changing shared global defaults.

## Workshop and local fork

From the workshop root, reconstruct the independent local fork from the pinned upstream commit and included patch. No unpublished SQL or upstream push is needed.

```bash
git clone https://github.com/rioriost/horizondb-workshop.git
cd horizondb-workshop
export WORKSHOP_ROOT="$PWD"
npm run prepare:zava
node zava/scripts/hooks.mjs prepare
npm --prefix zava/src/zava-designer-agent-ui-demo run build
cd zava
azd env new '<unique-participant-environment>'
azd env set AZURE_SUBSCRIPTION_ID '<subscription-id>'
azd env set AZURE_LOCATION '<region-id>'
cd "$WORKSHOP_ROOT"
```

Choose a unique environment name and a region ID such as `japaneast`. Container Apps is the default. To use App Service, [select it](04-zava.md#selecting-app-service) before the first deployment.

Preparation preserves an existing fork and downloads official public root certificates for TLS validation. Deployment-generated passwords remain in private `zava/.azure/` environment files and Key Vault. Never commit or screen-share environment files.

If provider registration is needed, ask an administrator to select the subscription explicitly. The default uses `Microsoft.HorizonDb`, `Microsoft.App`, `Microsoft.ContainerRegistry`, `Microsoft.Network`, `Microsoft.ManagedIdentity`, `Microsoft.KeyVault` and `Microsoft.OperationalInsights`. App Service additionally needs `Microsoft.Web`.

Allow outbound TCP 5432 and HTTPS to Azure, GitHub, npm and certificate distributors. Automatic public-IP discovery uses `api.ipify.org`; set `AZURE_CLIENT_IP` explicitly with `azd env set` when venue/VPN networking requires it. Use separate participant clusters and no real customer data, personal photos or secrets.

Next: [1. Deploy HorizonDB](01-deploy.md)
