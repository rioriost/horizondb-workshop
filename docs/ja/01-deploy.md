# 1. 最初にHorizonDBをデプロイする

[目次](../../README.md) | [English](../en/01-deploy.md)

**目安: 操作2分、待機15分程度。** [事前準備](prerequisites.md)を済ませてください。最初にDBを作成し、待機中に[技術解説](architecture.md)を聞きます。初回の管理モデルの準備などで、待機がさらに延びる場合があります。

## Bicepで作成を開始

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

選択された環境、サブスクリプション、リージョンを確認します。専用リソースグループにHorizonDB PostgreSQL 17、2 vCoreのwriter 1ノード、Container Apps、ACR、Key Vault、Log Analyticsと接続用ネットワークを作成します。HAは短時間の演習用に無効です。通常のPostgreSQL Flexible Serverではありません。

`azd up`は作成からアプリ初期化・配信まで一括実行します。**今回はSQLを自分で学ぶため、`azd provision`でDB作成まで進め、後半で`azd deploy`を実行します。** 実行中に同じ環境の設定を別ターミナルから変更しないでください。

## 待機中: 技術解説

`infra/`とazdフックが以下を自動で設定します。Portalで同じリソースを重複作成する必要はありません。

| 設定 | 内容 |
| --- | --- |
| パラメーターグループ | `azure_ai,vector,pg_diskann,pg_textsearch,pg_durable,age`を許可 |
| Preload | `pg_textsearch,pg_durable,age` |
| pool割り当て | 作成後にカスタムグループを割り当て、静的変更が保留中ならRestart |
| AI Model Management | 作成後の更新APIで有効化し、既定のEmbedding・チャット・リランカーを使用 |
| DB Firewall | PCのIPv4とNAT Gatewayの固定送信元IPv4のみ許可 |
| アプリへのアクセス | PCのIPだけ許可、HTTPSのみ |
| Key Vaultへの接続 | VNet、Private Endpoint、Private DNSを使い、公開アクセスは無効 |
| 接続設定 | サービスが返すReadWrite endpointを取得。ホスト名は推測しない |
| 秘密情報 | 私有のazd環境ファイルとKey Vault。アプリはアプリ用秘密だけ参照 |

DBを全IPや全Azureサービスに開放せず、TLSの証明書検証も有効にしたまま使います。この構成は、PCからDBとアプリへの公開接続を許可した環境を対象とします。

## 次に進む条件

コマンドが成功したら次の章に進みます。フックがクラスターとpoolの準備、パラメーターの反映、管理モデルの有効化、接続設定を行っています。モデルの登録状況は後続のAI演習でSQLから確認します。

エラーが出た場合は内容を確認し、解消してから再実行してください。途中までリソースが作成されている場合も、演習を終了する際には[後片付け](05-cleanup.md)が必要です。

次へ: [2. psql接続とPostgreSQLの確認](02-postgresql.md)
