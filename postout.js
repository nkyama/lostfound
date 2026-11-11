
// Supabase接続情報
const postsSupabaseClient = supabase.createClient(
    "https://safodxqocftrddfnnzfg.supabase.co",
    "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d"
);

const postsMessage = document.getElementById("posts-message");

// 投稿一覧を取得
async function loadPosts() {

    const postsList = document.getElementById("posts-list");
    postsMessage.textContent = "";

    const { data, error } = await postsSupabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        postsList.textContent = "投稿の取得に失敗しました：" + error.message;
        return;
    }

    const userIds = [...new Set(data.map(post => post.user_id).filter(Boolean))];
    let profilesById = new Map();

    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await postsSupabaseClient
            .from("profiles")
            .select("id, display_name")
            .in("id", userIds);

        if (profilesError) {
            postsMessage.textContent =
                "投稿者情報の取得に失敗しました：" + profilesError.message;
        } else {
            profilesById = new Map(
                profiles.map(profile => [profile.id, profile.display_name])
            );
        }
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

        const poster = document.createElement("p");
        poster.textContent = "投稿者：" + (
            profilesById.get(post.user_id) || "表示名未設定"
        );

        info.append(
            title,
            location,
            date,
            status,
            category,
            description,
            poster
        );

        card.appendChild(info);
        postsList.appendChild(card);
    });
}

// ページ読み込み時に実行
loadPosts();