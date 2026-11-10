const { createClient } = supabase;

// Supabase接続情報
const SUPABASE_URL = "https://safodxqocftrddfnnzfg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// 投稿一覧を取得
async function loadPosts() {

    const postsList = document.getElementById("posts-list");

    const { data, error } = await supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        postsList.textContent = "投稿の取得に失敗しました：" + error.message;
        return;
    }

    // 投稿がない場合
    if (data.length === 0) {
        postsList.textContent = "まだ投稿はありません。";
        return;
    }

    // 投稿を画面に表示
    postsList.replaceChildren();

    data.forEach(post => {

        const card = document.createElement("div");
        card.className = "item";

        const title = document.createElement("h3");
        title.textContent = post.title;

        const location = document.createElement("p");
        location.textContent = "発見場所：" + post.location;

        const date = document.createElement("p");
        date.textContent = "発見日時：" + post.found_date;

        const category = document.createElement("p");
        category.textContent = "カテゴリ：" + post.category;

        const description = document.createElement("p");
        description.textContent = "詳細：" + (post.description || "なし");

        card.append(
            title,
            location,
            date,
            category,
            description
        );

        postsList.appendChild(card);
    });
}

// ページ読み込み時に実行
document.addEventListener("DOMContentLoaded", loadPosts);