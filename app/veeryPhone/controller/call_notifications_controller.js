/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.controller('call_notifications_controller', function ($rootScope, $scope, $timeout, jwtHelper, authService, veery_phone_api, shared_data, shared_function, WebAudio, chatService) {

    //veery_phone_api.setStrategy(shared_data.phone_strategy);
    // -------------------- ringtone config -------------------------------------
    var options = {
        buffer: true,
        loop: true,
        gain: 1,
        fallback: false,     // Use HTML5 audio fallback
        retryInterval: 500  // Retry interval if buffering fails
    };
    var audio = new WebAudio('assets/sounds/ringtone.wav', options);
    audio.buffer();

    audio.onPlay = function () {
        console.info("........................... Playing Audio ........................... ");
    };    // When media starts playing
    audio.onStop = function () {
        console.info("........................... Stop Audio ........................... ");
    };      // When media is stopped (with audio.stop())
    audio.onEnd = function () {
        console.info("........................... End Audio ........................... ");
    };    // When media finishes playing completely (only if loop = false)
    audio.onBuffered = function () {
        console.info("........................... Buffered  Audio ........................... ");
    }; // When media is buffered

    function startRingTone(no) {
        try {
            audio.play();
            console.info("........................... Play Ring Tone ........................... " + no);
        }
        catch (e) {
            console.error("-------------------------- Fail To play Ring Tone. -----------------------------------");
            console.error(e);
        }
    }

    function stopRingTone() {
        try {
            audio.stop();
            console.info("........................... Stop Ring Tone ........................... ");
        }
        catch (e) {
            console.error("----------------------------- Fail To Stop RingTone. ---------------------------");
            console.error(e);
        }
    }

    /* var ringtone = new Audio('assets/sounds/ringtone.wav');
     ringtone.loop = true;

     function startRingTone(no) {
         try {
             ringtone.play();
             console.info("........................... Play Ring Tone ........................... " + no);
         }
         catch (e) {
             console.error("Fail To play Ring Tone.");
             console.error(e);
         }
     }

     function stopRingTone() {
         try {
             ringtone.pause();
             console.info("........................... Stop Ring Tone ........................... ");
         }
         catch (e) {
             console.error("Fail To Stop RingTone.");
             console.error(e);
         }
     }*/
    // -------------------- ringtone config -------------------------------------

    var veery_api_key = "";
    var sipConnectionLostCount = 0;

    $scope.notification_call = {
        number: "",
        skill: "",
        displayName: "",
        sessionId: ""
    };

    var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());
    var my_id = decodeData.context.veeryaccount.contact;

    /*----------------------- timers configurations -------------------------------*/

    /*acw_countdown_timer phone */
    var acw_countdown_web_rtc_timer = new Timer();
    acw_countdown_web_rtc_timer.addEventListener('secondsUpdated', function (e) {
        $('#call_notification_acw_countdown_web_rtc_timer .values').html(acw_countdown_web_rtc_timer.getTimeValues().toString());
    });
    acw_countdown_web_rtc_timer.addEventListener('targetAchieved', function (e) {
        notification_panel_ui_state.call_idel();
    });

    /*call duration timer webrtc*/
    var call_duration_webrtc_timer = new Timer();
    call_duration_webrtc_timer.addEventListener('secondsUpdated', function (e) {
        $('#call_notification_call_duration_webrtc_timer').html(call_duration_webrtc_timer.getTimeValues().toString());
    });

    /*call duration timer*/
    var call_duration_timer = new Timer();
    call_duration_timer.addEventListener('secondsUpdated', function (e) {
        $('#call_notification_call_duration_timer').html(call_duration_timer.getTimeValues().toString());
    });

    /*acw_countdown_timer */
    var acw_countdown_timer = new Timer();
    acw_countdown_timer.addEventListener('secondsUpdated', function (e) {
        $('#call_notification_acw_countdown_timer .values').html(acw_countdown_timer.getTimeValues().toString());
    });
    acw_countdown_timer.addEventListener('targetAchieved', function (e) {
        notification_panel_ui_state.call_idel();
    });

    /*freeze_timer*/
    var freeze_timer = new Timer();
    freeze_timer.addEventListener('secondsUpdated', function (e) {
        $('#call_notification_freeze_duration_timer').html(freeze_timer.getTimeValues().toString());
    });

    /*----------------------- timers configurations -------------------------------*/
    var timeReset = function () {

    };
    var autoAnswerTimeTimer = $timeout(timeReset, 0);
    $scope.notification_panel_phone = {
        auto_answer: function () {
            try {
                if (shared_data.phone_config && shared_data.phone_config.autoAnswer) {
                    var autoAnswerAfterDelay = function () {
                        $timeout.cancel(autoAnswerTimeTimer);
                        $scope.notification_panel_phone.call_answer();
                    };
                    autoAnswerTimeTimer = $timeout(autoAnswerAfterDelay, shared_data.phone_config.autoAnswerDelay);
                }
            }
            catch (ex) {
                console.log(ex)
            }
        },
        make_call: function (number) {
            $scope.notification_call.skill = 'Outbound Call';
            veery_phone_api.makeCall(veery_api_key, number, my_id);
        },
        call_answer: function () {
            veery_phone_api.answerCall(veery_api_key);
        },
        call_end: function () {
            veery_phone_api.endCall(veery_api_key, (shared_data.callDetails.direction.toLowerCase() === 'outbound') ?
                shared_data.callDetails.sessionId : shared_data.callDetails.callrefid);
        },
        call_mute: function () {
            veery_phone_api.muteCall(veery_api_key);
        },
        call_hold: function () {
            veery_phone_api.holdCall(veery_api_key);
        },

        call_freeze: function () {
            notification_panel_ui_state.call_freeze_req();
            veery_phone_api.freezeAcw(veery_api_key, $scope.notification_call.sessionId);
        },
        call_end_freeze: function () {
            veery_phone_api.endFreeze(veery_api_key, $scope.notification_call.sessionId);
        },
        call_end_acw: function () {
            veery_phone_api.endAcw(veery_api_key, $scope.notification_call.sessionId);
        },
        call_transfer: function (number) {
            veery_phone_api.transferCall(veery_api_key, number, shared_data.callDetails.callrefid);
        },
        open_transfer_view: function () {
            notification_panel_ui_state.call_transfer_view();
        },
        close_transfer_view: function () {
            notification_panel_ui_state.call_close_transfer_view();
        },
        call_etl: function () {
            veery_phone_api.etlCall(veery_api_key);
        },
        call_conference: function () {
            veery_phone_api.conferenceCall(veery_api_key);
        },
        cPanleToggelRight: function () {

        },
        cPanleToggelLeft: function () {

        }
    };
    var element;
    /* ---------------- UI status -------------------------------- */
    var notification_panel_ui_state = {
        phone_online: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                $('#idPhoneReconnect').addClass('display-none');
                $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
                $('#phoneRegister').removeClass('display-none');
                $('#isBtnReg').addClass('display-block active-menu-icon').removeClass('display-none');
                $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
                $('#softPhoneDragElem').addClass('display-block').removeClass('display-none ');
                $('.isOperationPhone').addClass('display-block ').removeClass('display-none');
                $('#softPhone').addClass('display-block ').removeClass('display-none');
                $('#agentDialerTop').addClass('display-block active-menu-icon').removeClass('display-none');
                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].stop();
                $('#softPhone').removeClass('phone-disconnected');
                element = document.getElementById('answerButton');
                if (element) {
                    element.onclick = function () {
                        $scope.notification_panel_phone.make_call(shared_data.callDetails.number);
                    };
                }
                shared_function.showAlert("Soft Phone", "success", "Phone Connected");
            }
            else {
                $('#call_notification_panel').removeClass('display-none');
                $('#idPhoneReconnect').addClass('display-none');
                //is loading done
                $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
                $('#phoneRegister').removeClass('display-none');
                $('#isBtnReg').addClass('display-block active-menu-icon').removeClass('display-none');
                $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
                $('#softPhoneDragElem').addClass('display-block').removeClass('display-none ');
                $('#softPhone').removeClass('phone-disconnected');
            }
            notification_panel_ui_state.call_idel();

        },
        phone_offline: function (title, msg) {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_panel').addClass('display-none');
            shared_function.showAlert('Phone', 'error', msg);
            shared_function.showWarningAlert(title, msg);
        },
        phone_operation_error: function (msg) {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#softPhone').addClass('phone-disconnected');
                $('#isCallOnline').addClass('display-block transport-error').removeClass('display-none');
                $rootScope.$emit('dialstop', undefined);
                console.log("Phone Offline....PhoneOnErrorState......");
                $scope.showAlert("Soft Phone", "error", msg);
            } else {
                shared_function.showAlert('Phone', 'error', msg);
            }
            chatService.Status('offline', 'call');
        },
        call_idel: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                $('#answerButton').addClass('phone-sm-btn answer').removeClass('display-none');
                $('#freezebtn').addClass('display-none').removeClass('phone-sm-btn ');
                $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
                $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
                $('#dialPad').addClass('veery-font-1-menu-4').removeClass('display-none');
                $('#contactList').addClass('veery-font-1-user').removeClass('display-none');
                $('#morebtn').addClass('phone-sm-btn phone-sm-bn-p8 veery-font-1-more').removeClass('display-none');
                $scope.freeze = false;
                $scope.isAcw = false;
                $scope.isReadyToSpeak = false;
                document.getElementById('callStatus').innerHTML = 'Idle';
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                $('#transferCall').addClass('display-none').removeClass('display-inline');
                $('#divKeyPad').removeClass('display-none');
                $('#divIvrPad').addClass('display-none');
                $('#transferIvr').addClass('display-none').removeClass('display-inline');
                $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');

                // $('#swapCall').addClass('display-none').removeClass('display-inline');
                call_duration_webrtc_timer.stop();
                acw_countdown_web_rtc_timer.stop();
                return;
            }
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').addClass('display-none');
            $('#call_notification_Information').addClass('display-none');
            $('#call_notification_outbound').removeClass('display-none');

            $('#call_notification_call_conference_btn').addClass('display-none');
            $('#call_notification_call_etl_btn').addClass('display-none');
            $('#call_notification_call_transfer_btn').removeClass('display-none');


            call_duration_timer.stop();
            acw_countdown_timer.stop();

            stopRingTone();
            chatService.Status('available', 'call');
            $scope.isAcw = false;
            $scope.freeze = false;
        },
        call_incoming: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                if (element) {
                    element.onclick = function () {
                        $scope.notification_panel_phone.call_answer();
                    };
                }
                $('#incomingNotification').addClass('display-block fadeIn').removeClass('display-none zoomOut');
                var msg = "Hello " + shared_data.firstName + " you are receiving a call";
                var no = shared_data.callDetails.number;
                if (no) {
                    msg = msg + " From " + no;
                }
                if (shared_data.callDetails.skill && no) {
                    msg = "Hello " + shared_data.firstName + " You Are Receiving a " + shared_data.callDetails.skill + " Call From " + no;
                }
                showNotification(msg, 15000);
                document.getElementById('phone_number').innerHTML = no;
                $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
                $('#holdResumeButton').addClass('display-none ').removeClass('display-inline');
                $('#muteButton').addClass('display-none ').removeClass('display-inline');
                /*addCallToHistory(sRemoteNumber, 2);*/
                document.getElementById('callStatus').innerHTML = 'Incoming Call';
                $scope.notification_panel_phone.auto_answer();
                call_duration_webrtc_timer.stop();
                acw_countdown_web_rtc_timer.stop();
                return;
            }
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').addClass('display-none');
            $('#call_notification_Information').removeClass('display-none');
            $('#call_notification_outbound').addClass('display-none');

            $('#call_notification_answer_btn').removeClass('display-none');

            call_duration_timer.stop();
            acw_countdown_timer.stop();
            startRingTone(shared_data.callDetails.number);
            chatService.Status('busy', 'call');
            $scope.inCall = true;
            $scope.addToCallLog(shared_data.callDetails.number, 'Rejected');
            console.info("........................... On incoming Call Event End ........................... " + shared_data.callDetails.number);
        },
        call_connected: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('display-none');
                $('#speakerButton').addClass('veery-font-1-microphone').removeClass('veery-font-1-muted display-none');
                $('#muteButton').addClass('phone-btn ').removeClass('display-none');
                $('#muteButton').addClass('veery-font-1-mute').removeClass('veery-font-1-muted');
                $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
                $('#transferCall').addClass('display-inline').removeClass('display-none');
                $('#transferIvr').addClass('display-inline').removeClass('display-none');
                $('#answerButton').addClass('display-none ').removeClass('phone-sm-btn answer');
                document.getElementById('callStatus').innerHTML = 'In Call';
                $('#calltimmer').removeClass('display-none').addClass('call-duations');
                if (element) {
                    element.onclick = function () {
                        $scope.notification_panel_phone.make_call(shared_data.callDetails.number);
                    };
                }
                $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
                stopRingTone();
                stopRingbackTone();

                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].start();
                $scope.addToCallLog(shared_data.callDetails.number, 'Answered');
                $('#call_notification_acw_countdown_web_rtc_timer .values').html("00:00:00");
                $('#call_notification_call_duration_webrtc_timer').html("00:00:00");
                acw_countdown_web_rtc_timer.stop();
                call_duration_webrtc_timer.reset();

            }
            else {
                $('#call_notification_call_function_btns').removeClass('display-none');
                $('#call_notification_acw_panel').addClass('display-none');
                $('#call_notification_Information').removeClass('display-none');
                $('#call_notification_outbound').addClass('display-none');

                $('#call_notification_answer_btn').addClass('display-none');
                $('#call_notification_call_transfer_btn').removeClass('display-none');
                $('#call_notification_call_etl_btn').addClass('display-none');
                $('#call_notification_call_hold_btn').removeClass('display-none');

                $('#call_notification_acw_countdown_timer .values').html("00:00:00");
                $('#call_notification_call_duration_timer').html("00:00:00");
                call_duration_timer.reset();
                acw_countdown_timer.stop();
            }

            chatService.Status('busy', 'call');
        },
        call_disconnected: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                if (element) {
                    element.onclick = function () {
                        $scope.notification_panel_phone.make_call(shared_data.callDetails.number);
                    };
                }
                $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].stop();
                $scope.isAcw = true;
                $('#calltimmer').addClass('display-none').removeClass('call-duations');
                $('#countdownCalltimmer').addClass('call-duations').removeClass('display-none');
                document.getElementById('callStatus').innerHTML = 'ACW';
                //document.getElementById('countdownCalltimmer').getElementsByTagName('timer')[0].start();
                $('#answerButton').addClass('display-none ').removeClass('phone-sm-btn answer');
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');
                $('#morebtn').addClass('display-none').removeClass('phone-sm-btn phone-sm-bn-p8 veery-font-1-more');
                $('#endButton').addClass('display-none ');
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                $('#holdResumeButton').addClass('display-none ').removeClass('display-inline');
                $('#muteButton').addClass('display-none ').removeClass('display-inline');
                $('#speakerButton').addClass('display-none ');
                // $('#swapCall').addClass('display-none').removeClass('display-inline');
                $('#transferCall').addClass('display-none').removeClass('display-inline');
                $('#transferIvr').addClass('display-none').removeClass('display-inline');
                $('#divKeyPad').removeClass('display-none');
                $('#divIvrPad').addClass('display-none');
                $('#dialPad').addClass('display-none').removeClass('veery-font-1-menu-4');
                $('#contactList').addClass('display-none').removeClass('veery-font-1-user');
                $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
                $('#endACWbtn').addClass('phone-sm-btn ').removeClass('display-none');
                acw_countdown_web_rtc_timer.start({countdown: true, startValues: {seconds: shared_data.acw_time}});
                $('#call_notification_acw_countdown_web_rtc_timer.values').html(acw_countdown_web_rtc_timer.getTimeValues().toString());
            }
            else {
                $('#call_notification_call_function_btns').addClass('display-none');
                $('#call_notification_acw_panel').removeClass('display-none');
                $('#call_notification_Information').addClass('display-none');
                $('#call_notification_outbound').addClass('display-none');

                $('#call_notification_freeze').addClass('display-none');
                $('#call_notification_call_transfer_panel').addClass('display-none');
                $('#call_notification_acw').removeClass('display-none');


                acw_countdown_timer.start({countdown: true, startValues: {seconds: shared_data.acw_time}});
                $('#call_notification_acw_countdown_timer .values').html(acw_countdown_timer.getTimeValues().toString());
            }
            $scope.inCall = false;
            stopRingbackTone();
            stopRingTone();
        },
        call_mute: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_mute_btn').addClass('display-none');
            $('#call_notification_call_unmute_btn').removeClass('display-none');
        },
        call_unmute: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_unmute_btn').addClass('display-none');
            $('#call_notification_call_mute_btn').removeClass('display-none');
        },
        call_hold: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_hold_btn').addClass('display-none');
            $('#call_notification_call_unhold_btn').removeClass('display-none');
        },
        call_unhold: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_unhold_btn').addClass('display-none');
            $('#call_notification_call_hold_btn').removeClass('display-none');
        },
        call_freeze_req: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#freezeRequest').removeClass('display-none');
                acw_countdown_web_rtc_timer.pause();
                return;
            }
            $('#call_notification_freeze_btn').addClass('display-none');
            $('#call_notification_freeze_request').removeClass('display-none');
        },
        call_freeze_req_cancel: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#freezeRequest').addClass('display-none');
                acw_countdown_web_rtc_timer.start();
                return;
            }
            $('#call_notification_freeze_request').addClass('display-none');
            $('#call_notification_freeze_btn').removeClass('display-none');
        },
        call_freeze: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#freezeRequest').addClass('display-none');
                $('#calltimmer').addClass('call-duations').removeClass('display-none');
                $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
                $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
                $('#freezeRequest').addClass('display-none').removeClass('call-duations');
                call_duration_webrtc_timer.reset();
                $("#freezebtn").attr({
                    "title": "End-Freeze [Alt+Z]"
                });
                //freeze_timer.reset();
                return;
            }
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').removeClass('display-none');
            $('#call_notification_Information').addClass('display-none');
            $('#call_notification_outbound').addClass('display-none');

            $('#call_notification_acw').addClass('display-none');
            $('#call_notification_freeze').removeClass('display-none');
            $('#call_notification_freeze_btn').removeClass('display-none');
            $('#call_notification_freeze_request').addClass('display-none');
            freeze_timer.reset();

        },
        call_transfer_view: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_call_transfer_panel').removeClass('display-none');

        },
        call_close_transfer_view: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_function_btns').removeClass('display-none');
            $('#call_notification_call_transfer_panel').addClass('display-none');

        },
        call_transfer: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_function_btns').removeClass('display-none');
            $('#call_notification_call_conference_btn').removeClass('display-none');
            $('#call_notification_call_etl_btn').removeClass('display-none');
            $('#call_notification_call_transfer_panel').addClass('display-none');
            $('#call_notification_call_transfer_btn').addClass('display-none');
            $('#call_notification_call_hold_btn').addClass('display-none');
        },
        call_conference: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            }
            $('#call_notification_call_conference_btn').addClass('display-none');
            $('#call_notification_call_etl_btn').addClass('display-none');
        }
    };
    /* ---------------- UI status -------------------------------- */


    var subscribeEvents = {
        onClose: function (event) {
            if (veery_api_key === "") {
                console.log("invalidMessage.");
                return;
            }
            console.log(event);
            var msg = "Connection Interrupted with Phone.";
            if (sipConnectionLostCount < 2)
                notification_panel_ui_state.phone_offline('Connection Interrupted', msg);
            sipConnectionLostCount++;
        },
        onError: function (event) {
            if (veery_api_key === "") {
                console.log("invalidMessage.");
                return;
            }
            console.log(event);
            var msg = "Connection Interrupted with Phone.";
            if (sipConnectionLostCount < 2)
                notification_panel_ui_state.phone_offline('Connection Interrupted', msg);
            sipConnectionLostCount++;
        },
        onMessage: function (event) {
            console.log(event);
            var data = JSON.parse(event.data);
            switch (data.veery_command) {
                case 'Handshake':
                    veery_api_key = data.veery_api_key;
                    veery_phone_api.registerSipPhone(veery_api_key);
                    sipConnectionLostCount = 0;
                    break;
                case 'Initialized':
                    notification_panel_ui_state.phone_online();
                    sipConnectionLostCount = 0;
                    break;
                case 'IncomingCall':
                    var no = data.number ? data.number : "N/A";
                    if ($scope.isAcw || $scope.freeze) {
                        console.info("........................... Reject Call ........................... " + no);
                        $scope.notification_panel_phone.call_end();
                        $scope.addToCallLog(no, 'Rejected');
                        return;
                    }
                    shared_data.callDetails.number = no;
                    shared_data.callDetails.direction = "inbound";
                    notification_panel_ui_state.call_incoming();
                    break;
                case 'MakeCall':
                    notification_panel_ui_state.call_connected();
                    break;
                case 'AnswerCall':
                    notification_panel_ui_state.call_connected();
                    break;
                case 'EndCall':
                    notification_panel_ui_state.call_disconnected();
                    break;
                case 'HoldCall':
                    notification_panel_ui_state.call_hold();
                    break;
                case 'UnholdCall':
                    notification_panel_ui_state.call_unhold();
                    break;
                case 'MuteCall':
                    notification_panel_ui_state.call_mute();
                    break;
                case 'UnmuteCall':
                    notification_panel_ui_state.call_unmute();
                    break;
                case 'TransferCall':
                    notification_panel_ui_state.call_transfer();
                    break;
                case 'ConfCall':
                    notification_panel_ui_state.call_conference();
                    break;
                case 'EtlCall':
                    notification_panel_ui_state.call_connected();
                    break;
                case 'Freeze':
                    notification_panel_ui_state.call_freeze();
                    break;
                case 'FreezeReqCancel':
                    notification_panel_ui_state.call_freeze_req_cancel();
                    break;
                case 'EndFreeze':
                    notification_panel_ui_state.call_idel();
                    break;
                case 'Error':
                    notification_panel_ui_state.phone_operation_error(data.description);
                    break;
                case 'Session Progress':
                    shared_function.showAlert("Soft Phone", "info", 'Session Progress');
                    break;
                default:

            }
        },

    };

   /* chatService.SubscribeEvents(function (event, data) {
        console.log('Chat Service Subscribe Events : ' + event);
        if (event === 'agent_found') {

            var values = data.Message.split("|");

            var needToShowNewTab = false;
            if ( shared_data.phone_strategy!="veery_web_rtc_phone" || shared_data.callDetails.number === "" || shared_data.callDetails.number === undefined || shared_data.callDetails.number === "Outbound Call" || values[3].startsWith(shared_data.callDetails.number)) {
                needToShowNewTab = true;
            }
            else {
                var tempNumber = "";
                if (values.length === 12 && values[11] === 'TRANSFER') {
                    tempNumber = values[3];
                }
                else if (values.length === 12 && values[11] === 'AGENT_AGENT') {
                    tempNumber = values[5];
                }else if(values.length === 11 && values[7] === "outbound"){
                    tempNumber = shared_data.callDetails.number;
                }
                needToShowNewTab = tempNumber.startsWith(shared_data.callDetails.number);
                if(!needToShowNewTab){
                    if(shared_data.callDetails.number.length<=values[3].length){
                        //tempNumber = shared_data.callDetails.number.substr(1);
                        tempNumber = shared_data.callDetails.number.slice(-7);
                        needToShowNewTab = values[3].includes(tempNumber)
                    }else{
                        tempNumber = values[3].slice(-7);
                        needToShowNewTab = shared_data.callDetails.number.includes(tempNumber)
                    }
                }

                console.log(needToShowNewTab);
            }
        }
    });*/

    $rootScope.$on("initialize_call_notification", function (event, data) {
        veery_phone_api.setStrategy(shared_data.phone_strategy);
        $scope.PhoneLoading();
        veery_phone_api.subscribeEvents(subscribeEvents);
    });

    $rootScope.$on("incoming_call_notification", function () {
        veery_phone_api.incomingCall(veery_api_key, number, my_id);
    });

    $scope.$watch(function () {
        return shared_data.callDetails;
    }, function (newValue, oldValue) {
        angular.extend($scope.notification_call, newValue);
    });
});



