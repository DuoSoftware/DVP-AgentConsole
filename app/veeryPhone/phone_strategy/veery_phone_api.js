/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('veery_phone_api', function ($injector) {

    var storage;

    var setStrategy = function (name) {
        storage = undefined;
        storage = $injector.get(name);
    };


    return {
        setStrategy: setStrategy,

        // Strategy interface methods:
        getName: function () {
            return storage.getName();
        },
        resetPhone:function (key) {
            return storage.resetPhone(key);
        },
        registerSipPhone:function (key,phone_setting) {
            return storage.registerSipPhone(key,phone_setting);
        },
        subscribeEvents: function (events) {
            return storage.subscribeEvents(events);
        },
        unsubscribeEvents: function () {
            return storage.unsubscribeEvents();
        },
        incomingCall:function (key,number) {
            return storage.incomingCall(key,number);
        },
        makeCall: function (key,number,my_id) {
            return storage.makeCall(key,number,my_id);
        },
        answerCall: function (key,session_id) {
            return storage.answerCall(key,session_id);
        },
        rejectCall: function (key,session_id) {
            storage.rejectCall(key,session_id);
        },
        endCall: function (key,session_id) {
            storage.endCall(key,session_id);
        },
        etlCall: function (key,session_id) {
            return storage.etlCall(key,session_id);
        },
        transferCall: function (key,session_id, number,callref_id) {
            return storage.transferCall(key,session_id, number,callref_id);
        },
        transferIVR: function (key,session_id, number,callref_id) {
            return storage.transferIVR(key,session_id, number,callref_id);
        },
        swapCall: function (key,session_id) {
            return storage.swapCall(key,session_id);
        },
        holdCall: function (key,session_id) {
            return storage.holdCall(key,session_id);
        },
        unholdCall: function (key,session_id) {
            return storage.unholdCall(key,session_id);
        },
        muteCall: function (key,session_id) {
            return storage.muteCall(key,session_id);
        },
        unmuteCall: function (key,session_id) {
            return storage.unmuteCall(key,session_id);
        },
        conferenceCall: function (key,session_id) {
            return storage.conferenceCall(key,session_id);
        },
        freezeAcw: function (key,session_id) {
            return storage.freezeAcw(key,session_id);
        },
        endFreeze: function (key,session_id) {
            return storage.endFreeze(key,session_id);
        }        ,
        endAcw: function (key,session_id) {
            return storage.endAcw(key,session_id);
        },
        send_dtmf: function (key,session_id,dtmf) {
            return storage.send_dtmf(key,session_id,dtmf);
        },
        unregister: function (key) {
            return storage.unregister(key);
        },
        phone_mode_change:function (key,mode) {
            return storage.phone_mode_change(key,mode);
        }

    };

});