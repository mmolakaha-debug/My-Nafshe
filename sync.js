const SUPABASE_URL = "https://yfwlgqhujhmniaapjdlz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Nc7Ey0UHyVaI_w6AoMnCKg_Xo7PqK4m";
const SYNC_FUNCTION_NAME = "clever-processor";

// اتصال به Supabase نباید مانع اجرای خود برنامه شود.
// اگر CDN یا اینترنت در دسترس نباشد، بخش همگام‌سازی غیرفعال می‌شود
// ولی تب‌ها و بقیه برنامه همچنان باید کاملاً کار کنند.
let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("Supabase library is unavailable");
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  return supabaseClient;
}

const SYNC_ACCOUNT_KEY = "my-nafshe-sync-account";
const SYNC_STATUS_KEY = "my-nafshe-sync-status";
const LOCAL_REVISION_KEY = "my-nafshe-local-revision";
const LOCAL_DIRTY_KEY = "my-nafshe-local-dirty";

let syncTimer = null;
let isSyncing = false;

async function ensureAnonymousUser() {
  const { data: { session }, error: sessionError } =
    await getSupabaseClient().auth.getSession();

  if (sessionError) throw sessionError;
  if (session) return session.user;

  const { data, error } =
    await getSupabaseClient().auth.signInAnonymously();

  if (error) throw error;
  return data.user;
}

function getSyncAccountId() {
  return localStorage.getItem(SYNC_ACCOUNT_KEY);
}

function setSyncAccountId(id) {
  localStorage.setItem(SYNC_ACCOUNT_KEY, id);
}

function clearSyncAccount() {
  localStorage.removeItem(SYNC_ACCOUNT_KEY);
  localStorage.removeItem(SYNC_STATUS_KEY);
  localStorage.removeItem(LOCAL_REVISION_KEY);
  localStorage.removeItem(LOCAL_DIRTY_KEY);
}

function getSyncStatus() {
  return localStorage.getItem(SYNC_STATUS_KEY) || "off";
}

function setSyncStatus(status) {
  localStorage.setItem(SYNC_STATUS_KEY, status);
  window.dispatchEvent(
    new CustomEvent("my-nafshe-sync-status", { detail: status })
  );
}

function generateSyncCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(12);
  crypto.getRandomValues(values);
  let result = "";

  for (let i = 0; i < values.length; i++) {
    result += chars[values[i] % chars.length];
    if (i === 3 || i === 7) result += "-";
  }

  return result;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function createSyncAccount() {
  const user = await ensureAnonymousUser();

  const syncCode = generateSyncCode();
  const syncCodeHash = await sha256(syncCode);

  const { data: account, error: accountError } = await getSupabaseClient()
    .from("sync_accounts")
    .insert({ sync_code_hash: syncCodeHash })
    .select("id")
    .single();

  if (accountError) throw accountError;

  const { error: memberError } = await getSupabaseClient()
    .from("sync_members")
    .insert({
      sync_account_id: account.id,
      user_id: user.id
    });

  if (memberError) throw memberError;

  const { error: dataError } = await getSupabaseClient()
    .from("sync_data")
    .insert({
      sync_account_id: account.id,
      data: {},
      revision: 0
    });

  if (dataError) throw dataError;

  setSyncAccountId(account.id);
  setSyncStatus("connected");

  return syncCode;
}
async function connectExistingSync(syncCode) {
  if (!syncCode) {
    throw new Error("Sync Code وارد نشده است");
  }

  const user = await ensureAnonymousUser();
  const normalizedCode = syncCode.trim().toUpperCase();
  const syncCodeHash = await sha256(normalizedCode);

  const { data: account, error: accountError } = await getSupabaseClient()
    .from("sync_accounts")
    .select("id")
    .eq("sync_code_hash", syncCodeHash)
    .maybeSingle();

  if (accountError) throw accountError;
  if (!account) throw new Error("Sync Code نامعتبر است");

  const { error: memberError } = await getSupabaseClient()
    .from("sync_members")
    .upsert(
      {
        sync_account_id: account.id,
        user_id: user.id
      },
      { onConflict: "sync_account_id,user_id" }
    );

  if (memberError) throw memberError;

  setSyncAccountId(account.id);
  setSyncStatus("connected");

  return true;
}
async function pullCloudData() {
  const syncAccountId = getSyncAccountId();

  if (!syncAccountId) return null;

  await ensureAnonymousUser();

  const { data, error } = await getSupabaseClient()
    .from("sync_data")
    .select("*")
    .eq("sync_account_id", syncAccountId)
    .single();

  if (error) throw error;

  return data;
}

async function pushCloudData(appState) {
  const syncAccountId = getSyncAccountId();

  if (!syncAccountId) return false;

  await ensureAnonymousUser();

  const cloud = await pullCloudData();
  const currentRevision = cloud?.revision ?? 0;
  const nextRevision = currentRevision + 1;

  const { data, error } = await getSupabaseClient()
    .from("sync_data")
    .update({
      data: appState,
      revision: nextRevision,
      updated_at: new Date().toISOString()
    })
    .eq("sync_account_id", syncAccountId)
    .eq("revision", currentRevision)
    .select()
    .single();

  if (error) throw error;

  if (data) {
    localStorage.setItem(LOCAL_REVISION_KEY, String(data.revision));
    localStorage.removeItem(LOCAL_DIRTY_KEY);
  }

  return !!data;
}

function applyCloudData(cloudData) {
  if (!cloudData) return;

  window.dispatchEvent(
    new CustomEvent("my-nafshe-cloud-data", {
      detail: cloudData
    })
  );
}

async function syncNow(appState, options = {}) {
  if (isSyncing) return;

  if (!navigator.onLine) {
    setSyncStatus("offline");
    return;
  }

  if (!getSyncAccountId()) {
    setSyncStatus("off");
    return;
  }

  try {
    isSyncing = true;
    setSyncStatus("syncing");

    const cloud = await pullCloudData();

    if (!cloud) {
      setSyncStatus("connected");
      return;
    }

    const cloudIsEmpty =
      cloud.revision === 0 &&
      cloud.data &&
      Object.keys(cloud.data).length === 0;

    if (cloudIsEmpty) {
      if (appState) {
        await pushCloudData(appState);
      }
      setSyncStatus("connected");
      return;
    }

    if (options.push === true && appState) {
      await pushCloudData(appState);
      setSyncStatus("connected");
      return;
    }

    if (options.forcePull === true) {
      applyCloudData(cloud.data);
      setSyncStatus("connected");
      return;
    }

    const localRevision = Number(
      localStorage.getItem(LOCAL_REVISION_KEY) || 0
    );

    if (localRevision === 0 && cloud.data) {
      applyCloudData(cloud.data);
    }

    setSyncStatus("connected");
  } catch (error) {
    console.error("My-Nafshe Sync Error:", error);
    setSyncStatus("error");
  } finally {
    isSyncing = false;
  }
}

function scheduleSync(appState) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncNow(appState, { push: true });
  }, 1500);
}

async function pullFromCloud() {
  if (!navigator.onLine) {
    setSyncStatus("offline");
    return false;
  }

  try {
    setSyncStatus("syncing");

    const cloud = await pullCloudData();

    if (!cloud || !cloud.data) {
      setSyncStatus("connected");
      return false;
    }

    applyCloudData(cloud.data);
    setSyncStatus("connected");
    return true;
  } catch (error) {
    console.error("My-Nafshe Pull Error:", error);
    setSyncStatus("error");
    return false;
  }
}

window.addEventListener("online", () => {
  if (getSyncAccountId()) {
    setSyncStatus("connected");
    window.dispatchEvent(new Event("my-nafshe-sync-online"));
  } else {
    setSyncStatus("off");
  }
});

window.addEventListener("offline", () => {
  if (getSyncAccountId()) {
    setSyncStatus("offline");
  }
});

window.MyNafsheSync = {
  ensureAnonymousUser,
  createSyncAccount,
  connectExistingSync,
  pullCloudData,
  pushCloudData,
  pullFromCloud,
  syncNow,
  scheduleSync,
  getSyncStatus,
  getSyncAccountId,
  clearSyncAccount
};

window.addEventListener("my-nafshe-sync-status", (event) => {
  if (event.detail === "connected") {
    // وضعیت فقط برای UI است؛ تغییرات واقعی در save() ارسال می‌شوند.
  }
});
