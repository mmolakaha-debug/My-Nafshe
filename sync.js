const SUPABASE_URL = "https://yfwlgqhujhmniaapjdlz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Nc7Ey0UHyVaI_w6AoMnCKg_Xo7PqK4m";
const SYNC_FUNCTION_NAME = "clever-processor";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const SYNC_ACCOUNT_KEY = "my-nafshe-sync-account";
const SYNC_STATUS_KEY = "my-nafshe-sync-status";
const LOCAL_REVISION_KEY = "my-nafshe-local-revision";
const LOCAL_DIRTY_KEY = "my-nafshe-local-dirty";

let syncTimer = null;
let isSyncing = false;

async function ensureAnonymousUser() {
  const { data: { session }, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError) throw sessionError;
  if (session) return session.user;

  const { data, error } =
    await supabaseClient.auth.signInAnonymously();

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

async function invokeSyncFunction(body) {
  const response = await supabaseClient.functions.invoke(
    SYNC_FUNCTION_NAME,
    { body }
  );

  if (response.error) {
    console.error("My-Nafshe Sync Function Error:", response.error);
    throw response.error;
  }

  return response.data;
}

async function createSyncAccount() {
  await ensureAnonymousUser();

  const result = await invokeSyncFunction({
    action: "create"
  });

  if (!result?.success) {
    throw new Error(
      result?.error || "Failed to create Sync Account"
    );
  }

  setSyncAccountId(result.syncAccountId);
  setSyncStatus("connected");

  return result.syncCode;
}

async function connectExistingSync(syncCode) {
  if (!syncCode) {
    throw new Error("Sync Code وارد نشده است");
  }

  await ensureAnonymousUser();

  const result = await invokeSyncFunction({
    action: "connect",
    syncCode: syncCode.trim()
  });

  if (!result?.success) {
    throw new Error(
      result?.error || "Sync Code نامعتبر است"
    );
  }

  setSyncAccountId(result.syncAccountId);
  setSyncStatus("connected");

  return true;
}

async function pullCloudData() {
  const syncAccountId = getSyncAccountId();

  if (!syncAccountId) return null;

  await ensureAnonymousUser();

  const { data, error } = await supabaseClient
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

  const { data, error } = await supabaseClient
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
