export function createDB() {
    let openRequest = indexedDB.open("blocklist");

    console.log("Creating/updating Database")

    openRequest.onerror = function (e) {
        console.log("error")
        console.log(e)
    }
    openRequest.onupgradeneeded = function (e) {
        var thisDb = e.target.result;
        if (!thisDb.objectStoreNames.contains("malicious-urls")) {
            var objectStore = thisDb.createObjectStore("malicious-urls", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("url", "url", { unique: true });
        }
    }
}

export function addMaliciousUrlToDb(url) {
    let openRequest = indexedDB.open("blocklist", 1);

    openRequest.onsuccess = function (e) {
        var db = e.target.result
        var transaction = db.transaction(["malicious-urls"], "readwrite");
        var objectStore = transaction.objectStore("malicious-urls");
        var req = objectStore.add({ url: url });
        req.onsuccess = function () {
            console.log("Data added");
        };
        transaction.commit();
    }
}

async function deleteDB() {
    let db = await indexedDB.deleteDatabase("blocklist");
    db.onerror = function (event) { console.log("error deleting database"); }
    db.onsuccess = function (event) { console.log("database deleted") }
    return await db;
}