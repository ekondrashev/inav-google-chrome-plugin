function showMenu(items) {
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
        var a = document.createElement('a');
        a.setAttribute('href', element.src);
        var text = document.createTextNode(element.src.replace(/^.*[\\/]/, ''));
        a.appendChild(text);
        li.appendChild(a);
        ul.appendChild(li);
    });
    return nav;
}

chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'get_all_images'}, function(response) {
        document.getElementById('menu').appendChild(showMenu(response));
        //tab.url
    });
});
