/**
 * Created by Veery Team on 4/8/2016.
 */


var coolPhone = {};
var _profile = {};
var UserEvent = {};
var session  = undefined;
var localAudio,remoteAudio, ringtone, ringbacktone;
function sipRegister_test(userEvent, profile) {
    try {
        _profile = profile;
        UserEvent = userEvent;
        localAudio = document.getElementById("local-media");
        remoteAudio = document.getElementById("audio_remote");
        ringtone = document.getElementById("ringtone");
        ringbacktone = document.getElementById("ringbacktone");
        var socket = new JsSIP.WebSocketInterface(profile.server.websocketUrl);
        var configuration = {
            sockets: [socket],
            uri: profile.publicIdentity,
            password: profile.password,
            register:true
        };

        coolPhone = new JsSIP.UA(configuration);


        /*WebSocket connection events*/
        coolPhone.on('connected', function (e) {
            /*UserEvent.onConnected(true);*/
        });

        coolPhone.on('disconnected', function (e) {
            UserEvent.onDisconnected(true);
        });


        /*SIP registration events*/

        coolPhone.on('registered', function (e) {
            UserEvent.onConnected(true);
           // UserEvent.onRegistered(true);
        });
        coolPhone.on('unregistered', function (e) {
            UserEvent.onUnregistered(true);
        });
        coolPhone.on('registrationFailed', function (e) {
            UserEvent.onRegistered(false);
        });

        /*New incoming or outgoing call event*/
        coolPhone.on('newRTCSession', function (e) {
            session = e.session;

            session.on("ended",function(){
                UserEvent.onSipEvent(e,'ended');
            });
            session.on("failed",function(){
                UserEvent.onSipEvent(e,'failed');
            });

            session.on('addstream', function(e){
                // set remote audio stream (to listen to remote audio)
                // remoteAudio is <audio> element on page
                remoteAudio.src = window.URL.createObjectURL(e.stream);
                remoteAudio.play();
            });
            session.on('started',   function(e){
                var rtcSession = e.sender;
                // Attach local stream to selfView
                if (rtcSession.getLocalStreams().length > 0) {
                    localAudio.src = window.URL.createObjectURL(rtcSession.getLocalStreams()[0]);
                }
                // Attach remote stream to remoteView
                if (rtcSession.getRemoteStreams().length > 0) {
                    remoteAudio.src = window.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
                }
            });

            if (session.direction === "incoming") {
                // incoming call here

                session.on("progress", function () {
                    UserEvent.onSipEvent(e,'progress');
                });
                session.on("accepted", function () {
                    UserEvent.onSipEvent(e,'accepted');
                });
                session.on("confirmed", function () {
                    var rtcSession = e.session.connection;
                    // Attach local stream to selfView
                    /*if (rtcSession.getLocalStreams().length > 0) {
                        localAudio.src = window.URL.createObjectURL(rtcSession.getLocalStreams()[0]);
                    }*/
                    // Attach remote stream to remoteView
                    if (rtcSession.getRemoteStreams().length > 0) {
                        remoteAudio.src = window.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
                    }
                    /*remoteAudio.src = window.URL.createObjectURL(e.session._localMediaStream);
                    remoteAudio.play();*/
                    UserEvent.onSipEvent(e,'confirmed');
                });

                UserEvent.onIncomingCall(e.request.from._display_name,e);
            }
            else{

                var dtmfSender;
                session.on("confirmed",function(){
                    //the call has connected, and audio is playing
                    var localStream = session.connection.getLocalStreams()[0];
                    dtmfSender = session.connection.createDTMFSender(localStream.getAudioTracks()[0])
                });


            }

        });


        coolPhone.start();
    }
    catch (e) {
        UserEvent.onError(e);
    }
}


function sipUnregister() {
    var options = {
        all: true
    };
    coolPhone.unregister(options);
}

var callOptions = {
    mediaConstraints: {
        audio: true, // only audio calls
        video: false
    }
};

function answerCall() {
    // Answer call
    if(session)
    session.answer(callOptions);
}

function hangupCall() {
    // Reject call (or hang up it)
    if(session)
        session.terminate();
}

function muteCall() {
    //mute call
    if(session)
        session.mute({audio: true});
}

function unmuteCall() {
    //unmute call
    if(session)
        session.unmute({audio: true});
}

function sipCall_test(phoneNumber) {

    var eventHandlers = {
        'progress':   function(e){ /* Your code here */ },
        'failed':     function(e){ /* Your code here */ },
        'confirmed':  function(e){
            // Attach local stream to selfView
            localAudio.src = window.URL.createObjectURL(session.connection.getLocalStreams()[0]);
        },
        'addstream':  function(e) {
            var stream = e.stream;

            // Attach remote stream to remoteView
            remoteView.src = window.URL.createObjectURL(stream);
        },
        'ended':      function(e){ /* Your code here */ }
    };

    var options = {
        'eventHandlers': eventHandlers,
        'extraHeaders': [ 'X-Foo: foo', 'X-Bar: bar' ],
        'mediaConstraints': {'audio': true, 'video': false}
    };

    session = coolPhone.call('sip:94112375000@duo.media1.veery.cloud', options);

    /*var session = coolPhone.call('sip:' + phoneNumber + '@' + _profile.server.domain, callOptions);*/
}