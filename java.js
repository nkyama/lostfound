

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
const account = document.getElementById("account");
const userEmail = document.getElementById("user-email");
const signupButton = document.getElementById("signup");
const logoutButton = document.getElementById("logout");
const loginStatus = document.getElementById("login-status");

// メッセージ表示
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// ログイン状態に合わせて画面を更新
function updateDisplay(session) {
  const user = session?.user;

  if (account) {
    account.hidden = !user;
  }

  if (form) {
    form.hidden = !!user;
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

    showMessage(
      "登録を受け付けました。メールを確認してください。"
    );
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
    showMessage("ログイン状態を確認できませんでした。");

    if (loginStatus) {
      loginStatus.textContent =
        "ログイン状態を確認できませんでした。";
    }

    return;
  }

  updateDisplay(data.session);
}

initialize();

