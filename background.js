console.log("masma       ");
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.tabId){
      chrome.tabs.get(request.tabId, function(tab){
        sendResponse(tab.url);
      });
      return true;
    }
    else {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', request.logUrl, true); //true = async
      httpRequest.onreadystatechange = function(resp){
        if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText)
          sendResponse(this.responseText)
        }
      };
      httpRequest.send(null); //null = get
      return true;
    }
  }
);
