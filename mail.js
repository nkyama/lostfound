

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
const loginArea = document.getElementById("login-area");
const displayNameInput = document.getElementById("display-name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const signupButton = document.getElementById("signup");
const logoutButton = document.getElementById("logout");
const account = document.getElementById("account");
const userEmail = document.getElementById("user-email");
const accountDisplayName = document.getElementById("account-display-name");
const saveDisplayNameButton = document.getElementById("save-display-name");

// メッセージ表示
function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// ログイン状態に応じて画面を切り替える


async function updateScreen() {
    const { data: { user }, error } =
        await supabaseClient.auth.getUser();

    if (error && !user) {
        console.warn("ログイン状態の確認:", error.message);
    }

    if (user) {
        // ログイン中
        loginArea.hidden = true;
        account.hidden = false;

        userEmail.textContent = user.email;

        // 保存済みの表示名を表示
        accountDisplayName.value =
            user.user_metadata?.display_name || "";

        // 不要なメッセージを消す
        showMessage("");

    } else {
        // 未ログイン
        loginArea.hidden = false;
        account.hidden = true;

        userEmail.textContent = "";
        accountDisplayName.value = "";

        showMessage("");
    }
}


// ログイン
if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // 新潟大学メールアドレス以外を拒否
        if (!email.endsWith("@mail.cc.niigata-u.ac.jp")) {
            showMessage("新潟大学のメールアドレスのみ利用できます。");
            return;
        }

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

        window.location.href = "index.html";
    });
}


// 表示名を保存
saveDisplayNameButton.addEventListener("click", async () => {

    const displayName = accountDisplayName.value.trim();

    if (!displayName) {
        showMessage("表示名を入力してください。");
        return;
    }

    saveDisplayNameButton.disabled = true;

    const { error } = await supabaseClient.auth.updateUser({
        data: {
            display_name: displayName
        }
    });

    saveDisplayNameButton.disabled = false;

    if (error) {
        showMessage("保存エラー：" + error.message);
        return;
    }

    showMessage("");
});

// ログアウト
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            showMessage("ログアウトエラー：" + error.message);
            return;
        }

        showMessage("ログアウトしました。");
        await updateScreen();
    });
}

// 新規登録
if (signupButton) {
    signupButton.addEventListener("click", async () => {

        const displayName = displayNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // 新潟大学メールアドレスのみ許可
        if (!email.endsWith("@mail.cc.niigata-u.ac.jp")) {
            showMessage("新潟大学のメールアドレスのみ登録できます。");
            return;
        }

        if (!displayName) {
            showMessage("表示名を入力してください。");
            return;
        }

        showMessage("登録処理中です...");

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                }
            }
        });

        if (error) {
            showMessage("登録エラー：" + error.message);
            return;
        }

        showMessage("確認メールを送信しました。メールを確認してください。");
    });
}

// ログイン状態の変化を監視
supabaseClient.auth.onAuthStateChange(() => {
    updateScreen();
});

// ページを開いたときにログイン状態を確認
updateScreen();
