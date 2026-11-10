

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

// 投稿処理
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "投稿中...";

    // ログインユーザーを確認
    const { data: { user }, error: authError } =
        await supabaseClient.auth.getUser();

    if (authError || !user) {
        message.textContent = "ログインしてください。";
        return;
    }

    // 入力内容を取得
    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const foundDate = document.getElementById("found-date").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    // Supabaseにデータを送信
    const { error } = await supabaseClient
        .from("posts")
        .insert({
            user_id: user.id,
            title: title,
            location: location,
            found_date: foundDate,
            category: category,
            description: description
        });

    if (error) {
        message.textContent = "投稿に失敗しました：" + error.message;
    } else {
        message.textContent = "投稿しました！";
        form.reset();
    }
});
