
const chatsClient = supabase.createClient(
    "https://safodxqocftrddfnnzfg.supabase.co",
    "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d"
);

const chatsList = document.getElementById("chats-list");
const chatsStatus = document.getElementById("chats-status");

async function loadChats() {

    // ログイン確認
    const { data: userData, error: userError } =
        await chatsClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.replace("mail.html");
        return;
    }

    document.body.style.visibility = "visible";

    const user = userData.user;

    // 自分が参加している会話を取得
    const { data: conversations, error } =
        await chatsClient
            .from("conversations")
            .select("id, post_id, owner_id, requester_id, created_at")
            .order("created_at", { ascending: false });

    if (error) {
        chatsStatus.textContent =
            "チャットの取得に失敗しました：" + error.message;
        return;
    }

    chatsList.replaceChildren();

    if (conversations.length === 0) {
        chatsStatus.textContent = "まだチャットはありません。";
        return;
    }

    // 会話ごとに表示
    for (const conversation of conversations) {

        const { data: post } = await chatsClient
            .from("posts")
            .select("title")
            .eq("id", conversation.post_id)
            .maybeSingle();

        const card = document.createElement("div");
        card.className = "item";

        const info = document.createElement("div");
        info.className = "item-info";

        const title = document.createElement("h3");
        title.textContent = post?.title || "削除された投稿";

        const role = document.createElement("p");
        role.textContent =
            conversation.owner_id === user.id
                ? "あなたの投稿への問い合わせ"
                : "あなたが問い合わせた投稿";

        const button = document.createElement("button");
        button.textContent = "チャットを開く";

        button.addEventListener("click", () => {
            window.location.href =
                "chat.html?conversation_id=" +
                encodeURIComponent(conversation.id);
        });

        info.append(title, role, button);
        card.appendChild(info);
        chatsList.appendChild(card);
    }
}

loadChats();
