
const { createClient } = supabase;

const SUPABASE_URL =
    "https://safodxqocftrddfnnzfg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// HTMLの要素を取得
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatStatus = document.getElementById("chat-status");

// URLから投稿IDを取得

const params = new URLSearchParams(window.location.search);

const postId = params.get("post_id");
const conversationIdFromUrl = params.get("conversation_id");


// 現在の会話ID
let conversationId = null;

// チャットの初期設定
async function initializeChat() {

    
async function initializeChat() {

    // ログイン確認
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.replace("mail.html");
        return;
    }

    const user = userData.user;

    // チャット一覧から開いた場合
    if (conversationIdFromUrl) {

        if (!/^[1-9]\d*$/.test(conversationIdFromUrl)) {
            chatStatus.textContent = "会話IDが正しくありません。";
            return;
        }

        const { data: conversation, error } =
            await supabaseClient
                .from("conversations")
                .select("id")
                .eq("id", conversationIdFromUrl)
                .single();

        if (error || !conversation) {
            chatStatus.textContent =
                "チャットが見つからないか、閲覧権限がありません。";
            return;
        }

        conversationId = conversation.id;

    } else {

        // 投稿一覧から開いた場合
        if (!postId || !/^[1-9]\d*$/.test(postId)) {
            chatStatus.textContent = "投稿が指定されていません。";
            return;
        }

        const { data: post, error: postError } =
            await supabaseClient
                .from("posts")
                .select("id, user_id")
                .eq("id", postId)
                .single();

        if (postError || !post) {
            chatStatus.textContent = "投稿が見つかりません。";
            return;
        }

        if (post.user_id === user.id) {
            chatStatus.textContent =
                "自分の投稿にはチャットできません。";
            return;
        }

        // 既存の会話を検索
        const { data: existing, error: searchError } =
            await supabaseClient
                .from("conversations")
                .select("id")
                .eq("post_id", post.id)
                .eq("requester_id", user.id)
                .maybeSingle();

        if (searchError) {
            chatStatus.textContent =
                "会話の取得に失敗しました：" + searchError.message;
            return;
        }

        if (existing) {
            conversationId = existing.id;
        } else {

            // 新しい会話を作成
            const { data: created, error: createError } =
                await supabaseClient
                    .from("conversations")
                    .insert({
                        post_id: post.id,
                        owner_id: post.user_id,
                        requester_id: user.id
                    })
                    .select("id")
                    .single();

            if (createError) {
                chatStatus.textContent =
                    "会話の作成に失敗しました：" + createError.message;
                return;
            }

            conversationId = created.id;
        }
    }

    // メッセージ一覧を表示
    chatStatus.textContent = "";
    await loadMessages();
}


// ページを開いたときに実行
initializeChat();


// メッセージ送信機能
chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!conversationId) {
        chatStatus.textContent = "チャットの準備ができていません。";
        return;
    }

    const messageInput = chatForm.querySelector("input");
    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // ログイン中のユーザーを取得
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        chatStatus.textContent = "ログインが必要です。";
        return;
    }

    // Supabaseにメッセージを保存
    const { error } = await supabaseClient
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: userData.user.id,
            content: message
        });

    if (error) {
        chatStatus.textContent =
            "送信に失敗しました：" + error.message;
        return;
    }

    // 送信成功
    messageInput.value = "";
    chatStatus.textContent = "";

    // メッセージ一覧を更新
    await loadMessages();
});

// メッセージ送信機能
chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!conversationId) {
        chatStatus.textContent = "チャットの準備ができていません。";
        return;
    }

    const messageInput = chatForm.querySelector("input");
    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // ログイン中のユーザーを取得
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        chatStatus.textContent = "ログインが必要です。";
        return;
    }

    // Supabaseにメッセージを保存
    const { error } = await supabaseClient
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: userData.user.id,
            content: message
        });

    if (error) {
        chatStatus.textContent =
            "送信に失敗しました：" + error.message;
        return;
    }

    // 送信成功
    messageInput.value = "";
    chatStatus.textContent = "";

    // メッセージ一覧を更新
    await loadMessages();
});


// メッセージ一覧を取得して表示
async function loadMessages() {

    if (!conversationId) return;

    const { data, error } = await supabaseClient
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) {
        chatStatus.textContent =
            "メッセージの取得に失敗しました：" + error.message;
        return;
    }

    const { data: userData } =
        await supabaseClient.auth.getUser();

    const currentUserId = userData.user?.id;

    chatMessages.replaceChildren();

    data.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        if (message.sender_id === currentUserId) {
            messageDiv.classList.add("my-message");
        }

        messageDiv.textContent = message.content;
        chatMessages.appendChild(messageDiv);
    });

    // 一番新しいメッセージまでスクロール
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// 3秒ごとに新しいメッセージを確認
setInterval(async () => {
    if (!conversationId) return;

    await loadMessages();
}, 3000);
