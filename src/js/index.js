
// database actions
import {addMaliciousUrlToDb,createDB} from './database.js';
import {urlInDatabase} from './lookup.js';


async function validate_url(requestDetails) {
    let { url } = requestDetails;
    const redirect_site = chrome.runtime.getURL("src/403.html");

    urlInDatabase(url)
        .then(function (response) {
            console.log("Malicious URls: ", url);
            chrome.tabs.query({ active: true }, function (tab) {
                chrome.tabs.update(tab.id, { url: redirect_site });
            });
        })
        .catch(function (error) {
            console.log("not malicious");
        });
}

function controllerDatabase(alarm) {
    const phishtank_url = "https://data.phishtank.com/data/online-valid.json";

    fetch(phishtank_url, { redirect: 'follow', mode: 'cors' })
        .then(response => response.json())
        .then(json => {
            createDB();
            json.map(function (entry) { addMaliciousUrlToDb(entry["url"]) })
        });
}

chrome.runtime.onInstalled.addListener(() => {
    controllerDatabase()
  });

chrome.alarms.onAlarm.addListener(controllerDatabase);

chrome.webRequest.onBeforeRequest.addListener(validate_url, { urls: ["<all_urls>"] });

chrome.alarms.create('DownloadListOfMaliciousDomains', {
    when: Date.now(),
    periodInMinutes: 60
});

function keepServiceRunning() {
    console.log("keep running")
    setTimeout(keepServiceRunning, 2000);
  }

keepServiceRunning()