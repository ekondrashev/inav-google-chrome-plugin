// Awaiting the request and giving the answer
chrome.runtime.onMessage.addListener(function (msg, sender, send_response) {
    if (msg.text === 'save_images') {
        var status = {text: "All selected images are uploaded"};
        send_response(status);
    }
});
