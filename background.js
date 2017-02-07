console.log("i'm here mama")
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.tabs.get(request.tabId, function(tab){
      sendResponse(tab.url);
    });
    return true;
  }
);
