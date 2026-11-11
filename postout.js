
// Supabase接続情報
const postsSupabaseClient = supabase.createClient(
    "https://safodxqocftrddfnnzfg.supabase.co",
    "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d"
);

// 投稿一覧を取得
async function loadPosts() {

    const postsList = document.getElementById("posts-list");

    const { data, error } = await postsSupabaseClient
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

        const info = document.createElement("div");
        info.className = "item-info";

        const title = document.createElement("h3");
        title.textContent = post.title;
        
        const status = document.createElement("span");
        status.className = "status";
        status.textContent = "落とし物";

        const location = document.createElement("p");
        location.textContent = "発見場所：" + post.location;

        const date = document.createElement("p");
        date.textContent = "発見日時：" + post.found_date;

        const category = document.createElement("p");
        category.textContent = "カテゴリ：" + post.category;

        const description = document.createElement("p");
        description.textContent = "詳細：" + (post.description || "なし");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.style.marginTop = "10px";
        
        if (post.photo_url) {
            const photo = document.createElement("img");
            photo.src = post.photo_url;
            photo.alt = `${post.title}の写真`;
            photo.loading = "lazy";
            card.appendChild(photo);
        }

        info.append(
            title,
            location,
            date,
            status,
            category,
            description
        );

        card.appendChild(info);
        postsList.appendChild(card);
    });
}

// ページ読み込み時に実行
loadPosts();
