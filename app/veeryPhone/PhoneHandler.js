/**
 * Created by Veery Team on 4/8/2016.
 */

var sTransferNumber;
var oRingTone, oRingbackTone;
var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;
var audioRemote;
var bFullScreen = false;
var oNotifICall;
var bDisableVideo = false;
var oConfigCall;
var oReadyStateTimer;
var ringtone, ringbacktone;
var UserEvent = {};
var Profile = {};


var getPVal = function (PName) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === PName) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
};

var preInit = function (userEvent, profile) {

    UserEvent = userEvent;
    Profile = profile;
    audioRemote = document.getElementById("audio_remote");
   // ringtone = document.getElementById("ringtone");
    ringbacktone = document.getElementById("ringbacktone");

    // set default webrtc type (before initialization)
    var s_webrtc_type = getPVal("wt");


    if (s_webrtc_type) SIPml.setWebRtcType(s_webrtc_type);

    // initialize SIPML5
    if (SIPml.isInitialized()) {
        postInit();
    }
    else {
        SIPml.init(postInit);
    }

};

function postInit() {
    // check for WebRTC support
    if (!SIPml.isWebRtcSupported()) {
        // is it chrome?
        if (SIPml.getNavigatorFriendlyName() == 'chrome') {
            if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {
                window.location = 'http://www.webrtc.org/running-the-demos';
            }
            else {
                window.location = "../../../index.html";
            }
            return;
        }
        else {
            if (confirm("webrtc-everywhere extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                window.location = 'https://github.com/sarandogou/webrtc-everywhere';
            }
            else {
                // Must do nothing: give the user the chance to accept the extension
                // window.location = "index.html";
            }
        }
    }

    // checks for WebSocket support
    if (!SIPml.isWebSocketSupported()) {
        if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {
            window.location = 'https://www.google.com/intl/en/chrome/browser/';
        }
        else {
            window.location = "../../../index.html";
        }
        return;
    }


    if (!SIPml.isWebRtcSupported()) {
        if (confirm('Your browser don\'t support WebRTC.\naudio/video calls will be disabled.\nDo you want to download a WebRTC-capable browser?')) {
            window.location = 'https://www.google.com/intl/en/chrome/browser/';
        }
    }

    document.body.style.cursor = 'default';
    oConfigCall = {
        audio_remote: audioRemote,
        /*video_local: viewVideoLocal,
         video_remote: viewVideoRemote,
         video_size: {minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined},
         screencast_window_id: 0x00000000, */
        bandwidth: {audio: Profile.server.bandwidth_audio},
        events_listener: {events: '*', listener: onSipEventSession},
        sip_caps: [
            {name: '+g.oma.sip-im'},
            {name: 'language', value: '\"en,fr\"'}
        ]
    };

    sipRegister();
}

// sends SIP REGISTER request to login
function sipRegister() {
    // catch exception for IE (DOM not ready)
    try {


        // create SIP stack
        oSipStack = new SIPml.Stack({
                realm: Profile.server.domain,
                impi: Profile.authorizationName,
                impu: Profile.publicIdentity,
                password: Profile.password,
                display_name: Profile.authorizationName,
                websocket_proxy_url: Profile.server.websocketUrl,
                outbound_proxy_url: Profile.server.outboundProxy,
                ice_servers: Profile.server.ice_servers,
                enable_rtcweb_breaker: false,
                events_listener: {events: '*', listener: onSipEventStack},
                enable_early_ims: true, // Must be true unless you're using a real IMS network
                enable_media_stream_cache: true,
                enable_click2call: false,
                bandwidth: {audio: Profile.server.bandwidth_audio}, // could be redefined a session-level
                sip_headers: [
                    {name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04'},
                    {name: 'Organization', value: 'DuoSoftware'}
                ]
            }
        );
        if (oSipStack.start() != 0) {
            UserEvent.notificationEvent('Failed to start the SIP stack');
        }
        else return;
    }
    catch (e) {
        UserEvent.onErrorEvent(e);
    }
}

// sends SIP REGISTER (expires=0) to logout
function sipUnRegister() {
    if (oSipStack) {
        /*var session = oSipStack.newSession('register', {
         expires: 0,
         events_listener: { events: '*', listener: unregisterSip },
         sip_caps: [
         { name: '+g.oma.sip-im', value: null },
         { name: '+audio', value: null },
         { name: 'language', value: '\"en,fr\"' }
         ]
         });
         session.register();*/
        oSipStack.stop(); // shutdown all sessions
    }
}

function rejectCall() {
    if (oSipSessionCall) {
        oSipSessionCall.reject();
        return true;
    }
    return false;
}

function answerCall() {
    if (oSipSessionCall) {
        oSipSessionCall.accept();
        return true;
    }
    return false;
}
// makes a call (SIP INVITE)
function sipCall(s_type, phoneNumber) {
    if (oSipStack && !oSipSessionCall) {// && !tsk_string_is_null_or_empty(txtPhoneNumber)) {
        if (s_type == 'call-screenshare') {
            if (!SIPml.isScreenShareSupported()) {
                alert('Screen sharing not supported. Are you using chrome 26+?');
                return false;
            }
            if (!location.protocol.match('https')) {
                if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
                    sipUnRegister();
                    window.location = 'https://ns313841.ovh.net/call.htm';
                }
                return false;
            }
        }

        // create call session
        oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
        // make call
        if (oSipSessionCall.call(phoneNumber) != 0) {
            oSipSessionCall = null;
            /*txtCallStatus.value = 'Failed to make call';
             btnCall.disabled = false;
             btnHangUp.disabled = true;*/
            return false;
        }else {
            return true;
        }

    }
    else if (oSipSessionCall) {
        oSipSessionCall.accept(oConfigCall);
        return false;
    }
}

// Share entire desktop aor application using BFCP or WebRTC native implementation
function sipShareScreen() {
    if (SIPml.getWebRtcType() === 'w4a') {
        // Sharing using BFCP -> requires an active session
        if (!oSipSessionCall) {
            return "No active session";
        }
        if (oSipSessionCall.bfcpSharing) {
            if (oSipSessionCall.stopBfcpShare(oConfigCall) != 0) {
                return 'Failed to stop BFCP share';
            }
            else {
                oSipSessionCall.bfcpSharing = false;
            }
        }
        else {
            oConfigCall.screencast_window_id = 0x00000000;
            if (oSipSessionCall.startBfcpShare(oConfigCall) != 0) {
                return 'Failed to start BFCP share';
            }
            else {
                oSipSessionCall.bfcpSharing = true;
            }
        }
    }
    else {
        sipCall('call-screenshare');
    }
}

function call_webrtc_hold() {
    if (oSipSessionCall) {
        var i_ret;
        i_ret = oSipSessionCall.hold();
        if (i_ret != 0) {
            return 'Hold / Resume failed';
        }
        else {
            return '1';
        }

    }
}

function call_webrtc_unhold() {
    if (oSipSessionCall) {
        var i_ret;
        i_ret = oSipSessionCall.resume();
        if (i_ret != 0) {
            return 'Hold / Resume failed';
        }
        else {
            return '0';
        }
    }
}

// holds or resumes the call
function sipToggleHoldResume() {
    if (oSipSessionCall) {
        var i_ret;
        i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();
        if (i_ret != 0) {
            return 'Hold / Resume failed';
        }
        if (oSipSessionCall.bHeld) {
            return '0';
        }
        else {
            return '1';
        }
    }
}

// Mute or Unmute the call
function sipToggleMute() {
    if (oSipSessionCall) {
        var i_ret;
        var bMute = !oSipSessionCall.bMute;
        i_ret = oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);
        if (i_ret != 0) {
            return 'Mute / Unmute failed';
        }
        oSipSessionCall.bMute = bMute;
        /*btnMute.value = bMute ? "Unmute" : "Mute";*/
        return bMute;
    }
}

// terminates the call (SIP BYE or CANCEL)
function sipHangUp() {
    if (oSipSessionCall) {
        oSipSessionCall.hangup({events_listener: {events: '*', listener: onSipEventSession}});
        return true;
    }
    return false;
}

function sipSendDTMF(c) {
    if (oSipSessionCall && c) {
        if (oSipSessionCall.dtmf(c) == 0) {
            try {
                dtmfTone.play();
                console.log("DTMF :" + c);
            } catch (e) {
            }
        }
    }
}


function startRingbackTone() {
    try {
        ringbacktone.play();
    }
    catch (e) {
    }
}

function stopRingbackTone() {
    try {
        ringbacktone.pause();
    }
    catch (e) {
    }
}

var errorCount = 0;
// Callback function for SIP Stacks
function onSipEventStack(e /*SIPml.Stack.Event*/) {

    console.log("onSipEventStack----------------------------");
    console.log(e.type);
    switch (e.type) {
        case 'started': {
            // catch exception for IE (DOM not ready)
            try {
                // LogIn (REGISTER) as soon as the stack finish starting
                oSipSessionRegister = this.newSession('register', {
                    expires: 200,
                    events_listener: {events: '*', listener: onSipEventSession},
                    sip_caps: [
                        {name: '+g.oma.sip-im', value: null},
                        //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                        {name: '+audio', value: null},
                        {name: 'language', value: '\"en,fr\"'}
                    ]
                });
                oSipSessionRegister.register();
            }
            catch (e) {
                UserEvent.onErrorEvent(e);
            }
            break;
        }
        case 'stopping':
        case 'stopped':
        case 'failed_to_start':
        case 'failed_to_stop': {

            console.log("Request Phone UI Change-stopping/stopped/failed_to_start/failed_to_stop");
            oSipStack = null;
            oSipSessionRegister = null;
            oSipSessionCall = null;

            UserEvent.uiOnConnectionEvent(false, false);

            stopRingbackTone();


            //UserEvent.uiVideoDisplayShowHide(false);
            break;
        }

        case 'i_new_call': {
            if (oSipSessionCall) {

                // do not accept the incoming call if we're already 'in call'
                e.newSession.hangup(); // comment this line for multi-line support
                console.error("Call receive in invalid State");
            }
            else {
                oSipSessionCall = e.newSession;
                // start listening for events
                oSipSessionCall.setConfiguration(oConfigCall);


                var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                UserEvent.onIncomingCall(sRemoteNumber);
            }
            break;
        }

        case 'm_permission_requested':
        case 'm_permission_accepted':
        case 'm_permission_refused': {
            //divGlassPanel.style.visibility = 'hidden';
            if (e.type == 'm_permission_refused') {
                oSipSessionCall = null;
                if (oNotifICall) {
                    oNotifICall.cancel();
                    oNotifICall = null;
                }
                UserEvent.uiCallTerminated('Media stream permission denied');
            }
            if (e.type == 'm_permission_refused'){
                UserEvent.onMediaStream("Media stream permission denied");
            }

            break;
        }

        case 'starting':
        default:
            break;
    }
}

// Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...)
function onSipEventSession(e /* SIPml.Session.Event */) {

    UserEvent.notificationEvent(e.description);
    console.log("onSipEventSession------------------");
    console.log(e.type);
    switch (e.type) {
        case 'connecting':
        case 'connected': {
            var bConnected = (e.type == 'connected');
            if (e.session == oSipSessionRegister) {
                console.log("Request Phone UI Change-connected/connecting");
                UserEvent.uiOnConnectionEvent(bConnected, !bConnected);

            }
            else if (e.session == oSipSessionCall) {
                if (window.btnBFCP) window.btnBFCP.disabled = false;

                if (bConnected) {
                    stopRingbackTone();

                    UserEvent.onSipEventSession(e.description);
                    if (oNotifICall) {
                        oNotifICall.cancel();
                        oNotifICall = null;
                    }
                }


                if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                    /* UserEvent.uiVideoDisplayEvent(false, true);
                     UserEvent.uiVideoDisplayEvent(true, true);*/
                }
            }
            break;
        } // 'connecting' | 'connected'
        case 'terminating':
        case 'terminated': {
            if (e.session == oSipSessionRegister) {
                console.log("Request Phone UI Change-terminating/terminated");
                UserEvent.uiOnConnectionEvent(false, false);

                oSipSessionRegister = null;
            }
            else if (e.session == oSipSessionCall) {
                if (oNotifICall) {
                    oNotifICall.cancel();
                    oNotifICall = null;
                }
                UserEvent.uiCallTerminated(e.description);
            }
            oSipSessionCall = null;
            break;
        } // 'terminating' | 'terminated'

        case 'm_stream_video_local_added': {
            if (e.session == oSipSessionCall) {
                //UserEvent.uiVideoDisplayEvent(true, true);
            }
            break;
        }
        case 'm_stream_video_local_removed': {
            if (e.session == oSipSessionCall) {
                // UserEvent.uiVideoDisplayEvent(true, false);
            }
            break;
        }
        case 'm_stream_video_remote_added': {
            if (e.session == oSipSessionCall) {
                // UserEvent.uiVideoDisplayEvent(false, true);
            }
            break;
        }
        case 'm_stream_video_remote_removed': {
            if (e.session == oSipSessionCall) {
                // UserEvent.uiVideoDisplayEvent(false, false);
            }
            break;
        }

        case 'm_stream_audio_local_added':
        case 'm_stream_audio_local_removed':
        case 'm_stream_audio_remote_added':
        case 'm_stream_audio_remote_removed': {
            break;
        }

        case 'i_ect_new_call': {
            oSipSessionTransferCall = e.session;
            break;
        }

        case 'i_ao_request': {
            if (e.session == oSipSessionCall) {
                var iSipResponseCode = e.getSipResponseCode();
                if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                    UserEvent.onSipEventSession("Remote Ringing");
                   // startRingbackTone();
                }
            }
            break;
        }

        case 'm_early_media': {
            if (e.session == oSipSessionCall) {
                stopRingbackTone();

                UserEvent.notificationEvent("Early media started");
            }
            break;
        }

        case 'm_local_hold_ok': {
            if (e.session == oSipSessionCall) {
                if (oSipSessionCall.bTransfering) {
                    oSipSessionCall.bTransfering = false;
                    // this.AVSession.TransferCall(this.transferUri);
                }
                UserEvent.onSipEventSession("Call placed on hold");
                oSipSessionCall.bHeld = true;
            }
            break;
        }
        case 'm_local_hold_nok': {
            if (e.session == oSipSessionCall) {
                oSipSessionCall.bTransfering = false;
                UserEvent.onSipEventSession("Failed to place remote party on hold");
            }
            break;
        }
        case 'm_local_resume_ok': {
            if (e.session == oSipSessionCall) {
                oSipSessionCall.bTransfering = false;
                UserEvent.onSipEventSession("Call taken off hold");
                oSipSessionCall.bHeld = false;

                if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                    /* UserEvent.uiVideoDisplayEvent(false, true);
                     UserEvent.uiVideoDisplayEvent(true, true);*/
                }
            }
            break;
        }
        case 'm_local_resume_nok': {
            if (e.session == oSipSessionCall) {
                oSipSessionCall.bTransfering = false;
                UserEvent.onSipEventSession("Failed to unhold call");
            }
            break;
        }
        case 'm_remote_hold': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Placed on hold by remote party");
            }
            break;
        }
        case 'm_remote_resume': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Taken off hold by remote party");
            }
            break;
        }
        case 'm_bfcp_info': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession('BFCP Info: ' + e.description);
            }
            break;
        }

        case 'o_ect_trying': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Call transfer in progress");
            }
            break;
        }
        case 'o_ect_accepted': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Call transfer accepted");
            }
            break;
        }
        case 'o_ect_completed':
        case 'i_ect_completed': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Call transfer completed");

                if (oSipSessionTransferCall) {
                    oSipSessionCall = oSipSessionTransferCall;
                }
                oSipSessionTransferCall = null;
            }
            break;
        }
        case 'o_ect_failed':
        case 'i_ect_failed': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Call transfer failed");
            }
            break;
        }
        case 'o_ect_notify':
        case 'i_ect_notify': {
            if (e.session == oSipSessionCall) {
                UserEvent.onSipEventSession("Call Transfer: " + e.getSipResponseCode() + " " + e.description);
                if (e.getSipResponseCode() >= 300) {
                    if (oSipSessionCall.bHeld) {
                        oSipSessionCall.resume();
                    }

                }
            }
            break;
        }
        case 'i_ect_requested': {
            if (e.session == oSipSessionCall) {
                var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
                if (confirm(s_message)) {
                    UserEvent.onSipEventSession("Call transfer in progress");
                    oSipSessionCall.acceptTransfer();
                    break;
                }
                oSipSessionCall.rejectTransfer();
            }
            break;
        }
        case 'transport_error': {
            //sipUnRegister();
            if (UserEvent.onError) {
                UserEvent.onError(e);
            }
            break;
        }
    }
}

