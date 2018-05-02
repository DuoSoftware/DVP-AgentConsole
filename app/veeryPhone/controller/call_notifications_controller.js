/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.controller('call_notifications_controller', function ($rootScope, $scope,jwtHelper,authService, veery_phone_api, shared_data, shared_function) {

    //veery_phone_api.setStrategy(shared_data.phone_strategy);
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




    $scope.notification_panel_phone = {
        make_call: function (number) {
            $scope.notification_call.skill = 'Outbound Call';
            veery_phone_api.makeCall(veery_api_key, number,my_id);
        },
        call_answer: function () {
            veery_phone_api.answerCall(veery_api_key);
        },
        call_end: function () {
            veery_phone_api.endCall(veery_api_key,(shared_data.callDetails.direction.toLowerCase() === 'outbound') ?
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
            veery_phone_api.freezeAcw(veery_api_key, $scope.call.sessionId);
        },
        call_end_freeze: function () {
            veery_phone_api.endFreeze(veery_api_key, $scope.call.sessionId);
        },
        call_transfer: function (number) {
            veery_phone_api.transferCall(veery_api_key, number,shared_data.callDetails.callrefid);
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

    /* ---------------- UI status -------------------------------- */
    var notification_panel_ui_state = {
        phone_online: function () {
            $('#call_notification_panel').removeClass('display-none');
            $('#idPhoneReconnect').addClass('display-none');
            //is loading done
            $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
            $('#phoneRegister').removeClass('display-none');
            $('#isBtnReg').addClass('display-block active-menu-icon').removeClass('display-none');
            $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
            $('#softPhoneDragElem').addClass('display-block').removeClass('display-none ');
            $('#softPhone').removeClass('phone-disconnected');

            notification_panel_ui_state.call_idel();

        },
        phone_offline: function (title, msg) {
            $('#call_notification_panel').addClass('display-none');
            shared_function.showAlert('Phone', 'error', msg);
            shared_function.showWarningAlert(title, msg);
        },
        phone_operation_error: function (msg) {
            shared_function.showAlert('Phone', 'error', msg);
        },
        call_idel: function () {
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').addClass('display-none');
            $('#call_notification_Information').addClass('display-none');
            $('#call_notification_outbound').removeClass('display-none');

            $('#call_notification_call_conference_btn').addClass('display-none');
            $('#call_notification_call_etl_btn').addClass('display-none');
            $('#call_notification_call_transfer_btn').removeClass('display-none');


            call_duration_timer.stop();
            acw_countdown_timer.stop();
        },
        call_incoming: function () {
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').addClass('display-none');
            $('#call_notification_Information').removeClass('display-none');
            $('#call_notification_outbound').addClass('display-none');

            $('#call_notification_answer_btn').removeClass('display-none');

            call_duration_timer.stop();
            acw_countdown_timer.stop();
        },
        call_connected: function () {

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
        },
        call_disconnected: function () {
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_acw_panel').removeClass('display-none');
            $('#call_notification_Information').addClass('display-none');
            $('#call_notification_outbound').addClass('display-none');

            $('#call_notification_freeze').addClass('display-none');
            $('#call_notification_call_transfer_panel').addClass('display-none');
            $('#call_notification_acw').removeClass('display-none');


            acw_countdown_timer.start({countdown: true, startValues: {seconds: shared_data.acw_time}});
            $('#call_notification_acw_countdown_timer .values').html(acw_countdown_timer.getTimeValues().toString());
        },
        call_mute: function () {
            $('#call_notification_call_mute_btn').addClass('display-none');
            $('#call_notification_call_unmute_btn').removeClass('display-none');
        },
        call_unmute: function () {
            $('#call_notification_call_unmute_btn').addClass('display-none');
            $('#call_notification_call_mute_btn').removeClass('display-none');
        },
        call_hold: function () {
            $('#call_notification_call_hold_btn').addClass('display-none');
            $('#call_notification_call_unhold_btn').removeClass('display-none');
        },
        call_unhold: function () {
            $('#call_notification_call_unhold_btn').addClass('display-none');
            $('#call_notification_call_hold_btn').removeClass('display-none');
        },
        call_freeze_req: function () {
            $('#call_notification_freeze_btn').addClass('display-none');
            $('#call_notification_freeze_request').removeClass('display-none');
        },
        call_freeze_req_cancel: function () {
            $('#call_notification_freeze_request').addClass('display-none');
            $('#call_notification_freeze_btn').removeClass('display-none');
        },
        call_freeze: function () {
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
            $('#call_notification_call_function_btns').addClass('display-none');
            $('#call_notification_call_transfer_panel').removeClass('display-none');

        },
        call_close_transfer_view: function () {
            $('#call_notification_call_function_btns').removeClass('display-none');
            $('#call_notification_call_transfer_panel').addClass('display-none');

        },
        call_transfer: function () {
            $('#call_notification_call_function_btns').removeClass('display-none');
            $('#call_notification_call_conference_btn').removeClass('display-none');
            $('#call_notification_call_etl_btn').removeClass('display-none');
            $('#call_notification_call_transfer_panel').addClass('display-none');
            $('#call_notification_call_transfer_btn').addClass('display-none');
            $('#call_notification_call_hold_btn').addClass('display-none');
        },
        call_conference: function () {
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
                    notification_panel_ui_state.call_incoming();
                    break;
                case 'MakeCall':
                    notification_panel_ui_state.call_connected();
                    break;
                case 'AnswerCall':
                    //$scope.phoneNotificationFunctions.answerState();
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
                default:

            }
        }
    };

    $rootScope.$on("initialize_call_notification", function (event, data) {
        veery_phone_api.setStrategy(shared_data.phone_strategy);
        $scope.PhoneLoading();
        veery_phone_api.subscribeEvents(subscribeEvents);
    });

    $rootScope.$on("incoming_call_notification", function () {
        veery_phone_api.incomingCall(veery_api_key, number,my_id);
    });

    $scope.$watch(function () {
        return shared_data.callDetails;
    }, function (newValue, oldValue) {
        angular.extend($scope.notification_call, newValue);
    });
});



