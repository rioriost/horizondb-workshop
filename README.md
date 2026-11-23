# Azure HorizonDB ハンズオン

[English](README.en.md) | 日本語（プライマリ）

**約60分を目安に、PostgreSQLの基本操作からAIを使った家具推薦アプリまで体験します。** 最初にHorizonDBのデプロイを開始し、待ち時間に技術解説を行います。[事前準備](docs/ja/prerequisites.md)を済ませてから、最初の手順に進んでください。

## コンテンツ / ToC

| 順番・時間 | コンテンツ | 到達点 |
| --- | --- | --- |
| 1 · 00–05分 | [HorizonDBのデプロイ](docs/ja/01-deploy.md) | 作成を開始する |
| 待機 · 05–20分 | [技術解説](docs/ja/architecture.md) | コンピュートとストレージの分離、SQLで使えるAI機能を理解する |
| 2 · 20–28分 | [psql接続とPostgreSQLの確認](docs/ja/02-postgresql.md) | SQL・JOIN・JSONB・トランザクションを実行する |
| 3 · 28–45分 | [AI機能](docs/ja/03-ai.md) | Embedding生成、ベクトル・全文・ハイブリッド検索、リランク、生成、抽出、評価、パイプライン、グラフ |
| 4 · 45–58分 | [Zava Designer Agentのデプロイと操作](docs/ja/04-zava.md) | 同じデータを使うアプリをAzureに公開し、実際のSQLトレースを確認する |
| 5 · 58–60分 | [後片付け](docs/ja/05-cleanup.md) | 課金対象リソースを削除する |

時間は進行の目安です。リソースの作成・削除や管理AIモデルの準備には、Azureの状況によって15分以上かかる場合があります。

## 事前準備

必要なものは、Azureサブスクリプションとリソース作成・RBAC割り当ての権限、`psql` 17以降、Azure CLI (`az`)、Azure Developer CLI (`azd`) 1.39.1以降、Node.js 24以降、npm、Gitです。導入と認証、教材の取得は[事前準備の手順](docs/ja/prerequisites.md)にまとめています。

ハンズオンでは、最初に`azd provision`でDBとアプリの実行基盤を作成し、SQL演習の後に`azd deploy`でアプリを公開します。アプリだけを一括で試す場合は、準備したローカルforkの`zava/`で`azd up`を実行します。

**アプリの標準構成はAzure Container Appsです。** コンテナーはAzure Container Registryでビルドするため、ローカルのDockerは不要です。App Serviceを選ぶ方法は[アプリの手順](docs/ja/04-zava.md)に記載しています。

## 同梱データとアプリ

[架空の家具18件](data/products.csv)と[実行用SQL](sql/01-postgresql.sql)は本リポジトリに同梱しています。商品は6カテゴリ×3スタイル、価格はUSDです。実在する商品の広告・評価ではありません。検索用説明は英語、表示用商品名は日本語と英語です。

Zavaは[Microsoft Build 2026のリポジトリ](https://github.com/microsoft/Build26-DEM364-simplify-app-dev-with-cloud-native-postgresql-in-azure-horizondb)のReact画面を使い、[本教材のバックエンド](app/agent.mjs)から実際のHorizonDBと管理AIモデルを呼び出します。ベクトル検索・全文検索・グラフを同じDBにまとめる構成を体験できます。[上流との違いとデモの制約](docs/ja/04-zava.md#上流との違いとデモの制約)も確認してください。

## ライセンスと参照

本教材のMarkdown・コード・架空データ・サンプルSVGは[MIT](LICENSE)です。上流のコード・画像等には、それぞれのライセンスが適用されます。[公式資料・出典](docs/references.md) / [講師向けガイド](docs/ja/instructor.md)。仕様確認日: **2026-11-23**。
