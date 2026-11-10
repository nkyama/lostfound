
const { createClient } = supabase;

// Supabaseの接続情報
const SUPABASE_URL = "https://safodxqocftrddfnnzfg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// HTML要素を取得
const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const signupButton = document.getElementById("signup");
const logoutButton = document.getElementById("logout");

// メッセージ表示
function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// 新規登録
if (signupButton) {
    signupButton.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || password.length < 6) {
            showMessage("メールアドレスと6文字以上のパスワードを入力してください。");
            return;
        }

        showMessage("登録処理中です...");

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo:
                    window.location.origin + "/lostfound/index.html"
            }
        });

        if (error) {
            showMessage("登録エラー：" + error.message);
            return;
        }

        showMessage("登録を受け付けました。メールを確認してください。");
    });
}

// ログイン
if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        showMessage("ログイン処理中です...");

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            showMessage("ログインエラー：" + error.message);
            return;
        }

        showMessage("ログインしました！");
        window.location.href = "index.html";
    });
}

// ログアウト
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            showMessage("ログアウトエラー：" + error.message);
            return;
        }

        showMessage("ログアウトしました。");
    });
}
