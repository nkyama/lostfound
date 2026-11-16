


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


supabaseClient.auth.onAuthStateChange(
    (event, session) => {
        if (event === "SIGNED_OUT") {
            document.body.style.visibility = "hidden";
            window.location.replace("mail.html");
            return;
        }

        updateDisplay(session);
    }
);



async function initialize() {
    const { data, error } =
        await supabaseClient.auth.getUser();

    // ログインしていない場合
    if (error || !data.user) {
        window.location.replace("mail.html");
        return;
    }

    // ログインしている場合<head> 内
    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    updateDisplay(sessionData.session);
    document.body.style.visibility = "visible";
}

initialize();
