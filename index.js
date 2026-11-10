


const { createClient } = supabase;

const SUPABASE_URL = "https://safodxqocftrddfnnzfg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const account = document.getElementById("account");
const userEmail = document.getElementById("user-email");
const loginStatus = document.getElementById("login-status");

function updateDisplay(session) {
    const user = session?.user;

    if (account) {
        account.hidden = !user;
    }

    if (userEmail) {
        userEmail.textContent = user?.email ?? "";
    }

    if (loginStatus) {
        loginStatus.textContent = user
            ? `ログイン中：${user.email}`
            : "未ログイン";
    }

    const authLink = document.getElementById("auth-link");

    if (authLink) {
        authLink.textContent = user
            ? "アカウント"
            : "ログイン・新規登録";
    }
}

// ログイン状態の変化を監視
supabaseClient.auth.onAuthStateChange(
    (_event, session) => {
        updateDisplay(session);
    }
);

// 最初にログイン状態を取得
async function initialize() {
    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        if (loginStatus) {
            loginStatus.textContent =
                "ログイン状態を確認できませんでした。";
        }
        return;
    }

    updateDisplay(data.session);
}

initialize();


