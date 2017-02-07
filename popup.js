var useLogLevelFilters = false;


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
    console.log(this)
    var popup = document.getElementById("log-body");
    var logStart = this.responseText.indexOf("<pre>");
    var logEnd = this.responseText.indexOf("</pre>");
    var logs = this.responseText.substring(logStart, logEnd+6);
    if (document.getElementById("restart-filter").checked){
      serviceStart = logs.lastIndexOf("#######################################");
      if(serviceStart >= 0)
        logs = "<pre>" + logs.substring(serviceStart+39) //get rid of the #######################################
    }
    if(useLogLevelFilters){
      logs = censorLogLevels(logs)
    }
    popup.innerHTML = logs;
  }
}

function censorLogLevels(logs){
  var logLevelCheckboxes = document.getElementsByClassName("log-level-filter");
  var includedLevels = [], excludedLevels = [];
  for (var j = 0; j < logLevelCheckboxes.length; j++){
    if(logLevelCheckboxes[j].checked){
      includedLevels.push(logLevelCheckboxes[j].value);
    }
    else {
      excludedLevels.push(logLevelCheckboxes[j].value);
    }
  }
  var specialIncludes = { //put lines in here if they are special lines we always want to include or exclude them
    "#######################################" : true //include when the service is restarted
  }
  logsByLine = logs.split('\n')
  newLogs = logsByLine[0] + '\n'; //include the first line, it contains the <pre> and info about the log
  var includedPrev = false;
  for (var k = 1; k < logsByLine.length - 1; k++){
    var line = logsByLine[k];
    var include = false;
    for (var i = 0; i < includedLevels.length && include === false; i++){
      if(line.indexOf(includedLevels[i]) > -1){
        include = true;
      }
    }
    if (!include){
      include = includedPrev; //include the line if the previous line was included, as it might be an extension
                              //unless the line contains a log level
      for(var i = 0; i < excludedLevels.length && include === true; i++){
        if(line.indexOf(excludedLevels[i]) > -1){
          include = false;
        }
      }
    }
    if(specialIncludes.hasOwnProperty(line)) {
      include = specialIncludes[line];
    }
    if(include){
      newLogs += (line + '\n');
    }
    includedPrev = include;
  }
  newLogs += logsByLine[logsByLine.length - 1]; //include </pre>
  return newLogs;
}

function toggleLogLevelFilters(){
  useLogLevelFilters = document.getElementById("log-level-filter-show").checked;
  if(useLogLevelFilters){
    document.getElementById("log-level-filter-list").classList.remove("hidden");
  }
  else{
    document.getElementById("log-level-filter-list").classList.add("hidden");
  }
  populateLogs();
}

document.addEventListener('DOMContentLoaded', populateLogs);
document.getElementById("process").addEventListener("change", populateLogs);
document.getElementById("restart-filter").addEventListener("change", populateLogs);
document.getElementById("log-level-filter-list").addEventListener("change", populateLogs);
document.getElementById("log-level-filter-show").addEventListener("change", toggleLogLevelFilters);
