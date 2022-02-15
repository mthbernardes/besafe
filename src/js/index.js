// database actions
import { addMaliciousUrlToDb, createDB } from "./database.js";
import { urlInDatabase } from "./lookup.js";


async function validateUrl(requestDetails) {
    const { url } = requestDetails;
    const redirect_site = chrome.runtime.getURL("src/403.html");

    urlInDatabase(url)
        .then((response) => {
            console.log("Malicious URls: ", url);
            chrome.tabs.query({ active: true }, (tab) => {
                chrome.tabs.update(tab.id, { url: redirect_site });
            });
        })
        .catch((error) => false);
}

function controllerDatabase(alarm) {
    const phishtank_url = "https://180s-public.s3.us-east-2.amazonaws.com/infosec/phishing/database.json";
    chrome.action.setBadgeText({ text: "..." });

    fetch(phishtank_url, { redirect: "follow", mode: "cors" })
        .then(response => response.json())
        .then(json => {
            createDB();
            json.map((entry) => { addMaliciousUrlToDb(entry["url"]) })
        }).then(_ => chrome.action.setBadgeText({ text: "" }));
}

chrome.runtime.onInstalled.addListener(() => {
    controllerDatabase()
});

chrome.alarms.onAlarm.addListener(controllerDatabase);

chrome.webRequest.onBeforeRequest.addListener(validateUrl, { urls: ["<all_urls>"] });

chrome.alarms.create("DownloadListOfMaliciousDomains", {
    when: Date.now(),
    periodInMinutes: 60
});

function keepServiceRunning() {
    setTimeout(keepServiceRunning, 2000);
}

keepServiceRunning();
