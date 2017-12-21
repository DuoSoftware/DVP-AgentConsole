/**
 * Created by Veery Team on 8/16/2016.
 */


agentApp.controller('consoleCtrl', function ($window, $filter, $rootScope, $scope, $http,
                                             $base64, $timeout, $q, $crypto, jwtHelper,
                                             resourceService, baseUrls, dataParser, authService,
                                             userService, tagService, ticketService, mailInboxService, $interval,
                                             profileDataParser, loginService, $state, uuid4,
                                             filterFilter, engagementService, phoneSetting, toDoService, turnServers,
                                             Pubnub, $uibModal, agentSettingFact, chatService, contactService, userProfileApiAccess, $anchorScroll, $window, notificationService, $ngConfirm,
                                             templateService, userImageList, integrationAPIService, hotkeys, tabConfig,consoleConfig) {



// check Agent Console is focus or not.
    $scope.focusOnTab = true;
    angular.element($window).bind('focus', function () {
        $scope.focusOnTab = true;
        console.log('Console Focus......................');
    }).bind('blur', function () {
        $scope.focusOnTab = false;
        console.log('Console Lost Focus......................');
    });


    // call $anchorScroll()
    $anchorScroll();
    $scope.onExit = function (event) {
        chatService.Status('offline', 'call');
    };

    $scope.goToTopScroller = function () {
        $('html, body').animate({scrollTop: 0}, 'fast');
    };


    $scope.$on('$locationChangeStart', function (event, next, current) {
        // Here you can take the control and call your own functions:
        // Prevent the browser default action (Going back):
        event.preventDefault();
    });

    /*//safe apply
     $scope.safeApply = function (fn) {
     var phase = this.$root.$$phase;
     if (phase == '$apply' || phase == '$digest') {
     if (fn && (typeof(fn) === 'function')) {
     fn();
     }
     } else {
     this.$apply(fn);
     }
     };*/

    $scope.safeApply = function (fn) {
        if (this.$root) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        } else {
            this.$apply(fn);
        }

    };

    $window.onbeforeunload = $scope.onExit;


    $scope.isReadyToSpeak = false;
    $scope.sayIt = function (text) {
        if (!$scope.isReadyToSpeak) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
    };

    $scope.usercounts = 0;

    $scope.showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3',
        });
    };

    $scope.showChromeNotification = function (msg, duration, focusOnTab) {
        if (!focusOnTab) {
            showNotification(msg, duration);
        }
    };

    /*----------------------------enable shortcut keys-----------------------------------------------*/


    hotkeys.add({
        combo: 'ctrl+alt+w',
        description: 'showTimer',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.showTimer();
        }
    });
    hotkeys.add({
        combo: 'ctrl+alt+t',
        description: 'addNewTicketInboxTemp',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.addNewTicketInboxTemp();
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+n',
        description: 'addMyNote',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.addMyNote();
        }
    });
    hotkeys.add({
        combo: 'ctrl+alt+x',
        description: 'addDashBoard',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.consoleTopMenu.Register();
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+d',
        description: 'addDashBoard',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.addDashBoard();
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+p',
        description: 'createNewProfile',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            $scope.createNewProfile();
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+s',
        description: 'focusToSearchBox',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            var element = $window.document.getElementById('commonSearch');
            if (element)
                element.focus();
        }
    });

    hotkeys.add({
        combo: 'alt+a',
        description: 'Answer Call',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function () {
            if ($scope.currentModeOption.toLowerCase() === 'outbound') {
                $scope.veeryPhone.makeAudioCall($scope.call.number);
            }
            else {
                $scope.veeryPhone.answerCall();
            }
        }
    });

    hotkeys.add(
        {
            combo: 'alt+c',
            description: 'Drop Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.veeryPhone.endCall();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+r',
            description: 'reject Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.veeryPhone.rejectCall();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+h',
            description: 'Hold Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.veeryPhone.holdResumeCall();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+z',
            description: 'freezeAcw Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                if ($scope.isAcw || $scope.freeze)
                    $scope.veeryPhone.freezeAcw();
            }
        });

    hotkeys.add(
        {
            combo: 'alt+e',
            description: 'End-Acw Call',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                if ($scope.isAcw)
                    $scope.veeryPhone.endAcw();
            }
        });

    /*hotkeys.add(
     {
     combo: 'alt+p',
     description: 'Initiate Soft phone',
     allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
     callback: function () {
     $scope.consoleTopMenu.Register();
     }
     });*/

    hotkeys.add(
        {
            combo: 'alt+i',
            description: 'Initiate Soft phone',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.modeOption.inboundOption('Inbound');
            }
        });

    hotkeys.add(
        {
            combo: 'alt+o',
            description: 'Initiate Soft phone',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                $scope.modeOption.outboundOption('Outbound');
            }
        });

    /*---------------------------- shortcut keys-----------------------------------------------*/

    function startRingTone() {
        try {
            ringtone.play();
        }
        catch (e) {
        }
    }

    function stopRingTone() {
        try {
            ringtone.pause();
        }
        catch (e) {
        }
    }


    $scope.notifications = [];
    $scope.agentList = [];
    $scope.isFreezeReq = false;
    $scope.isEnableSoftPhoneDrag = false;
    $scope.myTemplates = [];


    var loadChatTemplates = function () {

        templateService.getAvailableChatTemplates().then(function (temps) {

            $scope.myTemplates = temps;

        }, function (error) {
            $scope.showAlert('Error', 'error', 'Error in searching chat templates');
            console.log(error);
        })


    };

    loadChatTemplates();


    $scope.$watch('isLoading', function (newValue, oldValue) {
        if (newValue) {
            $('#searchSpin').removeClass('display-none');
        }
        else {
            $('#searchSpin').addClass('display-none');
        }


    });


    $scope.showConfirmation = function (title, contentData, okText, okFunc, closeFunc) {

        $ngConfirm({
            title: title,
            content: contentData, // if contentUrl is provided, 'content' is ignored.
            scope: $scope,
            buttons: {
                // long hand button definition
                ok: {
                    text: okText,
                    btnClass: 'btn-primary',
                    keys: ['enter'], // will trigger when enter is pressed
                    action: function (scope) {
                        okFunc();
                    }
                },
                // short hand button definition
                close: function (scope) {
                    closeFunc();
                }
            }
        });
    };


    //
    $('#softPhoneDragElem').draggable({
        preventCollision: true,
        containment: "window",
        start: function (event, ui) {
            $scope.isEnableSoftPhoneDrag = true;
        },
        stop: function (event, ui) {
        }
    });

    //soft phone load contact list


    $scope.status = {
        isopen: false
    };

    $scope.countdownVal = 5;
    $scope.GetAcwTime = function () {
        resourceService.GetAcwTime().then(function (response) {
            $scope.countdownVal = (parseInt(JSON.parse(response).MaxAfterWorkTime) - phoneSetting.AcwCountdown) <= 0 ? 1 : (parseInt(JSON.parse(response).MaxAfterWorkTime) - phoneSetting.AcwCountdown);
        }, function (err) {
            $scope.countdownVal = 10;
            authService.IsCheckResponse(err);
            $scope.showAlert('Phone', 'error', "Fail To Get ACW Time");
        });
    };
    $scope.GetAcwTime();

    /*# console top menu */
    var getALlPhoneContact = function () {
        $scope.contactObj = {};
        contactService.getAllContacts().then(function (response) {
            if (response && response.Result) {
                var previousCategory = "";
                var contacts = [];
                var total = response.Result.length;
                var lastIndex = total - 1;
                for (var i = 0; i < total; i++) {
                    var item = response.Result[i];
                    if (item && !item.category) {
                        item.category = "others"
                    }

                    if (previousCategory === item.category.toLowerCase()) {
                        $scope.contactObj[previousCategory].push(item);
                    }
                    else {
                        previousCategory = item.category.toLowerCase();
                        if (!Array.isArray($scope.contactObj[previousCategory])) {
                            $scope.contactObj[previousCategory] = [];
                        }
                        $scope.contactObj[previousCategory].push(item);

                    }

                    /*if ((previousCategory === item.category || previousCategory === '') && (i != lastIndex)) {
                     contacts.push(item);
                     previousCategory = item.category;
                     }
                     else {
                     if (i === lastIndex) {
                     contacts.push(item);
                     }
                     $scope.contactObj[previousCategory] = contacts;
                     contacts = [];
                     contacts.push(item);
                     previousCategory = item.category;

                     }*/
                }

                /*response.Result.map(function (item) {
                 if (item && !item.category) {
                 item.category = "Others"
                 }
                 if (previousCategory === item.category || previousCategory === '') {
                 contacts.push(item);
                 previousCategory = item.category;
                 }
                 else {
                 $scope.contactObj[previousCategory] = contacts;
                 contacts = [];
                 contacts.push(item);
                 previousCategory = item.category;

                 }
                 })*/
            }
            //$scope.contactObj = response.Result;
        });
        $scope.callLogPage = 0;
        $scope.GetCallLogs($scope.contactSearchDate);
    };

    var i = 1;
    $scope.sessionData = {};
    $scope.callLog = [];
    $scope.callLogEmpty = false;
    $scope.callLogSessionId = uuid4.generate();
    $scope.addToCallLog = function (number, callType) {

        if (callType === 'Outbound' || callType === 'Incoming' || callType === 'Missed Call') {
            $scope.callLogSessionId = uuid4.generate();
        }

        //var tempData = $scope.callLog[$scope.callLogSessionId];
        var tempData = $filter('filter')($scope.callLog, {'callLogSessionId': $scope.callLogSessionId}, true);

        if (tempData[0] && tempData[0].callType === 'Outbound') {
            return;
        }

        var log = {
            created_at: new Date().toISOString(),
            callLogSessionId: $scope.callLogSessionId,
            count: i++,
            data: {
                'callLogSessionId': $scope.callLogSessionId,
                'number': number,
                'callType': callType,
                'time': moment().format('LT')
            }
        };
        var index = $scope.callLog.indexOf(tempData[0]);

        if (index != -1) {
            $scope.callLog[index] = log.data;
        }
        else {
            $scope.callLog.push(log.data);
            //$scope.callLog.splice(0, 0, log);
        }

        //$scope.callLog.reverse();
        $scope.SaveCallLogs(log);


    };

    $scope.SaveCallLogs = function (log) {
        contactService.SaveCallLog(log).then(function (response) {
            console.log(response);
        });
    };

    $scope.callLogPage = 0;
    $scope.isLoadingCallLog = false;
    $scope.isLastPage = false;
    $scope.callLogLength = 0;
    $scope.GetCallLogs = function (date) {
        $scope.callLogPage++;
        $scope.isLoadingCallLog = true;
        $scope.isLastPage = false;
        contactService.GetCallLogs($scope.callLogPage, date).then(function (response) {
            if (response && response.length != 0) {
                /*response.map(function (item) {
                 if (item.data) {
                 $scope.callLog[item.data.callLogSessionId] = item.data;
                 }
                 });*/

                response.map(function (item) {
                    if (item.data) {
                        var index = $scope.callLog.indexOf(item.data);

                        if (index != -1) {
                            $scope.callLog[index] = item.data;
                        }
                        else {
                            $scope.callLog.splice(0, 0, item.data);
                            //$scope.callLog.push(item.data);
                        }
                    }
                });
            }
            else {
                $scope.isLastPage = true;
            }

            $scope.isLoadingCallLog = false;
        });
    };

    $scope.contactSearchDate = "Today";
    $scope.GetLogByDate = function (date) {
        $scope.callLogPage = 0;
        $scope.callLog = [];
        $scope.GetCallLogs(date);
    };

    $scope.doSearch = function (number) {
        if (number.toString() === "reload") {
            $scope.callLogPage = 0;
            $scope.callLog = [];
            $scope.GetCallLogs($scope.contactSearchDate);
        }
        $scope.isLoadingCallLog = true;
        contactService.SearchCallLogs(number).then(function (response) {
            if (response) {
                response.map(function (item) {
                    if (item.data) {
                        var index = $scope.callLog.indexOf(item.data);

                        if (index != -1) {
                            $scope.callLog[index] = item.data;
                        }
                        else {
                            $scope.callLog.push(item.data);
                        }
                    }
                });

            }
            $scope.isLoadingCallLog = false;
        });
    };

    $scope.makeCallHistory = function (caller, type) {
        //contact.number
        if (type == "log") {
            //caller.number
            $scope.call.number = caller.number;
        } else {
            //caller.number
            $scope.call.number = caller.contact;
        }

        $scope.veeryPhone.hidePhoneBook();
    };

    $scope.consoleTopMenu = {
        openTicket: function () {
            $('#mainTicketWrapper').addClass(' display-block fadeIn').removeClass('display-none zoomOut');
            if (profileDataParser.isInitiateLoad) {
                profileDataParser.isInitiateLoad = false;
            }
            else {

                $rootScope.$emit('reloadInbox', true);
            }

        },
        openAgentDialer: function () {
            $('#AgentDialerUi').addClass('agent-d-wrapper-0522017 fadeIn').removeClass('display-none');
            $('#btn-close-dialer').removeClass('display-none');
            $rootScope.$emit('dialnextnumber', undefined);
            $scope.agentDialerOn = true;
        },
        Register: function () {
            $scope.veeryPhone.Register('DuoS123');
            getALlPhoneContact();
            /*if ($scope.isRegistor) {
             $scope.ShowHidePhone(!$scope.showPhone);
             } else {
             $scope.veeryPhone.Register('DuoS123');
             }*/
        },
        openTicketViews: function () {
            divModel.model('#ticketFilterWrap', 'display-block');
        }

    };
    /*--------------------------Veery Phone---------------------------------------*/
    var element = document.getElementById('answerButton');
    if (element) {
        element.onclick = function () {
            $scope.veeryPhone.makeAudioCall($scope.call.number);
        };
    }
    $scope.ShowIncomingNotification = function (status, no) {

        if (status) {
            if (element) {
                element.onclick = function () {
                    $scope.veeryPhone.answerCall();
                };
            }

            $('#incomingNotification').addClass('display-block fadeIn').removeClass('display-none zoomOut');

            var msg = "Hello " + $scope.firstName + " you are receiving a call";
            if (no) {
                msg = msg + " From " + no;
            }
            if ($scope.call.skill && $scope.call.displayNumber) {
                msg = "Hello " + $scope.firstName + " You Are Receiving a " + $scope.call.skill + " Call From " + no;
            }
            showNotification(msg, 15000);
        } else {
            if (element) {
                element.onclick = function () {
                    $scope.veeryPhone.makeAudioCall($scope.call.number);
                };
            }
            $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
        }
    };

    $scope.ShowHidePhone = function (value) {
        $scope.showPhone = value;
        if (value) {
            // is show phone
            $('.isOperationPhone').addClass('display-block ').removeClass('display-none');
            $('#softPhone').addClass('display-block ').removeClass('display-none');

        } else {
            //is hide phone
            $('.isOperationPhone').addClass('display-none ').removeClass('display-block');
            $('#softPhone').addClass('display-none ').removeClass('display-block');
        }
    };
    $scope.ShowHidePhone();

    $scope.ShowHideDialpad = function () {

        if (pinHeight != 0) {
            removePin();
        }
        else {
            pinScreen();
        }
    };
    // $scope.ShowHideDialpad();

    //update code damith
    $scope.contactList = function () {
        $('#phoneBook').animate({
            left: '0'
        }, 500);
    };

    //contact list tab panel
    $scope.contactTab = [
        {title: 'Contact', content: 'contact'},
        {title: 'Recent', content: 'log'}
    ];

    $scope.PhoneOffline = function () {



        //is loading done
        $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
        $('#phoneRegister').removeClass('display-none');
        $('#isBtnReg').addClass('display-none').removeClass('display-block active-menu-icon');
        //$('#isCallOnline').addClass('display-block deactive-menu-icon').removeClass('display-none');
        $('#softPhoneDragElem').addClass('display-none ').removeClass('display-block');
        phoneFuncion.idle();
        $scope.ShowHidePhone(false);
        $('#agentDialerTop').removeClass('display-block active-menu-icon').addClass('display-none');
        $rootScope.$emit('dialstop', undefined);
    };

    $scope.PhoneOnline = function () {
        $('#idPhoneReconnect').addClass('display-none');
        //is loading done
        $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
        $('#phoneRegister').removeClass('display-none');
        $('#isBtnReg').addClass('display-block active-menu-icon').removeClass('display-none');
        $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
        $('#softPhoneDragElem').addClass('display-block').removeClass('display-none ');
        $scope.ShowHidePhone(true);
        phoneFuncion.idle();
        $('#agentDialerTop').addClass('display-block active-menu-icon').removeClass('display-none');
        //chatService.Status('available', 'call');
        $scope.stopCallTime();

    };

    $scope.PhoneLoading = function () {
        $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
        $('#isLoadingRegPhone').addClass('display-block').removeClass('display-none');
        $('#phoneRegister').addClass('display-none');
        $('#isBtnReg').addClass('display-none ').removeClass('display-block active-menu-icon');
        $('#phoneRegister').addClass('display-none');
        /*IsRegisterPhone: function (status) {
         if (!status) {
         //is loading
         $('#isLoadingRegPhone').addClass('display-block').
         removeClass('display-none');
         $('#isBtnReg').addClass('display-none ').
         removeClass('display-block active-menu-icon');
         } else {
         //is loading done
         $('#isLoadingRegPhone').addClass('display-none').
         removeClass('display-block active-menu-icon ');
         $('#isBtnReg').addClass('display-block active-menu-icon   ').
         removeClass('display-none  ');
         }
         }*/
    };


    $scope.FreezeAcw = function (callSessionId, endFreeze) {
        resourceService.FreezeAcw(callSessionId, endFreeze).then(function (response) {

        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert('Phone', 'error', "Fail Freeze Operation.");
            return false;
        });
    };

    var timeReset = function () {

    };
    $scope.isRegistor = false;
    $scope.showPhone = false;
    $scope.phoneStatus = "Offline";

    $scope.profile = {};
    $scope.profile.displayName = "";
    $scope.profile.freezeExceeded = false;
    $scope.profile.break_exceeded = false;
    $scope.profile.authorizationName = "";
    $scope.profile.publicIdentity = "";//sip:bob@159.203.160.47
    $scope.profile.server = {};
    $scope.profile.server.domain = "";
    $scope.profile.server.websocketUrl = "";//wss://159.203.160.47:7443
    $scope.profile.server.outboundProxy = "";
    $scope.profile.server.enableRtcwebBreaker = false;
    $scope.profile.server.password = null;
    $scope.profile.server.token = authService.TokenWithoutBearer();


    $scope.call = {};
    $scope.call.number = "";
    $scope.call.skill = "";
    $scope.call.Company = "";
    $scope.call.CompanyNo = "";
    $scope.call.sessionId = "";
    $scope.isAcw = false;
    $scope.freeze = false;
    $scope.inCall = false;
    var autoAnswerTimeTimer = $timeout(timeReset, 0);

    $scope.veeryPhone = {

        sipSendDTMF: function (dtmf) {
            if ($scope.isRegistor) {
                sipSendDTMF(dtmf);
            }
            else {
                $scope.phoneNotificationFunctions.SendDtmf(dtmf);
            }

            //$scope.call.number = $scope.call.number + dtmf;
        },
        makeCall: function (callNumber, tabReference) {

            if ($scope.isRegistor) {
                $scope.veeryPhone.makeAudioCall(callNumber);
            }
            else {
                phoneFuncion.updateCallStatus('Dialing');
                var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());
                var value = decodeData.context.veeryaccount.contact;
                resourceService.Call(callNumber, value).then(function (res) {
                    if (res) {
                        $scope.showAlert("Soft Phone", "success", "Successfully Dial To " + callNumber);
                    }
                    else {
                        $scope.showAlert("Soft Phone", "error", "Fail to Make Call.");
                    }
                }, function (err) {
                    $scope.showAlert("Soft Phone", "error", "Fail to Make Call.");
                })
            }


            //  var nos = $filter('filter')(ticket.requester.contacts, {type: 'phone'});

            $scope.tabReference = tabReference;
        },
        makeAudioCall: function (callNumber) {
            if (callNumber == "") {
                return
            }
            if ($scope.currentModeOption.toLowerCase() !== 'outbound') {
                $scope.showAlert("Soft Phone", "error", "Cannot make outbound call while you are in inbound mode.");
                return
            }
            $scope.call.number = callNumber;
            sipCall('call-audio', callNumber);
            phoneFuncion.updateCallStatus('Dialing');
            $scope.$broadcast('timer-set-countdown');
            $scope.addToCallLog(callNumber, "Outbound");
        },
        endCall: function () {
            console.log("click endCall...........");
            sipHangUp();
            $scope.inCall = false;
            $timeout.cancel(autoAnswerTimeTimer);
        },
        answerCall: function () {
            answerCall();
            $scope.ShowIncomingNotification(false, null);
        },
        rejectCall: function () {
            //UIStateChange.inIdleState();
            rejectCall();
            stopRingbackTone();
            stopRingTone();
            $scope.ShowIncomingNotification(false, null);
            phoneFuncion.updateCallStatus('');
            $timeout.cancel(autoAnswerTimeTimer);
            $scope.inCall = false;
        },
        etlCall: function () {
            var dtmfSet = phoneSetting.EtlCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
            phoneFuncion.showTransfer();
            phoneFuncion.showIvrBtn();
            phoneFuncion.hideSwap();
            phoneFuncion.hideEtl();
            phoneFuncion.hideConference();
        },
        swapCall: function () {
            var dtmfSet = phoneSetting.SwapCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
        },
        conferenceCall: function () {
            var dtmfSet = phoneSetting.ConferenceCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
        },
        showIvrPenel: function () {

            if ($('#divIvrPad').hasClass('display-none')) {
                phoneFuncion.showIvrList();
            }
            else {
                phoneFuncion.hideIvrList();
            }

        },
        transferCall: function (no) {
            var dtmfSet = no.length < phoneSetting.ExtNumberLength ? phoneSetting.TransferExtCode.split('') : phoneSetting.TransferPhnCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
            $timeout(function () {
                dtmfSet = no.split('');
                angular.forEach(dtmfSet, function (chr) {
                    sipSendDTMF(chr);
                });
                sipSendDTMF('#');
            }, 1000);
            phoneFuncion.hideTransfer();
            phoneFuncion.showSwap();
            phoneFuncion.showEtl();
            phoneFuncion.showConference();

        },
        ivrTransferCall: function (no) {
            var dtmfSet = phoneSetting.TransferIvrCode.split('');
            angular.forEach(dtmfSet, function (chr) {
                sipSendDTMF(chr);
            });
            $timeout(function () {
                dtmfSet = no.split('');
                angular.forEach(dtmfSet, function (chr) {
                    sipSendDTMF(chr);
                });
                sipSendDTMF('#');
            }, 1000);
            //phoneFuncion.hideTransfer();
            phoneFuncion.showSwap();
            phoneFuncion.showEtl();
            phoneFuncion.showConference();

        },
        muteCall: function () {
            /*btnMute.value = bMute ? "Unmute" : "Mute";*/
            if (sipToggleMute()) {
                $('#speakerButton').addClass('veery-font-1-muted').removeClass('veery-font-1-microphone');
            } else {
                $('#speakerButton').addClass('veery-font-1-microphone').removeClass('veery-font-1-muted');
            }
        },
        holdResumeCall: function () {
            var h = sipToggleHoldResume();
            if (h === '0') { //connect
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('call-ended');
            }
            else if (h === '1') {//hold
                $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8 call-ended');
            } else {
//error
            }
        },
        registerWithArds: function (userProfile) {
            sipUnRegister();
            preInit(userEvent, userProfile);
            /*resourceService.RegisterWithArds(userProfile.id, userProfile.veeryFormat).then(function (response) {
             $scope.registerdWithArds = response;
             $scope.userName = userProfile.userName;
             preInit(userEvent, userProfile);// initialize Soft phone

             }, function (error) {
             $scope.showAlert("Soft Phone", "error", "Fail To Register With Resource Server.");
             });*/
            resourceService.MapResourceToVeery($scope.profile.publicIdentity);
        },
        Register: function (password) {

            $scope.PhoneLoading();
            $scope.phoneStatus = "Registering With Servers";
            $scope.isshowRegistor = false;

            var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());

            var values = decodeData.context.veeryaccount.contact.split("@");
            $scope.profile.id = decodeData.context.resourceid;
            $scope.profile.displayName = values[0];
            $scope.profile.authorizationName = values[0];
            $scope.profile.publicIdentity = "sip:" + decodeData.context.veeryaccount.contact;//sip:bob@159.203.160.47
            $scope.profile.password = password;
            $scope.profile.server.token = authService.GetToken();
            $scope.profile.server.domain = values[1];
            $scope.profile.server.websocketUrl = "wss://" + values[1] + ":7443";//wss://159.203.160.47:7443
            $scope.profile.server.ice_servers = turnServers;
            $scope.profile.server.outboundProxy = "";
            $scope.profile.server.enableRtcwebBreaker = false;
            dataParser.userProfile = $scope.profile;
            if (!decodeData.context.resourceid) {
                $scope.showAlert("Soft Phone", "error", "Fail to Get Resource Information's.");
                return;
            }


            resourceService.SipUserPassword(values[0]).then(function (reply) {

                var decrypted = $crypto.decrypt(reply, "DuoS123");
                $scope.profile.password = decrypted;
                resourceService.GetContactVeeryFormat().then(function (response) {
                    if (response.IsSuccess) {
                        if ($scope.profile.server.password)
                            $scope.profile.password = $scope.profile.server.password;
                        $scope.profile.veeryFormat = response.Result;
                        dataParser.userProfile = $scope.profile;
                        $scope.profile.server.bandwidth_audio = phoneSetting.Bandwidth;
                        $scope.profile.server.ReRegisterTimeout = phoneSetting.ReRegisterTimeout;
                        $scope.profile.server.ReRegisterTryCount = phoneSetting.ReRegisterTryCount;
                        $scope.veeryPhone.registerWithArds($scope.profile);
                    }
                    else {
                        $scope.showAlert("Soft Phone", "error", "Fail to Get Contact Details.");
                    }
                }, function (error) {

                    $scope.showAlert("Soft Phone", "error", "Fail to Communicate with servers");
                    $('#isLoadingRegPhone').addClass('display-none').removeClass('display-block active-menu-icon');
                    $('#phoneRegister').removeClass('display-none');
                    $scope.PhoneOffline();
                    $('#isCallOnline').addClass('display-block transport-error').removeClass('display-none');
                });

            }, function (error) {

                $scope.showAlert("Soft Phone", "error", "Fail to Communicate with servers");
                $scope.PhoneOffline();
                $('#isCallOnline').addClass('display-block transport-error').removeClass('display-none');
            });


        },
        sipUnRegister: function () {
            sipUnRegister();
        },
        unregisterWithArds: function (callback) {
            sipUnRegister();

            var resid = authService.GetResourceId();

            if (resid != undefined) {
                resourceService.UnregisterWithArds(resid).then(function (response) {
                    $scope.registerdWithArds = !response;
                    callback('done');
                }, function (error) {
                    $scope.showAlert("Soft Phone", "error", "Unregister With ARDS Fail");
                    callback('done');
                });
            } else {
                callback('done');
            }
        },
        fullScreen: function (b_fs) {
            return;
            bFullScreen = b_fs;
            if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {
                if (bFullScreen) {
                    videoRemote.webkitEnterFullScreen();

                }
                else {
                    videoRemote.webkitExitFullscreen();
                }
            }
            else {
                if (tsk_utils_have_webrtc4npapi()) {
                    try {
                        if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs);
                    }
                    catch (e) {
                        document.getElementById("divVideo").setAttribute("class", b_fs ? "full-screen" : "normal-screen");
                    }
                }
                else {
                    document.getElementById("divVideo").setAttribute("class", b_fs ? "full-screen" : "normal-screen");
                }
            }
        },
        onSipEventSession: function (e) {
            try {
                console.info("onSipEventSession : " + e);

                $scope.callStatus = e;
                //document.getElementById("lblSipStatus").innerHTML = e;
                //Notification.info({message: e, delay: 500, closeOnClick: true});
                if (e == 'Session Progress') {
                    //document.getElementById("lblSipStatus").innerHTML = 'Session Progress';
                    //document.getElementById("lblStatus").innerHTML = 'Session Progress';
                    $scope.showAlert("Soft Phone", "info", 'Session Progress');
                }
                else if (e.toString().toLowerCase() == 'in call') {
                    $scope.inCall = true;
                    stopRingTone();
                    stopRingbackTone();
                    /*UIStateChange.inCallConnectedState();*/
                    phoneFuncion.showHoldButton();
                    phoneFuncion.showSpeakerButton();
                    phoneFuncion.showMuteButton();
                    phoneFuncion.showEndButton();
                    phoneFuncion.showTransfer();
                    phoneFuncion.showIvrBtn();
                    phoneFuncion.hideAnswerButton();
                    phoneFuncion.updateCallStatus('In Call');
                    $scope.ShowIncomingNotification(false, null);
                    $scope.startCallTime();

                    $scope.addToCallLog($scope.call.number, 'Answered');

                    chatService.Status('busy', 'call');
                }
            }
            catch (ex) {
                console.error(ex.message);
            }
        },
        notificationEvent: function (description) {
            try {

                $scope.phoneStatus = description;
                if (description == 'Connected') {
                    stopRingTone();
                    /*UIStateChange.inIdleState();*/
                    $scope.PhoneOnline();
                    $scope.isRegistor = true;
                    $scope.showAlert("Soft Phone", "success", description);
                    chatService.Status('available', 'call');
                }
                else if (description == 'Forbidden') {
                    $scope.showAlert("Soft Phone", "error", description);
                    console.error(description);
                }
                else if (description == 'Transport error') {
                    $('#isCallOnline').addClass('display-block transport-error').removeClass('display-none');
                    $scope.showAlert("Soft Phone", "error", "Unable to Communicate With Servers. Please Re-register Your Phone Or Contact Your System Administrator.");
                    console.error(description);
                }
                else if (description == 'ReRegistering') {
                    $('#idPhoneReconnect').removeClass('display-none');

                }
            }
            catch (ex) {
                console.error(ex.message);
            }

        },
        onErrorEvent: function (e) {
            //document.getElementById("lblStatus").innerHTML = e;
            $scope.showAlert("Soft Phone", "error", e);
            console.error(e);
        },
        uiOnConnectionEvent: function (b_connected, b_connecting) {
            try {

                if (!b_connected && !b_connecting) {
                    console.log("Phone Offline....");
                    $scope.isRegistor = false;
                    $scope.PhoneOffline();
                    if (!$scope.isshowRegistor)
                        $scope.showAlert("Soft Phone", "error", "Fail To Register");
                    $scope.isshowRegistor = true;

                    chatService.Status('offline', 'call');
                }
                //$scope.isRegistor = false;
                /* document.getElementById("btnCall").disabled = !(b_connected && tsk_utils_have_webrtc() && tsk_utils_have_stream());
                 document.getElementById("btnAudioCall").disabled = document.getElementById("btnCall").disabled;
                 document.getElementById("btnHangUp").disabled = !oSipSessionCall;*/
            }
            catch (ex) {
                console.error(ex.message);
            }
        },
        uiVideoDisplayShowHide: function (b_show) {
            return;
            if (b_show) {
                document.getElementById("divVideo").style.height = '340px';
                document.getElementById("divVideo").style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';
            }
            else {
                document.getElementById("divVideo").style.height = '0px';
                document.getElementById("divVideo").style.height = '0px';
            }
            //btnFullScreen.disabled = !b_show;
        },
        uiVideoDisplayEvent: function (b_local, b_added) {
            return;
            var o_elt_video = b_local ? videoLocal : videoRemote;

            if (b_added) {
                o_elt_video.style.opacity = 1;
                $scope.veeryPhone.uiVideoDisplayShowHide(true);
            }
            else {
                o_elt_video.style.opacity = 0;
                $scope.veeryPhone.fullScreen(false);
            }
        },
        onIncomingCall: function (sRemoteNumber) {
            try {
                $scope.addToCallLog(sRemoteNumber, 'Missed Call');
                if ($scope.isAcw || $scope.freeze) {
                    console.info("Reject Call...........................");
                    rejectCall();
                    $scope.addToCallLog(sRemoteNumber, 'Rejected');
                    return;
                }

                startRingTone();
                /*UIStateChange.inIncomingState();*/
                $scope.safeApply(function () {
                    $scope.call.number = sRemoteNumber;
                });

                $scope.ShowIncomingNotification(true, sRemoteNumber);
                phoneFuncion.showEndButton();
                phoneFuncion.hideHoldButton();
                phoneFuncion.hideMuteButton();
                /*addCallToHistory(sRemoteNumber, 2);*/
                phoneFuncion.updateCallStatus('Incoming Call');
                $scope.veeryPhone.autoAnswer();
                chatService.Status('busy', 'call');
                $scope.inCall = true;
            }
            catch (ex) {
                console.error(ex.message);
            }
        },
        autoAnswer: function () {
            try {
                if ($scope.PhoneConfig) {
                    if ($scope.PhoneConfig.autoAnswer) {
                        var autoAnswerAfterDelay = function () {
                            $timeout.cancel(autoAnswerTimeTimer);
                            this.answerCall();
                        };
                        autoAnswerTimeTimer = $timeout(autoAnswerAfterDelay, $scope.PhoneConfig.autoAnswerDelay);
                    }
                }
            }
            catch (ex) {
                console.log(ex)
            }
        },
        uiCallTerminated: function (msg) {
            try {

                console.log("uiCallTerminated");
                $scope.call.transferName = '';
                $scope.call.skill = '';
                $scope.call.Company = '';
                $scope.call.CompanyNo = '';
                $scope.inCall = false;
                $scope.$broadcast('timer-set-countdown');
                $scope.stopCallTime();
                $scope.ShowIncomingNotification(false, null);


                /*phoneFuncion.hideHoldButton();
                 phoneFuncion.hideMuteButton();
                 phoneFuncion.hideSpeakerButton();
                 phoneFuncion.hideSwap();
                 phoneFuncion.hideEtl();
                 phoneFuncion.hideTransfer();
                 phoneFuncion.hideConference();

                 phoneFuncion.updateCallStatus('');*/
                $scope.veeryPhone.StartAcw();

                if (window.btnBFCP) window.btnBFCP.disabled = true;


                stopRingbackTone();
                stopRingTone();

                //chatService.Status('available', 'call');

                /* //document.getElementById("lblSipStatus").innerHTML = msg;
                 //Notification.info({message: msg, delay: 500, closeOnClick: true});
                 $scope.veeryPhone.uiVideoDisplayShowHide(false);
                 //document.getElementById("divCallOptions").style.opacity = 0;


                 $scope.veeryPhone.uiVideoDisplayEvent(false, false);
                 $scope.veeryPhone.uiVideoDisplayEvent(true, false);*/


                //setTimeout(function () { if (!oSipSessionCall) txtCallStatus.innerHTML = ''; }, 2500);
            }
            catch (ex) {
                console.log(ex)
            }
        },
        showMoreOption: function () {
            phoneFuncion.showMoreOption();
        },
        hideMoreOption: function () {
            phoneFuncion.hideMoreOption();
        },
        StartAcw: function () {
            phoneFuncion.startAcw();
        },
        StopAcw: function () {
            $scope.isAcw = false;
            $scope.stopCountdownTimmer();
            $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
            $('#calltimmer').addClass('call-duations').removeClass('display-none');
            document.getElementById('callStatus').innerHTML = "idle";
        },
        FinishedAcw: function () {
            $scope.isAcw = false;
            $scope.stopCountdownTimmer();
            $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
            $('#calltimmer').addClass('call-duations').removeClass('display-none');
            document.getElementById('callStatus').innerHTML = "idle";
            $scope.freeze = false;
            $('#freezebtn').addClass('display-none').removeClass('phone-sm-btn veery-font-1-stopwatch-2 show-1-btn');
            $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn veery-font-1-stopwatch-2 show-1-btn');
            //document.getElementById('freeze').innerHTML = "freeze";
            phoneFuncion.idle();
            chatService.Status('available', 'call');
        },
        endAcw: function () {
            phoneFuncion.endAcw();
        },
        freezeAcw: function () {
            if ($scope.freeze) {
                phoneFuncion.endfreezeBtn();
            }
            else {

                phoneFuncion.freezeBtn();
            }
            return false;
        }, showPhoneBook: function () {
            if (pinHeight != 0)
                removePin();
            $('#phoneBook').animate({
                left: '0'
            }, 500);
            $('#contactBtnWrp').removeClass('display-none');
            $('#phoneBtnWrapper').addClass('display-none');
        },
        hidePhoneBook: function () {
            $('#phoneBook').animate({
                left: '-235'
            }, 500);
            $('#contactBtnWrp').addClass('display-none');
            $('#phoneBtnWrapper').removeClass('display-none');
            this.hideCallLogs();
        },
        showCallLogs: function () {
            // if (!$scope.isShowLog) {
            //     $('#calllogs').animate({
            //         left: '0'
            //     }, 500);
            // } else {
            //     $('#calllogs').animate({
            //         left: '-235'
            //     }, 500);
            // }
            // $scope.isShowLog = !$scope.isShowLog;
        },
        hideCallLogs: function () {
            // $('#calllogs').animate({
            //     left: '-235'
            // }, 500);
            $('#contactBtnWrp').addClass('display-none');
            $('#phoneBtnWrapper').removeClass('display-none');
        }
    };
    $scope.isShowLog = false;
    $scope.isWaiting = false;
    $scope.freezeRequest = false;
    $scope.ShowfreezeClose = false;
    $scope.showNofifyDialpad = false;

    $scope.phoneNotificationFunctions = {
        closePanel: function () {
            $scope.freezeRequest = false;
            $scope.phoneNotificationFunctions(false);
        },
        showNotfication: function (val) {
            if ($scope.isRegistor) return;
            if ($scope.freezeRequest) {
                $scope.ShowfreezeClose = true;
            }
            if (val) {
                $('#notificationCallFunction').removeClass('display-none');
                $('#notificationAcw').addClass('display-none');
                $('.notification-acw').addClass('display-none');
                $('#callNIncomingAlert').animate({
                    right: '0'
                }, 300);
                if ($scope.call.direction.toLowerCase() === 'outbound') {
                    $('#anzNotificationCall').addClass('display-none');
                    $('#rejectNotificationCall').addClass('display-none');
                    $('#endNotificationCall').removeClass('display-none');
                } else {
                    $('#anzNotificationCall').removeClass('display-none');
                    $('#rejectNotificationCall').removeClass('display-none');
                    $('#endNotificationCall').addClass('display-none');
                }
            }
            else {
                $('#notificationAcw').removeClass('display-none');
                $('.notification-acw').removeClass('display-none');
                $('#notificationCallFunction').addClass('display-none');
                $('#callNIncomingAlert').animate({
                    right: '-500'
                }, 500);

            }
            $scope.showNofifyDialpad = false;
            $scope.showNofifyNumber = false;
        },
        SendDtmf: function (digit) {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;
            resourceService.SendDtmf($scope.call.sessionId, digit).then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
        },
        answerCall: function () {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;
            resourceService.CallAnswer($scope.call.sessionId).then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
        }, rejectCall: function () {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;
            resourceService.CallHungup($scope.call.sessionId).then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
        },
        endCall: function () {
            console.log("click endCall Service Call..........." + $scope.isRegistor);
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;
            resourceService.CallHungup(($scope.call.direction.toLowerCase() === 'outbound') ?
                $scope.call.sessionId : $scope.call.callrefid).then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
        },
        holdCall: function () {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;

            resourceService.CallHold($scope.call.callrefid, 'true').then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
            $scope.phoneNotificationFunctions.holdState();
            $scope.showNofifyDialpad = false;
        },
        transferCall: function (number) {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;
            resourceService.TransferCall(number, $scope.call.sessionId, $scope.call.callrefid).then(function (response) {
                $scope.isWaiting = false;
                if (response) {
                    $('#transferCallViewPoint').animate({
                        bottom: '-500'
                    }, 200, function () {
                        //$('#transferForm').removeClass('fadeIn');
                    });
                }
            }, function (err) {
                $scope.isWaiting = false;
            });
            $scope.showNofifyNumber = false;
            $scope.showNofifyDialpad = false;
        },
        unholdCall: function () {
            if ($scope.isRegistor) return;
            $scope.isWaiting = true;

            resourceService.CallHold($scope.call.callrefid, 'false').then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
            $scope.phoneNotificationFunctions.unholdState();
            $scope.showNofifyDialpad = false;
        },
        muteCall: function () {
            if ($scope.isRegistor) return;

            $scope.isWaiting = true;
            resourceService.CallMute($scope.call.sessionId, 'true').then(function (response) {
                $scope.isWaiting = false;

            }, function (err) {
                $scope.isWaiting = false;
            });
            $scope.phoneNotificationFunctions.muteState();
            $scope.showNofifyDialpad = false;
        },
        unmuteCall: function () {
            if ($scope.isRegistor) return;

            resourceService.CallMute($scope.call.sessionId, 'false').then(function (response) {
                $scope.isWaiting = false;
            }, function (err) {
                $scope.isWaiting = false;
            });
            $scope.phoneNotificationFunctions.unmuteState();
            $scope.showNofifyDialpad = false;
        },
        endFreeze: function () {
            if ($scope.isRegistor) return;
            document.getElementById('notificationfreezetimmer').getElementsByTagName('timer')[0].stop();
            $scope.$broadcast('timer-reset');
            $scope.isWaiting = true;
            $scope.freezeRequest = false;
            resourceService.FreezeAcw($scope.call.sessionId, false).then(function (response) {
                $scope.phoneNotificationFunctions.showNotfication(false);
                $scope.isWaiting = false;
            }, function (err) {
                $scope.phoneNotificationFunctions.showNotfication(false);
                $scope.isWaiting = false;
            });

            chatService.Status('available', 'call');
            $scope.showNofifyDialpad = false;
        },
        freezeAcw: function () {
            if ($scope.isRegistor) return;
            $('#notificationfreezeRequest').removeClass('display-none');
            $('#countdownnotificationCalltimmer').addClass('display-none');
            $scope.isWaiting = true;
            $scope.freezeRequest = true;
            resourceService.FreezeAcw($scope.call.sessionId, true).then(function (response) {
                if (response) {

                    $('#countdownnotificationCalltimmer').addClass('display-none');
                    $('#notificationfreezeRequest').addClass('display-none');
                    $('#notificationfreezetimmer').removeClass('display-none');
                    $('#notificationfreezebtn').addClass('display-none');
                    $('#notificationendfreezebtn').removeClass('display-none');
                    document.getElementById('countdownnotificationCalltimmer').getElementsByTagName('timer')[0].stop();
                    document.getElementById('notificationfreezetimmer').getElementsByTagName('timer')[0].start();
                }
                else {
                    $('#countdownnotificationCalltimmer').removeClass('display-none');
                    $('#notificationfreezeRequest').addClass('display-none');
                }
                $scope.isWaiting = false;
                $scope.freezeRequest = false;
            }, function (err) {
                $scope.showAlert('Phone', 'error', "Fail Freeze Operation.");
                $('#countdownnotificationCalltimmer').removeClass('display-none');
                $('#notificationfreezeRequest').addClass('display-none');
                $scope.isWaiting = false;
            });
            $scope.showNofifyDialpad = false;
        },
        answerState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').addClass('display-none');
            $('#anzNotificationCall').addClass('display-none');
            $('#endNotificationCall').removeClass('display-none');
            $('#endNotificationDialpad').removeClass('display-none');
            $('#holdNotificationCall').removeClass('display-none');
            $('#unholdNotificationCall').addClass('display-none');
            $('#muteNotificationCall').removeClass('display-none');
            $('#uumuteNotificationCall').addClass('display-none');
            $('#notificationCallFunction').removeClass('display-none');
            $('#notificationAcw').addClass('display-none');
            $('#notificationfreezebtn').removeClass('display-none');
            $('#notificationendfreezebtn').addClass('display-none');
            $('#transferNotificationCall').removeClass('display-none');
            $('.anz-call-state').removeClass('display-none');
            $('#callingIcon').addClass('display-none');
            $('#EndIcon').removeClass('display-none');
            //document.getElementById('countdownnotificationCalltimmer').getElementsByTagName('timer')[0].stop();
        },
        rejectState: function () {
            if ($scope.isRegistor) return;
            $scope.phoneNotificationFunctions.endState();
        },
        endState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').removeClass('display-none');
            $('#anzNotificationCall').removeClass('display-none');
            $('#endNotificationCall').addClass('display-none');
            $('#endNotificationDialpad').addClass('display-none');
            $('#holdNotificationCall').addClass('display-none');
            $('#unholdNotificationCall').addClass('display-none');
            $('#muteNotificationCall').addClass('display-none');
            $('#uumuteNotificationCall').addClass('display-none');
            $('#notificationCallFunction').addClass('display-none');
            $('#notificationAcw').removeClass('display-none');
            $('#countdownnotificationCalltimmer').removeClass('display-none');
            $('#transferNotificationCall').addClass('display-none');
            document.getElementById('countdownnotificationCalltimmer').getElementsByTagName('timer')[0].start();
            $('.anz-call-state').addClass('display-none');
            $scope.call.number = '';

            $('#callingIcon').removeClass('display-none');
            $('#EndIcon').addClass('display-none');
        },
        holdState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').addClass('display-none');
            $('#anzNotificationCall').addClass('display-none');
            $('#endNotificationCall').removeClass('display-none');
            $('#holdNotificationCall').addClass('display-none');
            $('#unholdNotificationCall').removeClass('display-none');
            /*$('#muteNotificationCall').removeClass('display-none');
             $('#uumuteNotificationCall').addClass('display-none');*/
            $('#notificationCallFunction').removeClass('display-none');
            $('#notificationAcw').addClass('display-none');
            $('#transferNotificationCall').addClass('display-none');
        },
        unholdState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').addClass('display-none');
            $('#anzNotificationCall').addClass('display-none');
            $('#endNotificationCall').removeClass('display-none');
            $('#holdNotificationCall').removeClass('display-none');
            $('#unholdNotificationCall').addClass('display-none');
            /*$('#muteNotificationCall').removeClass('display-none');
             $('#uumuteNotificationCall').addClass('display-none');*/
            $('#notificationCallFunction').removeClass('display-none');
            $('#notificationAcw').addClass('display-none');
            $('#transferNotificationCall').removeClass('display-none');
        }
        ,
        muteState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').addClass('display-none');
            $('#anzNotificationCall').addClass('display-none');
            $('#endNotificationCall').removeClass('display-none');
            // $('#holdNotificationCall').removeClass('display-none');
            // $('#unholdNotificationCall').addClass('display-none');
            $('#muteNotificationCall').addClass('display-none');
            $('#uumuteNotificationCall').removeClass('display-none');
            $('#notificationCallFunction').removeClass('display-none');
            $('#notificationAcw').addClass('display-none');
        },
        unmuteState: function () {
            if ($scope.isRegistor) return;
            $('#rejectNotificationCall').addClass('display-none');
            $('#anzNotificationCall').addClass('display-none');
            $('#endNotificationCall').removeClass('display-none');
            /* $('#holdNotificationCall').addClass('display-none');
             $('#unholdNotificationCall').removeClass('display-none');*/
            $('#muteNotificationCall').removeClass('display-none');
            $('#uumuteNotificationCall').addClass('display-none');
            $('#notificationCallFunction').removeClass('display-none');
            $('#notificationAcw').addClass('display-none');
        },
        stopCallTime: function () {
            if ($scope.isRegistor) return;
            try {
                document.getElementById('notificationcalltimmer').getElementsByTagName('timer')[0].stop();
                $scope.$broadcast('timer-reset');
            }
            catch (ex) {

            }

        },
        startCallTime: function () {
            if ($scope.isRegistor) return;
            try {
                document.getElementById('notificationcalltimmer').getElementsByTagName('timer')[0].start();
            }
            catch (ex) {

            }
        }
    };

    var phoneFuncion = {
        hideAllBtn: function () {
            phoneFuncion.hideAnswerButton();
            phoneFuncion.hideConference();
            phoneFuncion.hideMorebtn();
            phoneFuncion.hideEndButton();
            phoneFuncion.hideEtl();
            phoneFuncion.hideHoldButton();
            phoneFuncion.hideMuteButton();
            phoneFuncion.hideSpeakerButton();
            phoneFuncion.hideSwap();
            phoneFuncion.hideTransfer();
            phoneFuncion.hideIvrBtn();
            phoneFuncion.hideIvrList();
            phoneFuncion.hideDialPad();
            phoneFuncion.hideContactList();
        },
        idle: function () {
            phoneFuncion.showAnswerButton();
            phoneFuncion.showEndButton();
            phoneFuncion.showDialPad();
            phoneFuncion.showContactList();
            phoneFuncion.showMorebtn();
            $scope.freeze = false;
            $scope.isAcw = false;
            $scope.isReadyToSpeak = false;
            phoneFuncion.updateCallStatus('Idle');

            phoneFuncion.hideConference();
            phoneFuncion.hideEtl();
            phoneFuncion.hideTransfer();
            phoneFuncion.hideIvrList();
            phoneFuncion.hideIvrBtn();
            phoneFuncion.hideSwap();


            if ($scope.agentDialerOn) { // start only if dialer start
                $rootScope.$emit('dialnextnumber', undefined);
            }
            $scope.profile.freezeExceeded = false;
        },
        freezeBtn: function () {
            $scope.isFreezeReq = true;
            $scope.freeze = true;
            $scope.isAcw = false;
            phoneFuncion.updateCallStatus('Freeze');
            $scope.stopCountdownTimmer();
            $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
            phoneFuncion.showfreezeRequest();
            resourceService.FreezeAcw($scope.call.sessionId, true).then(function (response) {

                if (response) {
                    $('#calltimmer').addClass('call-duations').removeClass('display-none');
                    $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
                    $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
                    $('#freezeRequest').addClass('display-none').removeClass('call-duations');
                    $scope.startCallTime();
                    $("#freezebtn").attr({
                        "title": "End-Freeze [Alt+Z]"
                    });
                }
                else {
                    phoneFuncion.hidefreezeRequest();
                }
                $scope.isFreezeReq = false;
            }, function (err) {
                authService.IsCheckResponse(err);
                $scope.showAlert('Phone', 'error', "Fail Freeze Operation.");
                phoneFuncion.hidefreezeRequest();
            });
        },
        endfreezeBtn: function () {

            resourceService.FreezeAcw($scope.call.sessionId, false).then(function (response) {
                if (response) {
                    $scope.freeze = false;
                    $scope.stopCallTime();
                    phoneFuncion.updateCallStatus('Idle');
                    $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
                    $('#endACWbtn').addClass('phone-sm-btn ').removeClass('display-none');
                    phoneFuncion.idle();
                    chatService.Status('available', 'call');
                    $("#freezebtn").attr({
                        "title": "Freeze [Alt+Z]"
                    });
                    return true;
                } else {
                    $scope.showAlert('Phone', 'error', "Fail End-Freeze Operation.");
                    return false;
                }
            }, function (err) {
                $scope.showAlert('Phone', 'error', "Fail End-Freeze Operation.");
                return false;
            });


        },
        startAcw: function () {
            $scope.isAcw = true;
            $('#calltimmer').addClass('display-none').removeClass('call-duations');
            $('#countdownCalltimmer').addClass('call-duations').removeClass('display-none');
            phoneFuncion.updateCallStatus('ACW');
            $scope.startCountdownTimmer();
            phoneFuncion.hideAllBtn();
            $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
            $('#endACWbtn').addClass('phone-sm-btn ').removeClass('display-none');
        },
        endAcw: function () {
            resourceService.EndAcw($scope.call.sessionId).then(function (response) {
                if (response) {
                    $scope.stopCountdownTimmer();
                    $('#countdownCalltimmer').addClass('display-none').removeClass('call-duations');
                    $('#calltimmer').addClass('call-duations').removeClass('display-none');
                    document.getElementById('callStatus').innerHTML = "idle";
                    $scope.freeze = false;
                    $('#freezebtn').addClass('display-none').removeClass('phone-sm-btn ');
                    $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
                    //document.getElementById('freeze').innerHTML = "freeze";
                    phoneFuncion.idle();
                    chatService.Status('available', 'call');
                }
                else {
                    $scope.showAlert('Phone', 'error', "Fail End ACW Operation.");
                    console.log("Fail to End ACW.");
                }
            }, function (err) {
                console.log("Fail to End ACW.");
                $scope.showAlert('Phone', 'error', "Fail End ACW Operation.");
            });
        }
        , showAnswerButton: function () {
            $('#answerButton').addClass('phone-sm-btn answer').removeClass('display-none');
            $('#freezebtn').addClass('display-none').removeClass('phone-sm-btn ');
            $('#endACWbtn').addClass('display-none').removeClass('phone-sm-btn ');
        },
        hideAnswerButton: function () {
            $('#answerButton').addClass('display-none ').removeClass('phone-sm-btn answer');
        },
        showHoldButton: function () {
            $('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('display-none');
            /*$('#holdResumeButton').addClass('phone-sm-btn phone-sm-bn-p8').removeClass('veery-phone-icon-1-phone-call-2');*/
        },
        hideHoldButton: function () {
            $('#holdResumeButton').addClass('display-none ').removeClass('display-inline');
        },
        showEndButton: function () {
            $('#endButton').addClass('phone-sm-btn call-ended').removeClass('display-none');
        },
        hideEndButton: function () {
            $('#endButton').addClass('display-none ');
        },
        showMuteButton: function () {
            $('#muteButton').addClass('phone-btn ').removeClass('display-none');
            $('#muteButton').addClass('veery-font-1-mute').removeClass('veery-font-1-muted');
        },
        hideMuteButton: function () {
            $('#muteButton').addClass('display-none ').removeClass('display-inline');
        },
        showSpeakerButton: function () {
            $('#speakerButton').addClass('veery-font-1-microphone').removeClass('veery-font-1-muted display-none');
        },
        hideSpeakerButton: function () {
            $('#speakerButton').addClass('display-none ');
        },
        updateCallStatus: function (status) {
            /*$scope.safeApply(function () {
             $scope.call.status = status;
             });*/

            document.getElementById('callStatus').innerHTML = status;
            switch (status) {
                case 'Dialing':
                    $scope.startCallTime();
                    break;
                case 'In Call':
                    $scope.stopCallTime();
                    //$scope.startCallTime();
                    break;
                default:

            }
        },
        hideTransfer: function () {
            $('#transferCall').addClass('display-none').removeClass('display-inline');
            phoneFuncion.hideIvrList();
        },
        showTransfer: function () {
            $('#transferCall').addClass('display-inline').removeClass('display-none');

        },
        showIvrBtn: function () {
            $('#transferIvr').addClass('display-inline').removeClass('display-none');
        },
        hideIvrBtn: function () {
            $('#transferIvr').addClass('display-none').removeClass('display-inline');
        },
        hideSwap: function () {
            // $('#swapCall').addClass('display-none').removeClass('display-inline');
        },
        showSwap: function () {
            /*$('#swapCall').addClass('display-inline').removeClass('display-none');
             $('#slapCall').addClass('display-inline').removeClass('display-none');*/
        },
        hideEtl: function () {
            $('#etlCall').addClass('display-none').removeClass('display-inline');
        },
        showEtl: function () {
            $('#etlCall').addClass('display-inline').removeClass('display-none');
        },
        hideConference: function () {
            $('#conferenceCall').addClass('display-none').removeClass('display-inline');
        },
        showConference: function () {
            $('#conferenceCall').addClass('display-inline').removeClass('display-none');
            phoneFuncion.hideIvrBtn();
        },
        hideDialPad: function () {
            $('#dialPad').addClass('display-none').removeClass('veery-font-1-menu-4');
        },
        showDialPad: function () {
            $('#dialPad').addClass('veery-font-1-menu-4').removeClass('display-none');
        },
        hideMorebtn: function () {
            $('#morebtn').addClass('display-none').removeClass('phone-sm-btn phone-sm-bn-p8 veery-font-1-more');
        },
        showMorebtn: function () {
            $('#morebtn').addClass('phone-sm-btn phone-sm-bn-p8 veery-font-1-more').removeClass('display-none');
        },
        hideContactList: function () {
            $('#contactList').addClass('display-none').removeClass('veery-font-1-user');
        },
        showContactList: function () {
            $('#contactList').addClass('veery-font-1-user').removeClass('display-none');
        },
        showMoreOption: function () {
            $('#onlinePhoneBtnWrapper').removeClass('display-none');
            $('#phoneBtnWrapper').addClass('display-none');
        },
        hideMoreOption: function () {
            $('#phoneBtnWrapper').removeClass('display-none');
            $('#onlinePhoneBtnWrapper').addClass('display-none');
        },

        showfreezeRequest: function () {
            $('#freezeRequest').addClass('call-duations').removeClass('display-none');
        },
        hidefreezeRequest: function () {
            $scope.isFreezeReq = false;
            $('#calltimmer').addClass('call-duations').removeClass('display-none');
            $('#freezebtn').addClass('phone-sm-btn ').removeClass('display-none');
            $('#endACWbtn').addClass('phone-sm-btn ').removeClass('display-none');
            $('#freezeRequest').addClass('display-none').removeClass('call-duations');
            this.idle();
        },
        showIvrList: function () {
            $('#divIvrPad').removeClass('display-none');
            $('#divKeyPad').addClass('display-none');
        },
        hideIvrList: function () {
            $('#divKeyPad').removeClass('display-none');
            $('#divIvrPad').addClass('display-none');
        },

        /*showConnectedBtn: function () {
         //$('#onlinePhoneBtnWrapper').removeClass('display-none');
         $('#phoneBtnWrapper').addClass('display-none');
         },
         hideConnectedBtn: function () {
         $('#phoneBtnWrapper').removeClass('display-none');
         // $('#onlinePhoneBtnWrapper').addClass('display-none');
         },*/
    };

    phoneFuncion.hideHoldButton();
    phoneFuncion.hideMuteButton();
    phoneFuncion.hideSpeakerButton();
    phoneFuncion.updateCallStatus("Dial Number");


    var userEvent = {
        onSipEventSession: $scope.veeryPhone.onSipEventSession,
        notificationEvent: $scope.veeryPhone.notificationEvent,
        onErrorCallback: $scope.veeryPhone.onErrorEvent,
        uiOnConnectionEvent: $scope.veeryPhone.uiOnConnectionEvent,
        uiVideoDisplayShowHide: $scope.veeryPhone.uiVideoDisplayShowHide,
        uiVideoDisplayEvent: $scope.veeryPhone.uiVideoDisplayEvent,
        onIncomingCall: $scope.veeryPhone.onIncomingCall,
        uiCallTerminated: $scope.veeryPhone.uiCallTerminated
    };


    $('#phoneDialpad input').click(function () {
        var values = $(this).data('values');
        var chr = values[0].toString();
        $scope.call.number = $scope.call.number ? $scope.call.number + chr : chr;

        $scope.veeryPhone.sipSendDTMF(chr);
        $scope.$apply();
    });

    $scope.PhoneConfig = {};
    var getPhoneConfig = function () {
        userService.getPhoneConfig().then(function (response) {
            $scope.PhoneConfig = response;
        }, function (error) {

            console.log(error);
            $scope.showAlert("Phone", "error", "Fail To Get Phone Config.");
        });
    };
    getPhoneConfig();


    //dont remove this code
    /*var prev, $result = $('#result'),
     counter = 0,
     timer;
     $('#phoneDialpad input').click(function () {
     var values = $(this).data('values'),
     result = $result.text();
     if (this == prev) {
     result = result.slice(0, -1);
     counter = values.length == counter + 1 ? 0 : counter + 1;
     } else {
     counter = 0;
     }

     $scope.call.number = $scope.call.number + values[counter];

     prev = this;

     //timer to reset
     clearTimeout(timer)
     timer = setTimeout(function () {
     prev = undefined;
     }, 1000)
     });*/
    /*--------------------------Veery Phone---------------------------------------*/


    /*--------------------------Dialer Message---------------------------------------*/

    $scope.previewMessage = {};
    var audioDialerMessage = new Audio('assets/sounds/previewtone.mp3');
    $scope.dialerMessage = {
        sendPreviewReply: function (topicKey, replyMessage) {
            try {
                audioDialerMessage.pause();
                audioDialerMessage.currentTime = 0;
            } catch (e) {

            }


            var replyData = {Tkey: topicKey, Message: replyMessage};
            notificationService.ReplyToNotification(replyData).then(function (response) {

                if (!response.IsSuccess) {
                    $scope.showAlert("Preview Reply", "error", "Error in reply message");
                }

            }, function (error) {
                $scope.showAlert("Preview Reply", "error", "Error in reply message");
            });

            $('#previewMessage').addClass('display-none').removeClass('display-block');
        }
    };

    /*--------------------------Dialer Message---------------------------------------*/


    /*--------------------------      Notification  ---------------------------------------*/


    $scope.agentSuspended = function (data) {

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
                        $scope.veeryPhone.sipUnRegister();
                    }
                }
            },
            columnClass: 'col-md-6 col-md-offset-3',
            /*boxWidth: '50%',*/
            useBootstrap: true
        });

        $('#userStatus').addClass('agent-suspend').removeClass('online');
    };


    $scope.agentFound = function (data) {

        console.log("agentFound");
        $scope.call.transferName = '';
        /* var values = data.Message.split("|");
         var direction = values[7].toLowerCase();
         var notifyData = {
         company: data.Company,
         direction: values[7],
         channelFrom: direction=== 'inbound' ? values[3]:values[5],
         channelTo: direction=== 'inbound' ? values[5]:values[3],
         channel: 'call',
         skill: values[6],
         sessionId: values[1],
         displayName: values[4]
         };*/
        var values = data.Message.split("|");
        var notifyData = {
            company: data.Company,
            direction: values[7],
            channelFrom: values[3],
            channelTo: values[5],
            channel: 'call',
            skill: values[6],
            sessionId: values[1],
            displayName: values[4]
        };
        //agent_found|c8e009d8-4e31-4685-ab57-2315c69854dd|60|18705056580|Extension 18705056580|94112375000|ClientSupport|inbound|call|duoarafath

        if (values.length > 8) {

            notifyData.channel = values[8];
            if (notifyData.channel == 'skype')
                notifyData.channelFrom = values[4];

        }

        if (values.length === 12 && values[11] === 'DIALER') {
            $scope.call.CompanyNo = '';
        }
        else {
            $scope.call.CompanyNo = notifyData.channelTo;
        }


        var index = notifyData.sessionId;
        if (notifyData.direction.toLowerCase() != 'inbound') {
            $scope.tabs.filter(function (item) {
                var substring = "-Call" + notifyData.channelFrom;
                if (item.tabReference.indexOf(substring) !== -1) {
                    index = item.tabReference;
                }
            });
        }
        else {
            $scope.sayIt("you are receiving " + values[6] + " call");
        }
        //$scope.call.number = notifyData.channelFrom;
        $scope.call.skill = notifyData.skill;
        $scope.call.displayNumber = notifyData.channelFrom;
        $scope.call.displayName = notifyData.displayName;
        $scope.call.Company = notifyData.company;

        $scope.call.sessionId = notifyData.sessionId;
        $scope.call.direction = notifyData.direction;
        $scope.call.callrefid = (values.length >= 10) ? values[10] : undefined;
        $scope.addTab('Engagement - ' + values[3], 'Engagement', 'engagement', notifyData, index);
        collectSessions(index);


        /*show notifications */
        if (notifyData.direction.toLowerCase() === 'inbound' || notifyData.direction.toLowerCase() === 'outbound') {
            $scope.phoneNotificationFunctions.showNotfication(true);
        }

        if (values.length === 12 && values[11] === 'TRANSFER') {
            $scope.call.transferName = 'Transfer Call From : ' + values[9];
            $scope.call.number = values[3];
            $scope.call.CompanyNo = '';
        }
        else if (values.length === 12 && values[11] === 'AGENT_AGENT') {
            $scope.call.number = values[5];
            $scope.call.CompanyNo = '';
        }

    };

    $scope.dialerPreviewMessage = function (data) {
        if (data) {
            console.log('dialerPreviewMessage data :: ' + JSON.stringify(data));

            $scope.previewMessage.Tkey = data.TopicKey;
            $scope.previewMessage.Message = "";

            $scope.safeApply(function () {
                if (data.Message) {
                    $scope.previewMessage.PreviewData = JSON.parse(data.Message);

                } else {
                    $scope.previewMessage.PreviewData = undefined;
                }
            });


            //display enable preview dialer
            audioDialerMessage.play();
            $('#previewMessage').addClass('display-block').removeClass('display-none');
            showNotification("Hello " + $scope.firstName + " you are allocated to campaign call", 10000);
        }
    };

    $scope.test = {
        "name": 'sdsdsdsdsdsdsd',
        "address": "3434343 dsd",
        "location": "bandarawela",
        "location1": "bandarawela2",
        "location2": "bandarawela2",
        "location3": "bandarawela3",
        "location4": "bandarawela4",
        "location5": "bandarawela5",
        "location6": "bandarawela6",
        "location7": "bandarawela7",
        "location8": "bandarawela8",
        "location9": "bandarawela9",
        "location10": "bandarawela10",
        "location11": "bandarawela11",
        "location12": "bandarawela12",
        "location13": "bandarawela13",
        "location14": "bandarawela14",
        "contactNo": "test"
    };

    $scope.agentConnected = function (data) {
        console.log("agentConnected");
        //"agent_connected|de1334de-35d8-412f-aa65-886f18c11487|60|18705056580|Extension 18705056580|94112375000|ClientSupport|inbound|call|duoarafath|eec46ff0-cbea-4b04-9132-d912e0e8dc55"
        var values = data.Message.split("|");
        if (values.length > 10) {
            $scope.call.callrefid = values[10];
        }

        $scope.phoneNotificationFunctions.answerState();
        $scope.phoneNotificationFunctions.startCallTime();
    };

    $scope.agentRejected = function (data) {
        console.log("agentRejected");
        $scope.phoneNotificationFunctions.rejectState();
    };

    $scope.agentDisconnected = function (data) {
        console.log("agentDisconnected");
        $scope.phoneNotificationFunctions.stopCallTime();
        $scope.phoneNotificationFunctions.endState();

    };

    $scope.transferEnded = function (data) {
        if (data && data.Message) {
            var splitMsg = data.Message.split('|');

            if (splitMsg.length > 5) {
                $scope.showAlert(splitMsg[10], 'warn', 'Call transfer ended for ' + splitMsg[4]);
            }
            phoneFuncion.showTransfer();
            phoneFuncion.hideConference();
            phoneFuncion.hideEtl();
        }
    };

    $scope.transferTrying = function (data) {
        if (data && data.Message) {
            var splitMsg = data.Message.split('|');

            if (splitMsg.length >= 9) {
                $scope.call.transferName = 'Transfer Call From : ' + splitMsg[3];
                $scope.call.number = splitMsg[8];
            }
        }
    };

    $scope.agentUnauthenticate = function (data) {
        console.log("agentUnauthenticate");
        $scope.isSocketRegistered = false;
        if (!$scope.isLogingOut) {
            $scope.showAlert("Registration failed", "error", "Disconnected from notifications, Please re-register");
        }
        // $('#regNotification').addClass('display-none');
        //$('#regNotificationLoading').removeClass('display-none');
        $scope.phoneNotificationFunctions.showNotfication(false);
    };

    $scope.MakeNotificationObject = function (data) {


        var callbackObj = JSON.parse(data.Callback);

        callbackObj.From = data.From;
        callbackObj.TopicKey = callbackObj.Topic;
        callbackObj.messageType = callbackObj.MessageType;
        callbackObj.isPersistMessage = true;
        callbackObj.PersistMessageID = data.id;


        return callbackObj;

    };

    var isPersistanceLoaded = false;

    $scope.agentAuthenticated = function () {
        console.log("agentAuthenticated");
        $scope.isSocketRegistered = true;
        // $('#regNotificationLoading').addClass('display-none').removeClass('display-block');
        //$('#regNotification').addClass('display-block').removeClass('display-none');
        $scope.showAlert("Registration succeeded", "success", "Registered with notifications");


    };

    $scope.unredNotifications = 0;

    $scope.OnTicketNoticeReceived = function (data) {
        console.log("OnTicketNoticeReceived");
        $scope.OnMessage(data);
    };

    $scope.OnMessage = function (data) {
        console.log("OnMessage");
        var senderAvatar = "assets/img/avatar/profileAvatar.png";

        if (data.From && $scope.users) {

            var user = $filter('filter')($scope.users, {username: data.From});
            if (user && user.length) {
                senderAvatar = user[0].avatar;
            }
            else if ($filter('filter')($scope.userGroups, {name: data.From})) {
                var user = $filter('filter')($scope.userGroups, {username: data.From});
                if (user && user.length) {
                    senderAvatar = user[0].avatar;
                }
            }
        }
        else {
            senderAvatar = null;
            data.From = "System";
        }

        var regex = /~#tid (.*?) ~/;
        var tid = regex.exec(data.Message);
        var regexref = /~#tref (.*?) ~/;
        var tref = regexref.exec(data.Message);
        var objMessage = {
            "id": data.TopicKey,
            "header": data.Message,
            "type": "menu",
            "icon": "main-icon-2-speech-bubble",
            "time": new Date(),
            "level": data.eventLevel,
            "read": false,
            "avatar": senderAvatar,
            "from": data.From
        };


        if (data.isPersistMessage && data.PersistMessageID) {
            objMessage['isPersistMessage'] = data.isPersistMessage;
            objMessage['PersistMessageID'] = data.PersistMessageID;
        }

        if (Array.isArray(tid) && tid.length > 1) {
            objMessage['ticket'] = tid[1];
            objMessage['ticketref'] = tid[1];
        }

        if (Array.isArray(tref) && tref.length > 1) {
            objMessage['ticketref'] = tref[1];
        }


        if (data.TopicKey || data.messageType && $scope.notifications.indexOf(objMessage) == -1) {
            var audio = new Audio('assets/sounds/notification-1.mp3');
            audio.play();
            $scope.notifications.unshift(objMessage);
            $('#notificationAlarm').addClass('animated swing');
            $scope.unredNotifications = $scope.getCountOfUnredNotifications();
            setTimeout(function () {
                $('#notificationAlarm').removeClass('animated swing');
            }, 500);

            if (objMessage.level && objMessage.level === "urgent") {

                $scope.showChromeNotification("Urgent notification Received From " + objMessage.from + "\n" + objMessage.header, 50000, false);
            }
            //$scope.showChromeNotification("Notification Received From "+ objMessage.from, 10000);
        } else {


        }
    };

    $scope.readNotification = function (id) {
        console.log("readNotification");
        var index = -1;
        for (var i = 0, len = $scope.notifications.length; i < len; i++) {
            if ($scope.notifications[i].id === id) {
                index = i;
                break;
            }
        }
        if (index >= 0)
            $scope.notifications.splice(index, 1);
        $scope.unredNotifications = $scope.getCountOfUnredNotifications();
    };

    $scope.getCountOfUnredNotifications = function () {
        console.log("getCountOfUnredNotifications");
        return filterFilter($scope.notifications, {read: false}).length;
    };


    $scope.isSocketRegistered = false;
    $scope.isLoadingNotifiReg = false;


//#myNote
    $scope.todoRemind = function (data) {
        var displayReminder = true;
        console.log("todoRemind");
        $scope.myNoteReminder = data;


        if (data.From) {
            if ($filter('filter')($scope.users, {username: data.From})) {
                senderAvatar = $filter('filter')($scope.users, {username: data.From}).avatar;
            }
            else if ($filter('filter')($scope.userGroups, {name: data.From})) {
                senderAvatar = $filter('filter')($scope.userGroups, {username: data.From}).avatar;
            }
            else {
                senderAvatar = null;
            }


        }
        else {
            senderAvatar = null;
            data.From = "System";
        }


        var objMessage = {
            "id": data.TopicKey,
            "header": data.Message.Message,
            "title": data.Message.title,
            "type": "menu",
            "icon": "main-icon-2-speech-bubble",
            "time": new Date(),
            "read": false,
            "avatar": senderAvatar,
            "from": data.From,
            "messageType": "todo",
            "external_user": data.Message.external_user
        };

        if (data.isPersistMessage && data.PersistMessageID) {
            objMessage['isPersistMessage'] = data.isPersistMessage;
            objMessage['PersistMessageID'] = data.PersistMessageID;
            displayReminder = false;
        }


        if (data.TopicKey || data.messageType && $scope.notifications.indexOf(objMessage) == -1) {
            var audio = new Audio('assets/sounds/notification-1.mp3');
            //audio.play();
            $scope.notifications.unshift(objMessage);
            $('#notificationAlarm').addClass('animated swing');
            $scope.unredNotifications = $scope.getCountOfUnredNotifications();
            setTimeout(function () {
                $('#notificationAlarm').removeClass('animated swing');
            }, 500);
        }

        if (displayReminder) {
            $scope.myNoteNotiMe.showMe();
            $scope.goToTopScroller();
        }


    };
    $scope.noticeRecieved = function (data) {
        console.log("noticeRecieved");
        // $scope.myNoteReminder = data;
        // $scope.myNoteNotiMe.showMe();


        var senderAvatar;
        var senderName;
        $rootScope.$emit('noticeReceived', data);

        if (data.from) {
            if ($filter('filter')($scope.users, {id: data.from})) {
                senderAvatar = $filter('filter')($scope.users, {username: data.from})[0].avatar;
                senderName = $filter('filter')($scope.users, {username: data.from})[0].username;
            }
            else if ($filter('filter')($scope.userGroups, {name: data.from})) {
                senderAvatar = $filter('filter')($scope.userGroups, {name: data.from})[0].avatar;
                senderName = $filter('filter')($scope.userGroups, {name: data.from})[0].name;
            }
        }
        var regex = /~#tid (.*?) ~/;
        var tid = regex.exec(data.message);
        var regexref = /~#tref (.*?) ~/;
        var tref = regexref.exec(data.message);
        var objMessage = {
            "id": data.id,
            "header": data.message,
            "type": "menu",
            "icon": "main-icon-2-speech-bubble",
            "time": new Date(),
            "read": false,
            "avatar": senderAvatar,
            "from": senderName,
            "messageType": "notice",
            "title": data.title
        };


        var audio = new Audio('assets/sounds/notification-1.mp3');
        //audio.play();
        $scope.notifications.unshift(objMessage);
        $('#notificationAlarm').addClass('animated swing');
        $scope.unredNotifications = $scope.getCountOfUnredNotifications();
        setTimeout(function () {
            $('#notificationAlarm').removeClass('animated swing');
        }, 500);


    };


    var notificationEvent = {
        onAgentFound: $scope.agentFound,
        OnMessageReceived: $scope.OnMessage,
        onAgentConnected: $scope.agentConnected,
        onAgentRejected: $scope.agentRejected,
        onAgentDisconnected: $scope.agentDisconnected,
        onTransferFailed: $scope.transferFailed,
        OnAgentUnauthenticate: $scope.agentUnauthenticate,
        onAgentAuthenticated: $scope.agentAuthenticated,
        onToDoRemind: $scope.todoRemind,
        OnTicketNoticeReceived: $scope.noticeRecieved
    };

    chatService.SubscribeConnection(function (isConnected) {

        if (isConnected) {
            $scope.agentAuthenticated();
        } else {
            //$scope.agentDisconnected();
            $scope.agentUnauthenticate();
        }
    });


    chatService.SubscribeEvents(function (event, data) {
        console.log('preview_dialer_message :: ' + event);
        switch (event) {

            case 'agent_connected':

                $scope.agentConnected(data);

                break;

            case 'agent_disconnected':

                $scope.agentDisconnected(data);

                break;
            case 'transfer_ended':

                $scope.transferEnded(data);

                break;

            case 'transfer_trying':

                $scope.transferTrying(data);

                break;

            case 'agent_found':

                $scope.agentFound(data);

                break;
            case 'agent_suspended':

                $scope.agentSuspended(data);

                break;

            case 'agent_rejected':
                $scope.agentRejected(data);
                break;

            case 'todo_reminder':

                $scope.todoRemind(data);

                break;

            case 'notice':

                $scope.noticeRecieved(data);

                break;

            case 'notice_message':

                $scope.OnMessage(data);

                break;

            case 'preview_dialer_message':

                $scope.dialerPreviewMessage(data);

                break;


        }


    });

    var convertToNoticifationObject = function (event) {
        var data = {};
        angular.copy(event, data);
        var mObject = data.Message;

        mObject.From = mObject.UserName;
        if ($scope.users && $scope.users.length) {
            var items = $filter('filter')($scope.users, {resourceid: mObject.ResourceId.toString()});
            mObject.From = (items && items.length) ? items[0].username : mObject.UserName;
        }

        mObject.TopicKey = data.eventName;
        mObject.messageType = mObject.Message;
        mObject.header = mObject.Message;
        mObject.isPersistMessage = mObject.Direction !== "STATELESS";
        mObject.PersistMessageID = mObject.id;
        return mObject;
    };

    chatService.SubscribeDashboard(function (event) {
        switch (event.roomName) {
            case 'ARDS:freeze_exceeded':
                if (event.Message) {

                    var resourceId = authService.GetResourceId();
                    if ($scope.profile && event.Message.ResourceId === resourceId) {
                        $scope.profile.freezeExceeded = true;
                        if (event.Message.SessionId) {
                            event.Message.Message = event.Message.Message + " Session : " + event.Message.SessionId;
                        }
                        $scope.OnMessage(convertToNoticifationObject(event));
                        phoneFuncion.updateCallStatus('Freeze Exceeded.');
                    }
                }

                break;
            case 'ARDS:break_exceeded':
                if (event.Message) {

                    var resourceId = authService.GetResourceId();
                    if ($scope.profile && event.Message.ResourceId === resourceId) {
                        $scope.safeApply(function () {
                            $scope.profile.break_exceeded = true;
                        });
                        $scope.OnMessage(convertToNoticifationObject(event));
                    }
                }

                break;
            default:
                //console.log(event);
                break;

        }
    });

    $scope.veeryNotification = function () {
        //veeryNotification.connectToServer(authService.TokenWithoutBearer(), baseUrls.notification, notificationEvent);
    };

    $scope.veeryNotification();
    $scope.socketReconnect = function () {
        //veeryNotification.reconnectToServer();
    };


    $scope.checkAndRegister = function () {


        if (!$scope.isSocketRegistered) {
            //todo
            //$('#regNotification').addClass('display-none').removeClass('display-block');
            //$('#regNotificationLoading').addClass('display-block').removeClass('display-none');
            $scope.isLoadingNotifiReg = true;
            //$scope.socketReconnect();
            SE.reconnect();
        }

    };


    /*--------------------------      Notification  ---------------------------------------*/

    /*---------------main tab panel----------------------- */


    $scope.activeTabIndex = undefined;
    $scope.tabReference = "";
    $scope.tabs = [];

    $scope.scrlTabsApi = {};

    $scope.reCalcScroll = function () {
        if ($scope.scrlTabsApi.doRecalculate) {
            $scope.scrlTabsApi.doRecalculate();
        }
    };

    var validateTabLimit = function () {

        var showWarningAlert = function (msg) {
            $ngConfirm({
                icon: 'fa fa-universal-access',
                title: 'Warning...!',
                content: '<div class="suspend-header-txt"> <h5> Too Many Tabs Opened!</h5> <span>' + msg + ' </span></div>',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Ok',
                        btnClass: 'btn-red',
                        action: function () {
                        }
                    }
                },
                columnClass: 'col-md-6 col-md-offset-3',
                /*boxWidth: '50%',*/
                useBootstrap: true
            });
        };
        var tabCount = $scope.tabs.length;
        if (tabCount >= tabConfig.alertValue && tabCount < tabConfig.warningValue) {
            $scope.showAlert('Warning', 'warning', "You have too many tabs opened on the screen. Please close unwanted tabs to improve performance.");
        }
        else if (tabCount >= tabConfig.warningValue && tabCount < tabConfig.maxTabLimit) {

            var msg = "You are nearing the maximum allowed threshold[" + tabConfig.maxTabLimit + "] for concurrent tabs opened. Please close unwanted tabs NOW. The system will automatically remove first tab opened once threshold is reached.";
            showWarningAlert(msg);

        }
        else if (tabCount >= tabConfig.maxTabLimit) {
            var msg = "You have reached the maximum allowed threshold[" + tabConfig.maxTabLimit + "] for concurrent tabs opened, the system will now automatically close the first tab opened to allocate space.";
            showWarningAlert(msg);
            $scope.tabs.shift();
        }
    };

    $scope.addTab = function (title, content, viewType, notificationData, index) {


        var isOpened = false;

        var newTab = {
            disabled: false,
            active: true,
            title: title,
            content: content,
            viewType: viewType,
            notificationData: notificationData,
            tabReference: index ? index : uuid4.generate()
        };

        $scope.tabs.filter(function (item) {
            if (item.tabReference == index) {
                isOpened = true;
            }
        });


        if (!isOpened) {
            $scope.tabs.push(newTab);
            $timeout(function () {
                //$scope.tabSelected(newTab.tabReference);
                if ($scope.tabs.length === 0) {
                    $scope.activeTabIndex = undefined;
                } else {
                    $scope.activeTabIndex = newTab.tabReference;
                }
                //document.getElementById("tab_view").active = $scope.tabs.length - 1;
                //$scope.$broadcast("checkTabs");
                $scope.reCalcScroll();
            });
            $scope.tabSelected(index);
            validateTabLimit();
        }
        else {
            $scope.tabSelected(index);
        }
        $('html, body').animate({scrollTop: 0}, 'fast');
    };
    $scope.isForceFocused = false;
    $scope.currTab = 0;

    $scope.closeTab = function (tab) {

        $scope.tabs.filter(function (item, c) {
            if (item.tabReference == tab.tabReference) {
                //var tIndex = $scope.tabs.indexOf(item);
                //if(tIndex > -1) {
                $scope.tabs.splice(c, 1);

                var nxtIndex = $scope.tabs.length - 1;
                if (nxtIndex > -1) {
                    $scope.activeTab = $scope.tabs[nxtIndex];
                    $scope.activeTabIndex = $scope.tabs[nxtIndex].tabReference;
                    $scope.tabSelected(nxtIndex);
                } else {
                    $scope.activeTab = undefined;
                    $scope.activeTabIndex = undefined;
                }
                $scope.reCalcScroll();
                $scope.searchExternalUsers = {};

                //}
            }

        });

    };

    $scope.isForceFocused = false;
    $scope.currTab = 0;
    $scope.tabSelected = function (tabIndex) {
        $scope.goToTopScroller();
        if (tabIndex == 'Ticket-Inbox') {
            $('#consoleBody').addClass('disable-scroll');
        } else {
            $('#consoleBody').removeClass('disable-scroll');
        }
        $scope.tabs.filter(function (item) {
            if (item.tabReference == tabIndex) {

                currTab = $scope.tabs.indexOf(item);
                $scope.activeTab = item;

                $scope.activeTabIndex = item.tabReference;
                //document.getElementById("tab_view").active = currTab;
            }
        });


    };


// load User List
    $scope.users = [];

    $scope.loadUsers = function () {
        userService.LoadUser().then(function (response) {

            for (var i = 0; i < response.length; i++) {

                response[i].status = 'offline';
                response[i].callstatus = 'offline';
                response[i].callstatusstyle = 'call-status-offline';

            }

            $scope.users = response;
            userImageList.addInToUserList(response)

            profileDataParser.assigneeUsers = response;


            $scope.userShowDropDown = 0;

            chatService.Request('pendingall');
            chatService.Request('allstatus');
            chatService.Request('allcallstatus');

            // load notification message
            if (!isPersistanceLoaded) {
                notificationService.GetPersistenceMessages().then(function (response) {

                    if (response.data.IsSuccess) {
                        isPersistanceLoaded = true;

                        angular.forEach(response.data.Result, function (value) {

                            var valObj = JSON.parse(value.Callback);

                            if (valObj.eventName == "todo_reminder") {
                                $scope.todoRemind($scope.MakeNotificationObject(value));
                            }
                            else {
                                $scope.OnMessage($scope.MakeNotificationObject(value));
                            }


                        });

                    }


                }, function (err) {

                });
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load Users", "error", "Fail To Get User List.")
        });
    };
    $scope.loadUsers();


//load userGroup list
    $scope.userGroups = [];
    $scope.loadUserGroups = function () {
        userService.getUserGroupList().then(function (response) {
            if (response.data && response.data.IsSuccess) {
                for (var j = 0; j < response.data.Result.length; j++) {
                    var userGroup = response.data.Result[j];
                    userGroup.listType = "Group";
                }
                $scope.userGroups = response.data.Result;
                profileDataParser.assigneeUserGroups = response.data.Result;


            }
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load User Groups", "error", "Fail To Get User Groups.")
        });
    };
    $scope.loadUserGroups();

// load tag List
    $scope.tags = [];
    $scope.loadTags = function () {
        tagService.GetAllTags().then(function (response) {
            $scope.tags = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load Tags", "error", "Fail To Get Tag List.")
        });
    };
    $scope.loadTags();

    $scope.loadTagCategories = function () {
        tagService.GetTagCategories().then(function (response) {
            $scope.tagCategories = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load Tags", "error", "Fail To Get Tag List.")
        });
    };
    $scope.loadTagCategories();

    $scope.reloadTagAndCategories = function () {
        $scope.loadTags();
        $scope.loadTagCategories();
    };

    $scope.addFilterTab = function () {
        $scope.addTab('Ticket Filter', 'Filter', 'filter', {
            company: "123",
            direction: "333",
            channelFrom: "33",
            channelTo: "33",
            channel: "555"
        }, 'ticketFilter');
    };

    var openNewTicketTab = function (ticket, index) {


        if (ticket.security_level >= profileDataParser.myProfile.security_level || !ticket.security_level) {
            var tabTopic = "Ticket - " + ticket.reference;
            $scope.addTab(tabTopic, tabTopic, 'ticketView', ticket, index);

        }

        else {
            $scope.showAlert("Error", "error", "You are tring to access unauthorized ticket");
        }


        /*var selectedTabs = $scope.tabs.filter(function (item) {
         return item.notificationData._id == ticket._id;
         });
         if (selectedTabs.length == 0) {

         $scope.addTab(tabTopic, tabTopic, 'ticketView', ticket);
         }
         resizeDiv();*/
    };

    var collectSessions = function (id) {
        if (profileDataParser.RecentEngagements.length >= 10) {
            profileDataParser.RecentEngagements.splice(-1, 1)
        }
        profileDataParser.RecentEngagements.push(id);
    };

    var openNewUserProfileTab = function (profile, index, sessionObj, data) {
        $('#consoleBody').removeClass('disable-scroll');
        var engUuid = uuid4.generate();
        var engSessionObj = {
            engagement_id: engUuid,
            channel: "api",
            channel_from: "direct",
            channel_to: "direct",
            direction: "direct",
            has_profile: true
        };
        if (sessionObj) {
            sessionObj.engagement_id = engUuid;
            engSessionObj = sessionObj;
        }

        if (data) {

            engSessionObj.channel = data.channel;
            engSessionObj.channel_from = data.channel_from;
            engSessionObj.channel_to = data.channel_to;
            engSessionObj.direction = data.direction;

        }


        if (profile) {
            engagementService.createEngagementSession(profile._id, engSessionObj).then(function (response) {
                if (response) {
                    if (response.IsSuccess) {
                        console.log("Create Engagement Session success :: " + response);

                        var notifyData = {
                            company: profile.company,
                            direction: response.Result.direction,
                            channelFrom: response.Result.channel_from,
                            channelTo: response.Result.channel_to,
                            channel: response.Result.channel,
                            skill: '',
                            sessionId: engUuid,
                            userProfile: profile
                        };
                        $scope.addTab('UserProfile ' + profile._id, 'Engagement', 'engagement', notifyData, index);
                        collectSessions(engUuid);
                    } else {
                        var errMsg1 = "Create Engagement Session Failed";

                        if (response.CustomMessage) {

                            errMsg1 = response.CustomMessage;

                        }

                        $scope.showAlert('Error', 'error', errMsg1);
                    }
                } else {
                    var errMsg = "Engagement Session Undefined";
                    $scope.showAlert('Error', 'error', errMsg);
                }

            }, function (err) {
                authService.IsCheckResponse(err);
                var errMsg = "Create Engagement Session Failed";

                if (err.statusText) {

                    errMsg = err.statusText;

                }

                $scope.showAlert('Error', 'error', errMsg);

            });
        } else {
            engagementService.AddEngagementSessionForProfile(engSessionObj).then(function (response) {
                if (response) {
                    if (response.IsSuccess) {
                        console.log("Create Engagement success :: " + response);

                        var notifyData = {
                            company: authService.GetCompanyInfo().company,
                            direction: "direct",
                            channelFrom: engSessionObj.channel_from,
                            channelTo: engSessionObj.channel_to,
                            channel: engSessionObj.channel,
                            skill: '',
                            sessionId: engSessionObj.engagement_id,
                            userProfile: profile
                        };
                        $scope.addTab('Create New Profile', 'Engagement', 'engagement', notifyData, index);
                        collectSessions(engUuid);
                    } else {
                        var errMsg1 = "Create Engagement Session Failed";

                        if (response.CustomMessage) {

                            errMsg1 = response.CustomMessage;

                        }

                        $scope.showAlert('Error', 'error', errMsg1);
                    }
                } else {
                    var errMsg = "Engagement Session Undefined";
                    $scope.showAlert('Error', 'error', errMsg);
                }

            }, function (err) {
                authService.IsCheckResponse(err);
                var errMsg = "Create Engagement Session Failed";

                if (err.statusText) {

                    errMsg = err.statusText;

                }

                $scope.showAlert('Error', 'error', errMsg);

            });
        }
    };


    $scope.addMailInbox = function () {
        $scope.addTab('Mail-Inbox', 'mail-inbox', 'mail-inbox', null, 'mailinbox_agentconsole');
        $('#consoleBody').removeClass('disable-scroll');
        resizeDiv();
    };

//add dashboard inside tab
    $scope.addDashBoard = function () {
        $('#consoleBody').removeClass('disable-scroll');
        $scope.addTab('Dashboard', 'dashboard', 'dashboard', "dashborad", "dashborad");
        $('#consoleBody').removeClass('disable-scroll');
    };
//add myquick note inside tab
    $scope.addMyNote = function () {
        $('#consoleBody').removeClass('disable-scroll');
        $scope.addTab('MyNote', 'MyNote', 'MyNote', "MyNote", "MyNote");
    };

    //add setting tab
    $scope.addTabProfileSetting = function () {
        $('#consoleBody').removeClass('disable-scroll');
        $scope.addTab('profile-setting', 'profile-setting', 'profile-setting', "profile-setting", "profile-setting");
    };

//ToDo
    $scope.addDashBoard();

    //ToDo
    $scope.addNewTicketInboxTemp = function () {
        $('#consoleBody').addClass('disable-scroll');
        $scope.addTab('Ticket-Inbox', 'Ticket-Inbox', 'Ticket-Inbox', "Ticket-Inbox", "Ticket-Inbox");

    };


    var openNewEngagementTab = function (args, index) {
        $('#consoleBody').removeClass('disable-scroll');
        var notifyData = {
            company: args.company,
            direction: args.direction,
            channelFrom: args.channel_from,
            channelTo: args.channel_to,
            channel: args.channel,
            raw_contact: args.raw_contact,
            skill: '',
            sessionId: args.engagement_id,
            userProfile: undefined
        };
        $scope.addTab('Engagement ' + args.channel_from, 'Engagement', 'engagement', notifyData, args.engagement_id);

    };

    $rootScope.$on('openNewTab', function (events, args) {
        $('#consoleBody').removeClass('disable-scroll');
        switch (args.tabType) {
            case 'ticketView':
                openNewTicketTab(args, args.reference);
                break;
            case 'engagement':
                openNewEngagementTab(args, args.index);
                break;
            case 'inbox':
                openEngagementTabForMailReply(args.data, args.index);
                break;
            case 'userProfile':
                openNewUserProfileTab(args, args.index, undefined, undefined);
                break;
            case 'newUserProfile':
                var data = {
                    Company: args.company,
                    Message: "agent_found|" + args.sessionId + "|60|" + args.channelFrom + "|" + args.channelFrom + "|" + args.channelTo + "| |" + args.channel + "|" + args.channel
                };

                $scope.agentFound(data);
                //openNewUserProfileTab(undefined, args.index,args.sessionId);
                break;
            default:

        }
    });

    /* -------- new UI update user profile tab --------- */
//add dashboard inside tab
    $scope.addUserProfileTab = function () {
        $('#consoleBody').removeClass('disable-scroll');
        $scope.addTab('new-profile', 'new-profile', 'new-profile', "new-profile", "new-profile");
    };
//$scope.addUserProfileTab();


    $rootScope.$on('closeTab', function (events, args) {
        $scope.tabs.filter(function (item) {
            if (item.notificationData._id == args) {

                $scope.tabs.splice($scope.tabs.indexOf(item), 1);
                $scope.searchExternalUsers = {};

            }

        });
    });

    $rootScope.$on('makecall', function (events, args) {
        if (args)
            $scope.veeryPhone.makeCall(args.callNumber, args.tabReference);
    });

    var openEngagementTabForMailReply = function (args, index) {
        $('#consoleBody').removeClass('disable-scroll');
        var notifyData = {
            company: args.company,
            direction: args.direction,
            channelFrom: args.channel_from,
            channelTo: args.channel_to,
            channel: args.channel,
            skill: '',
            sessionId: args.engagement_id,
            userProfile: undefined
        };
        $scope.addTab('Engagement' + args.channel_from, 'Engagement', 'engagement', notifyData, args.engagement_id);
    };

    /*use Common Method to open New Tab*/
    /*$scope.ticketTabCreater = function (ticket) {

     var tabTopic = "Ticket - " + ticket.reference;
     if ($scope.tabs.length > 0) {

     var isOpened = $scope.tabs.filter(function (item) {
     return item.notificationData._id == ticket._id;
     });

     if (isOpened.length == 0) {

     $scope.addTab(tabTopic, tabTopic, 'ticketView', ticket);
     }
     }
     else {

     $scope.addTab(tabTopic, tabTopic, 'ticketView', ticket);
     }
     resizeDiv();
     };


     $rootScope.$on('newTicketTab', function (events, args) {

     $scope.ticketTabCreater(args);

     });*/


//nav bar main search box
    $scope.loadTags = function (query) {
        return $http.get('/tags?query=' + query);
    };

    $scope.users = [];
    $scope.loadUser = function ($query) {
        return $http.get('assets/json/assigneeUsers.json', {cache: true}).then(function (response) {
            var countries = response.data;
            console.log(countries);
            return countries.filter(function (country) {
                return country.profileName.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        });
    };

//###time tracker option
//var _intervalId;
//$scope.status.active = false;
//function init() {
//    $scope.counter = "00:00:00";
//}
//
//init();
    $scope.unreadMailCount = 0;
    $scope.activeTicketTab = {};
    $scope.ttimer = {};
    $scope.ttimer.active = false;
    $scope.ttimer.pause = false;
    $scope.ttimer.startTime = {};
    $scope.ttimer.pausedTime = {};
    $scope.ttimer.ticketRef = "Start";
    $scope.ttimer.ticket = undefined;

//update new ui timer function
    var timerUIFun = function () {

        //.addClass('display-none').removeClass('display-block');
        //.addClass('display-block').removeClass('display-none');
        return {
            pauseModeOn: function () {
                $('#pauseActive').addClass('display-inline').removeClass('display-none');
                $('#pauseDisable').addClass('display-none').removeClass('display-inline');
            },
            pauseModeOff: function () {
                $('#pauseActive').addClass('display-none').removeClass('display-inline');
                $('#pauseDisable').addClass('display-inline').removeClass('display-none');
            },
            startTrackerModeOn: function () {
                $('#startActive').addClass('display-inline').removeClass('display-none');
                $('#startDisable').addClass('display-none').removeClass('display-inline');
            },
            startTrackerModeOff: function () {
                $('#startActive').addClass('display-none').removeClass('display-inline');
                $('#startDisable').addClass('display-inline').removeClass('display-none');
            },
            stopTrackerModeOn: function () {
                $('#stopActive').addClass('display-inline').removeClass('display-none');
                $('#stopDisable').addClass('display-none').removeClass('display-inline');
            },
            stopTrackerModeOff: function () {
                $('#stopActive').addClass('display-none').removeClass('display-inline');
                $('#stopDisable').addClass('display-inline').removeClass('display-none');
            },
            activeTimerHide: function () {
                $('#HideActiveTimer').addClass('display-inline').removeClass('display-none');
                $('#showActiveTimer').addClass('display-none').removeClass('display-inline');
            },
            activeTimerShow: function () {
                $('#HideActiveTimer').addClass('display-inline').removeClass('display-none');
                $('#showActiveTimer').addClass('display-none').removeClass('display-inline');
            },
            timerDisableMode: function () {
                timerUIFun.pauseModeOff();
                timerUIFun.startTrackerModeOn();
                timerUIFun.stopTrackerModeOff();
            },
            timerActiveMode: function () {
                $('#timerWidget').removeClass('display-none').addClass('display-block');
                timerUIFun.pauseModeOn();
                timerUIFun.startTrackerModeOff();
                timerUIFun.stopTrackerModeOn();
                timerUIFun.activeTimerHide();
            },
            timerPauseMode: function () {
                timerUIFun.pauseModeOff();
                timerUIFun.startTrackerModeOn();
                timerUIFun.stopTrackerModeOn();
            },
            timerStopMode: function () {
                timerUIFun.pauseModeOff();
                timerUIFun.startTrackerModeOn();
                timerUIFun.stopTrackerModeOn();
            },
            timerStartMode: function () {
                timerUIFun.pauseModeOn();
                timerUIFun.startTrackerModeOff();
                timerUIFun.stopTrackerModeOn();
                timerUIFun.activeTimerHide();

            }
        }
    }();

    $scope.openTimerTicket = function () {
        if ($scope.ttimer.ticket) {
            $scope.ttimer.ticket.tabType = 'ticketView';
            $scope.ttimer.ticket.index = $scope.ttimer.ticket.reference;
            $rootScope.$emit('openNewTab', $scope.ttimer.ticket);
        }
    };

    $scope.stopTime = function () {
        ticketService.stopTimer($scope.ttimer.trackerId).then(function (response) {
            if (response) {

                document.getElementById('clock-timer').getElementsByTagName('timer')[0].stop();
                $scope.timerTick = false;
                $scope.status.active = false;
                $scope.ttimer.active = false;
                $scope.ttimer.pause = false;
                $scope.ttimer.play = true;
                $scope.ttimer.ticketRef = "Start";
                $scope.ttimer.trackerId = undefined;
                $scope.ttimer.ticket = undefined;
                timerUIFun.timerDisableMode();

            }
            else {
                $scope.showAlert("Tracker", "error", "Timer failed to stop timer ");
            }
        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.showAlert("Tracker", "error", "Timer failed to stop timer ");
        });
    };

    $scope.pauseTime = function () {
        ticketService.pauseTimer($scope.ttimer.trackerId).then(function (response) {
            if (response) {

                $scope.ttimer.pause = true;
                $scope.ttimer.play = true;
                timerUIFun.timerPauseMode();
                $scope.ttimer.pausedTime = moment.utc();
                document.getElementById('clock-timer').getElementsByTagName('timer')[0].stop();

            }
            else {
                $scope.showAlert("Tracker", "error", "Timer failed to pause timer ");
            }
        }, function (error) {
            authService.IsCheckResponse(err);
            console.log(error);
            $scope.showAlert("Tracker", "error", "Timer failed to pause timer ");
        });
        //$interval.pauseTime(_intervalId);
    };

//function updateTime() {
//    var seconds = moment().diff(moment($scope.dateStart, 'x'), 'seconds');
//    var elapsed = moment().startOf('day').seconds(seconds).format('HH:mm:ss');
//    $scope.counter = elapsed;
//}


    $scope.timerModeActive = false;
    $scope.timerTick = false;
    $scope.startTracker = function () {
        if ($scope.ttimer.pause) {
            ticketService.startTimer().then(function (response) {
                if (response) {
                    var timeNow = moment.utc();
                    var timeDiff = timeNow.diff($scope.ttimer.pausedTime, 'seconds');
                    if (timeDiff > 0) {
                        $scope.ttimer.startTime = $scope.ttimer.startTime + (timeDiff * 1000);
                    }

                    document.getElementById('clock-timer').getElementsByTagName('timer')[0].resume();
                    $scope.timerTick = true;
                    $scope.ttimer.pause = false;
                    $scope.status.active = true;
                    $scope.ttimer.play = true;
                    $scope.timerModeActive = true;
                    $scope.ttimer.pausedTime = {};
                    timerUIFun.timerStartMode();
                }
                else {
                    $scope.showAlert("Tracker", "error", "Timer failed to resume timer ");
                }
            }, function (error) {
                authService.IsCheckResponse(err);
                console.log(error);
                $scope.showAlert("Tracker", "error", "Timer failed to resume timer ");
            });
        } else {

            if ($scope.activeTab && $scope.activeTab.viewType === "ticketView") {
                ticketService.createTimer($scope.activeTab.notificationData._id).then(function (response) {
                    if (response) {
                        var timeNow = moment.utc();
                        if (response.last_event === "pause" || response.last_event === "start") {
                            var lastTimeStamp = moment.utc(response.last_event_date);
                            var timeDiff = timeNow.diff(lastTimeStamp, 'seconds');

                            if (timeDiff > 0) {
                                var startTime = timeNow.subtract(timeDiff, 'seconds');
                                $scope.ttimer.startTime = parseInt(startTime.format('x'));
                            } else {
                                $scope.ttimer.startTime = parseInt(timeNow.format('x'));
                            }
                        } else {
                            $scope.ttimer.startTime = parseInt(timeNow.format('x'));

                        }

                        $scope.status.active = true;
                        $scope.ttimer.active = true;
                        timerUIFun.timerActiveMode();
                        $scope.ttimer.ticket = $scope.activeTab.notificationData;
                        $scope.ttimer.ticketId = $scope.activeTab.notificationData._id;
                        $scope.ttimer.ticketRef = $scope.activeTab.content;
                        $scope.ttimer.trackerId = response._id;

                        document.getElementById('clock-timer').getElementsByTagName('timer')[0].start();
                        $scope.timerTick = true;
                    }
                    else {
                        $scope.showAlert("Tracker", "error", "Timer failed to start ");
                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    console.log(error);
                    $scope.showAlert("Tracker", "error", "Timer failed to start ");
                });
            }
        }

    };


    $scope.checkTimerOnLogin = function () {
        ticketService.getMyTimer().then(function (response) {
            if (response && response.ticket) {
                ticketService.getTicket(response.ticket).then(function (ticketResponse) {

                    if (ticketResponse && ticketResponse.data && ticketResponse.data.IsSuccess) {
                        var ticket = ticketResponse.data.Result;
                        var timeNow = moment.utc();
                        if (response.last_event === "pause" || response.last_event === "start") {

                            var currentTime = Math.ceil(response.time / 1000);
                            if (response.last_event === "pause") {
                                if (currentTime) {
                                    var pauseTime = timeNow.subtract(currentTime, 'seconds');
                                    $scope.ttimer.startTime = parseInt(pauseTime.format('x'));
                                }
                            } else {
                                var lastTimeStamp = moment.utc(response.last_event_date);
                                var timeDiff = timeNow.diff(lastTimeStamp, 'seconds');
                                if (currentTime) {
                                    timeDiff = timeDiff + currentTime;
                                }
                                if (timeDiff > 0) {
                                    var startTime = timeNow.subtract(timeDiff, 'seconds');
                                    $scope.ttimer.startTime = parseInt(startTime.format('x'));
                                } else {
                                    $scope.ttimer.startTime = parseInt(timeNow.format('x'));
                                }
                            }


                            $scope.status.active = true;
                            $scope.ttimer.active = true;
                            $scope.timerModeActive = true;
                            $scope.ttimer.ticket = ticket;
                            $scope.ttimer.ticketId = response.ticket;
                            $scope.ttimer.ticketRef = ticket.reference;
                            $scope.ttimer.trackerId = response._id;

                            timerUIFun.timerActiveMode();

                            document.getElementById('clock-timer').getElementsByTagName('timer')[0].start();
                            $scope.timerTick = true;

                            if (response.last_event === "pause") {
                                $timeout(function () {
                                    $scope.ttimer.pause = true;
                                    timerUIFun.activeTimerHide();
                                    $scope.ttimer.pausedTime = moment.utc();
                                    timerUIFun.timerPauseMode();
                                    document.getElementById('clock-timer').getElementsByTagName('timer')[0].stop();
                                }, 1000);
                            }
                        }
                    }

                }, function (error) {
                    authService.IsCheckResponse(error);
                    console.log(error);
                    $scope.showAlert("Tracker", "error", "Timer failed to load ticket details");
                });
            } else {
                $('#timerWidget').addClass('display-none').removeClass('display-block');
                timerUIFun.timerDisableMode();
                $scope.timerModeActive = false;
            }
        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.showAlert("Tracker", "error", "Timer failed to start");
        });
    };
    $scope.checkTimerOnLogin();
    $scope.showTimerWidget = false;

    $scope.showTimer = function () {
        $scope.showTimerWidget = !$scope.showTimerWidget;
    };
//end time tracker function


//----------------------SearchBar-----------------------------------------------------
//Main serch bar option

    $scope.searchText = "";
    $scope.commonSearchQuery = "";
    $scope.searchTabReference = "";
    $scope.states = [{obj: {}, type: "searchKey", value: "#ticket:search:"}, {
        obj: {},
        type: "searchKey",
        value: "#ticket:channel:"
    }, {obj: {}, type: "searchKey", value: "#ticket:groupId:"}, {
        obj: {},
        type: "searchKey",
        value: "#ticket:tid:"
    }, {obj: {}, type: "searchKey", value: "#ticket:priority:"},
        {obj: {}, type: "searchKey", value: "#ticket:reference:"}, {
            obj: {},
            type: "searchKey",
            value: "#ticket:requester:"
        }, {obj: {}, type: "searchKey", value: "#ticket:status:"}, {
            obj: {},
            type: "searchKey",
            value: "#profile:search:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#profile:email:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#profile:firstname:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#profile:lastname:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#profile:phone:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#profile:ssn:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#thirdparty:search:"
        }];

//$scope.searchResult = [];

    $scope.bindSearchData = function (item) {
        if ($scope.searchExternalUsers && $scope.searchExternalUsers.tabReference && item && item.obj && item.type === "profile") {
            console.log("search from engagement");
            var tabItem = {};
            $scope.tabs.filter(function (item) {
                if (item.tabReference == $scope.searchExternalUsers.tabReference) {
                    tabItem = item;
                }
            });

            if (tabItem) {
                tabItem.notificationData.userProfile = item.obj;
                $scope.searchExternalUsers.updateProfileTab(item.obj);
            }

            $scope.searchExternalUsers = {};
            $scope.searchText = "";
        }
        else if (item && item.obj && item.type === "ticket") {
            item.obj.tabType = 'ticketView';
            item.obj.index = item.obj.reference;
            $rootScope.$emit('openNewTab', item.obj);

            $scope.searchText = "";
        } else if (item && item.obj && item.type === "profile") {
            item.obj.tabType = 'userProfile';
            item.obj.index = item.obj._id;
            //$rootScope.$emit('openNewTab', item.obj);
            openNewUserProfileTab(item.obj, item.obj.index, undefined, undefined);

            $scope.searchText = "";
        }
    };

    $scope.createNewProfile = function () {
        openNewUserProfileTab(undefined, 'createNewProfile', undefined, undefined);
    };

    $scope.searchExternalUsers = {};

    function getDefaultState($query) {
        return $q(function (resolve) {
            if ($query) {
                var resultList = [];
                for (var i = 0; i < $scope.states.length; i++) {
                    var state = $scope.states[i];
                    if (state.value.startsWith($query)) {
                        resultList.push(state);
                    }
                }
                resolve(resultList);
            } else {
                resolve($scope.states);
            }
        });
    }

    $scope.callIntegrationService = function (query) {

        var searchResult = [];

        var postData = {
            "PROFILE_SEARCH_DATA": {
                "SearchFiled": "FIRSTNME",
                "SearchValue": "CHRISTINE"
            }
        };
        return integrationAPIService.GetIntegrationDetails("PROFILE_SEARCH_DATA", postData).then(function (response) {

            angular.forEach(response, function (item) {
                if (item && item.firstname) {
                    searchResult.push({
                        obj: item,
                        type: "profile",
                        value: item.firstname + " " + item.lastname
                    });
                }
            });
            $scope.states = searchResult;
            return searchResult;

        }, function (err) {
            $scope.showAlert("Profile Search", "error", "Fail To Get Profile Details.");
            return searchResult;
        });

        /* if ($scope.callIntegrationSearchService) {
         var searchResult = [];
         if (query.startsWith("#thirdparty:search:")) {
         var queryText= query.replace("#thirdparty:search:", "");

         var postData = {
         "PROFILE_SEARCH_DATA": {
         "SearchFiled": "FIRSTNME",
         "SearchValue": queryText
         }
         };
         return integrationAPIService.GetIntegrationDetails("PROFILE_SEARCH_DATA", postData).then(function (response) {

         angular.forEach(response, function (item) {
         if (item && item.firstname) {
         searchResult.push({
         obj: item,
         type: "profile",
         value: item.firstname + " " + item.lastname
         });
         }
         });
         return searchResult;

         }, function (err) {
         $scope.showAlert("Profile Search", "error", "Fail To Get Profile Details.");
         return searchResult;
         });
         }
         else {
         return searchResult;
         }


         }*/
        /* case "#thirdparty:search":
         var searchResult = [];
         var postData = {
         "PROFILE_SEARCH_DATA": {
         "SearchFiled": "FIRSTNME",
         "SearchValue": queryText
         }
         };
         return integrationAPIService.GetIntegrationDetails("PROFILE_SEARCH_DATA", postData).then(function (response) {

         angular.forEach(response, function (item) {
         if (item&&item.firstname) {
         searchResult.push({
         obj: item,
         type: "profile",
         value: item.firstname + " " + item.lastname
         });
         }
         });
         return searchResult;

         }, function (err) {
         $scope.showAlert("Profile Search", "error", "Fail To Get Profile Details.");
         return searchResult;
         });

         break;*/
    };


    $scope.commonSearch = function ($query) {
        $scope.commonSearchQuery = $query;
        return getDefaultState($query).then(function (state) {
            if ($query) {
                var searchItems = $query.split(":");
                if (searchItems && searchItems.length > 2) {
                    var queryText = searchItems.pop();
                    var queryPath = searchItems.join(":");
                    if (queryText) {
                        switch (queryPath) {
                            case "#thirdparty:search":
                                var searchResult = [];
                                if (queryText.indexOf("#") !== -1) {
                                    var postData = {
                                        "PROFILE_SEARCH_DATA": {
                                            "SearchFiled": "FIRSTNME",
                                            "SearchValue": queryText.replace("#", "")
                                        }
                                    };
                                    return integrationAPIService.GetIntegrationDetails("PROFILE_SEARCH_DATA", postData).then(function (response) {

                                        angular.forEach(response, function (item) {
                                            if (item && item.firstname) {
                                                searchResult.push({
                                                    obj: item,
                                                    type: "profile",
                                                    value: item.firstname + " " + item.lastname
                                                });
                                            }
                                        });
                                        return searchResult;

                                    }, function (err) {
                                        $scope.showAlert("Profile Search", "error", "Fail To Get Profile Details.");
                                        return searchResult;
                                    });
                                } else {
                                    searchResult.push({
                                        obj: null,
                                        type: "profile",
                                        value: "Type # To Search"
                                    });
                                    return searchResult;
                                }

                                break;
                            case "#ticket:tid":
                                var queryFiledTid = searchItems.pop();
                                return ticketService.searchTicketByField(queryFiledTid, queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:reference":
                                var queryFiled = searchItems.pop();
                                return ticketService.searchTicketByField(queryFiled, queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:search":
                                return ticketService.searchTicket(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:channel":
                                return ticketService.searchTicketByChannel(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:groupId":
                                return ticketService.searchTicketByGroupId(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:priority":
                                return ticketService.searchTicketByPriority(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:requester":
                                return ticketService.searchTicketByRequester(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#ticket:status":
                                return ticketService.searchTicketByStatus(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;

                            case "#profile:search":
                                return userService.searchExternalUsers(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });

                                break;
                            //case "#eng:profile:search":
                            //    return userService.searchExternalUsers(queryText).then(function (response) {
                            //        if (response.IsSuccess) {
                            //            var searchResult = [];
                            //            for (var i = 0; i < response.Result.length; i++) {
                            //                var result = response.Result[i];
                            //                searchResult.push({
                            //                    obj: result,
                            //                    type: "profile",
                            //                    value: result.firstname + " " + result.lastname
                            //                });
                            //            }
                            //            return searchResult;
                            //        }
                            //    });
                            //    break;
                            case "#profile:firstname":
                                return userService.getExternalUserProfileByField("firstname", queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#profile:lastname":
                                return userService.getExternalUserProfileByField("lastname", queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#profile:phone":
                                return userService.GetExternalUserProfileByContact("phone", queryText).then(function (response) {
                                    if (response) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.length; i++) {
                                            var result = response[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#profile:email":
                                return userService.GetExternalUserProfileByContact("email", queryText).then(function (response) {
                                    if (response) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.length; i++) {
                                            var result = response[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            case "#profile:ssn":
                                return userService.getExternalUserProfileBySsn(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "profile",
                                                value: result.firstname + " " + result.lastname
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                            default :
                                return ticketService.searchTicketByStatus(queryText).then(function (response) {
                                    if (response.IsSuccess) {
                                        var searchResult = [];
                                        for (var i = 0; i < response.Result.length; i++) {
                                            var result = response.Result[i];
                                            searchResult.push({
                                                obj: result,
                                                type: "ticket",
                                                value: result.tid + ":" + result.subject
                                            });
                                        }
                                        return searchResult;
                                    }
                                });
                                break;
                        }
                    } else {
                        return state;
                    }
                } else {
                    return state;
                }
            } else {
                if (!document.getElementById("commonSearch").value) {
                    $scope.searchExternalUsers = {};
                }
                return state;
            }
        });

    };

    $scope.clearSearchResult = function () {
        $scope.searchResult = [];
    };

//----------------------------------------------------------------------------------------


    var getUnreadMailCounters = function (profileId) {

        try {
            mailInboxService.getMessageCounters(profileId)
                .then(function (data) {
                        if (data.IsSuccess) {
                            if (data.Result && data.Result.UNREAD) {
                                $scope.unreadMailCount = data.Result.UNREAD;
                            }
                        }
                        else {
                            var errMsg = data.CustomMessage;

                            if (data.Exception) {
                                errMsg = data.Exception.Message;
                            }
                            console.log(errMsg);
                        }


                    },
                    function (err) {
                        authService.IsCheckResponse(err);
                        console.log(err);

                    })

        }
        catch (ex) {
            console.log(ex);

        }

    };

//update code get my rating =>> dashboard
    $scope.isRatingStatue = false;
    var pickMyRatings = function (owner) {
        userProfileApiAccess.getMyRatings(owner).then(function (resPapers) {
            if (resPapers.Result) {
                $scope.sectionArray = {};
                $scope.myRemarks = [];
                angular.forEach(resPapers.Result, function (submissions) {
                    if (submissions.answers) {
                        angular.forEach(submissions.answers, function (answer) {


                            if (answer.section && answer.question && answer.question.weight > 0 && answer.question.type != 'remark') {
                                $scope.isRatingStatue = true;
                                if ($scope.sectionArray[answer.section._id]) {
                                    var ansValue = $scope.sectionArray[answer.section._id].value;
                                    var val = (answer.points * answer.question.weight) / 10;

                                    $scope.sectionArray[answer.section._id].value = ansValue + val;
                                    $scope.sectionArray[answer.section._id].itemCount += 1;
                                }
                                else {

                                    $scope.sectionArray[answer.section._id] =
                                        {
                                            value: (answer.points * answer.question.weight) / 10,
                                            itemCount: 1,
                                            name: answer.section.name,
                                            id: answer.section._id
                                        };

                                }
                            }

                            if (answer.section && answer.question && answer.question.type == 'remark') {
                                var remarkObj =
                                    {
                                        evaluator: submissions.evaluator.name,
                                        section: answer.section.name,
                                        remark: answer.remarks,
                                        avatar: submissions.evaluator.avatar
                                    };
                                $scope.myRemarks.push(remarkObj);
                            }

                        });
                    }

                });

            }
            else {
                console.log("Error");
            }

        }).catch(function (errPapers) {

            console.log(errPapers);

        })

    };
    $scope.titles = [];

    $scope.RatingResultResolve = function (item) {
        var rateObj =
            {
                starValue: Math.round(item.value / item.itemCount),
                displayValue: (item.value / item.itemCount).toFixed(2)
            };

        return rateObj;
    };

    $scope.SetTitiles = function (value) {
        $scope.titles = [];
        for (var i = 1; i <= 10; i++) {
            $scope.titles.push(value);
        }

    };


    $scope.getMyProfile = function () {


        userService.getMyProfileDetails().then(function (response) {

            if (response.data.IsSuccess) {
                profileDataParser.myProfile = response.data.Result;
                $scope.loginAvatar = profileDataParser.myProfile.avatar;
                $scope.firstName = profileDataParser.myProfile.firstname == null ? $scope.loginName : profileDataParser.myProfile.firstname;
                $scope.lastName = profileDataParser.myProfile.lastname;
                $scope.outboundAllowed = profileDataParser.myProfile.allowoutbound;
                getUnreadMailCounters(profileDataParser.myProfile._id);
                ///get use resource id
                //update code damith
                //get my rating
                pickMyRatings(profileDataParser.myProfile._id);


            }
            else {
                profileDataParser.myProfile = {};
            }
        }, function (error) {
            authService.IsCheckResponse(error);
            profileDataParser.myProfile = {};
        });
    };
    $scope.getMyProfile();
    $scope.getMyTicketMetaData = function () {

        ticketService.GetMyTicketConfig(function (success, data) {

            if (success) {
                profileDataParser.myTicketMetaData = data.Result;
            }
        });

    };
    $scope.getMyTicketMetaData();

    $scope.loginName = authService.GetResourceIss();


//Time base create message
    var myDate = new Date();
    /* hour is before noon */
    if (myDate.getHours() < 12) {
        $scope.timeBaseMsg = "Good Morning";
    }
    else  /* Hour is from noon to 5pm (actually to 5:59 pm) */
    if (myDate.getHours() >= 12 && myDate.getHours() <= 17) {
        $scope.timeBaseMsg = "Good Afternoon";
    }
    else  /* the hour is after 5pm, so it is between 6pm and midnight */
    if (myDate.getHours() > 17 && myDate.getHours() <= 24) {
        $scope.timeBaseMsg = "Good Evening";
    }
    else  /* the hour is not between 0 and 24, so something is wrong */
    {
        document.write("I'm not sure what time it is!");
        $scope.timeBaseMsg = "-";
    }

//logOut
    $scope.isLogingOut = false;
    $scope.logOut = function () {

        $scope.isLogingOut = true;
        $scope.veeryPhone.unregisterWithArds(function (done) {
            loginService.Logoff(function () {

                $timeout.cancel(getAllRealTimeTimer);

                SE.disconnect();
                $state.go('login');

            });
        });
        //loginService.Logoff(function () {
        //    $state.go('login');
        //    $timeout.cancel(getAllRealTimeTimer);
        //});


    };


    $scope.reserveTicketTab = function (key, obj) {

        reservedTicket.key = key;//phone number
        reservedTicket.session_obj = obj;

    };


//-------------------------------OnlineAgent/ Notification-----------------------------------------------------

    $scope.naviSelectedUser = {};
    $scope.notificationMsg = {};
    var getAllRealTimeTimer = {}


    $scope.setExtention = function (selectedUser) {

        try {
            var extention = selectedUser.veeryaccount.display;
            if (extention) {
                $scope.call.number = extention;
            }
            else {
                $scope.showAlert('Error', 'error', "Fail To Find Extention.");
            }
        }
        catch (ex) {
            $scope.showAlert('Error', 'error', "Fail To Read Agent Data.");
        }
    };
    /*$scope.setExtention = function (selectedUser) {

     try {
     var concurrencyInfos = $filter('filter')(selectedUser.ConcurrencyInfo, {HandlingType: 'CALL'});
     if (angular.isArray(concurrencyInfos)) {
     var RefInfo = JSON.parse(concurrencyInfos[0].RefInfo);
     $scope.call.number = RefInfo.Extention;
     }
     else {
     $scope.showAlert('Error', 'error', "Fail To Find Extention.");
     }
     }
     catch (ex) {
     $scope.showAlert('Error', 'error', "Fail To Read Agent Data.");
     }
     };*/
    $scope.closeMessage = function () {
        divModel.model('#sendMessage', 'display-none');
    };

    /* Set the width of the side navigation to 250px */
    $scope.getViewportHeight = function () {
        $scope.windowHeight = jsUpdateSize() - 85 + "px";
        document.getElementById('notificationWrapper').style.height = $scope.windowHeight;
    };
//Detect Document Height
//update code damith
    window.onload = function () {
        $scope.windowHeight = jsUpdateSize() - 85 + "px";
        $scope.windowHeightLeftMenu = jsUpdateSize() - 200 + "px";
        document.getElementById('notificationWrapper').style.height = $scope.windowHeight;
        document.getElementById('windowHeightLeftMenu').style.height = $scope.windowHeight;
    };

    window.onresize = function () {
        $scope.windowHeight = jsUpdateSize() - 85 + "px";
        $scope.windowHeightLeftMenu = jsUpdateSize() - 200 + "px";
        document.getElementById('notificationWrapper').style.height = $scope.windowHeight;
        document.getElementById('windowHeightLeftMenu').style.height = $scope.windowHeight;
    };
    $scope.isUserListOpen = false;
    $scope.navOpen = false;
    $scope.openNav = function () {

        if ($scope.isUserListOpen) {
            $scope.navOpen = false;
            $scope.closeNav();
            chatService.SetChatPosition(false);
        }
        else {
            $scope.getViewportHeight();
            //getAllRealTimeTimer = $timeout(getAllRealTime, 1000);
            document.getElementById("mySidenav").style.width = "230px";
            document.getElementById("main").style.marginRight = "215px";
            chatService.Request('allstatus');
            $scope.onlineClientUser = chatService.GetClientUsers();
            chatService.SetChatPosition(true);


        }


        $scope.isUserListOpen = !$scope.isUserListOpen;


        // document.getElementById("navBar").style.marginRight = "300px";
    };


    /* Set the width of the side navigation to 0 */
    $scope.closeNav = function () {

        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginRight = "0";
        //  document.getElementById("navBar").style.marginRight = "0";
    };

    $scope.showNotificationView = function (currentUsr, userType) {
        $scope.naviSelectedUser = {};
        $scope.naviSelectedUser = currentUsr;
        $scope.naviSelectedUser.listType = userType;
        $('#uNotifiWrp').animate({bottom: '34'}, 400, function () {
            //hedaer animation
            $('#uNotiH').toggle("slide", {direction: "left"});
        });
        if (userType == "Group") {
            $scope.naviSelectedUser.avatar = "assets/img/avatar/profileAvatar.png";
        }
    };
    $scope.closeNotificationView = function () {
        $('#uNotifiWrp').animate({bottom: '-400'}, 300);
    };

    $scope.isSendingNotifi = false;
    $scope.sendNotification = function () {
        if ($scope.naviSelectedUser) {
            $scope.notificationMsg.From = $scope.loginName;
            $scope.notificationMsg.Direction = "STATELESS";
            $scope.isSendingNotifi = true;
            $scope.notificationMsg.isPersist = true;

            if ($scope.naviSelectedUser.listType === "Group") {

                userService.getGroupMembers($scope.naviSelectedUser._id).then(function (response) {
                    if (response.IsSuccess) {
                        if (response.Result) {
                            var clients = [];
                            for (var i = 0; i < response.Result.length; i++) {
                                var gUser = response.Result[i];
                                //if (gUser && gUser.username && gUser.username != $scope.loginName) {
                                clients.push(gUser.username);
                                //}
                            }
                            $scope.notificationMsg.clients = clients;

                            notificationService.broadcastNotification($scope.notificationMsg).then(function (response) {
                                $scope.notificationMsg = {};
                                console.log("send notification success :: " + JSON.stringify(clients));
                            }, function (err) {
                                var errMsg = "Send Notification Failed";
                                if (err.statusText) {
                                    errMsg = err.statusText;
                                }
                                $scope.showAlert('Error', 'error', errMsg);
                            });
                        } else {
                            $scope.showAlert('Error', 'error', "Send Notification Failed");
                        }
                    }
                    else {
                        console.log("Error in loading Group member list");
                        $scope.showAlert('Error', 'error', "Send Notification Failed");
                    }
                    $scope.isSendingNotifi = false;
                }, function (err) {
                    console.log("Error in loading Group member list ", err);
                    $scope.showAlert('Error', 'error', "Send Notification Failed");
                });
            } else {
                $scope.notificationMsg.To = $scope.naviSelectedUser.username;

                notificationService.sendNotification($scope.notificationMsg, "message", "").then(function (response) {
                    console.log("send notification success :: " + $scope.notificationMsg.To);
                    $scope.notificationMsg = {};
                }, function (err) {
                    authService.IsCheckResponse(err);
                    var errMsg = "Send Notification Failed";
                    if (err.statusText) {
                        errMsg = err.statusText;
                    }
                    $scope.showAlert('Error', 'error', errMsg);
                });
            }
            $scope.isSendingNotifi = false;

        } else {
            $scope.showAlert('Error', 'error', "Send Notification Failed");
        }
    };

    var FilterByID = function (array, field, value) {
        if (array) {
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i].hasOwnProperty(field)) {
                    if (array[i][field] == value) {
                        return array[i];
                    }
                }
            }
            return null;
        } else {
            return null;
        }
    };

    $scope.loadOnlineAgents = function () {
        resourceService.getOnlineAgentList().then(function (response) {
            if (response.IsSuccess) {
                var onlineAgentList = [];
                var offlineAgentList = [];
                $scope.agentList = [];
                var onlineAgents = response.Result;

                if ($scope.users) {
                    for (var i = 0; i < $scope.users.length; i++) {
                        var user = $scope.users[i];
                        user.listType = "User";
                        if (user.resourceid) {
                            if (user.resourceid != authService.GetResourceId()) {
                                var resource = FilterByID(onlineAgents, "ResourceId", user.resourceid);
                                if (resource) {
                                    user.status = resource.Status.State;
                                    user.ConcurrencyInfo = resource.ConcurrencyInfo;
                                    if (user.status === "NotAvailable") {
                                        offlineAgentList.push(user);
                                    } else {
                                        onlineAgentList.push(user);
                                    }
                                } else {
                                    user.status = "NotAvailable";
                                    offlineAgentList.push(user);
                                }
                            }

                        } else {
                            user.status = "NotAvailable";
                            offlineAgentList.push(user);
                        }


                    }

                    onlineAgentList.sort(function (a, b) {
                        if (a && a.name && b && b.name && a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if (a && a.name && b && b.name && a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                    });
                    offlineAgentList.sort(function (a, b) {
                        if (a && a.name && b && b.name && a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if (a && a.name && b && b.name && a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                    });

                    $scope.agentList = onlineAgentList.concat(offlineAgentList);
                }

                if ($scope.userGroups) {
                    var userGroupList = [];

                    for (var j = 0; j < $scope.userGroups.length; j++) {
                        var userGroup = $scope.userGroups[j];

                        userGroup.status = "Available";
                        userGroup.listType = "Group";
                        userGroupList.push(userGroup);
                    }

                    userGroupList.sort(function (a, b) {
                        if (a && a.name && b && b.name && a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if (a && a.name && b && b.name && a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                    });

                    // $scope.agentList = userGroupList.concat($scope.agentList)
                    $scope.userGroups = userGroupList;
                }
            }
            else {
                var errMsg = response.CustomMessage;

                if (response.Exception) {
                    errMsg = response.Exception.Message;
                }
                $scope.showAlert('Error', 'error', errMsg);
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            var errMsg = "Error occurred while loading online agents";
            if (err.statusText) {
                errMsg = err.statusText;
            }
            $scope.showAlert('Error', 'error', errMsg);
        });
    };

//$scope.loadOnlineAgents();

    var getAllRealTime = function () {
        loadOnlineAgents();
        getAllRealTimeTimer = $timeout(getAllRealTime, 1000);
    };


    $scope.$on("$destroy", function () {
        if (getAllRealTimeTimer) {
            $timeout.cancel(getAllRealTimeTimer);
        }
        $scope.veeryPhone.unregisterWithArds(function () {

        });
    });

    /* update code damith
     lock screen
     ARDS break option */
    var changeLockScreenView = function () {
        return {
            show: function () {
                $('#loginScreeen').removeClass('display-none').addClass('display-block');
                $('body').addClass('overflow-hidden');
                document.getElementById("lockPwd").value = "";
                $scope.lockPwd = "";
            },
            hide: function () {
                $('#loginScreeen').addClass('display-none').removeClass('display-block');
                $('body').removeClass('overflow-hidden');
                $scope.lockPwd = '';

            }
        }
    }();

    //changeLockScreenView.show();
    $scope.currentBerekOption = null;
    var breakList = ['#Available'];


//--------------------------Dynamic Break Type-------------------------------------------------

    $scope.dynamicBreakTypes = [];
    $scope.agentInBreak = false;
    $scope.getDynamicBreakTypes = function () {

        resourceService.GetActiveDynamicBreakTypes().then(function (data) {
            if (data && data.IsSuccess) {
                data.Result.forEach(function (bObj) {
                    breakList.push('#' + bObj.BreakType)
                });
                $scope.dynamicBreakTypes = data.Result;

            } else {
                $scope.showAlert("Dynamic Break Types", "error", "Fail To load dynamic break types");
            }
        }, function (error) {
            authService.IsCheckResponse(error);
            $scope.showAlert("Dynamic Break Types", "error", "Fail To load dynamic break types");
        });
    };
    $scope.getDynamicBreakTypes();


    $scope.breakOption = {
        changeBreakOption: function (requestOption) {


            resourceService.BreakRequest(authService.GetResourceId(), requestOption).then(function (res) {
                if (res) {

                    $scope.currentBreak = requestOption;
                    $('#loginScreeen').removeClass('display-none').addClass('display-block');
                    $('body').addClass('overflow-hidden');
                    dataParser.userProfile = $scope.profile;
                    breakList.forEach(function (option) {
                        $(option).removeClass('font-color-green bold');
                    });

                    $scope.breakTimeStart = moment.utc();
                    document.getElementById('lockTime').getElementsByTagName('timer')[0].resume();


                    $('#userStatus').addClass('offline').removeClass('online');
                    $scope.showAlert(requestOption, "success", 'update resource state success');
                    $('#' + requestOption).addClass('font-color-green bold');
                    $scope.currentBerekOption = requestOption;
                    $scope.agentInBreak = true;
                    chatService.Status('offline', 'chat');
                } else {
                    $scope.showAlert(requestOption, "warn", 'break request failed');
                }
            }, function (error) {
                authService.IsCheckResponse(error);
                $scope.showAlert("Break Request", "error", "Fail To Register With " + requestOption);
            });
        },
        endBreakOption: function (requestOption) {
            dataParser.userProfile = $scope.profile;
            breakList.forEach(function (option) {
                $(option).removeClass('font-color-green bold');
            });
            resourceService.EndBreakRequest(authService.GetResourceId(), 'EndBreak').then(function (data) {
                if (data) {
                    $scope.showAlert("Available", "success", "Update resource state success.");
                    $('#userStatus').addClass('online').removeClass('offline');
                    $('#Available').addClass('font-color-green bold');
                    $scope.currentBerekOption = requestOption;
                    // getCurrentState.breakState();
                    changeLockScreenView.hide();
                    $scope.isUnlock = false;
                    $scope.agentInBreak = false;
                    chatService.Status('online', 'chat');
                    return;
                }
            });
        }
    };//end


    $scope.currentModeOption = null;
    var modeList = ['#Inbound', '#Outbound'];
    $scope.modeOption = {
        outboundOption: function (requestOption) {
            console.log(requestOption);

            resourceService.BreakRequest(authService.GetResourceId(), requestOption).then(function (res) {
                if (res) {
                    dataParser.userProfile = $scope.profile;
                    modeList.forEach(function (option) {
                        $(option).removeClass('active-font');
                    });


                    $('#userStatus').addClass('offline').removeClass('online');
                    $scope.showAlert(requestOption, "success", 'update resource state success');
                    $('#' + requestOption).addClass('active-font').removeClass('top-drop-text');
                    $scope.currentModeOption = requestOption;
                    $('#agentPhone').removeClass('display-none');
                } else {
                    $scope.showAlert(requestOption, "warn", 'mode change request failed');
                }
            }, function (error) {
                authService.IsCheckResponse(error);
                $scope.showAlert("Break Request", "error", "Fail To Register With " + requestOption);
            });
        },
        inboundOption: function (requestOption) {

            resourceService.EndBreakRequest(authService.GetResourceId(), requestOption).then(function (data) {
                if (data) {
                    dataParser.userProfile = $scope.profile;
                    modeList.forEach(function (option) {
                        $(option).removeClass('active-font').addClass('top-drop-text');
                    });


                    $scope.showAlert("Available", "success", "Update resource state success.");
                    $('#userStatus').addClass('online').removeClass('offline');
                    $('#Inbound').addClass('active-font').removeClass('top-drop-text');
                    ;
                    $scope.currentModeOption = requestOption;
                    // getCurrentState.breakState();
                    //changeLockScreenView.hide();
                    //$scope.isUnlock = false;
                    //return;
                    $('#agentPhone').removeClass('display-none');
                }
            });
        }
    };//end

//change agent Register status
    $scope.changeRegisterStatus = {
        changeStatus: function (type) {
            dataParser.userProfile = $scope.profile;
            //is check current reg resource task
            for (var i = 0; i < $scope.resourceTaskObj.length; i++) {
                if ($scope.resourceTaskObj[i].RegTask == type) {
                    //remove resource sharing

                    if (type.toLowerCase() === 'call' && $scope.inCall === true) {
                        $scope.showAlert("Change Register", "warn", "Cannot remove task while you are in a call!");
                    } else {
                        getCurrentState.removeSharing(type, i);
                    }
                    return;
                }
            }


            //get veery format
            resourceService.GetContactVeeryFormat().then(function (res) {
                if (res.IsSuccess) {
                    resourceService.ChangeRegisterStatus(authService.GetResourceId(), type, res.Result).then(function (data) {
                        getCurrentState.getCurrentRegisterTask();
                        getCurrentState.breakState();
                        $scope.showAlert("Change Register", "success", "Register resource info success.");
                        $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');

                    })
                } else {
                    console.log(data);
                }
            }, function (error) {
                authService.IsCheckResponse(error);
                $scope.showAlert("Change Register", "error", "Fail To Register..!");
            });
            //
        }
    };//end

    $scope.resourceTaskObj = [];
    $scope.breakTimeStart = 0;
    var getCurrentState = (function () {
        return {
            breakState: function () {
                resourceService.GetResourceState(authService.GetResourceId()).then(function (data) {
                    if (data && data.IsSuccess) {
                        if (data.Result && data.Result.Reason) {
                            $scope.currentBreak = data.Result.Reason;
                        }

                        if (data.Result.State == "Available") {
                            $scope.currentBerekOption = "Available";
                            $('#userStatus').addClass('online').removeClass('offline');
                            $('#Available').addClass('font-color-green bold');
                            changeLockScreenView.hide();
                        } else {
                            $('#userStatus').addClass('offline').removeClass('online');
                            var timeDiff = 0,
                                timeNow,
                                breakTime,
                                startTime;

                            if (data.Result.Reason && data.Result.StateChangeTime && data.Result.Reason.toLowerCase().indexOf('break') > -1) {
                                timeNow = moment.utc();
                                breakTime = moment.utc(data.Result.StateChangeTime);
                                timeDiff = timeNow.diff(breakTime, 'seconds');
                                startTime = timeNow.subtract(timeDiff, 'seconds');

                                var cssValue = '#' + data.Result.Reason;
                                $(cssValue).addClass('font-color-green bold');
                                $scope.currentBerekOption = data.Result.Reason;
                                //StateChangeTime
                                //StateChangeTime
                                if (timeDiff > 0) {
                                    $scope.breakTimeStart = parseInt(startTime.format('x'));
                                } else {
                                    $scope.breakTimeStart = moment.utc();
                                }
                                document.getElementById('lockTime').getElementsByTagName('timer')[0].resume();
                                changeLockScreenView.show();
                                $scope.agentInBreak = true;
                            }
                        }


                        if (data.Result.Mode === "Outbound") {
                            $('#userStatus').addClass('offline').removeClass('online');
                            $('#Outbound').addClass('active-font');
                            $('#agentPhone').removeClass('display-none');
                            $scope.currentModeOption = "Outbound";
                            return;
                        } else if (data.Result.Mode === "Inbound") {
                            $('#userStatus').addClass('online').removeClass('offline');
                            $('#Inbound').addClass('active-font');
                            $('#agentPhone').removeClass('display-none');
                            $scope.currentModeOption = "Inbound";
                            return;
                        } else {
                            $('#userStatus').addClass('offline').removeClass('online');
                            //$('#Inbound').addClass('font-color-green bold');
                            $scope.currentModeOption = "Offline";
                            return;
                        }
                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent State", "error", "Fail To load get current state..");
                });
            },
            getResourceState: function () {
                resourceService.GetResource(authService.GetResourceId()).then(function (data) {
                    if (data && data.IsSuccess) {
                        if (data.Result && !data.Result.obj) {
                            resourceService.RegisterWithArds(authService.GetResourceId()).then(function (data) {
                                console.log('registerdWithArds' + data);
                            }, function (error) {
                                console.log('Error- registerdWithArds');
                            });
                        }
                    }

                    console.log(data);
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent State", "error", "Fail To load get current state..");
                });
            },
            getResourceTasks: function () {
                resourceService.GetResourceTasks(authService.GetResourceId()).then(function (data) {
                    //all task are offline mode
                    $('#regStatusNone').removeClass('reg-status-done').addClass('task-none');
                    if (data && data.IsSuccess) {
                        data.Result.forEach(function (value, key) {
                            // $scope.resourceTaskObj = [];
                            if (data.Result[key].ResTask) {
                                if (data.Result[key].ResTask.ResTaskInfo) {
                                    if (data.Result[key].ResTask.ResTaskInfo.TaskName) {
                                        $scope.resourceTaskObj.push({
                                            'task': data.Result[key].ResTask.ResTaskInfo.TaskName,
                                            'RegTask': null
                                        });
                                        /*profileDataParser.myResourceID = data.Result[key].ResourceId;
                                         if (data.Result[key].ResTask && data.Result[key].ResTask.ResTaskInfo && data.Result[key].ResTask.ResTaskInfo.TaskType == "CALL") {
                                         profileDataParser.myCallTaskID = data.Result[key].ResTask.TaskId;
                                         }*/
                                    }
                                }
                            }
                        });
                        getCurrentState.getCurrentRegisterTask();
                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent Task", "error", "Fail To load get resource task list.");
                });
            },
            getCurrentRegisterTask: function () {
                resourceService.GetCurrentRegisterTask(authService.GetResourceId()).then(function (data) {
                    if (data && data.IsSuccess) {
                        if (data.Result) {
                            if (data.Result.obj) {
                                if (data.Result.obj.LoginTasks) {
                                    for (var i = 0; i < $scope.resourceTaskObj.length; i++) {
                                        data.Result.obj.LoginTasks.forEach(function (value, key) {
                                            if ($scope.resourceTaskObj[i].task == data.Result.obj.LoginTasks[key]) {
                                                $scope.resourceTaskObj[i].RegTask = data.Result.obj.LoginTasks[key];
                                                $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');
                                            }
                                        })

                                    }
                                }
                            }
                        }
                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent Task", "error", "Fail To load get register task.");
                });
            },
            removeSharing: function (type, index) {
                resourceService.RemoveSharing(authService.GetResourceId(), type).then(function (data) {
                    if (data && data.IsSuccess) {
                        $scope.resourceTaskObj[index].RegTask = null;
                        // getCurrentState.getCurrentRegisterTask();
                        $('#regStatusNone').removeClass('reg-status-done').addClass('task-none ');
                        $scope.resourceTaskObj.forEach(function (value, i) {
                            if ($scope.resourceTaskObj[i].RegTask != null) {
                                $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');
                            }
                        });

                        getCurrentState.breakState();

                        $scope.showAlert("Agent Task", "success", "Delete resource info success.");
                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent Task", "error", "Fail To remove sharing resource.");
                });
            }
        }
    })();

    getCurrentState.breakState();
    getCurrentState.getResourceState();
    getCurrentState.getResourceTasks();


    $scope.clickRefTask = function () {
        $scope.resourceTaskObj = [];
        getCurrentState.getResourceTasks();
        // getCurrentState.getCurrentRegisterTask();
    };


// Phone Call Timers
    $scope.counter = 0;
    var callDurationTimeout = {};
    $scope.duations = '';


    $scope.stopCallTime = function () {
        try {
            document.getElementById('calltimmer').getElementsByTagName('timer')[0].stop();
        }
        catch (ex) {

        }

    };
    $scope.startCallTime = function () {
        try {
            document.getElementById('calltimmer').getElementsByTagName('timer')[0].start();
        }
        catch (ex) {

        }
    };

    $scope.stopCountdownTimmer = function () {
        try {
            document.getElementById('countdownCalltimmer').getElementsByTagName('timer')[0].stop();
        }
        catch (ex) {

        }

    };
    $scope.startCountdownTimmer = function () {
        try {
            document.getElementById('countdownCalltimmer').getElementsByTagName('timer')[0].start();
        }
        catch (ex) {

        }
    };


    $scope.showMesssageModal = false;

    $scope.showNotificationMessage = function (notifyMessage) {
        $scope.showMesssageModal = true;
        $scope.showModal(notifyMessage);
    };

    $scope.RemoveAllNotifications = function () {


        $scope.showConfirmation("Remove all notifications", "Do you want to remove all Notifications ?", "Ok", function () {
            notificationService.RemoveAllPersistenceMessages().then(function (response) {

                if (response.data.IsSuccess) {
                    $scope.unredNotifications = 0;
                    $scope.notifications = [];
                }
                else {
                    console.log("Error in Removing notifications");
                    $scope.showAlert("Error", "error", "Error in deleting notifications");
                }

                $scope.showMesssageModal = false;

            }, function (error) {
                $scope.showAlert("Error", "error", "Error in deleting notifications");
                console.log("Error in Removing notifications");
            });
        }, function () {

        });


        /* notificationService.RemoveAllPersistenceMessages().then(function (response) {

         if(response.data.IsSuccess)
         {
         $scope.unredNotifications = 0;
         $scope.notifications =[];
         }
         else
         {
         console.log("Error in Removing notifications");
         $scope.showAlert("Error", "error", "Error in deleting notifications");
         }

         $scope.showMesssageModal = false;

         },function (error) {
         $scope.showAlert("Error", "error", "Error in deleting notifications");
         console.log("Error in Removing notifications");
         });*/

        /*$scope.showConfirm("Delete notifications","Delete","ok","cancel","Do you want to delete all notifications",function () {



         },function () {

         },null)*/


    };


    $scope.discardNotifications = function (notifyMessage) {
        if (notifyMessage.isPersistMessage && notifyMessage.PersistMessageID) {
            notificationService.RemovePersistenceMessage(notifyMessage.PersistMessageID).then(function (response) {
                $scope.notifications.splice($scope.notifications.indexOf(notifyMessage), 1);
                $scope.unredNotifications = $scope.notifications.length;
                $scope.showMesssageModal = false;

            }, function (error) {
                $scope.showAlert("Error", "error", "Error in deleting notification");
                $scope.showMesssageModal = false;
            });
        }
        else {
            $scope.notifications.splice($scope.notifications.indexOf(notifyMessage), 1);
            $scope.unredNotifications = $scope.notifications.length;
            $scope.showMesssageModal = false;
        }


    };

    $scope.addToDoList = function (todoMessage) {
        todoMessage.title = todoMessage.header;
        toDoService.addNewToDo(todoMessage).then(function (response) {
            $scope.discardNotifications(todoMessage);
            $scope.showAlert("Added to ToDo", "success", "Notification successfully added as To Do");
            $scope.showMesssageModal = false;
        }, function (error) {
            authService.IsCheckResponse(error);
            $scope.showAlert("Adding failed ", "error", "Notification is failed to add as To Do");
        });
    };

    $scope.showModal = function (MessageObj) {
        $scope.MessageObj = MessageObj;
    };

    $scope.keepNotification = function () {
        //$uibModalInstance.dismiss('cancel');
        $scope.showMesssageModal = false;
    };
    $scope.discardNotification = function (msgObj) {
        $scope.discardNotifications(msgObj);
        $scope.showMesssageModal = false;
        // $uibModalInstance.dismiss('cancel');
    };

    $scope.oepnTicketOnNotification = function (MessageObj) {

        $scope.addTab('Ticket - ' + MessageObj.ticketref, 'Ticket - ' + MessageObj.ticket, 'ticketView', {_id: MessageObj.ticket}, MessageObj.ticket);
        $scope.showMesssageModal = false;
    };
    $scope.openUserProfile = function (userID) {

        $scope.showMesssageModal = false;
        if (userID) {
            userService.getExternalUserProfileByID(userID).then(function (resUser) {

                if (resUser.IsSuccess) {
                    var userObj = resUser.Result;
                    if (userObj) {
                        var DataObj = {
                            channel: "appointment",
                            channel_from: profileDataParser.myProfile.username,
                            channel_to: userObj.firstname,
                            direction: "OUTBOUND"

                        }

                        openNewUserProfileTab(userObj, userID, undefined, DataObj);
                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Cannot open user profile');
                    }
                }
                else {
                    console.log("Error in loading external user ");

                }

            }, function (errUser) {
                console.log("Error in loading external user ", errUser);

            });


        }
        else {
            $scope.showAlert('Error', 'error', 'Cannot open user profile');
        }
    };


    $scope.addToTodo = function (MessageData) {
        $scope.addToDoList(MessageData);
        $scope.showMesssageModal = false;
        //$uibModalInstance.dismiss('cancel');
    };


    $scope.myNoteNotiMe = function () {
        var timeoutNotiMe = function () {
            $timeout(function () {
                $scope.myNoteNotiMe.hideMe();
            }, 200000);
        };
        return {
            showMe: function () {
                $('#myNoteShow').animate({
                    top: "100"
                });
                timeoutNotiMe();
            },
            hideMe: function () {
                $('#myNoteShow').animate({
                    top: "-120"
                })
            }
        }
    }();


//#------ Update code Damith
// Break screen functions
    $scope.lockPwd = null;
    $scope.isUnlock = false;
    $scope.breakScreen = function () {
        var param = {
            userName: $scope.loginName,
            password: ''
        };
        return {
            unlock: function () {
                var pwd = document.getElementById("lockPwd").value;
                if (!pwd) {
                    $scope.showAlert('Error', 'error', 'Invalid authentication..');
                    $('#lockPwd').addClass('shake');
                    $('#lockPwd').addClass('shake');
                    return;
                }
                param.password = pwd;
                $scope.isUnlock = true;

                $('#btnUnlock').addClass('display-none');
                $('#btnUnlockLoading').removeClass('display-none');
                loginService.VerifyPwd(param, function (res) {
                    $('#btnUnlock').removeClass('display-none');
                    $('#btnUnlockLoading').addClass('display-none');
                    if (res) {
                        $scope.lockPwd = "";
                        document.getElementById("lockPwd").value = "";
                        $scope.breakOption.endBreakOption('Available');
                        $scope.profile.break_exceeded = false;

                    } else {
                        $scope.lockPwd = "";
                        $scope.showAlert('Error', 'error', 'Invalid authentication..');
                        $('#lockPwd').addClass('shake');
                        $('#lockPwd').addClass('shake');
                        changeLockScreenView.show();
                    }
                    $scope.isUnlock = false;
                    return;
                });
            }
        }
    }();

//text key event fire
    $scope.enterUnlockMe = function () {
        alert('event fire');
    };
    var buildFormSchema = function (schema, form, fields) {
        fields.forEach(function (fieldItem) {
            if (fieldItem.field) {
                var isActive = true;
                if (fieldItem.active === false) {
                    isActive = false;
                }
                if (fieldItem.type === 'text') {
                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };
                    form.push({
                        "key": fieldItem.field,
                        "type": "text"
                    })
                }
                else if (fieldItem.type === 'textarea') {

                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "textarea"
                    })
                }
                else if (fieldItem.type === 'url') {

                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "text"
                    })
                }
                else if (fieldItem.type === 'header') {
                    var h2Tag = '<h2>' + fieldItem.title + '</h2>';
                    form.push({
                        "type": "help",
                        "helpvalue": h2Tag
                    });
                }
                else if (fieldItem.type === 'radio') {
                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    var formObj = {
                        "key": fieldItem.field,
                        "type": "radios-inline",
                        "titleMap": []
                    };


                    if (fieldItem.values && fieldItem.values.length > 0) {

                        schema.properties[fieldItem.field].enum = [];

                        fieldItem.values.forEach(function (enumVal) {
                            schema.properties[fieldItem.field].enum.push(enumVal.name);
                            formObj.titleMap.push(
                                {
                                    "value": enumVal.name,
                                    "name": enumVal.name
                                }
                            )
                        })

                    }

                    form.push(formObj);
                }
                else if (fieldItem.type === 'date') {

                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive,
                        format: 'date'

                    };

                    form.push({
                        "key": fieldItem.field,
                        "minDate": "1900-01-01"
                    })
                }
                else if (fieldItem.type === 'number') {

                    schema.properties[fieldItem.field] = {
                        type: 'number',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "number"
                    })
                }
                else if (fieldItem.type === 'phone') {

                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        pattern: "^[0-9*#+]+$",
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "text"
                    })
                }
                else if (fieldItem.type === 'boolean' || fieldItem.type === 'checkbox') {

                    schema.properties[fieldItem.field] = {
                        type: 'boolean',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "checkbox"
                    })
                }
                else if (fieldItem.type === 'checkboxes') {

                    schema.properties[fieldItem.field] = {
                        type: 'array',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive,
                        items: {
                            type: "string",
                            enum: []
                        }
                    };

                    if (fieldItem.values && fieldItem.values.length > 0) {

                        fieldItem.values.forEach(function (enumVal) {
                            schema.properties[fieldItem.field].items.enum.push(enumVal.name);
                        })

                    }

                    form.push(fieldItem.field);
                }
                else if (fieldItem.type === 'email') {

                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        description: fieldItem.description,
                        pattern: "^\\S+@\\S+$",
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    form.push({
                        "key": fieldItem.field,
                        "type": "text"
                    })
                }
                else if (fieldItem.type === 'select') {
                    schema.properties[fieldItem.field] = {
                        type: 'string',
                        title: fieldItem.title,
                        required: fieldItem.require ? true : false,
                        readonly: !isActive

                    };

                    var formObj = {
                        "key": fieldItem.field,
                        "type": "select",
                        "titleMap": []
                    };

                    if (fieldItem.values && fieldItem.values.length > 0) {

                        schema.properties[fieldItem.field].enum = [];

                        fieldItem.values.forEach(function (enumVal) {
                            schema.properties[fieldItem.field].enum.push(enumVal.name);
                            formObj.titleMap.push(
                                {
                                    "value": enumVal.name,
                                    "name": enumVal.name
                                });
                        })

                    }
                    form.push(formObj);
                }
            }
        });

        return schema;
    };

    $scope.schemaResponse = {};
    $scope.createTicketDynamicFrm = function () {
        var schema = {
            type: "object",
            properties: {}
        };

        var form = [];


        ticketService.getFormsForCompany().then(function (response) {
            if (response && response.Result && response.Result.ticket_form) {
                //compare two forms
                buildFormSchema(schema, form, response.Result.ticket_form.fields);
                var currentForm = response.Result.ticket_form;

                /*form.push({
                 type: "submit",
                 title: "Save"
                 });*/

                $scope.schemaResponse = {
                    schema: schema,
                    form: form,
                    model: {},
                    currentForm: currentForm
                };
            }
        }).catch(function (err) {
            $scope.showAlert('Ticket', 'error', 'Fail To Get Ticket Dynamic form Data');
        });
    };
    $scope.createTicketDynamicFrm();

    $scope.ivrlist = [];
    var ivrlist = function () {
        resourceService.IvrList().then(function (reply) {
            $scope.ivrlist = reply;
        }, function (error) {
            $scope.showAlert("Soft Phone", "error", "Fail to Get IVR List");
        });
    };
    ivrlist();

    $scope.setIvrExtension = function (ivr) {
        $scope.call.number = ivr.Extension;
        phoneFuncion.hideIvrBtn();
        phoneFuncion.hideIvrList();
        $scope.veeryPhone.ivrTransferCall(ivr.Extension);
    };

//open setting page
    $scope.openSettingPage = function () {
        agentSettingFact.changeSettingPageStatus(true);
    };


    /*--------------- chat services ------------------->
     /* update code by damith */
    var s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };


    $scope.getChatRandomId = function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    chatService.connectToChatServer();
    chatService.SubscribeStatus(function (status) {
        if (status) {
            Object.keys(status).forEach(function (key, index) {
                var userObj = $scope.users.filter(function (item) {
                    return key == item.username;
                });
                if (Array.isArray(userObj)) {
                    userObj.forEach(function (obj, index) {
                        obj.status = status[key];

                        obj.statusTime = Date.now();
                    });
                }

            });

            $scope.users.sort(function (a, b) {

                var i = 0;
                var j = 0;


                if (a.status == 'offline') {

                    i = 1;
                } else {

                    i = 2;
                }

                if (b.status == 'offline') {

                    j = 1;
                } else {

                    j = 2;
                }


                return j - i;

            });
        }
    });


    chatService.SubscribeCallStatus(function (status) {
        if (status) {
            Object.keys(status).forEach(function (key, index) {
                var userObj = $scope.users.filter(function (item) {
                    return key == item.username;
                });
                if (Array.isArray(userObj)) {
                    userObj.forEach(function (obj, index) {

                        obj.callstatus = status[key];
                        obj.callstatusstyle = 'call-status-' + obj.callstatus;
                        obj.callstatusTime = Date.now();
                    });
                }

            });
        }
    });


//show OnExistingclient
    chatService.SubscribeChatAll(function (message) {
        var userObj;
        if (message.who && message.who == 'client') {
            userObj = $scope.onlineClientUser.filter(function (item) {
                return message.from == item.username;
            });
        }
        else {
            userObj = $scope.users.filter(function (item) {
                return message.from == item.username;
            });
        }
        $scope.showChromeNotification("You Received Message From " + message.from, 15000, $scope.focusOnTab);
        if (Array.isArray(userObj)) {
            userObj.forEach(function (obj, index) {
                if (obj.chatcount) {
                    obj.chatcount += 1;
                }
                else {
                    obj.chatcount = 1;

                    /*if ($scope.usercounts) {

                     $scope.usercounts += 1;
                     } else {

                     $scope.usercounts = 1;
                     }*/
                    if (message.who != 'client') {

                        $scope.showTabChatPanel(obj);
                        if (obj) {
                            var audio = new Audio('assets/sounds/chattone.mp3');
                            audio.play();
                        }
                    }


                }

            });
        }
    });

    chatService.SubscribePending(function (pendingArr) {
        if (pendingArr && Array.isArray(pendingArr)) {

            pendingArr.forEach(function (item) {

                var userx = item._id;
                var userObj = $scope.users.filter(function (user) {
                    return userx == user.username;
                });


                if (Array.isArray(userObj)) {
                    userObj.forEach(function (obj, index) {

                        obj.chatcount = item.messages;

                        if (obj.chatcount) {

                            $scope.usercounts++;
                        }

                    });
                }

            });
        }

    });

//get online users
    var onlineUser = chatService.onUserStatus();

    $scope.showTabChatPanel = function (chatUser) {

        chatService.SetChatUser(chatUser);


        if (chatUser.chatcount) {

            $scope.usercounts -= 1;
            if ($scope.usercounts < 0)
                $scope.usercounts = 0;
        }
    };

    $rootScope.$on("updates", function () {
        $scope.safeApply(function () {
            $scope.selectedChatUser = chatService.GetCurrentChatUser();
            $scope.onlineClientUser = chatService.GetClientUsers();
        });
    });

    $scope.chatUserTypeFilter = function (user) {
        return user.type === 'client'
    };


//update new incoming notification

    $scope.toggleDownIncomingPanel = function () {
        $('#callNIncomingAlert').animate({
            bottom: '-130'
        }, 500);
        $('#toggleDown').addClass('display-none');
        $('#toggleUp').removeClass('display-none');
        $('#callerTimeSmall').removeClass('display-none');
    };

    $scope.toggleUpIncomingPanel = function () {
        $('#callNIncomingAlert').animate({
            bottom: '0'
        }, 500);
        $('#toggleDown').removeClass('display-none');
        $('#toggleUp').addClass('display-none');
        $('#callerTimeSmall').addClass('display-none');
    };


    $scope.openTransferView = function () {
        $('#transferCallViewPoint').animate({
            bottom: '0'
        }, 500, function () {
            //$('#transferForm').addClass('fadeIn');
        });
    };
    $scope.closeTransferView = function () {
        $('#transferCallViewPoint').animate({
            bottom: '-500'
        }, 200, function () {
            //$('#transferForm').removeClass('fadeIn');
        });
    };

    $scope.cPanleToggelLeft = function () {
        $('#callNIncomingAlert').animate({
            right: '-500'
        }, 400, function () {
            $('#cPanelToggleLeft').removeClass('display-none');
        });
    };
    $scope.cPanleToggelRight = function () {
        $('#callNIncomingAlert').animate({
            right: '0'
        }, 400, function () {
            //alert('done');
            $('#cPanelToggleLeft').addClass('display-none');
        });
    };


//new profile functions
    $scope.labels = ["New", "closed", "solved", "new"];
    $scope.data = [300, 500, 100, 30];
    $scope.ticketPieChartOpt = {
        type: 'doughnut',
        responsive: false,
        legend: {
            display: true,
            position: 'bottom',
            padding: 5,
            labels: {
                fontColor: 'rgb(72, 84, 101)',
                fontSize: 11,
                boxWidth: 10
            }
        },
        title: {
            display: true
        }
    };

    $scope.integrationDataList = [];
    $scope.callIntegrationSearchService = false;
    $scope.loadConfig = function () {
        integrationAPIService.GetIntegrationAPIDetails().then(function (response) {
            if (response) {
                $scope.integrationDataList = response;
                var data = $filter('filter')(response, {referenceType: 'PROFILE_SEARCH_DATA'});
                $scope.callIntegrationSearchService = (data && data.length);

            } else {
                $scope.showAlert("Integrations", "error", "Fail To Load Integration Configurations.");
            }
        }, function (error) {
            $scope.showAlert("Integrations", "error", "Fail To Load Integration Configurations.");
        });

    };
    $scope.loadConfig();


    // status node


    $scope.categorizeStatusNodes = function (nodes) {

        angular.forEach(nodes, function (node) {

            if (!node.category) {
                node.category = "NEW"
            }


            if (profileDataParser.statusNodes[node.category]) {
                if (profileDataParser.statusNodes[node.category].indexOf(node.name) == -1) {
                    profileDataParser.statusNodes[node.category].push(node.name);
                }
            }
            else {
                profileDataParser.statusNodes[node.category] = [];
                profileDataParser.statusNodes[node.category].push(node.name);
            }


        });

    };

    $scope.getStatusNodes = function () {
        ticketService.getStatusNodes().then(function (resStatus) {
            if (resStatus) {
                $scope.categorizeStatusNodes(resStatus);
            }
            else {

            }
        }, function (errStatus) {

        });
    };

    $scope.getStatusNodes();

    window.onbeforeunload = function(){
        //save info somewhere
        return 'are you sure you want to leave?';
    };

    $scope.exceedAllowedIdel = false;
    $scope.exceedAllowedIdelTime = function () {
        $scope.logOut();
        var msg = "You Have Been Logged Out Because Your Session Has Expired.[Maximum Allowed Idle Time Exceeded]";
        showNotification(msg, 50000);
        $scope.exceedAllowedIdel = true;
       // alert(msg);
    };


    $(function () {
        $scope.Gaceperiod = consoleConfig.graceperiod * 60;
        var idleTime = consoleConfig.maximumAllowedIdleTime * 60000;
        $(document).idleTimer(idleTime);

        $(document).on("idle.idleTimer", function (event, elem, obj) {
            if ($scope.inCall === false && $state.current.name==="console" && !$scope.agentInBreak) {
                $scope.exceedAllowedIdel = false;
                $ngConfirm({
                    icon: 'fa fa-universal-access',
                    title: 'Idle Time Exceeded!',
                    content: '<div ng-show="exceedAllowedIdel" class="suspend-header-txt"> <h5>Maximum Allowed Idle Time Exceeded.</h5> <span style="color:red;"> You Have Been Logged Out Because Your Session Has Expired.</span></div> <div ng-hide="exceedAllowedIdel" class="suspend-header-txt"> <h5>Maximum Allowed Idle Time Exceeded.</h5> <span> <b><i><span style="color:red;">Attention! </span></i></b>  You will be automatically logged out in </span> </br> <timer countdown="Gaceperiod" interval="1000" finish-callback="exceedAllowedIdelTime()">{{mminutes}} minute{{minutesS}}, {{sseconds}} second{{secondsS}}. </timer> </div>',
                    scope: $scope,
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        tryAgain: {
                            text: 'Ok',
                            btnClass: 'btn-red',
                            action: function () {

                            }
                        }
                    },
                    columnClass: 'col-md-6 col-md-offset-3',
                    /*boxWidth: '50%',*/
                    useBootstrap: true
                });


                showNotification("Maximum Allowed Idle Time Exceeded. You Will be Automatically Logged out in "+consoleConfig.graceperiod +" Minutes.", 15000);

            }
        });
    });


}).directive("mainScroll", function ($window) {
    return function (scope, element, attrs) {
        scope.isFiexedTab = false;
        angular.element($window).bind("scroll", function () {
            if (this.pageYOffset >= 20) {
                scope.isFiexedTab = true;
            } else {
                scope.isFiexedTab = false;
            }
            scope.$apply();
        });
    };
}).directive('enterUnlockScreen', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.enterUnlockScreen);
                });
                event.target.value = "";
                event.preventDefault();
            }
        });
    };
});

agentApp.controller("notificationModalController", function ($scope, $uibModalInstance, MessageObj, DiscardNotifications, AddToDoList) {


    $scope.showMesssageModal = true;
    $scope.MessageObj = MessageObj;
    console.log(MessageObj);


});
