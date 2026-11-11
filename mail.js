
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

async function showAccount(session) {
    const user = session?.user;
    account.hidden = !user;

    if (!user) {
        return;
    }

    userEmail.textContent = user.email ?? "";
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        showMessage("表示名の取得に失敗しました：" + error.message);
        return;
    }

    accountDisplayName.value = data?.display_name ?? "";
}

async function loadSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        showMessage("ログイン状態を確認できませんでした：" + error.message);
        return;
    }

    await showAccount(data.session);
}

// 新規登録
if (signupButton) {
    signupButton.addEventListener("click", async () => {
        const displayName = displayNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!displayName || displayName.length > 40 || !email || password.length < 6) {
            showMessage("表示名、メールアドレス、6文字以上のパスワードを入力してください。");
            return;
        }

        showMessage("登録処理中です...");

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                },
                emailRedirectTo:
                    window.location.origin + "/lostfound/index.html"
            }
        });

        if (error) {
            showMessage("登録エラー：" + error.message);
            return;
        }

        showMessage("登録を受け付けました。メールを確認してください。");
        await showAccount(data.session);
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
        account.hidden = true;
    });
}

if (saveDisplayNameButton) {
    saveDisplayNameButton.addEventListener("click", async () => {
        const displayName = accountDisplayName.value.trim();
        if (!displayName || displayName.length > 40) {
            showMessage("表示名を1〜40文字で入力してください。");
            return;
        }

        const { data: { user }, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !user) {
            showMessage(authError
                ? "ログイン状態を確認できませんでした：" + authError.message
                : "ログインしてください。");
            return;
        }

        const { error } = await supabaseClient
            .from("profiles")
            .upsert(
                { id: user.id, display_name: displayName },
                { onConflict: "id" }
            );

        if (error) {
            showMessage("表示名の保存に失敗しました：" + error.message);
            return;
        }

        showMessage("表示名を保存しました。");
    });
}

loadSession();
