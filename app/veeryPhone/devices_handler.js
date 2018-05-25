function getUserMedia(options, successCallback, failureCallback) {
    var api = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (api) {
        return api.bind(navigator)(options, successCallback, failureCallback);
    }
}

function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(function() {
                console.log('Success, audio output device attached: ' + sinkId);
                element.play();
            })
            .catch(function(error) {
                var errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = 'You need to use HTTPS for selecting audio output ' +
                        'device: ' + error;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
               // audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

function getStream (type) {

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }

// List cameras and microphones.

    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device) {
                console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
            });

            var element = document.getElementById('testaudio');
            attachSinkId(element,"ffbdc9bcd92dd2f43a3dc01522326d618458be0b82b7600f9759926592ff8026");

        })
        .catch(function(err) {
            console.log(err.name + ": " + err.message);
        });


    //var audioOutputSelect = document.querySelector('select#audioOutput');
    return;

    if (!navigator.getUserMedia && !navigator.webkitGetUserMedia &&
        !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
        alert('User Media API not supported.');
        return;
    }

    var constraints = {};
    constraints[type] = true;
    getUserMedia(constraints, function (stream) {
        var mediaControl = document.querySelector(type);

        if ('srcObject' in mediaControl) {
            mediaControl.srcObject = stream;
            mediaControl.src = (window.URL || window.webkitURL).createObjectURL(stream);
        } else if (navigator.mozGetUserMedia) {
            mediaControl.mozSrcObject = stream;
        }
    }, function (err) {
        alert('Error: ' + err);
    });
}