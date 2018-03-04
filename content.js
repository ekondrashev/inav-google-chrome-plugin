function getAllImages() {
    var arrImages = [];
    function getEls(el) {
        var chNodes, i;
        if (el instanceof HTMLImageElement) {
            arrImages.push(el);
        }
        if (el.hasChildNodes()) {
            chNodes = el.childNodes;
            for (i = 0; i < chNodes.length; i++) {
                getEls(chNodes[i]);
            }
        }
    }
    getEls(document);
    return arrImages;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'get_all_images') {
        var imgs=[], allImages = getAllImages();
        for (var i=0; i<allImages.length; i++) {
            var isDuplicate = false;
            for (var j=0; j<imgs.length; j++) {
                if (allImages[i].src===imgs[j].src) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate && allImages[i].src) {
                imgs.push({
                    src: allImages[i].src,
                    alt: allImages[i].alt
                });
            }
        }
        sendResponse(imgs);
    }
});
