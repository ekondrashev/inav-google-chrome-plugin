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
