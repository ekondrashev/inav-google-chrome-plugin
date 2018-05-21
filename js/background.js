// The Google API javascript client 'gapi'
// with a minimal set of functionality that is Content Security Policy compliant and uses the chrome identity api.
window.gapi = {};
window.gapi.auth = {};
window.gapi.client = {};

var access_token = undefined;
var selected_images = [];
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

gapi.auth.revokeToken = function() {
    chrome.identity.getAuthToken({ 'interactive': false },
        function(current_token) {
            if (!chrome.runtime.lastError) {
                // @corecode_begin removeAndRevokeAuthToken
                // @corecode_begin removeCachedAuthToken
                // Remove the local cached token
                chrome.identity.removeCachedAuthToken({ token: current_token },
                    function() {});
                // @corecode_end removeCachedAuthToken
                // Make a request to revoke token in the server
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + current_token);
                xhr.send();
                // @corecode_end removeAndRevokeAuthToken
            }
        });
}

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
        var path = 'https://www.googleapis.com' + args.path;
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

gapi.client.createFolder = function(folder_name, getId) {
    gapi.client.request({
        'path': '/drive/v3/files',
        'method': 'POST',
        'body': {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': ['root']
        },
        'callback': function(json_resp, raw_resp) {
            getId(json_resp.id);
        }
    });
}

gapi.client.getFolderId = function(folder_name, getId) {
    gapi.client.request({
        'path': '/drive/v3/files',
        'method': 'GET',
        'params': {
            'maxResults': 10,
            'q': "mimeType='application/vnd.google-apps.folder' and name='" +folder_name+ "' and trashed=false",
            'fields': "files(id, name)"
        },
        'callback': function(json_resp, raw_resp) {
            if (json_resp.files.length>0) {
                getId(json_resp.files[0].id);
            } else
                gapi.client.createFolder(folder_name, function(id) {
                    getId(id);
                });
        }
    });
}

gapi.client.uploadImage = function(location, folder_id) {
    var xhr = new XmlHTTPRequest();
    xhr.open('GET', location, true);
    xhr.responseType = 'blob';
alert(JSON.stringify(xhr.response));
    xhr.onload = function() {
        var fileData = xhr.response;
        alert(fileData.fileName);
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var reader = new FileReader();
        reader.readAsDataURL(fileData);
        reader.onload =  function(e) {
            var contentType = fileData.type || 'application/octet-stream';
            var metadata = {
                'name': fileData.fileName,
                'mimeType': contentType,
                'parents': [folder_id]
            };
            var data = reader.result;
            var multipartRequestBody =
                delimiter + 'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n';
                
                //Transfer images as base64 string.
                if (contentType.indexOf('image/') === 0) {
                    var pos = data.indexOf('base64,');
                    multipartRequestBody += 'Content-Transfer-Encoding: base64\r\n' + '\r\n' +
                        data.slice(pos < 0 ? 0 : (pos + 'base64,'.length));
                    } else {
                        multipartRequestBody +=  + '\r\n' + data;
                    }
                    multipartRequestBody += close_delim;
                    
                    gapi.client.request({
                        'path': '/upload/drive/v3/files',
                        'method': 'POST',
                        'params': {'uploadType': 'multipart'},
                        'headers': {
                            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                        },
                        'body': multipartRequestBody,
                        'callback': function(json_resp, raw_resp) {
                            //if(file.id)
                            // send id to STM and mark uploaded
                            alert("request execute: "+JSON.stringify(json_resp));
                        }
                    });
        }
    }
}

function upload_files(auth_result) {
    if (auth_result && !auth_result.error) {
        var folder_name = 'inav';
        gapi.client.getFolderId(folder_name, function(id) {
            // use folder ID
            selected_images.forEach(function(image, index, arr) {
                gapi.client.uploadImage(image.imgSrc, id);
            });
        });
        status_msg = {text: "All selected images are uploaded"};
    } else
        status_msg = {text: "Google Drive authorization error!"};
}

// Awaiting the request and giving the answer
chrome.runtime.onMessage.addListener(function (msg, sender, send_response) {
    if (msg.text === 'save_images') {
        selected_images = msg.images;
        gapi.auth.authorize({interactive: true}, upload_files);
        send_response(status_msg);
    } else if (msg.text === 'revoke_token') {
        gapi.auth.revokeToken();
        send_response({text: "Authorization token has revoked!"});
    }
});
