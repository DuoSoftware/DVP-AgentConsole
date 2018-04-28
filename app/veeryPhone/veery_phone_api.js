/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('veery_phone_api', function ($injector) {

    var storage;

    var setStrategy = function (name) {
        storage = $injector.get(name);
    };


    return {
        setStrategy: setStrategy,

        // Strategy interface methods:
        getName: function () {
            return storage.getName();
        },
        registerSipPhone:function (key) {
            return storage.registerSipPhone(key);
        },
        subscribeEvents: function (events) {
            return storage.subscribeEvents(events);
        },
        makeCall: function (key,number) {
            return storage.makeCall(key,number);
        },
        answerCall: function (key) {
            return storage.answerCall(key);
        },
        rejectCall: function (key) {
            storage.rejectCall(key);
        },
        endCall: function (key) {
            storage.endCall(key);
        },
        etlCall: function (key) {
            return storage.etlCall(key);
        },
        transferCall: function (key, number) {
            return storage.transferCall(key, number);
        },
        swapCall: function (key) {
            return storage.swapCall(key);
        },
        holdCall: function (key) {
            return storage.holdCall(key);
        },
        unholdCall: function (key) {
            return storage.unholdCall(key);
        },
        muteCall: function (key) {
            return storage.muteCall(key);
        },
        unmuteCall: function (key) {
            return storage.unmuteCall(key);
        },
        conferenceCall: function (key) {
            return storage.conferenceCall(key);
        },
        freezeAcw: function (key,session_id) {
            return storage.freezeAcw(key,session_id);
        },
        endFreeze: function (key,session_id) {
            return storage.endFreeze(key,session_id);
        }
    };

});