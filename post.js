

const { createClient } = supabase;

// Supabaseの接続情報
const SUPABASE_URL = "https://safodxqocftrddfnnzfg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// フォームを取得
const form = document.getElementById("post-form");
const message = document.getElementById("message");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photo-preview");
const submitButton = form.querySelector('button[type="submit"]');
const PHOTO_BUCKET = "post-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

photoInput.addEventListener("change", () => {
    const photo = photoInput.files[0];
    message.textContent = "";

    if (!photo) {
        photoPreview.removeAttribute("src");
        photoPreview.hidden = true;
        return;
    }

    if (!photo.type.startsWith("image/")) {
        photoInput.value = "";
        photoPreview.removeAttribute("src");
        photoPreview.hidden = true;
        message.textContent = "画像ファイルを選択してください。";
        return;
    }

    if (photo.size > MAX_PHOTO_SIZE) {
        photoInput.value = "";
        photoPreview.removeAttribute("src");
        photoPreview.hidden = true;
        message.textContent = "写真は5MB以下のファイルを選択してください。";
        return;
    }

    photoPreview.src = URL.createObjectURL(photo);
    photoPreview.hidden = false;
});

// 投稿処理
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const photo = photoInput.files[0];
    if (photo && (!photo.type.startsWith("image/") || photo.size > MAX_PHOTO_SIZE)) {
        message.textContent = "画像ファイル（5MB以下）を選択してください。";
        return;
    }

    submitButton.disabled = true;
    message.textContent = "投稿中...";

    // ログインユーザーを確認
    const { data: { user }, error: authError } =
        await supabaseClient.auth.getUser();

    if (authError || !user) {
        message.textContent = "ログインしてください。";
        submitButton.disabled = false;
        return;
    }

    // 入力内容を取得
    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const foundDate = document.getElementById("found-date").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    let uploadedPhotoPath;
    const post = {
        user_id: user.id,
        title: title,
        location: location,
        found_date: foundDate,
        category: category,
        description: description
    };

    if (photo) {
        uploadedPhotoPath = `${user.id}/${crypto.randomUUID()}`;
        const { error: uploadError } = await supabaseClient.storage
            .from(PHOTO_BUCKET)
            .upload(uploadedPhotoPath, photo, {
                contentType: photo.type,
                upsert: false
            });

        if (uploadError) {
            message.textContent = "写真のアップロードに失敗しました：" + uploadError.message;
            submitButton.disabled = false;
            return;
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from(PHOTO_BUCKET)
            .getPublicUrl(uploadedPhotoPath);
        post.photo_url = publicUrl;
    }

    // Supabaseにデータを送信
    const { error } = await supabaseClient
        .from("posts")
        .insert(post);

    if (error) {
        message.textContent = "投稿に失敗しました：" + error.message;

        if (uploadedPhotoPath) {
            const { error: cleanupError } = await supabaseClient.storage
                .from(PHOTO_BUCKET)
                .remove([uploadedPhotoPath]);
            if (cleanupError) {
                message.textContent += " 写真の削除にも失敗しました：" + cleanupError.message;
            }
        }
    } else {
        message.textContent = "投稿しました！";
        form.reset();
        photoPreview.removeAttribute("src");
        photoPreview.hidden = true;
    }

    submitButton.disabled = false;
});
