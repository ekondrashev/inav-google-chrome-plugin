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
        var img = document.createElement('img');
        img.setAttribute('src', element.fullsrc);
        img.setAttribute('alt', element.description);
        button.appendChild(img);
        button.addEventListener('click', function() {
            document.getElementById('galleryherepls').innerHTML = 'Button '+(index+1)+' has pressed!';
        });
        li.appendChild(button);
        ul.appendChild(li);
    });
    return nav;
}

chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'get_all_images'}, function(response) {
        $(function() {
            $('#gallery').galereya({
                load: function(next) {
                    next(response);
                }
            });
        });
        //document.getElementById('gallery').appendChild(show_menu(response));
        //tab.url
    });
});

// Comunicate with background script
chrome.runtime.sendMessage({text: "save_images"}, function(resp) {
    //alert(resp.text);
});
