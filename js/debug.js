window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
    alert('Error: ' + errorMsg + '\nScript: ' + url + '\nLine: ' + lineNumber + '\nColumn: ' + column + '\nStackTrace: ' + errorObj);
    return true;
}
