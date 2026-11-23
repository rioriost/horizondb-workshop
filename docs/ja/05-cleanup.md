# 5. 後片付け

[目次](../../README.md) | [English](../en/05-cleanup.md)

**目安: 開始2分。削除完了まで追加の時間がかかります。** アプリを閉じるだけでは課金は止まりません。

psqlは`\q`で終了します。同じazd環境が選択されていることと、今回の専用リソースグループだけが対象であることを確認してください。Container Appsを使った場合は、`azd env get-value AZURE_CONTAINER_INFRASTRUCTURE_GROUP`で管理用リソースグループ名も控えておきます。

```bash
cd "$WORKSHOP_ROOT/zava"
RG="rg-$(azd env get-value AZURE_ENV_NAME)"
SUBSCRIPTION="$(azd env get-value AZURE_SUBSCRIPTION_ID)"
azd down --purge
az group exists --name "$RG" --subscription "$SUBSCRIPTION"
```

削除対象と確認プロンプトを読み、承認します。最後の結果が`false`になることを確認してください。対象はHorizonDB、Container Apps、ACR、Log Analytics、Key Vault、NAT Gateway、固定IPv4、VNet、Private Endpoint、Private DNSです。App Serviceを選んだ場合は、そのプランとWeb Appも削除対象です。

Container Appsが作成した管理用グループ（`ME-...`）も、Azure Portalまたは次のコマンドで削除完了を確認します。削除には追加の時間がかかる場合があります。

```bash
az group exists --name '<控えた管理用リソースグループ名>' --subscription "$SUBSCRIPTION"
```

作成途中で失敗した場合も、既に作成された対象を削除します。共有・既存リソースを削除してはいけません。

Key Vaultのsoft deleteをpurgeするため`--purge`を指定しています。組織でpurgeが禁止される場合、ロックや権限・MFAで削除できない場合は、エラーと残存状態を管理者に伝えます。保護ポリシーを無効にして回避しません。AI Model Managementが管理する関連リソースと課金停止も確認します。請求反映には遅延があります。

ローカルforkと教材ソースは残します。`zava/.azure/`に残る環境情報・パスワードは私有ファイルとして管理し、ログ・スクリーンショット・ソース管理に含めません。一時パスワードを別用途に使い回しません。
