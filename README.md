# webサイト制作
忘れ物共有サイト

index.html：トップページ
index.js：ログイン状況表示
mail.html：ログイン画面
mail.js：ログイン処理
post.js：投稿のデータを読み込む
postout.js：投稿のデータを出力
style.css：全体のデザイン
style.js：index.htmlのデザイン

## 写真投稿のSupabase設定

写真付き投稿では、画像をSupabase Storageに保存し、その公開URLを`posts.photo_url`に記録します。Supabaseのプロジェクトで以下を設定してください。

### 1. Storageバケットを作成する

1. Supabaseダッシュボードで対象プロジェクトを開きます。
2. 左メニューの **Storage** を開き、**New bucket** を選択します。
3. バケット名に `post-photos` を入力します。
4. **Public bucket** をオンにします。投稿一覧でログインしていない閲覧者にも写真を表示するためです。
5. ファイルサイズ上限を **5 MB** に設定し、バケットを作成します。
6. MIME typeの許可リストは空欄のままにします。フロントエンドでは画像ファイルのみを受け付けていますが、画像形式を限定すると対応形式が狭まる場合があります。

公開バケット内の写真はURLを知っている人なら誰でも閲覧できます。個人情報や顔、学生証などが写った写真を投稿しないでください。非公開バケットにする場合は、一覧表示処理を署名付きURL方式に変更する必要があります。

### 2. 投稿テーブルに写真URL列を追加する

ダッシュボードの **SQL Editor** で次を実行します。

```sql
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS photo_url text;
```

列はNULLを許可するため、写真なしの既存投稿や新規投稿には影響しません。

### 3. Storageのアクセス許可を設定する

引き続き **SQL Editor** で次を実行します。投稿者は自分のユーザーIDフォルダーに画像をアップロードでき、投稿データの登録に失敗した際の画像削除も自分のフォルダー内に限ってできます。

```sql
CREATE POLICY "Authenticated users can upload their own post photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Authenticated users can delete their own post photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'post-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
```

ポリシー名がすでに使われている場合は、同じポリシーを重複作成せず、**Storage → Policies** で既存の設定を確認してください。`posts`テーブルの投稿・一覧取得に必要なRLSポリシーも別途有効である必要があります。このアプリの既存投稿が使えている場合は、その設定を維持してください。

### 4. 動作を確認する

1. サイトにログインし、投稿ページで5MB以下の画像を選びます。選択後にプレビューが表示されます。
2. 投稿を送信し、成功メッセージが表示されることを確認します。
3. Supabaseの **Storage → post-photos** にユーザーID名のフォルダーと画像ができていることを確認します。
4. トップページの投稿一覧に画像が表示されることを確認します。

写真のアップロードだけ失敗する場合は、バケット名が`post-photos`であること、公開設定、ファイルサイズ上限、および上記のINSERTポリシーを確認してください。画像は上がるが投稿に失敗する場合は、`posts.photo_url`列と、`posts`テーブルのINSERTポリシーを確認してください。写真を付けない投稿は、Storageの設定がなくても従来どおり行えます。
