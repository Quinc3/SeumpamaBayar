// ==================== LOCALSTORAGE HELPER ====================

const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Inisialisasi data awal
if (!Storage.get('saldo')) {
    Storage.set('saldo', 1250000);
}

if (!Storage.get('riwayat')) {
    Storage.set('riwayat', []);
}

if (!Storage.get('sppData')) {
    Storage.set('sppData', sppData);
}