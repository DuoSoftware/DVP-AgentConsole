/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.controller('call_notifications_controller', function ($rootScope, $scope, $timeout, $ngConfirm, jwtHelper, hotkeys, authService, veery_phone_api, shared_data, shared_function, WebAudio, chatService, status_sync, resourceService) {

    /*----------------------------enable shortcut keys-----------------------------------------------*/

    hotkeys.add({
        combo: 'alt+a',
        description: 'Answer/Make Call',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            if ($scope.currentModeOption.toLowerCase() === 'outbound') {
                $scope.notification_panel_phone.make_call(shared_data.callDetails.number);
            }
            else {
                $scope.notification_panel_phone.call_answer();
            }
        }
    });

    hotkeys.add(
        {
            combo: 'alt+c',
            description: 'Drop Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.notification_panel_phone.call_end();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+r',
            description: 'reject Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.notification_panel_phone.call_end();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+h',
            description: 'Hold Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.notification_panel_phone.call_hold();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+z',
            description: 'freezeAcw Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                if ($scope.isAcw || $scope.freeze)
                    $scope.notification_panel_phone.call_freeze();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+w',
            description: 'End Freeze',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                if ($scope.isAcw || $scope.freeze)
                    $scope.notification_panel_phone.call_end_freeze();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+q',
            description: 'End-Acw Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                if ($scope.isAcw)
                    $scope.notification_panel_phone.call_end_acw();
            }
        });

    /*----------------------------enable shortcut keys-----------------------------------------------*/

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
            if (shared_data.phone_strategy === "veery_sip_phone")
                return;
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

    var call_in_progress = false;
    $scope.notification_panel_phone = {
        phone_mode_change: function (mode) {
            try {
                veery_phone_api.phone_mode_change(veery_api_key, mode);
            } catch (ex) {
                console.log(ex)
            }
        },
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
            if (number == "") {
                return
            }
            if (veery_api_key === undefined || veery_api_key === "" || ($('#call_notification_panel').hasClass('display-none') && $('#softPhone').hasClass('display-none'))) {
                shared_function.showAlert("Soft Phone", "error", "Phone Not Registered");
                return
            }
            if (call_in_progress) {
                shared_function.showAlert("Soft Phone", "error", "Call In Progress.");
                return
            }
            if ($scope.currentModeOption === null || $scope.currentModeOption.toLowerCase() !== 'outbound') {
                shared_function.showAlert("Soft Phone", "error", "Cannot make outbound call while you are in inbound mode.");
                return
            }
            $scope.notification_call.skill = 'Outbound Call';
            $scope.notification_call.direction = 'outbound';
            shared_data.callDetails = $scope.notification_call;
            veery_phone_api.makeCall(veery_api_key, number, my_id);
            notification_panel_ui_state.call_ringing();
            call_in_progress = true;
            $scope.addToCallLog(number, "Outbound");
        },
        call_answer: function () {
            veery_phone_api.answerCall(veery_api_key);
            call_in_progress = true;
        },
        call_end: function () {
            if (!call_in_progress) {
                $scope.addToCallLog(shared_data.callDetails.number, "Rejected");
            }
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
            veery_phone_api.freezeAcw(veery_api_key, shared_data.callDetails.sessionId);
        },
        call_end_freeze: function () {
            veery_phone_api.endFreeze(veery_api_key, shared_data.callDetails.sessionId);
        },
        call_end_acw: function () {
            veery_phone_api.endAcw(veery_api_key, shared_data.callDetails.sessionId);
        },
        call_transfer: function (number) {
            veery_phone_api.transferCall(veery_api_key, shared_data.callDetails.sessionId, number, shared_data.callDetails.callrefid);
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

        },
        send_dtmf: function (dtmf) {
            veery_phone_api.send_dtmf(veery_api_key, shared_data.callDetails.sessionId, dtmf);
        },
        unregister: function () {
            veery_phone_api.unregister(veery_api_key);
        }
    };
    var element;
    var phone_status = "Offline";
    /* ---------------- UI status -------------------------------- */
    $scope.notification_panel_ui_methid = {
        showIvrPenel: function () {

            if ($('#divIvrPad').hasClass('display-none')) {
                $('#divIvrPad').removeClass('display-none');
                $('#divKeyPad').addClass('display-none');
            }
            else {
                $('#divKeyPad').removeClass('display-none');
                $('#divIvrPad').addClass('display-none');
            }
        },
        showMoreOption: function () {
            $('#onlinePhoneBtnWrapper').removeClass('display-none');
            $('#phoneBtnWrapper').addClass('display-none');
        },
        hideMoreOption: function () {
            $('#phoneBtnWrapper').removeClass('display-none');
            $('#onlinePhoneBtnWrapper').addClass('display-none');
        },
        showPhoneBook: function () {
            notification_panel_ui_state.showPhoneBook();
        },
        hidePhoneBook: function () {
            notification_panel_ui_state.hidePhoneBook();
        }
    };

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
                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].stop();
                $('#softPhone').removeClass('phone-disconnected');
                element = document.getElementById('answerButton');

                $('#phoneDialpad input').off('click');
                $('#phoneDialpad input').click(function () {
                    var values = $(this).data('values');
                    var chr = values[0].toString();
                    $scope.call.number = $scope.call.number ? $scope.call.number + chr : chr;

                    $scope.notification_panel_phone.send_dtmf(chr);
                    $scope.$apply();
                });
                $('#call_logs').addClass('display-none');
            }
            else {
                if ($scope.currentModeOption === "Outbound") {
                    $('#call_notification_panel').removeClass('display-none');
                }
                $('#idPhoneReconnect').addClass('display-none');
                //is loading done
                $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
                $('#phoneRegister').removeClass('display-none');
                $('#isBtnReg').addClass('display-block active-menu-icon').removeClass('display-none');
                $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
                $('#softPhoneDragElem').addClass('display-block').removeClass('display-none ');
                $('#softPhone').removeClass('phone-disconnected');
                $('#call_logs').removeClass('display-none');

            }
            $('#agentDialerTop').addClass('display-block active-menu-icon').removeClass('display-none');
            shared_function.showAlert("Soft Phone", "success", "Phone Connected");

            sipConnectionLostCount = 0;
            $scope.phone_initialize = true;
            phone_status = "phone_online";
            if (shared_data.currentModeOption === "Inbound" || shared_data.currentModeOption === "Outbound")
                $scope.notification_panel_phone.phone_mode_change(shared_data.currentModeOption);

            notification_panel_ui_state.call_idel();
            set_agent_status_available();
        },
        phone_inbound: function () {
            $('#call_notification_panel').addClass('display-none');
        },
        phone_outbound: function () {
            $('#call_notification_panel').removeClass('display-none');
        },
        phone_offline: function (title, msg) {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

            }
            $('#call_notification_panel').addClass('display-none');
            $('#isBtnReg').addClass('display-none').removeClass('display-block active-menu-icon');
            $('#isCallOnline').addClass('display-none').removeClass('display-block deactive-menu-icon');
            $('#agentDialerTop').removeClass('display-block active-menu-icon').addClass('display-none');
            $('#call_logs').addClass('display-none');
            $('#agentDialerTop').addClass('display-none');
            shared_function.showAlert('Phone', 'error', msg);
            shared_function.showWarningAlert(title, msg);
            phone_status = "phone_offline";
            $scope.phone_initialize = false;

            $scope.resourceTaskObj[0].RegTask = "";
            $('#regStatusNone').removeClass('reg-status-done').addClass('task-none');
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
            phone_status = "phone_operation_error";

            $('#phoneRegister').removeClass('display-none');
            $('#call_logs').addClass('display-none');
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
                $scope.profile.freezeExceeded = false;
                document.getElementById('callStatus').innerHTML = 'Idle';
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                $('#transferCall').addClass('display-none').removeClass('display-inline');
                $('#divKeyPad').removeClass('display-none');
                $('#divIvrPad').addClass('display-none');
                $('#transferIvr').addClass('display-none').removeClass('display-inline');
                $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
                $('#endfreezebtn').removeClass('phone-sm-btn ').addClass('display-none');
                if (element) {
                    element.onclick = function () {
                        shared_data.callDetails.number = $scope.call.number;
                        $scope.notification_panel_phone.make_call(shared_data.callDetails.number);
                    };
                    element.title = "Make Call [Alt+A]";
                }
                // $('#swapCall').addClass('display-none').removeClass('display-inline');
                call_duration_webrtc_timer.stop();
                acw_countdown_web_rtc_timer.stop();

                //$scope.$apply();

            }
            else {
                $('#call_notification_call_function_btns').addClass('display-none');
                $('#call_notification_acw_panel').addClass('display-none');
                $('#call_notification_Information').addClass('display-none');
                $('#call_notification_outbound').removeClass('display-none');

                $('#call_notification_call_conference_btn').addClass('display-none');
                $('#call_notification_call_etl_btn').addClass('display-none');
                $('#call_notification_call_transfer_btn').removeClass('display-none');
                $('#call_notification_call_duration_timer').addClass('display-none');
                $('#call_notification_call_unmute_btn').addClass('display-none');
                $('#call_notification_call_mute_btn').removeClass('display-none');
                call_duration_timer.stop();
                acw_countdown_timer.stop();
                if (shared_data.currentModeOption === "Inbound") {
                    $('#call_notification_panel').addClass('display-none');
                }
            }


            stopRingTone();
            chatService.Status('available', 'call');
            $scope.isAcw = false;
            $scope.freeze = false;
            phone_status = "call_idel";
            if (!$('#AgentDialerUi').hasClass('display-none')) { // start only if dialer start
                $rootScope.$emit('dialnextnumber', undefined);
            }
            call_in_progress = false;
            set_agent_status_available();
        },
        call_ringing: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#answerButton').addClass('display-none ').removeClass('phone-sm-btn answer');
            }

            phone_status = "call_ringing";
            shared_data.agent_statue = "Reserved";
        },
        call_incoming: function () {

            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                if (element) {
                    element.onclick = function () {
                        $scope.notification_panel_phone.call_answer();
                    };
                    element.title = "Answer Call [Alt+A]";
                }
                $('#incomingNotification').addClass('display-block fadeIn').removeClass('display-none zoomOut');

                document.getElementById('phone_number').innerHTML = no;
                $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
                $('#holdResumeButton').addClass('display-none ').removeClass('display-inline');
                $('#muteButton').addClass('display-none ').removeClass('display-inline');
                /*addCallToHistory(sRemoteNumber, 2);*/
                document.getElementById('callStatus').innerHTML = 'Incoming Call';
                $scope.notification_panel_phone.auto_answer();
                call_duration_webrtc_timer.stop();
                acw_countdown_web_rtc_timer.stop();
            }
            else {
                $('#call_notification_panel').removeClass('display-none');
                $('#call_notification_call_function_btns').addClass('display-none');
                $('#call_notification_acw_panel').addClass('display-none');
                $('#call_notification_Information').removeClass('display-none');
                $('#call_notification_outbound').addClass('display-none');
                $('#call_notification_answer_btn').removeClass('display-none');
                call_duration_timer.stop();
                acw_countdown_timer.stop();
            }

            startRingTone(shared_data.callDetails.number);
            chatService.Status('busy', 'call');
            $scope.inCall = true;
            phone_status = "call_incoming";
            console.info("........................... On incoming Call Event End ........................... " + shared_data.callDetails.number);

            var msg = "Hello " + $scope.firstName + " you are receiving a call";
            if (shared_data.callDetails.number) {
                msg = msg + " From " + shared_data.callDetails.number;
            }
            if (shared_data.callDetails.skill && shared_data.callDetails.number) {
                msg = "Hello " + $scope.firstName + " You Are Receiving a " + shared_data.callDetails.skill + " Call From " + shared_data.callDetails.number;
            }
            showNotification(msg, 15000);
            shared_data.agent_statue = "Reserved";
            console.info("........................... Show Incoming call Notification Panel ...........................");
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
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                document.getElementById('callStatus').innerHTML = 'In Call';
                $('#calltimmer').removeClass('display-none').addClass('call-duations');
                $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');

                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].start();
                $('#call_notification_acw_countdown_web_rtc_timer .values').html("00:00:00");
                $('#call_notification_call_duration_webrtc_timer').html("00:00:00");
                acw_countdown_web_rtc_timer.stop();
                call_duration_webrtc_timer.reset();

            }
            else {
                $('#call_notification_call_duration_timer').removeClass('display-none');
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
            stopRingTone();
            stopRingbackTone();
            chatService.Status('busy', 'call');
            phone_status = "call_connected";
            $rootScope.$emit('stop_speak', true);
            shared_data.agent_statue = "Connected";
            $scope.addToCallLog(shared_data.callDetails.number, 'Answered');
        },
        call_end_etl: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('display-none');
                $('#speakerButton').addClass('veery-font-1-microphone').removeClass('veery-font-1-muted display-none');
                $('#muteButton').addClass('phone-btn ').removeClass('display-none');
                $('#muteButton').addClass('veery-font-1-mute').removeClass('veery-font-1-muted');
                $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
                $('#transferCall').addClass('display-inline').removeClass('display-none');
                $('#transferIvr').addClass('display-inline').removeClass('display-none');
                $('#answerButton').addClass('display-none ').removeClass('phone-sm-btn answer');
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                document.getElementById('callStatus').innerHTML = 'In Call';
                $('#calltimmer').removeClass('display-none').addClass('call-duations');
                $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');

                //document.getElementById('calltimmer').getElementsByTagName('timer')[0].start();

                $('#call_notification_acw_countdown_web_rtc_timer .values').html("00:00:00");
                $('#call_notification_call_duration_webrtc_timer').html("00:00:00");


            }
            else {
                $('#call_notification_call_duration_timer').removeClass('display-none');
                $('#call_notification_call_function_btns').removeClass('display-none');
                $('#call_notification_acw_panel').addClass('display-none');
                $('#call_notification_Information').removeClass('display-none');
                $('#call_notification_outbound').addClass('display-none');

                $('#call_notification_answer_btn').addClass('display-none');
                $('#call_notification_call_transfer_btn').removeClass('display-none');
                $('#call_notification_call_etl_btn').addClass('display-none');
                $('#call_notification_call_conference_btn').addClass('display-none');
                $('#call_notification_call_hold_btn').removeClass('display-none');
            }

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
            phone_status = "call_disconnected";
            shared_data.agent_statue = "AfterWork";
        },
        call_mute: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

            }
            else {
                $('#call_notification_call_mute_btn').addClass('display-none');
                $('#call_notification_call_unmute_btn').removeClass('display-none');
            }
            phone_status = "call_mute";
        },
        call_unmute: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

                return;
            } else {
                $('#call_notification_call_unmute_btn').addClass('display-none');
                $('#call_notification_call_mute_btn').removeClass('display-none');
            }

            phone_status = "call_unmute";
        },
        call_hold: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8 call-ended');
            } else {
                $('#call_notification_call_hold_btn').addClass('display-none');
                $('#call_notification_call_unhold_btn').removeClass('display-none');
            }
            phone_status = "call_hold";
        },
        call_unhold: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('call-ended');
            }
            else {
                $('#call_notification_call_unhold_btn').addClass('display-none');
                $('#call_notification_call_hold_btn').removeClass('display-none');
            }
            phone_status = "call_hold";
        },
        call_freeze_req: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#freezeRequest').removeClass('display-none');
                acw_countdown_web_rtc_timer.pause();
            } else {
                acw_countdown_timer.pause();
                $('#call_notification_freeze_btn').addClass('display-none');
                $('#call_notification_end_acw_btn').addClass('display-none');
                $('#call_notification_freeze_request').removeClass('display-none');
            }
            phone_status = "call_freeze_req";
        },
        call_freeze_req_cancel: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#freezeRequest').addClass('display-none');
                acw_countdown_web_rtc_timer.start();
            } else {
                acw_countdown_timer.start();
                $('#call_notification_freeze_request').addClass('display-none');
                $('#call_notification_freeze_btn').removeClass('display-none');
                $('#call_notification_end_acw_btn').removeClass('display-none');
            }

            phone_status = "call_freeze_req_cancel";
        },
        call_freeze: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
                $('#freezeRequest').addClass('display-none');
                $('#calltimmer').addClass('call-duations').removeClass('display-none');
                $('#endfreezebtn').addClass('phone-sm-btn ').removeClass('display-none');
                $('#freezebtn').removeClass('phone-sm-btn ').addClass('display-none');
                $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
                $('#freezeRequest').addClass('display-none').removeClass('call-duations');

                call_duration_webrtc_timer.reset();
                $("#freezebtn").attr({
                    "title": "End-Freeze [Alt+Z]"
                });
                //freeze_timer.reset();
            } else {
                $('#call_notification_call_function_btns').addClass('display-none');
                $('#call_notification_acw_panel').removeClass('display-none');
                $('#call_notification_Information').addClass('display-none');
                $('#call_notification_outbound').addClass('display-none');

                $('#call_notification_acw').addClass('display-none');
                $('#call_notification_freeze').removeClass('display-none');
                $('#call_notification_freeze_btn').removeClass('display-none');
                $('#call_notification_end_acw_btn').removeClass('display-none');
                $('#call_notification_freeze_request').addClass('display-none');
                acw_countdown_timer.stop();
                freeze_timer.reset();
            }

            phone_status = "call_freeze";
        },
        call_transfer_view: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {

            }
            else {
                $('#call_notification_call_function_btns').addClass('display-none');
                $('#call_notification_call_transfer_panel').removeClass('display-none');
            }


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
                $('#etlCall').removeClass('display-none').addClass('display-inline');
                $('#transferCall').addClass('display-none').removeClass('display-inline');
                $('#transferIvr').addClass('display-none').removeClass('display-inline');
                $('#conferenceCall').removeClass('display-none').addClass('display-inline');

            } else {
                $('#call_notification_call_function_btns').removeClass('display-none');
                $('#call_notification_call_conference_btn').removeClass('display-none');
                $('#call_notification_call_etl_btn').removeClass('display-none');
                $('#call_notification_call_transfer_panel').addClass('display-none');
                $('#call_notification_call_transfer_btn').addClass('display-none');
                $('#call_notification_call_hold_btn').addClass('display-none');
            }

            phone_status = "call_transfer";
        },
        call_conference: function () {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                $('#etlCall').addClass('display-none').removeClass('display-inline');
                $('#conferenceCall').addClass('display-none').removeClass('display-inline');
            }
            else {
                $('#call_notification_call_conference_btn').addClass('display-none');
                $('#call_notification_call_etl_btn').addClass('display-none');
            }

            phone_status = "call_conference";
        },
        update_call_status: function (status) {
            if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                document.getElementById('callStatus').innerHTML = status;
                return;
            }

        },
        transfer_ended: function (data) {
            if (data && data.Message) {
                var splitMsg = data.Message.split('|');

                if (splitMsg.length > 5) {
                    shared_function.showAlert(splitMsg[10], 'warn', 'Call transfer ended for ' + splitMsg[4]);
                }
                if (shared_data.phone_strategy === "veery_web_rtc_phone") {
                    $('#transferCall').addClass('display-inline').removeClass('display-none');
                    $('#conferenceCall').addClass('display-none').removeClass('display-inline');
                    $('#etlCall').addClass('display-none').removeClass('display-inline');
                }
                notification_panel_ui_state.call_end_etl();
            }
        },
        transfer_trying: function (data) {
            if (data && data.Message) {
                var splitMsg = data.Message.split('|');

                if (splitMsg.length >= 9) {
                    $scope.call.transferName = 'Transfer Call From : ' + splitMsg[3];
                    $scope.call.number = splitMsg[8];
                }
            }
        },
        agent_suspended: function (data) {
            agent_status_mismatch_count++;
            var taskType = "Call";
            if (data && data.Message) {
                var values = data.Message.split(":");
                if (values.length > 2) {
                    taskType = values[2];
                }
                else {
                    taskType = values[1];
                }
            }

            $ngConfirm({
                icon: 'fa fa-universal-access',
                title: 'Suspended!',
                content: '<div class="suspend-header-txt"> <h5>' + taskType.trim() + ' Task Suspended</h5> <span>Hi ' + $scope.firstName + ', Your account is suspended. Please Re-Register. </span></div>',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Ok',
                        btnClass: 'btn-red',
                        action: function () {
                            if (phone_status != "Offline")
                                $scope.notification_panel_phone.unregister();
                            agent_status_mismatch_count = 0;
                        }
                    }
                },
                columnClass: 'col-md-6 col-md-offset-3',
                /*boxWidth: '50%',*/
                useBootstrap: true
            });
            $('#userStatus').addClass('agent-suspend').removeClass('online');
        },
        showPhoneBook: function () {
            if (pinHeight != 0)
                removePin();
            $('#phoneBook').animate({
                left: '0'
            }, 500);
            $('#contactBtnWrp').removeClass('display-none');
            $('#phoneBtnWrapper').addClass('display-none');
            if ($('.contact-info-wr.height-auto')) $('.contact-info-wr').removeClass('height-auto');
        },
        hidePhoneBook: function () {
            $('#phoneBook').animate({
                left: '-235'
            }, 500);
            $('#contactBtnWrp').addClass('display-none');
            $('#phoneBtnWrapper').removeClass('display-none');
            $('.contact-info-wr').addClass('height-auto');
        },
        phoneLoading: function () {
            $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
            $('#isLoadingRegPhone').addClass('display-block').removeClass('display-none');
            $('#phoneRegister').addClass('display-none');
            $('#isBtnReg').addClass('display-none ').removeClass('display-block active-menu-icon');
            $('#phoneRegister').addClass('display-none');
        }
    };
    /* ---------------- UI status -------------------------------- */


    var subscribeEvents = {
        onClose: function (event) {
            if (veery_api_key === "" || veery_api_key === undefined) {
                console.log("invalidMessage.");
                return;
            }
            console.log(event);
            var msg = "Connection Interrupted with Phone.";
            if (sipConnectionLostCount < 1) {
                notification_panel_ui_state.phone_offline('Connection Interrupted', msg);
                veery_api_key = undefined;
            }
            sipConnectionLostCount++;
        },
        onError: function (event) {
            if (veery_api_key === "" || veery_api_key === undefined) {
                console.error("error occurred." + event);
                if (sipConnectionLostCount >= 2) {
                    veery_phone_api.unsubscribeEvents();
                    shared_data.phone_strategy = "veery_web_rtc_phone";
                    initialize_phone();
                    sipConnectionLostCount = 0;
                }
                sipConnectionLostCount++;
                return;
            }
            console.error(event);
            var msg = "Connection Interrupted with Phone.";
            if (sipConnectionLostCount < 1) {
                notification_panel_ui_state.phone_offline('Connection Interrupted', msg);
                veery_api_key = undefined;
            }
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

                    break;
                case 'IncomingCall':
                    var no = data.number ? data.number : "N/A";
                    $scope.addToCallLog(no, 'Missed Call');
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
                    notification_panel_ui_state.call_end_etl();
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
                case 'Offline':
                    notification_panel_ui_state.phone_offline("Phone Offline", "Soft Phone Unregistered.");
                    break;
                default:

            }
        }

    };

    /* ----------------------------  event subscribe ------------------------------------------*/


    chatService.SubscribeEvents(function (event, data) {
        switch (event) {
            case 'transfer_ended':
                notification_panel_ui_state.transfer_ended(data);
                break;
            case 'transfer_trying':
                notification_panel_ui_state.transfer_trying(data);
                break;
            case 'agent_suspended':
                notification_panel_ui_state.agent_suspended(data);
                break;
        }
    });

    var agent_status_mismatch_count = 0;
    shared_data.agent_statue = "Offline"; //Reserved , Break , Connected , AfterWork , Suspended , Available
    $scope.phone_initialize = false;
    var check_agent_status_timer = {};

    var mismatch_with_ards = 0;
    var validate_status_with_ards_timer = {};
    var validate_status_with_ards_mismatch_timer = undefined;
    var validate_agent_status = function (message) {
        function other_status_validation(slotState, slotMode)//Reserved , Connected , AfterWork , Available
        {
            function validate_status_with_ards(slotState, slotMode) {

                resourceService.validate_status_with_ards(slotState, slotMode).then(function (response) {
                    mismatch_with_ards++
                    if (response) {
                        agent_status_mismatch_count = 0;
                        $timeout.cancel(validate_status_with_ards_timer);
                        if (validate_status_with_ards_mismatch_timer) {
                            $timeout.cancel(validate_status_with_ards_mismatch_timer);
                        }
                    }
                    else {
                        if (mismatch_with_ards >= 3) {
                            shared_function.showWarningAlert("Agent Status", "Agent Status not match with backend service. please re-register.");
                            return;
                        }
                        validate_status_with_ards_mismatch_timer = $timeout(function () {
                            validate_status_with_ards(slotState, slotMode);
                        }, 60000);
                    }
                }, function (error) {
                    console.log(error);
                    $scope.showAlert("Agent Status", "error", "Fail To Validate Agent Status.");
                })
            }

            if (agent_status_mismatch_count >= 3) {
                if (slotMode != shared_data.currentModeOption) {
                    shared_function.showAlert("Agent Mode", "error", "Agent Mode not match with backend service. please re-register.");
                    if (agent_status_mismatch_count === 3) {
                        shared_function.showWarningAlert("Agent Mode", "Agent Mode not match with backend service. please re-register.");
                    }
                    return;
                }

                if (slotState != shared_data.agent_statue) {
                    if (agent_status_mismatch_count === 3) {
                        console.error("Your status not match with backend service. please re-register..............................");
                        shared_function.showWarningAlert("Agent Status", "Your status not match with backend service. please re-register.");
                    }
                }
            }
            if (agent_status_mismatch_count === 0) {
                validate_status_with_ards_timer = $timeout(function () {
                    validate_status_with_ards(slotState, slotMode);
                }, 120000);
            }
        }

        if (message && (message.resourceId === authService.GetResourceId())) {
            if (message.task === "CALL") {
                if(shared_data.agent_statue===message.slotState && shared_data.currentModeOption===message.slotMode){
                    agent_status_mismatch_count =0;
                    mismatch_with_ards = 0;
                    $timeout.cancel(validate_status_with_ards_timer);
                    if (validate_status_with_ards_mismatch_timer) {
                        $timeout.cancel(validate_status_with_ards_mismatch_timer);
                    }
                }
                if (agent_status_mismatch_count === 0) {
                    if (!$scope.phone_initialize) {
                        shared_function.showWarningAlert("Agent Status", "Please Initialize Soft Phone.");
                        console.error("Please Initialize Soft Phone.............................");
                        agent_status_mismatch_count++;
                        return;
                    }

                    switch (message.slotState) {
                        case "Suspended":
                            if (shared_data.agent_statue === "Suspended")
                                return;
                            var data = {Message: "Reject Count Exceeded!, Account Suspended for Task: CALL"};
                            notification_panel_ui_state.agent_suspended(data);
                            break;
                        case "Break":
                            if (shared_data.agent_statue === "Break")
                                return;
                            shared_function.showWarningAlert("Agent Status", "Agent Status mismatch. Please re-register.");
                            break;
                        default:
                            if (shared_data.agent_statue != message.slotState || shared_data.currentModeOption != message.slotMode)
                                agent_status_mismatch_count++;
                            //other_status_validation(message.slotState,message.slotMode);
                            break;
                    }
                }
                else {
                    if (shared_data.agent_statue != message.slotState || shared_data.currentModeOption != message.slotMode){
                        agent_status_mismatch_count++;
                        other_status_validation(message.slotState, message.slotMode);
                    }
                }
            }
        }
    };

    chatService.SubscribeDashboard(function (event) {
        switch (event.roomName) {
            case 'ARDS:freeze_exceeded':
                console.log("ARDS:freeze_exceeded----------------------------------------------------");
                var resourceId = authService.GetResourceId();
                if ($scope.profile && event.Message && event.Message.ResourceId === resourceId) {
                    $scope.profile.freezeExceeded = true;
                    notification_panel_ui_state.update_call_status('Freeze Exceeded.');
                }
                break;
            case 'ARDS:ResourceStatus':
                console.log("ARDS:ResourceStatus----------------------------------------------------");
                if (status_sync.enable)
                    validate_agent_status(event.Message);
                break;
        }


    });

    /* ----------------------------  event subscribe ------------------------------------------*/

    var initialize_phone = function () {
        veery_phone_api.setStrategy(shared_data.phone_strategy);
        notification_panel_ui_state.phoneLoading();
        veery_phone_api.subscribeEvents(subscribeEvents);
    };

    var set_agent_status_available = function () {
        if (shared_data.call_task_registered && (phone_status === "phone_online" || phone_status === "call_idel") && (shared_data.currentModeOption === "Inbound" || shared_data.currentModeOption === "Outbound")) {
            shared_data.agent_statue = "Available";
        }
    };

    angular.element(document).ready(function () {
        console.log("Load Notification Doc.............................");
        /*$rootScope.$on("initialize_phone", function (event, data) {
            if (data.initialize) {
                veery_phone_api.setStrategy(shared_data.phone_strategy);
                notification_panel_ui_state.phoneLoading();
                veery_phone_api.subscribeEvents(subscribeEvents);
            }
            else {
                if (!data.initialize)
                    $scope.notification_panel_phone.unregister();
            }
        });*/

        /*$rootScope.$on("incoming_call_notification", function (event, data) {
            $scope.notification_call = data;
            if (data.direction.toLowerCase() === 'inbound' && shared_data.phone_strategy === "veery_rest_phone") {
                veery_phone_api.incomingCall(veery_api_key, data.number, my_id);
            }
        });*/

        var make_call_handler = $rootScope.$on('makecall', function (events, args) {
            if (args) {
                $scope.notification_panel_phone.make_call(args.callNumber);
                $scope.tabReference = args.tabReference;
                $scope.notification_call.number = args.callNumber;
                shared_data.callDetails.number = args.callNumber;
            }
        });


        var command_handler = $rootScope.$on('execute_command', function (events, args) {
            if (args) {
                switch (args.command) {
                    case 'set_agent_status_available': {
                        set_agent_status_available();
                        break;
                    }
                    case 'initialize_phone': {
                        initialize_phone();
                        agent_status_mismatch_count = 0;
                        break;
                    }
                    case 'uninitialize_phone': {
                        if ($scope.phone_initialize) {
                            $scope.notification_panel_phone.unregister();
                        }
                        break;
                    }
                    case 'incoming_call_notification': {
                        $scope.notification_call = args.data;
                        if ((args.data.direction && args.data.direction.toLowerCase() === 'inbound') && shared_data.phone_strategy === "veery_rest_phone") {
                            veery_phone_api.incomingCall(veery_api_key, data.number, my_id);
                        }
                        break;
                    }
                    case 'make_call': {
                        if (args.data) {
                            $scope.notification_panel_phone.make_call(args.data.callNumber);
                            $scope.tabReference = args.data.tabReference;
                            notification_panel_ui_state.hidePhoneBook();
                            $scope.notification_call.number = args.data.callNumber;
                            shared_data.callDetails.number = args.data.callNumber;
                        }
                        else {
                            console.error("invalide make call command");
                        }
                        break;
                    }
                }
            }
        });


        var mode_change_watch = $scope.$watch(function () {
            return shared_data.currentModeOption;
        }, function (newValue, oldValue) {
            console.log("---------------------  Agent Mode Change to : " + newValue + " --------------------------------");
            if (!$scope.phone_initialize)
                return;
            if (newValue.toString() === "Outbound" && (phone_status === "phone_online" || phone_status === "call_idel")) {
                notification_panel_ui_state.phone_outbound();
                $scope.notification_panel_phone.phone_mode_change(newValue);
            }
            else if (newValue.toString() === "Inbound") {
                notification_panel_ui_state.phone_inbound();
                $scope.notification_panel_phone.phone_mode_change(newValue);
            }

            set_agent_status_available();
        });

        var task_change_watch = $scope.$watch(function () {
            return shared_data.call_task_registered;
        }, function (newValue, oldValue) {
            console.log("---------------------  Call Task Register State : " + newValue + " --------------------------------");
            set_agent_status_available();
        });

        $('#isBtnReg').addClass('display-none').removeClass('display-block active-menu-icon');
        $('#isCallOnline').addClass('display-none').removeClass('display-block deactive-menu-icon');

        // clean up listener when directive's scope is destroyed
        $scope.$on('$destroy', command_handler);
        $scope.$on('$destroy', mode_change_watch);
        $scope.$on('$destroy', make_call_handler);
        $scope.$on('$destroy', task_change_watch);
    });

    $('#softPhoneDragElem').draggable({
        preventCollision: true,
        containment: "window",
        start: function (event, ui) {
            $scope.isEnableSoftPhoneDrag = true;
        },
        stop: function (event, ui) {
        }
    });

    $('#callNotificationDragElem').draggable({
        preventCollision: true,
        containment: "window",
        start: function (event, ui) {
            $scope.isEnableCallNotificationDrag = true;
        },
        stop: function (event, ui) {
        }
    });


});



