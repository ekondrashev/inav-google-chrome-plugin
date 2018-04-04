// The Google API javascript client 'gapi'
// with a minimal set of functionality that is Content Security Policy compliant and uses the chrome identity api.
window.gapi = {};
window.gapi.auth = {};
window.gapi.client = {};

var access_token = undefined;

// 
gapi.auth.authorize = function (params, callback) {
    if (typeof callback !== 'function')
        throw new Error('callback required');

    var details = {};
    details.interactive = params.immediate === false || false;
    if (params.accountHint) {
        // Specifying this prevents the account chooser from appearing on Android.
        details.accountHint = params.accountHint;
    }
    var callbackWrapper = function (getAuthTokenCallbackParam) {
        access_token = getAuthTokenCallbackParam;
        // TODO: error conditions?
        if (typeof access_token !== 'undefined')
            callback({ access_token: access_token});
        else
            callback();
    }
    chrome.identity.getAuthToken(details, callbackWrapper);
};



// Awaiting the request and giving the answer
chrome.runtime.onMessage.addListener(function (msg, sender, send_response) {
    if (msg.text === 'save_images') {
        var status = {text: "All selected images are uploaded"};
        send_response(status);
    }
});
