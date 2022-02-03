const phishtank_url = "https://data.phishtank.com/data/online-valid.json";
const redirect_site = chrome.runtime.getURL("src/403.html");

async function validate_url(requestDetails) {
    let { url } = requestDetails;

    url_in_database(url)
        .then(function (reponse) {
            console.log("Malicious URls: ", url);
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.update(tab.id, {url: redirect_site});
            });
        })
        .catch(function (error) {
            console.log("not malicious");
        });
}

chrome.webRequest.onBeforeRequest.addListener(validate_url, { urls: ["http://*/*", "https://*/*"] });

chrome.alarms.create('DownloadListOfMaliciousDomains', {
    when: Date.now(),
    periodInMinutes: 60
});

chrome.alarms.onAlarm.addListener(function (alarm) {
    fetch(phishtank_url, { redirect: 'follow', mode: 'cors' })
        .then(response => response.json())
        .then(json => {
            createDB()
            json.map(function (entry) { addData(entry["url"]) })
        });
});