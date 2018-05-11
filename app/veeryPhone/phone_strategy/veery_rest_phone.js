/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('veery_rest_phone', function ($crypto, websocketServices, jwtHelper, authService, resourceService) {

    var ui_events = {};


    return {
        getName: function () {
            return 'veery_rest_phone';
        },
        registerSipPhone: function (key) {
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Initialized","description":"Initialized"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        subscribeEvents: function (events) {
            ui_events = events;
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Handshake","veery_api_key":"codemax","description":"Not Implemented"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        unsubscribeEvents: function () {
            ui_events = {};
        },
        incomingCall:function (key,number) {
            if (ui_events.onMessage) {
                var msg = {"veery_command":"IncomingCall","veery_api_key":"codemax","description":"IncomingCall"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        makeCall: function (key,number,my_id) {
            resourceService.Call(number, my_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Dial Call"};
                    if(response){
                        msg = {"veery_command":"MakeCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            })
        },
        answerCall: function (key,session_id) {
            resourceService.CallAnswer(session_id, true).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Answer Call"};
                    if(response){
                        msg = {"veery_command":"AnswerCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        rejectCall: function (key,session_id) {
            resourceService.CallHungup(session_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Reject Call"};
                    if(response){
                        msg = {"veery_command":"EndCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        endCall: function (key,session_id) {
            resourceService.CallHungup(session_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To End Call"};
                    if(response){
                        msg = {"veery_command":"EndCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        etlCall: function (key,session_id) {
            resourceService.EtlCall(session_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To End Transfer Call"};
                    if(response){
                        msg = {"veery_command":"EtlCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        transferCall: function (key,session_id, number,callref_id) {
            resourceService.TransferCall(number, session_id, callref_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Transfer Call"};
                    if(response){
                        msg = {"veery_command":"TransferCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        swapCall: function (key,session_id) {
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Error","description":"Not Implemented"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        holdCall: function (key,session_id) {
            resourceService.CallHold(session_id, 'true').then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Hold Call"};
                    if(response){
                        msg = {"veery_command":"HoldCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        unholdCall: function (key,session_id) {
            resourceService.CallHold(session_id, 'false').then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Un-Hold Call"};
                    if(response){
                        msg = {"veery_command":"UnholdCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        muteCall: function (key,session_id) {
            resourceService.CallMute(session_id, 'true').then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Mute Call"};
                    if(response){
                        msg = {"veery_command":"MuteCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        unmuteCall: function (key,session_id) {
            resourceService.CallMute(session_id, 'false').then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Fail To Mute Call"};
                    if(response){
                        msg = {"veery_command":"UnmuteCall"} ;
                    }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"Error","description":"Communication Error"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        conferenceCall: function (key,session_id) {
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Error","description":"Not Implemented"};
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
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"FreezeReqCancel","description":"Communication Error"};
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
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze","description":"Communication Error"};
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

        },
        unregister: function (key) {

        }
    };

});