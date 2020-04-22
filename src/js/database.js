function url_in_database (url){
    let storeName = "blocklist";
    return new Promise(
        function(resolve, reject) {
            var dbRequest = indexedDB.open(storeName);

            dbRequest.onerror = function(event) {
                reject(Error("Error text"));
            };

            dbRequest.onupgradeneeded = function(event) {
                // Objectstore does not exist. Nothing to load
                event.target.transaction.abort();
                reject(Error('Not found'));
            };

            dbRequest.onsuccess = function(event) {
                var database      = event.target.result;
                var transaction   = database.transaction(["malicious-urls"]);
                var objectStore   = transaction.objectStore("malicious-urls");
                var index = objectStore.index("url");
                var rangeTest = IDBKeyRange.only(url);
                var objectRequest = index.openCursor(rangeTest)

                objectRequest.onerror = function(event) {
                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function(event) {
                    if (objectRequest.result) resolve(objectRequest.result);
                    else reject(Error('object not found'));
                };
            };
        }
    );
}

function addData(url) {
    openRequest = indexedDB.open("blocklist",1);

    openRequest.onsuccess = function(e) {
        var db = e.target.result
        var transaction = db.transaction(["malicious-urls"], "readwrite");
        var objectStore = transaction.objectStore("malicious-urls");
        var req = objectStore.add({url:url});
        req.onsuccess = function() {
            console.log("Data added");
        };
    }
}

async function deleteDB(){
    let db = await indexedDB.deleteDatabase("blocklist");
    db.onerror = function (event) { console.log("error deleting database");}
    db.onsuccess = function (event) { console.log("database deleted")}
    return await db;
}

function createDB(){
    let result = false;
    openRequest = indexedDB.open("blocklist");

    openRequest.onupgradeneeded = function(e) {
        var thisDb = e.target.result;
        if(!thisDb.objectStoreNames.contains("malicious-urls")) {
            var objectStore = thisDb.createObjectStore("malicious-urls", { keyPath: "id", autoIncrement:true });  
            objectStore.createIndex("url","url", {unique:true});		            
            result = true;
        }
    }
}
