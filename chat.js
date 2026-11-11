
// Supabaseに接続
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
const chatMessages =
    document.getElementById("chat-messages");

const chatForm =
    document.getElementById("chat-form");

const chatStatus =
    document.getElementById("chat-status");

// ログイン状態を確認
async function checkLogin() {
    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error || !data.user) {
        alert("チャットを利用するにはログインが必要です。");
        window.location.href = "mail.html";
        return;
    }

    chatStatus.textContent = "ログイン確認が完了しました。";
}

// 最初にログイン確認を実行
checkLogin();

// まだ送信処理は実装しない
chatForm.addEventListener("submit", function(event) {
    event.preventDefault();

    chatStatus.textContent =
        "メッセージ送信機能は準備中です。";
});
