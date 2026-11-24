# 1. 最初にHorizonDBをデプロイする

[目次](../../README.md) | [English](../en/01-deploy.md)

**目安: 作成開始2分、待機15分程度。** [事前準備](prerequisites.md)を済ませてください。最初にDBを作成し、待機中に[技術解説](architecture.md)を聞きます。初回は管理モデルの利用規約への同意と、必要に応じた構成の再実行に追加時間がかかります。モデルの準備で待機がさらに延びる場合もあります。

## Bicepで作成を開始

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

選択された環境、サブスクリプション、リージョンを確認します。専用リソースグループにHorizonDB PostgreSQL 17、2 vCoreのwriter 1ノード、Container Apps、ACR、Key Vault、Log Analyticsと接続用ネットワークを作成します。HAは短時間の演習用に無効です。通常のPostgreSQL Flexible Serverではありません。

`azd up`は作成からアプリ初期化・配信まで一括実行します。**今回はSQLを自分で学ぶため、`azd provision`でDB作成まで進め、後半で`azd deploy`を実行します。** 実行中に同じ環境の設定を別ターミナルから変更しないでください。

## 初めてHorizonDBをデプロイする場合

**クラスターの作成と、管理AIモデルの利用開始は別の段階です。** 初めて利用する場合は、クラスター作成後にAzure Portalでモデルの利用規約に同意します。既存の利用者でも、同意を求められた場合は同じ操作が必要です。`azd`や本教材のフックは、利用規約に自動で同意しません。

最初の`azd provision`が終了したら、作成されたクラスターで以下を操作します。リソース作成が完了していても、続く`postprovision`のAI Model Management有効化でエラーになる場合があります。これは新しいクラスターをもう一度作る必要がある、という意味ではありません。

1. Azure Portalで、今回作成したHorizonDBクラスターを開きます。
2. **AI Model Manager**を選び、**Enable managed models**にチェックして**Save**を押します。
3. 表示された利用規約を確認し、組織の利用方針に従って同意します。承認できない場合は、AI演習とZavaには進まないでください。

画面の操作は[公式の有効化手順](https://learn.microsoft.com/azure/horizondb/ai/ai-model-management#enable-ai-model-management)も参照してください。同意後、Embedding・チャット・リランカーのモデルがサービスによって自動で用意されます。

**1回目の構成フックが停止していた場合**は、同意後に同じazd環境で再実行します。未同意のまま繰り返しても解消しません。環境を作り直したり、途中で作成されたリソースを削除したりする必要はありません。

```bash
cd "$WORKSHOP_ROOT/zava"
azd provision
```

インフラ作成が完了し、`postprovision`の構成処理だけが失敗したことを確認できている場合は、代わりに`node scripts/hooks.mjs configure`でその処理だけを再開できます。

**`azd provision`を必ず2回実行する仕様ではありません。** 1回目が正常に完了していて、モデルの準備だけを待っている場合は再実行不要です。有効化とモデルの準備完了も別なので、AI演習に入る前に3モデルの登録と状態を確認してください。

## 待機中: 技術解説

`infra/`とazdフックが以下を自動で設定します。Portalで同じリソースを重複作成する必要はありません。

| 設定 | 内容 |
| --- | --- |
| パラメーターグループ | `azure_ai,vector,pg_diskann,pg_textsearch,pg_durable,age`を許可 |
| Preload | `pg_textsearch,pg_durable,age` |
| pool割り当て | 作成後にカスタムグループを割り当て、静的変更が保留中ならRestart |
| AI Model Management | 作成後の更新APIで有効化。利用規約への同意はPortalで手動。既定のEmbedding・チャット・リランカーを使用 |
| DB Firewall | 実行環境の`AZURE_CLIENT_IP`とNAT Gatewayの固定送信元IPv4のみ許可 |
| アプリへのアクセス | 実行環境とブラウザーの`AZURE_HTTP_CLIENT_IP`を許可、HTTPSのみ |
| Key Vaultへの接続 | VNet、Private Endpoint、Private DNSを使い、公開アクセスは無効 |
| 接続設定 | サービスが返すReadWrite endpointを取得。ホスト名は推測しない |
| 秘密情報 | 私有のazd環境ファイルとKey Vault。アプリはアプリ用秘密だけ参照 |

DBを全IPや全Azureサービスに開放せず、TLSの証明書検証も有効にしたまま使います。この構成は、PCまたはCloud ShellからDBへの接続と、ブラウザーからアプリへの公開接続を許可した環境を対象とします。

## 次に進む条件

リソース作成と設定フックが正常に完了したら次の章に進みます。初回の同意でフックが停止した場合は、上記の再開処理も完了させてください。フックがクラスターとpoolの準備、パラメーターの反映、管理モデルの有効化、接続設定を行っています。モデルの準備中でもPostgreSQLの基本操作は先に確認できますが、[AI演習](03-ai.md#1-拡張機能とモデルを確認2分)に入る前に3モデルの登録と状態を確認します。

エラーが出た場合は内容を確認し、解消してから再実行してください。途中までリソースが作成されている場合も、演習を終了する際には[後片付け](05-cleanup.md)が必要です。

次へ: [2. psql接続とPostgreSQLの確認](02-postgresql.md)
