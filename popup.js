function populateLogs(){
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    url = getCoreUrl(url);
    var process = document.getElementById("process")
    getLog(url, process.value);
  });
}

function getCurrentTabUrl(callback) {

  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

function getCoreUrl(url){
  end = url.indexOf("/",8) + 1;
  return url.substring(0,end);
}

function getLog(coreUrl, service){
  var logUrl = coreUrl + "getlog?process=" + service
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', logUrl, true); //true = async
  httpRequest.onreadystatechange = writeLogsToPopup;
  httpRequest.send(null); //null = get
}

function writeLogsToPopup(resp){
  if (this.readyState == 4 && this.status == 200) {
    var popup = document.getElementById("log_body");
    var logStart = this.responseText.indexOf("<pre>");
    var logEnd = this.responseText.indexOf("</pre>");
    var logs = this.responseText.substring(logStart, logEnd+6);
    popup.innerHTML = logs;
  }
}

document.addEventListener('DOMContentLoaded', populateLogs);
document.getElementById("process").addEventListener("change", populateLogs);
