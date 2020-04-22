const phishtank_url = 'https://data.phishtank.com/data/online-valid.json'

async function validate_url (requestDetails){
    let {url} = requestDetails

    let notificationOpts = {
        iconUrl: 'imgs/icon.png', 
        type: 'basic', 
        title:'Site Blocked', 
        message:'Ops you tried to access a malicious website.'
    }

    url_in_database(url)
        .then(function (reponse) {
            console.log("Malicious URls: ",url);
            chrome.notifications.create('blocked',notificationOpts)
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.remove(tab.id, function() { });
            });
        })
        .catch(function (error) {
            console.log("not malicious");
        })
}

chrome.webRequest.onBeforeRequest.addListener( validate_url , {urls: ["http://*/*","https://*/*"]});

chrome.alarms.create('DownloadListOfMaliciousDomains', {
    when: Date.now(),
    periodInMinutes: 60
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    fetch(phishtank_url,{redirect: 'follow', mode: 'cors'})
        .then(response => response.json())
        .then(json => {
            deleteDB()
            createDB()
            json.map(function (entry) { addData(entry["url"]) })
        });
});
