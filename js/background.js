// The Google API javascript client 'gapi'
// with a minimal set of functionality that is Content Security Policy compliant and uses the chrome identity api.
window.gapi = {};
window.gapi.auth = {};
window.gapi.client = {};

var access_token = undefined;
var status_msg = undefined;

// Authorization method in Google services
gapi.auth.authorize = function (params, callback) {
    if (typeof callback !== 'function')
        throw new Error('callback required');

    var details = {};
    details.interactive = params.immediate !== false || false;
    if (params.accountHint) {
        // Specifying this prevents the account chooser from appearing on Android.
        details.accountHint = params.accountHint;
    }
    var callbackWrapper = function (getAuthTokenCallbackParam) {
        access_token = getAuthTokenCallbackParam;
        // TODO: error conditions?
        if (typeof access_token !== 'undefined')
            callback({access_token: access_token});
        else
            callback();
    }
    chrome.identity.getAuthToken(details, callbackWrapper);
};

// Google API request method
gapi.client.request = function(args) {
    if (typeof args !== 'object')
        throw new Error('args required');
    if (typeof args.callback !== 'function')
        throw new Error('callback required');
    if (typeof args.path !== 'string')
        throw new Error('path required');

    if (args.root && args.root === 'string') {
        var path = args.root + args.path;
    } else {
        var path = 'https://www.googleapis.com/' + args.path;
    }

    if (typeof args.params === 'object') {
        var deliminator = '?';
        for (var i in args.params) {
            path += deliminator + encodeURIComponent(i) + "="
                + encodeURIComponent(args.params[i]);
            deliminator = '&';
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open(args.method || 'GET', path);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    if (typeof args.body !== 'undefined') {
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(args.body));
    } else {
        xhr.send();
    }
    
    xhr.onerror = function () {
        // Todo and error handling.
        debugger;
    };

    xhr.onload = function() {
        var rawResponseObject = {
            // Todo: body, headers.
            gapiRequest: {
                data: {
                    status: this.status,
                    statusText: this.statusText
                }
            }
        };
        
        var rawResp = JSON.stringify(rawResponseObject);
        if (this.response) {
            var jsonResp = JSON.parse(this.response);
            args.callback(jsonResp, rawResp);
        } else {
            args.callback(null, rawResp);
        };
    };
}

gapi.client.mkdir = function(folder_name) {
    gapi.client.request({
        'path': 'drive/v3/files',
        'method': 'POST',
        'body': {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': ['root']
        },
        'callback': function(json_resp, raw_resp) {
            alert(JSON.stringify(json_resp));
        }
    });
}

function upload_files(auth_result) {
    if (auth_result && !auth_result.error) {
        gapi.client.mkdir('inav');
        status_msg = {text: "All selected images are uploaded"};
    } else
        status_msg = {text: "Google Drive authorization error!"};
}

// Awaiting the request and giving the answer
chrome.runtime.onMessage.addListener(function (msg, sender, send_response) {
    if (msg.text === 'save_images') {
        gapi.auth.authorize({interactive: true}, upload_files);
        send_response(status_msg);
    }
});
