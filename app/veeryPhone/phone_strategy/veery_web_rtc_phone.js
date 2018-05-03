/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('veery_web_rtc_phone', function ($crypto,$timeout, websocketServices, jwtHelper, authService, resourceService,phoneSetting,dataParser,turnServers) {

    var ui_events = {};
    var sip_events = {
        notificationEvent: function (description) {
            try {
                if (description == 'Connected') {

                    if (ui_events.onMessage) {
                        var msg = {"veery_command":"Initialized","description":"Initialized"};
                        var event = {
                            data : JSON.stringify(msg)
                        };
                        ui_events.onMessage(event);
                    }
                }
                else if (description == 'Forbidden') {
                    if (ui_events.onMessage) {
                        var msg = {"veery_command":"Error","description":description};
                        var event = {
                            data : JSON.stringify(msg)
                        };
                        ui_events.onMessage(event);
                    }
                    console.error(description);
                }
                else if (description == 'Transport error') {
                    console.error(description);
                    if (ui_events.onMessage) {
                        var msg = {"veery_command":"Error","description":"Unable to Communicate With Servers. Please Re-register Your Phone Or Contact Your System Administrator."};
                        var event = {
                            data : JSON.stringify(msg)
                        };
                        ui_events.onMessage(event);
                    }
                }
                else if (description == 'ReRegistering') {
                    //$('#idPhoneReconnect').removeClass('display-none');
                }
            }
            catch (ex) {
                console.error(ex.message);
            }

        },
        onSipEventSession: function (e) {
            try {
                console.info("onSipEventSession : " + e);
                if (e == 'Session Progress') {
                    shared_function.showAlert("Soft Phone", "info", 'Session Progress');
                }
                else if (e.toString().toLowerCase() == 'in call') {
                    if (ui_events.onMessage) {
                        var msg = {"veery_command":"AnswerCall","description":"AnswerCall"};
                        var event = {
                            data : JSON.stringify(msg)
                        };
                        ui_events.onMessage(event);
                    }
                }
            }
            catch (ex) {
                console.error(ex.message);
            }
        },
        onErrorEvent: function (e) {
            shared_function.showAlert("Soft Phone", "error", e);
            console.error(e);
        },
        uiOnConnectionEvent: function (b_connected, b_connecting) {
            try {
                if (!b_connected && !b_connecting) {
                    console.log("Phone Offline....UI Event");
                    if (ui_events.onMessage) {
                        var msg = {"veery_command":"Error","description":"Unable to Communicate With Servers. Please Re-register Your Phone Or Contact Your System Administrator."};
                        var event = {
                            data : JSON.stringify(msg)
                        };
                        ui_events.onMessage(event);
                    }
                }
            }
            catch (ex) {
                console.error(ex.message);
            }
        },
        onIncomingCall: function (sRemoteNumber) {
            try {
                console.info("........................... On incoming Call Event ........................... " + sRemoteNumber);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"IncomingCall","description":"IncomingCall - " +sRemoteNumber,"number":sRemoteNumber};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }
            catch (ex) {
                console.error(ex);
            }
        },
        uiCallTerminated: function (msg) {
            if (ui_events.onMessage) {
                var msg = {"veery_command":"EndCall","description":"EndCall - " +msg};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        onMediaStream: function (e) {
            var msg = "Media Stream Permission Denied";
            showNotification(msg, 50000);
            shared_function.showAlert('Phone', 'error', msg);
            console.error(msg);
        },
    };
    var registerSipPhone = function (password) {

        var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());

        var profile = {};
        var values = decodeData.context.veeryaccount.contact.split("@");
        profile.id = decodeData.context.resourceid;
        profile.displayName = values[0];
        profile.authorizationName = values[0];
        profile.publicIdentity = "sip:" + decodeData.context.veeryaccount.contact;//sip:bob@159.203.160.47
        profile.password = password;
        profile.server = {};
        profile.server.token = authService.GetToken();
        profile.server.domain = values[1];
        profile.server.websocketUrl = "wss://" + values[1] + ":7443";//wss://159.203.160.47:7443
        profile.server.ice_servers = turnServers;
        profile.server.outboundProxy = "";
        profile.server.enableRtcwebBreaker = false;
        dataParser.userProfile = profile;
        if (!decodeData.context.resourceid) {
            console.log("Phone Offline....Sip Password-errr");
            if (ui_events.onError) {
                ui_events.onError("Fail to Get Resource Information's.");
            }
            /*
            showAlert("Soft Phone", "error", "Fail to Get Resource Information's.");*/
            return;
        }


        resourceService.SipUserPassword(values[0]).then(function (reply) {

            var decrypted = $crypto.decrypt(reply, "DuoS123");
            profile.password = decrypted;
            resourceService.GetContactVeeryFormat().then(function (response) {
                if (response.IsSuccess) {
                    if (profile.server.password)
                        profile.password = profile.server.password;
                    profile.veeryFormat = response.Result;
                    dataParser.userProfile = profile;
                    profile.server.bandwidth_audio = phoneSetting.Bandwidth;
                    profile.server.ReRegisterTimeout = phoneSetting.ReRegisterTimeout;
                    profile.server.ReRegisterTryCount = phoneSetting.ReRegisterTryCount;

                    sipUnRegister();
                    preInit(sip_events, profile);
                    resourceService.MapResourceToVeery(profile.publicIdentity);
                }
                else {
                    if (ui_events.onError) {
                        ui_events.onError("Fail to Get Contact Details.");
                    }
                }
            }, function (error) {
                if (ui_events.onError) {
                    ui_events.onError(error.message);
                }
            });

        }, function (error) {
            if (ui_events.onError) {
                ui_events.onError(error.message);
            }
        });
    };
    return {
        getName: function () {
            return 'veery_web_rtc_phone';
        },
        registerSipPhone: function (key) {
            registerSipPhone(key);
        },
        subscribeEvents: function (events) {
            ui_events = events;
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Handshake","description":"Initialized"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        incomingCall:function (key,number) {

        },
        makeCall: function (key,number,my_id) {
            sipCall('call-audio', number);
        },
        answerCall: function (key,session_id) {
            answerCall();
        },
        rejectCall: function (key,session_id) {
            rejectCall();
        },
        endCall: function (key,session_id) {
            sipHangUp();
        },
        etlCall: function (key,session_id) {
            var dtmfSet = phoneSetting.EtlCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
            if (ui_events.onMessage) {
                var msg = {"veery_command":"EtlCall","description":"EtlCall"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        transferCall: function (key,session_id, number,callref_id) {
            var dtmfSet = number.length < phoneSetting.ExtNumberLength ? phoneSetting.TransferExtCode.split('') : phoneSetting.TransferPhnCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
            $timeout(function () {
                dtmfSet = number.split('');
                angular.forEach(dtmfSet, function (chr) {
                    sipSendDTMF(chr);
                });
                sipSendDTMF('#');
            }, 1000);
            if (ui_events.onMessage) {
                var msg = {"veery_command":"TransferCall","description":"TransferCall"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        swapCall: function (key,session_id) {
            var dtmfSet = phoneSetting.SwapCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
        },
        holdCall: function (key,session_id) {
            var h = sipToggleHoldResume();
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Error","description":"Fail To Hold Call"};
                if(h === '0'){
                    msg = {"veery_command":"UnholdCall"} ;
                }else if (h === '1') {//hold
                    msg = {"veery_command":"HoldCall"} ;
                }
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        unholdCall: function (key,session_id) {
            sipToggleHoldResume();
        },
        muteCall: function (key,session_id) {
            sipToggleMute()
        },
        unmuteCall: function (key,session_id) {
            sipToggleMute()
        },
        conferenceCall: function (key,session_id) {
            var dtmfSet = phoneSetting.ConferenceCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });

            if (ui_events.onMessage) {
                var msg = {"veery_command":"ConfCall","description":"ConfCall"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        freezeAcw: function (key, session_id) {
            resourceService.FreezeAcw(session_id, true).then(function (response) {
                if (ui_events.onMessage) {
                   var msg = {"veery_command":"FreezeReqCancel"};
                   if(response){
                       msg = {"veery_command":"Freeze"} ;
                   }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"FreezeReqCancel"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }

            });
        },
        endFreeze: function (key, session_id) {
            resourceService.FreezeAcw(session_id, false).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        endAcw: function (key, session_id) {
            resourceService.EndAcw(session_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        send_dtmf: function (key,session_id,dtmf) {
            sipSendDTMF(dtmf);
        },
        unregister: function (key) {
            sipUnRegister();
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Offline"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        }
    };

});