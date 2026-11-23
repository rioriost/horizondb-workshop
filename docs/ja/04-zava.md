# 4. Zava Designer Agentをデプロイして使う

[目次](../../README.md) | [English](../en/04-zava.md)

**目安: 13分。** SQL演習で18商品、Embedding、両インデックス、AGEグラフが完成していることが前提です。最初に作成したHorizonDBとホスティングを使います。

## azdで配信

psqlで`\q`を実行してから:

```bash
cd "$WORKSHOP_ROOT/zava"
azd deploy
```

初期化フックはSQL演習で作った商品・Embedding・グラフを再利用し、アプリ専用の非管理者DBユーザーを設定します。データがまだない場合は、同梱の18商品とEmbedding、検索インデックス、グラフを作成します。

**標準の配信先はContainer Appsです。** ACRでイメージをビルドし、React画面とExpress APIを配信します。ローカルのDockerや、手動でのイメージ作成・pushは不要です。配信後、フックが画面、DB接続、6段階のデザイン処理を確認します。エラーが出た場合は内容を確認してから再実行してください。

単独デモを空の環境から実行する場合は、同じfork内で**`azd up`**を使います。この場合、SQL演習相当の18件データと検索・グラフの準備も自動実行されます。

## アプリを操作

表示されたURLを、許可されたPCの回線から開きます。**Design My Room**を実行し、**Agent Details**で次の実トレースを確認します。

| 段階 | 実行内容 |
| --- | --- |
| 1 | `ai.generate`でテキストからJSONの部屋の要件を生成 |
| 2 | PostgreSQLカタログで列・型・コメントを参照 |
| 3 | `ai.search`でBM25とDiskANNを組み合わせる |
| 4 | AGEの`SIMILAR_TO`を辿って関連商品を追加 |
| 5 | 通常のSQLでカテゴリ・価格・評価をフィルター |
| 6 | `ai.rank`で再順位付けし、予算内で各カテゴリ最大1件を選ぶ |

テーマ、予算、優先カテゴリを変更してRedesignします。APIレスポンスの6段階、商品ID、価格合計を確認し、psqlでも同じ商品の価格を取得してください。予算が低すぎて候補がない場合やモデルの呼び出しに失敗した場合は、エラーが表示されます。

## 「ほぼHorizonDBだけ」の意味

商品、ベクトル、BM25、グラフ、AI関数と前章のDurable Pipelineを同じPostgreSQLにまとめています。別のベクトルDB・検索サービス・グラフDBとの同期は不要です。

ReactとNode.jsはContainer Apps、秘密情報はKey Vault、モデル推論自体は管理されたモデルサービスで動きます。ACRはコンテナーイメージ、Log Analyticsはログの保存に使います。HorizonDBのCPUでLLMを動かすという意味ではありません。Node.jsはSQLの段階制御と最終予算選択を行い、直接モデルSDKを呼びません。

## 上流との違いとデモの制約

上流の固定コミット`74d448cde1066defc62bb17ae999f68ab1cfa9f2`から作る編集可能なローカルforkです。親教材には再現用パッチを同梱し、`npm run prepare:zava`で準備します。GitHub上のforkや、元のread-onlyリポジトリへのpushは不要です。

上流デモの未公開SQLには依存せず、現行の`ai.*` APIと同梱データを使う[本教材のバックエンド](../../app/agent.mjs)に差し替えています。商品候補と実行トレースは実際のDB処理から取得します。

商品は18件の架空データです。写真・商品イラストは静的素材であり、写真解析、画像Embedding、画像生成、100Kデータ、ブランドフィルター、購入は行いません。アーキテクチャ説明と実トレースは区別して表示します。

## App Serviceを選ぶ場合

App Serviceは任意の構成です。事前準備で環境を作成した後、**最初の`azd provision`または`azd up`より前**に設定します。

```bash
azd env set AZURE_HOSTING_TARGET appservice
```

以降の手順は同じです。Linux B1プランとWeb Appを作成し、コンテナーではなくNode.jsのソースを配信します。B1を作成できるクォータが必要です。Key Vaultへのプライベート接続と固定送信元IP用のネットワークは、この構成でも作成します。

デプロイ済みの環境でホスティング先は変更できません。切り替える場合は別の環境名を使い、サブスクリプションとリージョンを設定してください。Container Appsを明示的に選ぶ値は`containerapp`です。

次へ: [5. 後片付け](05-cleanup.md)
