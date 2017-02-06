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

function getLog(coreUrl, log){
  logUrl = coreUrl + "getlog?process=" + log
  httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', logUrl, true); //true = asynch
  httpRequest.onreadystatechange = printErrors;
  httpRequest.send(null); //null = get
}

function printErrors(resp){
  if (this.readyState == 4 && this.status == 200) {
    var popup = document.getElementById("popup");
    popup.outerHTML=this.responseText
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    url = getCoreUrl(url);
    getLog(url, "ctm-ui");
  });
});
