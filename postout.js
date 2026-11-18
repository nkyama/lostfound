
// 検索に使用するキーワード
let searchKeyword = "";

//カテゴリと日付
let selectedCategory = "";
let sortOrder = "desc";


// Supabase接続情報
const postsSupabaseClient = supabase.createClient(
    "https://safodxqocftrddfnnzfg.supabase.co",
    "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d"
);

// 投稿一覧を取得
async function loadPosts() {
    const postsList = document.getElementById("posts-list");
    const {
        data: { user }
    } = await postsSupabaseClient.auth.getUser();

const { data, error } = await postsSupabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        postsList.textContent = "投稿の取得に失敗しました：" + error.message;
        return;
    }

// 投稿データからカテゴリ候補を作成
const categoryFilter = document.getElementById("category-filter");

const categories = [
    ...new Set(data.map(post => post.category).filter(Boolean))
];

categoryFilter.replaceChildren(new Option("すべて", ""));

categories.sort().forEach(category => {
    categoryFilter.add(new Option(category, category));
});

categoryFilter.value = selectedCategory;


const filteredPosts = data.filter(post => {

    const keyword = searchKeyword.toLowerCase();

    const title = (post.title || "").toLowerCase();
    const location = (post.location || "").toLowerCase();
    const description = (post.description || "").toLowerCase();

    // キーワード検索
    const matchesKeyword =
        title.includes(keyword) ||
        location.includes(keyword) ||
        description.includes(keyword);

    // カテゴリの絞り込み
    const matchesCategory =
        !selectedCategory ||
        post.category === selectedCategory;

    return matchesKeyword && matchesCategory;
});

// 発見日で並び替え
filteredPosts.sort((a, b) => {
    const dateA = a.found_date || "";
    const dateB = b.found_date || "";

    return sortOrder === "desc"
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
});


if (filteredPosts.length === 0) {
    postsList.textContent = searchKeyword
        ? "該当する投稿がありません。"
        : "まだ投稿はありません。";
    return;
}

    // 投稿を画面に表示
    postsList.replaceChildren();

    filteredPosts.forEach(post => {

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
        
        if (user && user.id === post.user_id) {
            deleteButton.addEventListener("click", async () => {
                const ok = confirm(
                    "この投稿を削除しますか？"
                );
                
                if (!ok) return;
                const { error } = await postsSupabaseClient
                    .from("posts")
                    .delete()
            .eq("id", post.id);
                if (error) {
                    alert("削除失敗：" + error.message);
                    return;
                }
                
                card.remove();
                
                alert("削除しました");
            });
            
            info.appendChild(deleteButton);
        }

// 投稿者以外にチャットボタンを表示
if (!user || user.id !== post.user_id) {
    const chatButton = document.createElement("button");

    chatButton.textContent = user
        ? "チャットする"
        : "チャットする";

    chatButton.style.marginTop = "10px";

    chatButton.addEventListener("click", () => {

        // ログインしていない場合
        if (!user) {
            window.location.href = "mail.html";
            return;
        }

        // 投稿IDをチャット画面に渡す
        window.location.href =
            "chat.html?post_id=" + encodeURIComponent(post.id);
    });

    info.appendChild(chatButton);
}

        card.appendChild(info);
        postsList.appendChild(card);
    });
}

// ページ読み込み時に実行
loadPosts();


// 検索ボタン
const searchButton = document.getElementById("search-button");
const searchClearButton = document.getElementById("search-clear-button");
const searchInput = document.getElementById("search-input");

searchButton.addEventListener("click", () => {
    searchKeyword = searchInput.value.trim();
    loadPosts();
});

searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchKeyword = "";
    loadPosts();
});

// Enterキーでも検索できるようにする
searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchKeyword = searchInput.value.trim();
        loadPosts();
    }
});


// カテゴリを変更したとき
document.getElementById("category-filter")
    .addEventListener("change", event => {
        selectedCategory = event.target.value;
        loadPosts();
    });

// 日付順を変更したとき
document.getElementById("sort-order")
    .addEventListener("change", event => {
        sortOrder = event.target.value;
        loadPosts();
    });
