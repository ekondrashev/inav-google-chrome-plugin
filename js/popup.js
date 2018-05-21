// Function shows multiselect of all images found on the page in the active tab
function show_multiselect(items) {
    if(items.length===0) {
        var h2 = document.createElement('h2');
        var text = document.createTextNode("Can't find images in active tab!");
        h2.appendChild(text);
        return h2;
    }
    var select = document.createElement('select');
    select.setAttribute('class', 'inav-select');
    select.setAttribute('multiple', 'multiple');
    items.forEach(function(element, index, arr){
        var option = document.createElement('option');
        option.setAttribute('data-img-src', element.fullsrc);
        option.setAttribute('data-description', element.description);
        var text = document.createTextNode(element.description);
        option.appendChild(text);
        select.appendChild(option);
        });
        return select;
}

function show_upload_button() {
    var button = document.createElement('button');
    var text = document.createTextNode("Upload selected images");
    button.appendChild(text);
    button.addEventListener('click', function() {
        var selected_items = $('.inav-select').selectedAsJSON();
        chrome.runtime.sendMessage({text: "save_images", images: selected_items}, function(resp) {
            alert(resp.text);
        });
        //prompt('a', JSON.stringify(s));
    });
    return button;
}

function show_revoke_button() {
    var button = document.createElement('button');
    var text = document.createTextNode("revoke access token");
    button.appendChild(text);
    button.addEventListener('click', function() {
        chrome.runtime.sendMessage({text: "revoke_token"}, function(resp) {
            alert(resp.text);
        });
    });
    return button;
}

// Function displays a list of pictures found on the page in the active tab
function show_menu(items) {
    if(items.length===0) {
        var h2 = document.createElement('h2');
        var text = document.createTextNode("Can't find images in active tab!");
        h2.appendChild(text);
        return h2;
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
            document.getElementById('gallery').innerHTML = 'Button '+(index+1)+' has pressed!';
        });
        li.appendChild(button);
        ul.appendChild(li);
    });
    return nav;
}

jQuery.fn.extend({
    selectedAsJSON: function(){
        var result = [];
        $('option:selected', this).each(function(){
            result.push($(this).data());
        });
        return result;
    }
});

chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'get_all_images'}, function(response) {
        //document.getElementById('gallery').appendChild(show_menu(response));
        document.getElementById('gallery').appendChild(show_multiselect(response));
        $(".inav-select").chosen({
            disable_search_threshold: 10,
            placeholder_text_multiple: "Please select some images",
            no_results_text: "Oops, no images found!",
            width:"100%",
            html_template: '<img style="border:3px solid #ff703d;padding:0px;margin:2px" class="{class_name}" src="{url}" alt="{text}" />'
        });
        document.getElementById('gallery').appendChild(show_upload_button());
        document.getElementById('gallery').appendChild(show_revoke_button());
        //tab.url
    });
});
