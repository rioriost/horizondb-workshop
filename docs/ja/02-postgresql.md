# 2. psqlで接続し、PostgreSQLとして使う

[目次](../../README.md) | [English](../en/02-postgresql.md)

**目安: 8分。** writerのread/write endpointと、作成時の管理者ユーザーを使います。

## 接続

教材ルートから、azd環境のReadWrite endpointと管理者を使って接続します。ヘルパーはパスワードを表示・コマンド引数に埋め込まず、TLSの証明書とホスト名を検証します。

```bash
cd "$WORKSHOP_ROOT"
node zava/scripts/psql.mjs
```

以降の`\i`は**psql内**で実行します。Bashコマンドではありません。

```sql
\conninfo
SHOW transaction_read_only;
\i sql/01-postgresql.sql
```

`\conninfo`にTLS接続が表示され、`transaction_read_only`は`off`であることを確認します。スクリプトは`workshop`スキーマを新規作成して[同梱CSV](../../data/products.csv)を`\copy`で取り込みます。`\copy`はPC側のファイルを読み込むため、サーバーにCSVをアップロードする必要はありません。

## 実行したSQLを確認

| 操作 | 観察する結果 |
| --- | --- |
| `SELECT version()` | PostgreSQLのバージョンとHorizonDBのビルド情報 |
| 件数・`GROUP BY` | 全体18件、各カテゴリ3件 |
| `WHERE` / `ORDER BY` | 200 USD以下の椅子を評価順に取得 |
| `jsonb_build_object` | 日本語商品名と価格をJSONBとして取得 |
| `JOIN` | 注文明細2件。小計は360.00と120.00 USD |
| `BEGIN` / `UPDATE` / `DELETE` / `ROLLBACK` | 一時的に190.00へ変えた価格が180.00に戻る |

標準のPostgreSQLクライアント・SQL・型・トランザクションがそのまま使えることを確認できました。数個のクエリだけで全拡張機能や管理権限まで「完全に同じ」と証明するものではありません。マネージドサービスではスーパーユーザー権限や利用可能な拡張に制約があります。

## よくある接続・取り込みエラー

| 症状 | 対応 |
| --- | --- |
| タイムアウト | Firewallの送信元IP、VPN、TCP 5432、クラスター・poolの状態を確認 |
| パスワード認証失敗 | 正しいユーザー名とパスワードを確認。ホスト名にユーザー名を付け足さない |
| 証明書検証失敗 | 公式エンドポイントとルートCAのパス・内容を確認。`sslmode=require`への変更で回避しない |
| read-onlyエラー | read/write endpointに接続し直す |
| CSVが見つからない | `\! pwd`で教材ルートか確認。`\copy`の相対パスはPC側の作業ディレクトリ基準 |
| `schema workshop already exists` | セットアップ済み。再実行せず次章へ進む。不明な既存スキーマを削除しない |
| 文字化け | UTF-8のターミナルを使う。スクリプトはUTF-8取り込みを指定済み |

次へ: [3. AI機能](03-ai.md)。psqlは接続したままにします。
