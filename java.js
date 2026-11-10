
const { createClient } = supabase;

// Supabaseの管理画面で確認した値に置き換える
const SUPABASE_URL = "https://safodxqocftrddfnnzfg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EDeqdHYI87z397J6B0pZag_0D_WRA9d";

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const account = document.getElementById("account");
const userEmail = document.getElementById("user-email");

function showMessage(text) {
  message.textContent = text;
}

// ログイン状態に合わせて画面を更新
async function updateScreen() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    showMessage("状態を確認できませんでした。");
    return;
  }

  const user = data.session?.user;

  account.hidden = !user;
  form.hidden = !!user;
  userEmail.textContent = user?.email ?? "";
}

// 新規登録
document.getElementById("signup").addEventListener(
  "click",
  async () => {
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
        emailRedirectTo: window.location.origin + "/lostfound/index.html"
      }
    });

    if (error) {
      showMessage("登録エラー：" + error.message);
      return;
    }

    showMessage(
      "登録処理を受け付けました。メール確認が必要な場合は、届いたメールを確認してください。"
    );
  }
);

// ログイン
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

// ログアウト
document.getElementById("logout").addEventListener(
  "click",
  async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      showMessage("ログアウトエラー：" + error.message);
      return;
    }

    showMessage("ログアウトしました。");
    await updateScreen();
  }
);

// メール確認後などの認証状態の変化を反映
supabaseClient.auth.onAuthStateChange(
  (_event, session) => {
    const user = session?.user;

    account.hidden = !user;
    form.hidden = !!user;
    userEmail.textContent = user?.email ?? "";
  }
);

updateScreen();

// トップページにログイン状態を表示する
async function showLoginStatus() {
  const status = document.getElementById("login-status");

  if (!status) return;

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    status.textContent = "ログイン状態を確認できませんでした。";
    return;
  }

  const user = data.session?.user;

  if (user) {
    status.textContent = `ログイン中：${user.email}`;
  } else {
    status.textContent = "ログインしていません。";
  }
}

showLoginStatus();
