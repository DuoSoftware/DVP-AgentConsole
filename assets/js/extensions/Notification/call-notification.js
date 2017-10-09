/**
 * Created by Waruna on 9/11/2017.
 */

// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
});

function callNotification(name, number,skill) {

    showNotification("Hello "+name+" You Are Receiving a "+skill+" Call From "+number,15000);
    /*if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Facetone', {
            icon: 'assets/img/logo_130x130yellow.png',
            body: "Hello "+name+" You Are Receiving a "+skill+" Call From "+number
        });
        setTimeout(notification.close.bind(notification), 15000);
        notification.onclick = function () {
            window.focus();
            //this.cancel();
        };

    }*/

}

function showNotification(msg,durations) {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Facetone', {
            icon: 'assets/img/logo_130x130yellow.png',
            body: msg
        });
        setTimeout(notification.close.bind(notification), durations);
        notification.onclick = function () {
            window.focus();
        };
    }
}
