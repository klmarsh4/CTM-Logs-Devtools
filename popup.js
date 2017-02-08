var useLogLevelFilters = false;


function populateLogs(){
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    url = getCoreUrl(url);
    var process = document.getElementById("process").value;
    var numLines = document.getElementById("num-lines-input").value;
    var reverse = document.getElementById("reverse-checkbox").checked;
    getLog(url, process, numLines, reverse);
  });
}

function getCurrentTabUrl(callback) {
  chrome.runtime.sendMessage(
    {"tabId":chrome.devtools.inspectedWindow.tabId},
    callback
  );
}

function getCoreUrl(url){
  end = url.indexOf("/",8) + 1;
  return url.substring(0,end);
}

function getLog(coreUrl, service, numLines, reverse){
  var logUrl = coreUrl + "getlog?process=" + service;
  var logUrl = numLines ? logUrl + "&lines=" + numLines : logUrl;
  var logUrl = reverse ? logUrl + "&reverse=" + reverse : logUrl;
  chrome.runtime.sendMessage(
    {"logUrl":logUrl},
      writeLogsToPopup
  );
}

function writeLogsToPopup(resp){
  var popup = document.getElementById("log-body");
  var logStart = resp.indexOf("<pre>");
  var logEnd = resp.indexOf("</pre>");
  var logs = resp.substring(logStart, logEnd+6);
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
    "#######################################" : true,
    "<pre>#######################################" : true,
    "<pre>Traceback (most recent call last):" : true
  }
  logsByLine = logs.split('\n')
  newLogs = ""; //include the first line, it contains the <pre> and info about the log
  var includedPrev = false;
  for (var k = 0; k < logsByLine.length - 1; k++){
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
  if(newLogs.indexOf("<pre>")  < 0){
    newLogs = "<pre>" + newLogs; //<pre> will only be there if first line was included
  }
  newLogs += logsByLine[logsByLine.length - 1]; //always include </pre>
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
document.getElementById("header").addEventListener("change", toggleLogLevelFilters);
document.getElementById("refresh-btn").addEventListener("click", toggleLogLevelFilters);
