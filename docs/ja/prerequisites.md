# 事前準備（開催前）

[目次](../../README.md) | [English](../en/prerequisites.md)

60分にはアカウント作成、ツールの導入、npmダウンロードを含めません。以下はBash用です。WindowsではWSL2を推奨します。共有PCへのインストールは管理者の承認を得てください。

## Azure・権限・費用

HorizonDB PostgreSQL 17、2 vCore、およびAI Model Management（プレビュー）のEmbedding・チャット・リランカーを利用できるサブスクリプションとリージョンを使います。モデルの利用規約を確認し、同意してから進めてください。このハンズオンでは管理モデルを使うため、個別のモデルデプロイやAPIキーの用意は不要です。

リソースグループの作成・削除と、Managed IdentityへのRBAC割り当てが必要です。Owner、またはContributorとRBAC管理権限を用意します。組織で利用が許可された環境を使ってください。DBとアプリには接続元IPを限定した公開接続を使い、Key VaultにはPrivate Endpointで接続します。

HorizonDB、モデル推論、Container Apps、ACR、Log Analytics、およびNAT Gateway・固定IPv4・Private Endpoint・Private DNSには、それぞれの料金が適用されます。**アプリのレプリカ数が0でも、NAT GatewayやACRなどの料金は発生します。** 無料枠だけで完了するとは限りません。予算を確認し、終了後は必ず[後片付け](05-cleanup.md)を行ってください。

## ツール

| ツール | 用途・導入 |
| --- | --- |
| `psql` 16.15以降 | PostgreSQLクライアント。[ダウンロード](https://www.postgresql.org/download/) |
| Azure CLI (`az`) | 認証・ARM操作。[導入](https://learn.microsoft.com/cli/azure/install-azure-cli) |
| Azure Developer CLI (`azd`) 1.37.1以降 | Bicepによる作成・アプリ配信・削除。[導入](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) |
| Node.js 24以降 / npm | Zavaと初期化フック。[導入](https://nodejs.org/en/download) |
| Git | 教材と編集可能なローカルforkを準備 |
| Webブラウザー | アプリを操作 |

macOSで[Homebrew](https://brew.sh/)を導入済みの場合、必要なCLIツールを次のコマンドでまとめて導入できます。

```bash
brew update
brew install libpq azure-cli node@24 git
brew install azure/azd/azd
export PATH="$(brew --prefix libpq)/bin:$(brew --prefix node@24)/bin:$PATH"
```

`npm`はNode.jsに同梱されています。`libpq`と`node@24`はPATHの追加が必要です。新しいターミナルでも使えるようにする場合は、同じ`export`行をシェルの設定ファイル（zshなら`~/.zshrc`）に追加してください。

WSL2 / Ubuntuでは`sudo apt-get install postgresql-client git`を使い、16.15未満なら公式手順で対応クライアントを導入します。ローカルのPostgreSQLサーバーやDockerは不要です。コンテナーのビルドにはAzure上のACRを使います。

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

両CLIを同じアカウントで認証します。共有環境のグローバル設定や既定サブスクリプションを変更せず、以下で環境ごとに指定できます。

## 教材とローカルfork

教材を取得してルートで実行します。ローカルforkは親Gitから独立し、元のコミットと教材同梱パッチから再現します。上流の未公開SQLやGitHubへのpushは不要です。

```bash
git clone https://github.com/rioriost/horizondb-workshop.git
cd horizondb-workshop
export WORKSHOP_ROOT="$PWD"
npm run prepare:zava
node zava/scripts/hooks.mjs prepare
npm --prefix zava/src/zava-designer-agent-ui-demo run build
cd zava
azd env new '<参加者固有の環境名>'
azd env set AZURE_SUBSCRIPTION_ID '<使用するサブスクリプションID>'
azd env set AZURE_LOCATION '<リージョンID>'
cd "$WORKSHOP_ROOT"
```

環境名は参加者ごとに重複しない名前にします。リージョンには`japaneast`のようなIDを指定します。標準のホスティング先はContainer Appsです。App Serviceを使う場合は、[切り替え方法](04-zava.md#app-serviceを選ぶ場合)に従って最初のデプロイ前に設定してください。

準備スクリプトは既存forkを上書きしません。公開ルートCAを公式配布元から取得し、TLSの証明書・ホスト名検証に使います。デプロイ時に生成するパスワードは`zava/.azure/`の環境ファイルとKey Vaultに保存します。環境ファイルをコミット・画面共有しないでください。

プロバイダー登録が必要な場合は、対象サブスクリプションを指定して管理者に依頼します。標準構成は`Microsoft.HorizonDb`、`Microsoft.App`、`Microsoft.ContainerRegistry`、`Microsoft.Network`、`Microsoft.ManagedIdentity`、`Microsoft.KeyVault`、`Microsoft.OperationalInsights`を使います。App Serviceを選ぶ場合は`Microsoft.Web`も必要です。

PCからTCP 5432と、Azure、GitHub、npm、公開CA配布元へのHTTPSが必要です。IP自動判定には`api.ipify.org`を使います。VPN・会場回線でIPが変わる場合は、事前に`azd env set AZURE_CLIENT_IP '<実際のIPv4>'`で指定します。各参加者が別のクラスターを使用し、実データ・個人の写真・秘密情報を投入しません。

次へ: [1. HorizonDBのデプロイ](01-deploy.md)
