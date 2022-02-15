export function createDB() {
    const openRequest = indexedDB.open("blocklist");

    console.log("Creating/updating Database")

    openRequest.onerror = function (e) {
        console.log("error")
        console.log(e)
    }
    openRequest.onupgradeneeded = function (e) {
        const thisDb = e.target.result;
        if (!thisDb.objectStoreNames.contains("malicious-urls")) {
            const objectStore = thisDb.createObjectStore("malicious-urls", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("url", "url", { unique: true });
        }
    }
}

export function addMaliciousUrlToDb(url) {
    const openRequest = indexedDB.open("blocklist", 1);

    openRequest.onsuccess = function (e) {
        const db = e.target.result
        const transaction = db.transaction(["malicious-urls"], "readwrite");
        const objectStore = transaction.objectStore("malicious-urls");
        const req = objectStore.add({ url: url });
        transaction.commit();
    }
}

async function deconsteDB() {
    const db = await indexedDB.deconsteDatabase("blocklist");
    db.onerror = function (event) { console.log("error deconsting database"); }
    db.onsuccess = function (event) { console.log("database deconsted") }
    return await db;
}
