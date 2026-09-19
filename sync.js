// =====================================================
// My-Nafshe Cloud Sync
// =====================================================
const SUPABASE_URL = "https://yfwlgqhujhmniaapjdlz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Nc7Ey0UHyVaI_w6AoMnCKg_Xo7PqK4m";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const SYNC_ACCOUNT_KEY = "my-nafshe-sync-account";
const SYNC_STATUS_KEY = "my-nafshe-sync-status";

let syncTimer = null;
let isSyncing = false;

// -----------------------------------------------------
// Anonymous Authentication
// -----------------------------------------------------

async function ensureAnonymousUser() {
    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (session) {
        return session.user;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.signInAnonymously();

    if (error) {
        throw error;
    }

    return data.user;
}


// -----------------------------------------------------
// Local Sync Account
// -----------------------------------------------------

function getSyncAccountId() {
    return localStorage.getItem(SYNC_ACCOUNT_KEY);
}

function setSyncAccountId(id) {
    localStorage.setItem(SYNC_ACCOUNT_KEY, id);
}

function clearSyncAccount() {
    localStorage.removeItem(SYNC_ACCOUNT_KEY);
}


// -----------------------------------------------------
// Sync Status
// -----------------------------------------------------

function setSyncStatus(status) {
    localStorage.setItem(
        SYNC_STATUS_KEY,
        status
    );

    window.dispatchEvent(
        new CustomEvent("my-nafshe-sync-status", {
            detail: status
        })
    );
}

function getSyncStatus() {
    return localStorage.getItem(SYNC_STATUS_KEY) || "off";
}


// -----------------------------------------------------
// Create Sync Account
// -----------------------------------------------------

async function createSyncAccount() {

    const user = await ensureAnonymousUser();

    const response = await supabaseClient.functions.invoke(
        "sync-connect",
        {
            body: {
                action: "create"
            }
        }
    );

    if (response.error) {
        throw response.error;
    }

    const result = response.data;

    if (!result?.success) {
        throw new Error(
            result?.error || "Failed to create Sync Account"
        );
    }

    setSyncAccountId(
        result.syncAccountId
    );

    setSyncStatus("connected");

    return result.syncCode;
}


// -----------------------------------------------------
// Connect Existing Sync Account
// -----------------------------------------------------

async function connectExistingSync(syncCode) {

    await ensureAnonymousUser();

    const response = await supabaseClient.functions.invoke(
        "sync-connect",
        {
            body: {
                action: "connect",
                syncCode: syncCode
            }
        }
    );

    if (response.error) {
        throw response.error;
    }

    const result = response.data;

    if (!result?.success) {
        throw new Error(
            result?.error || "Invalid Sync Code"
        );
    }

    setSyncAccountId(
        result.syncAccountId
    );

    setSyncStatus("connected");

    return true;
}


// -----------------------------------------------------
// Get Cloud Data
// -----------------------------------------------------

async function pullCloudData() {

    const syncAccountId =
        getSyncAccountId();

    if (!syncAccountId) {
        return null;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("sync_data")
        .select("*")
        .eq(
            "sync_account_id",
            syncAccountId
        )
        .single();

    if (error) {
        throw error;
    }

    return data;
}


// -----------------------------------------------------
// Push Cloud Data
// -----------------------------------------------------

async function pushCloudData(appState) {

    const syncAccountId =
        getSyncAccountId();

    if (!syncAccountId) {
        return false;
    }

    const cloud =
        await pullCloudData();

    const currentRevision =
        cloud?.revision ?? 0;

    const nextRevision =
        currentRevision + 1;

    const {
        error
    } = await supabaseClient
        .from("sync_data")
        .update({
            data: appState,
            revision: nextRevision,
            updated_at: new Date().toISOString()
        })
        .eq(
            "sync_account_id",
            syncAccountId
        )
        .eq(
            "revision",
            currentRevision
        );

    if (error) {
        throw error;
    }

    return true;
}


// -----------------------------------------------------
// Full Sync
// -----------------------------------------------------

async function syncNow(appState) {

    if (isSyncing) {
        return;
    }

    if (!navigator.onLine) {
        setSyncStatus("offline");
        return;
    }

    if (!getSyncAccountId()) {
        return;
    }

    try {

        isSyncing = true;

        setSyncStatus("syncing");

        const cloud =
            await pullCloudData();

        if (!cloud) {
            setSyncStatus("connected");
            return;
        }

        // First cloud sync
        if (
            cloud.revision === 0 &&
            Object.keys(cloud.data || {}).length === 0
        ) {

            await pushCloudData(appState);

        } else {

            const localUpdated =
                Number(
                    localStorage.getItem(
                        "my-nafshe-local-revision"
                    ) || 0
                );

            if (
                localUpdated === 0 &&
                cloud.data
            ) {

                // Let the application decide
                // when to import cloud state.

                window.dispatchEvent(
                    new CustomEvent(
                        "my-nafshe-cloud-data",
                        {
                            detail: cloud.data
                        }
                    )
                );

            }
        }

        setSyncStatus("connected");

    } catch (error) {

        console.error(
            "My-Nafshe Sync Error:",
            error
        );

        setSyncStatus("error");

    } finally {

        isSyncing = false;
    }
}


// -----------------------------------------------------
// Debounced Sync
// -----------------------------------------------------

function scheduleSync(appState) {

    clearTimeout(syncTimer);

    syncTimer = setTimeout(() => {

        syncNow(appState);

    }, 1500);
}


// -----------------------------------------------------
// Network Events
// -----------------------------------------------------

window.addEventListener(
    "online",
    () => {

        setSyncStatus(
            getSyncAccountId()
                ? "connected"
                : "off"
        );

        window.dispatchEvent(
            new Event("my-nafshe-sync-online")
        );
    }
);


window.addEventListener(
    "offline",
    () => {

        if (getSyncAccountId()) {
            setSyncStatus("offline");
        }

    }
);


// -----------------------------------------------------
// Public API
// -----------------------------------------------------

window.MyNafsheSync = {

    ensureAnonymousUser,
    createSyncAccount,
    connectExistingSync,

    pullCloudData,
    pushCloudData,

    syncNow,
    scheduleSync,

    getSyncStatus,
    getSyncAccountId,

    clearSyncAccount
};