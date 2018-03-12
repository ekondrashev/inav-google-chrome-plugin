// Get access token using saved refresh token (Google Drive REST API - Playground)
function get_access_token() {
    const refresh_token = "1/98Q2wu_TU43II00uaVO_17wcbwl_AIpvAKxD3QtP4wQ";
    const client_id = "6221500376-uj3r9a1l5591l5cr8vgjvvqntbuoj6fn.apps.googleusercontent.com";
    const client_secret = "k8-whQuOia8nQ1DHFQbAYAaJ";
    // from https://developers.google.com/identity/protocols/OAuth2WebServer#offline
    const refresh_url = "https://www.googleapis.com/oauth2/v4/token";
    const post_body = `grant_type=refresh_token&client_id=${encodeURIComponent(client_id)}&client_secret=${encodeURIComponent(client_secret)}&refresh_token=${encodeURIComponent(refresh_token)}`;
    let refresh_request = {
        body: post_body,
        method: "POST",
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    }

    // post to the refresh endpoint, parse the json response and use the access token to call files.list
    fetch(refresh_url, refresh_request).then( response => {
        return(response.json());
    }).then( response_json =>  {
        files_list(response_json.access_token);
    });
}

// function to list some Drive files using the newly acquired access token
function files_list(access_token) {
    const drive_url = "https://www.googleapis.com/drive/v3/files";
    let drive_request = {
        method: "GET",
        headers: new Headers({
            Authorization: "Bearer "+access_token
        })
    }
    fetch(drive_url, drive_request).then( response => {
        return(response.json());
    }).then( list =>  {
        alert(list.files[0].name);
    });
}

// Function displays a list of pictures found on the page in the active tab
function show_menu(items) {
    if(items.length===0) {
        var h1 = document.createElement('h1');
        var text = document.createTextNode("Can't find images in active tab!");
        h1.appendChild(text);
        return h1;
    }
    var nav = document.createElement('nav');
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'List of ' + items.length + ' images');
    var ul = document.createElement('ul');
    ul.setAttribute('role', 'menubar');
    ul.setAttribute('aria-hidden', 'false');
    nav.appendChild(ul);
    items.forEach(function(element, index, arr){
        var li = document.createElement('li');
        li.setAttribute('role', 'menuitem');
        var button = document.createElement('button');
        var text = document.createTextNode('Image '+(index+1)+': '+element.src.replace(/^.*[\\/]/, ''));
        button.appendChild(text);
        button.addEventListener('click', function() {
            sendData({src: element.src});
            document.getElementById('menu').innerHTML = 'Button '+(index+1)+' has pressed!';
        });
        li.appendChild(button);
        ul.appendChild(li);
    });
    return nav;
}

chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'get_all_images'}, function(response) {
        document.getElementById('menu').appendChild(show_menu(response));
        //tab.url
    });
});
