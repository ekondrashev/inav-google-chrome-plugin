// Function receives a list of images found on the page in the active tab of the browser
function get_all_images() {
    var arr_images = [];
    function get_els(el) {
        var ch_nodes, i;
        if (el instanceof HTMLImageElement) {
            arr_images.push(el);
        }
        if (el.hasChildNodes()) {
            ch_nodes = el.childNodes;
            for (i = 0; i < ch_nodes.length; i++) {
                get_els(ch_nodes[i]);
            }
        }
    }
    get_els(document);
    return arr_images;
}

// Awaiting the request and giving the answer
chrome.runtime.onMessage.addListener(function (msg, sender, send_response) {
    if (msg.text === 'get_all_images') {
        var imgs=[], all_images = get_all_images();
        var index = 1;
        for (var i in all_images) {
            var is_duplicate = false;
            for (var j in imgs) {
                if (all_images[i].src===imgs[j].fullsrc) {
                    is_duplicate = true;
                    break;
                }
            }
            if (!is_duplicate && all_images[i].src) {
                var alt = 'Image '+index+': ';
                if(all_images[i].alt) {
                    alt += all_images[i].alt;
                } else {
                    alt += all_images[i].src.replace(/^.*[\\/]/, '');
                }
                imgs.push({
                    lowsrc: all_images[i].src,
                    fullsrc: all_images[i].src,
                    description: alt,
                    category: "all"
                });
                index++;
            }
        }
        send_response(imgs);
    }
});
