agentApp.controller('consoleCtrl', function ($window, $filter, $rootScope, $scope, $http,
                                             $base64, $timeout, $q, $crypto, jwtHelper,
                                             resourceService, baseUrls, authService,
                                             userService, tagService, ticketService, mailInboxService, $interval,
                                             profileDataParser, identity_service, $state, uuid4,
                                             filterFilter, engagementService, phoneSetting, toDoService, turnServers,
                                             Pubnub, $uibModal, agentSettingFact, chatService, contactService, userProfileApiAccess, $anchorScroll, notificationService, $ngConfirm,
                                             templateService, userImageList, integrationAPIService, hotkeys, tabConfig, consoleConfig, Idle, localStorageService, WebAudio, shared_data, shared_function, package_service, internal_user_service) {

    $('[data-toggle="tooltip"]').tooltip();
    $scope.companyName = profileDataParser.companyName;
    this.title = "Agent Console";
    package_service.BusinessUnits = [];
    shared_data.allow_mode_change = true;
    package_service.GetBusinessUnits().then(function (businessUnits) {
        package_service.BusinessUnits = businessUnits;

    }).catch(function (err) {
        console.log(err);
    });

    // -------------------- ringtone config -------------------------------------
    /* var options = {
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
     }*/

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
// check Agent Console is focus or not.
    $scope.focusOnTab = true;
    angular.element($window).bind('focus', function () {
        $scope.focusOnTab = true;
        console.log('Console Focus......................');
    }).bind('blur', function () {
        $scope.focusOnTab = false;
        console.log('Console Lost Focus......................');
    });

    $scope.currentcallnum = null;
    $scope.currentcalltype = null;


    // call $anchorScroll()
    $anchorScroll();

    $scope.accessNavigation;
    var loadNavigations = function () {
        userService.getNavigationAccess().then(function (response) {
            $scope.accessNavigation = response;
        }, function (error) {
            console.error(error);
        });
    };

    loadNavigations();

    $scope.onExit = function (event) {
        chatService.Status('offline', 'chat');
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


    $scope.isReadyToSpeak = false;
    $scope.sayIt = function (text) {
        if (!$scope.isReadyToSpeak) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
    };

    $scope.stopIt = function () {
        window.speechSynthesis.cancel();
    };

    $rootScope.$on("stop_speak", function (event, data) {
        window.speechSynthesis.cancel();
    });

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
    //var ringtone = document.getElementById("ringtone");


    $scope.notifications = [];
    $scope.agentList = [];
    $scope.isFreezeReq = false;
    $scope.isEnableCallNotificationDrag = false;
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

    var getSingleFileUploadLimit = function () {

        userService.getSingleFileUploadLimit().then(function (resLimit) {

            if (resLimit && resLimit.data && resLimit.data.Result) {
                profileDataParser.uploadLimit = parseInt(resLimit.data.Result);
            } else {
                $scope.showAlert("Info", "info", "No single file upload limit found");
            }
        }, function (error) {
            $scope.showAlert("Error", "error", "Error in searching Single file upload limit");
        });
    };

    getSingleFileUploadLimit();

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


    $scope.status = {
        isopen: false
    };

    $scope.countdownVal = 5;
    $scope.GetAcwTime = function () {
        resourceService.GetAcwTime().then(function (response) {
            $scope.countdownVal = (parseInt(JSON.parse(response).MaxAfterWorkTime) - phoneSetting.AcwCountdown) <= 0 ? 1 : (parseInt(JSON.parse(response).MaxAfterWorkTime) - phoneSetting.AcwCountdown);
            shared_data.acw_time = $scope.countdownVal;
        }, function (err) {
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
        $scope.callLog = [];
        $scope.GetCallLogs($scope.contactSearchDate);
    };

    var i = 1;
    $scope.sessionData = {};
    $scope.callLog = [];
    $scope.callLogEmpty = false;
    $scope.callLogSessionId = uuid4.generate();
    $scope.addToCallLog = function (number, callType) {
        try {
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
        } catch (ex) {
            console.error(ex);
        }
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
        switch (type) {
            case "log":
            case "ticket":
                $scope.call.number = caller.number;
                break;
            case "phoneBook":
                $scope.call.number = caller.contact;
                break;
        }
        /*if (type == "log") {
            //caller.number
            $scope.call.number = caller.number;
        } else {
            //caller.number
            $scope.call.number = caller.contact;
        }*/
        send_command_to_veeryPhone('make_call', {callNumber: $scope.call.number, type: type});
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
            $('#maxdial').addClass('display-none');

            // Kasun_Wijeratne_28_MAY_2018
            if (!$('#call_notification_panel').hasClass('display-none')) {
                $("#call_notification_panel").css({'bottom': '62px'});
                if ($('#call_notification_panel').hasClass('call_notification_panel_min')) {
                    $("#call_notification_panel").css('bottom', '72px');
                }
            }
            // Kasun_Wijeratne_28_MAY_2018
        },
        Register: function () {
            try {
                var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());
                var res = $filter('filter')(decodeData.scope, {resource: "SoftPhone"}, true);
                if (res.length > 0 && res[0].resource === "SoftPhone" && res[0].actions.length > 0) {
                    $('#isCallOnline').addClass('display-none deactive-menu-icon').removeClass('display-block');
                    $('#isLoadingRegPhone').addClass('display-block').removeClass('display-none');
                    $('#phoneRegister').addClass('display-none');
                    $('#isBtnReg').addClass('display-none ').removeClass('display-block active-menu-icon');
                    $('#phoneRegister').addClass('display-none');

                    getPhoneConfig();

                    /*return;
                    $scope.veeryPhone.Register('DuoS123');*/
                    getALlPhoneContact();
                }
                else {
                    console.log("feature is disabled----------------------");
                    $scope.showAlert("Phone", "error", "feature is disabled");
                }
            } catch (ex) {
                console.error(ex);
            }

        },
        openTicketViews: function () {
            divModel.model('#ticketFilterWrap', 'display-block');
        }

    };
    /*--------------------------Veery Phone---------------------------------------*/
    /*var element = document.getElementById('answerButton');
    if (element) {
        element.onclick = function () {
            $scope.veeryPhone.makeAudioCall($scope.call.number);
        };
    }
    $scope.ShowIncomingNotification = function (status, no) {
        /!*try {
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
                console.info("........................... Show Incoming call Notification Panel ...........................");
            } else {
                if (element) {
                    element.onclick = function () {
                        $scope.veeryPhone.makeAudioCall($scope.call.number);
                    };
                }
                $('#incomingNotification').addClass('display-none fadeIn').removeClass('display-block  zoomOut');
                stopRingTone();
                stopRingbackTone();
            }
        } catch (ex) {
            $scope.showAlert('Phone', 'error', "Fail To Bind Phone Data.");
            console.error(ex);
        }*!/
        if (status) {
            $scope.currentcallnum = no;
            var pattern = new RegExp("^(\\(?\\+?[0-9]*\\)?)?[0-9_\\- \\(\\)]$");
            var startWithPattern = new RegExp("^(Extension)[^\\s]*");
            if (pattern.test(no) || startWithPattern.test(no)) {
                //customer
                $scope.currentcalltype = 'CUSTOMER';
            }
            else {
                $scope.currentcalltype = 'OTHER';
            }
        }
        else {
            /!*$scope.currentcallnum = null;
            $scope.currentcalltype = null;*!/
        }
    };*/

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
        console.log("ShowHidePhone....Method End..." + value);
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
        {title: 'Recent', content: 'log'},
        {title: 'IVR', content: 'ivr'}
    ];


    $scope.mapPhoneStatus = function () {
        if ($scope.agentPhoneStatusData) {
            $scope.call.sessionId = $scope.agentPhoneStatusData.HandlingRequest;
            //$scope.veeryPhone.uiCallTerminated("inti");
            //phoneFuncion.freezeBtn();

            $scope.agentPhoneStatusData = undefined;
        }
    };


    $scope.FreezeAcw = function (callSessionId, endFreeze) {
        resourceService.FreezeAcw(callSessionId, endFreeze).then(function (response) {

        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert('Phone', 'error', "Fail Freeze Operation.");
            return false;
        });
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

    var send_command_to_veeryPhone = function (command, data) {
        $rootScope.$emit("execute_command", {
            message: '',
            data: data,
            command: command
        });
    };

    $scope.isShowLog = false;
    $scope.isWaiting = false;
    $scope.freezeRequest = false;
    $scope.ShowfreezeClose = false;
    $scope.showNofifyDialpad = false;
    shared_data.phone_strategy = phoneSetting.phone_communication_strategy;

    var getPhoneConfig = function () {
        var registerPhone = function () {
            $rootScope.$emit("execute_command", {
                message: 'Phone Initializing-' + shared_data.phone_strategy,
                data: shared_data.phone_strategy,
                command: "initialize_phone"
            });
        };
        package_service.getPhoneConfig().then(function (response) {
            shared_data.phone_config = response;
            shared_data.phone_strategy = response.phoneType ? response.phoneType : phoneSetting.phone_communication_strategy;   //veery_rest_phone veery_sip_phone
            registerPhone();
        }, function (error) {
            console.log(error);
            $scope.showAlert("Phone", "error", "Fail To Get Phone Config. Try To Register With Default Settings");
            $('#phoneRegister').removeClass('display-none');
            shared_data.phone_strategy = phoneSetting.phone_communication_strategy;
            registerPhone();
        });
    };
    //getPhoneConfig();


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


    /*$scope.agent_suspended = function (data) {
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
            /!*boxWidth: '50%',*!/
            useBootstrap: true
        });
        $('#userStatus').addClass('agent-suspend').removeClass('online');
    };*/

    $scope.agentFound = function (data) {

        console.log("agentFound");

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

        var needToShowNewTab = false;
        /*if (shared_data.phone_strategy != "veery_web_rtc_phone" || shared_data.callDetails.number === "" || shared_data.callDetails.number === undefined || shared_data.callDetails.number === "Outbound Call" || values[3].startsWith(shared_data.callDetails.number)) {*/
        if (shared_data.callDetails.number === "" || shared_data.callDetails.number === undefined || shared_data.callDetails.number === "Outbound Call" || values[3].startsWith(shared_data.callDetails.number)) {
            needToShowNewTab = true;
        }
        else {
            var tempNumber = "";
            if (values.length === 12 && values[11] === 'TRANSFER') {
                tempNumber = values[3];
            }
            else if (values.length === 12 && values[11] === 'AGENT_AGENT') {
                tempNumber = values[5];
            } else if (values.length === 11 && values[7] === "outbound") {
                tempNumber = shared_data.callDetails.number;
            }
            needToShowNewTab = tempNumber.startsWith(shared_data.callDetails.number);
            if (!needToShowNewTab) {
                if (shared_data.callDetails.number.length <= values[3].length) {
                    //tempNumber = shared_data.callDetails.number.substr(1);
                    tempNumber = shared_data.callDetails.number.slice(-7);
                    needToShowNewTab = values[3].includes(tempNumber)
                } else {
                    tempNumber = values[3].slice(-7);
                    needToShowNewTab = shared_data.callDetails.number.includes(tempNumber)
                }

            }

            console.log(needToShowNewTab);
        }
        if (needToShowNewTab) {
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
            $scope.call.transferName = null;
            $scope.call.skill = notifyData.skill;
            $scope.call.displayNumber = notifyData.channelFrom;
            $scope.call.displayName = notifyData.displayName;
            $scope.call.number = notifyData.displayName;
            $scope.call.Company = notifyData.company;

            $scope.call.sessionId = notifyData.sessionId;
            $scope.call.direction = notifyData.direction;
            $scope.call.callrefid = (values.length >= 10) ? values[10] : undefined;
            $scope.call.callre_uniq_id = (values.length >= 10) ? values[10] : undefined;

            $scope.addTab('Engagement - ' + values[3], 'Engagement', 'engagement', notifyData, index);
            collectSessions(index);


            /*if (notifyData.direction.toLowerCase() === 'inbound' || notifyData.direction.toLowerCase() === 'outbound') {
                $scope.phoneNotificationFunctions.showNotfication(true);
            }*/

            if (values.length === 12 && values[11] === 'TRANSFER') {
                $scope.call.transferName = 'Transfer Call From : ' + values[9];
                $scope.call.number = values[3];
                $scope.call.CompanyNo = '';
            }
            else if (values.length === 12 && values[11] === 'AGENT_AGENT') {
                $scope.call.number = values[5];
                $scope.call.CompanyNo = '';
            }

            shared_data.callDetails = $scope.call;
            /*show notifications */
            $rootScope.$emit("execute_command", {
                message: 'incoming_call_notification',
                data: $scope.call,
                command: "incoming_call_notification"
            });


            /*if (notifyData.direction.toLowerCase() === 'inbound' && shared_data.phone_strategy === "veery_rest_phone") {
                $rootScope.$emit("incoming_call_notification",$scope.call);
            }*/
        }
        else {
            console.error("Agent Found Event Fire in Invalid State.");
        }
    };

    /*$scope.agentFound = function (data) {
        console.log("agentFound");
        /!* var values = data.Message.split("|");
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
         };*!/
        var values = data.Message.split("|");
        var isCustomerNotification = true;
        if (values.length === 12 && (values[11] === 'AGENT_AGENT' || values[11] === 'TRANSFER')) {
            isCustomerNotification = false;
        }
        if ($scope.currentcallnum === null || ($scope.currentcallnum && $scope.currentcalltype === 'CUSTOMER' && isCustomerNotification)) {
            $scope.call.transferName = '';
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
            /!*show notifications *!/
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
        }
    };*/

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
        //"agent_connected|de1334de-35d8-412f-aa65-886f18c11487|60|18705056580|Extension 18705056580|94112375000|ClientSupport|inbound|call|duoarafath|eec46ff0-cbea-4b04-9132-d912e0e8dc55"
        var values = data.Message.split("|");
        if (values.length > 10) {
            $scope.call.callrefid = values[10];
            shared_data.callDetails.callre_uniq_id = values[1];
        }
    };

    $scope.agentRejected = function (data) {
        console.log("agentRejected");

    };

    $scope.agentDisconnected = function (data) {
        console.log("agentDisconnected");
        var values = data.Message.split("|");

        if (values && values.length >= 10 && values[8] === 'call') {
            console.log('Disconnect Reason : ' + values[9]);
        }
    };

    $scope.agentUnauthenticate = function (data) {
        console.log("agentUnauthenticate");
        $scope.isSocketRegistered = false;
        $('#notifConnectivityError').addClass('task-incoming').removeClass('display-none');

        if (!$scope.isLogingOut) {
            $scope.showAlert("Registration failed", "error", "Disconnected from notifications, Please re-register");
        }

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
        $('#notifConnectivityError').removeClass('task-incoming').addClass('display-none');

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

    chatService.SubscribeConnection("console_ctrl", function (isConnected) {

        if (isConnected) {
            $scope.agentAuthenticated();
        } else {
            //$scope.agentDisconnected();
            $scope.agentUnauthenticate();
        }
    });


    chatService.SubscribeEvents("console_ctrl", function (event, data) {
        console.log('Chat Service Subscribe Events : ' + event);
        switch (event) {

            case 'agent_connected':

                $scope.agentConnected(data);

                break;

            case 'agent_disconnected':

                $scope.agentDisconnected(data);

                break;
            /*case 'transfer_ended':
                $scope.transfer_ended(data);
                break;
            case 'transfer_trying':
                $scope.transfer_trying(data);
                break;
*/
            case 'agent_found':
                $scope.agentFound(data);
                break;
            /*case 'agent_suspended':
                $scope.agent_suspended(data);
                break;*/

            case 'agent_rejected':
                $scope.agentRejected(data);
                if (shared_data.last_received_call != shared_data.callDetails.number) {
                    shared_data.callDetails.number = "";
                }
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
            var items = $filter('filter')($scope.users, {resourceid: mObject.ResourceId.toString()}, true);
            mObject.From = (items && items.length) ? items[0].username : mObject.UserName;
        }

        mObject.TopicKey = data.eventName;
        mObject.messageType = mObject.Message;
        mObject.header = mObject.Message;
        mObject.isPersistMessage = mObject.Direction !== "STATELESS";
        mObject.PersistMessageID = mObject.id;
        return mObject;
    };

    chatService.SubscribeDashboard("console_controller_dashboard", function (event) {
        switch (event.roomName) {
            case 'ARDS:freeze_exceeded':
                if (event.Message) {

                    var resourceId = authService.GetResourceId();
                    if ($scope.profile && event.Message.ResourceId === resourceId) {

                        if (event.Message.SessionId) {
                            event.Message.Message = event.Message.Message + " Session : " + event.Message.SessionId;
                        }
                        $scope.OnMessage(convertToNoticifationObject(event));

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


    var vm = this;
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
        else if (tabCount >= tabConfig.warningValue && tabCount <= tabConfig.maxTabLimit) {

            var msg = "You are nearing the maximum allowed threshold[" + tabConfig.maxTabLimit + "] for concurrent tabs opened. Please close unwanted tabs NOW. The system will automatically remove first tab opened once threshold is reached.";
            showWarningAlert(msg);

        }
        else if (tabCount > tabConfig.maxTabLimit) {
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
            $timeout(function () {
                $scope.tabs.push(newTab);
                //$scope.tabSelected(newTab.tabReference);
                if ($scope.tabs.length === 0) {
                    $scope.activeTabIndex = undefined;
                } else {
                    $scope.activeTabIndex = newTab.tabReference;
                }
                //document.getElementById("tab_view").active = $scope.tabs.length - 1;
                //$scope.$broadcast("checkTabs");
            });
            $scope.reCalcScroll();
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


        /* internal_user_service.getUserCount().then(function (row_count) {
             var pagesize = 20;
             var pagecount = Math.ceil(row_count / pagesize);
             var method_list = [];
             for (var i = 1; i <= pagecount; i++) {
                 method_list.push(internal_user_service.LoadUsersByPage(pagesize, i));
             }
             $q.all(method_list).then(function (resolveData) {
                 if (resolveData) {
                     resolveData.map(function (data) {
                         data.map(function (item) {
                             item.status = 'offline';
                             item.callstatus = 'offline';
                             item.callstatusstyle = 'call-status-offline';
                             $scope.users.push(item);
                         });
                     });
                 }
                 /!*if (resolveData) {
                     resolveData.map(function (item) {
                         item.status = 'offline';
                         item.callstatus = 'offline';
                         item.callstatusstyle = 'call-status-offline';
                         $scope.users.push(item);
                     });
                 }*!/
                 userImageList.addInToUserList($scope.users);
                 profileDataParser.assigneeUsers = $scope.users;
                 $scope.userShowDropDown = 0;
                 chatService.Request('pendingall');
                 chatService.Request('allstatus');
                 chatService.Request('allcallstatus');
             }).catch(function (err) {
                 console.error(err);
                 authService.IsCheckResponse(err);
                 $scope.showAlert("Load Users", "error", "Fail To Get User List.")
             });
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
                     console.log(err);
                 });
             }
         }, function (err) {
             authService.IsCheckResponse(err);
             $scope.showAlert("Load Users", "error", "Fail To Get User List.")
         });*/


        internal_user_service.LoadUser().then(function (response) {

            for (var i = 0; i < response.length; i++) {

                response[i].status = 'offline';
                response[i].callstatus = 'offline';
                response[i].callstatusstyle = 'call-status-offline';
                response[i].user_in_chat = 3;
            }

            $scope.users = response;
            userImageList.addInToUserList(response);

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

    $scope.show_contact_list = function () {
        if (shared_data.phone_strategy != 'veery_web_rtc_phone')
            getALlPhoneContact();
        $scope.addTab('Contact List', 'contact_list', 'contact_list', undefined, 'contact_list');
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
                        $scope.addTab('UserProfile ' + profile.firstname, 'Engagement', 'engagement', notifyData, index);
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
        if ($scope.accessNavigation && $scope.accessNavigation.AGENT_AGENT_DASHBOARD) {
            $('#consoleBody').removeClass('disable-scroll');
            $scope.addTab('Dashboard', 'dashboard', 'dashboard', "dashborad", "dashborad");
            $('#consoleBody').removeClass('disable-scroll');
        }
    };

    $scope.loadEngagementSession = function () {
        var resourceId = authService.GetResourceId();
        resourceService.Get_current_data(resourceId).then(function (reply) {
            if (reply && reply.obj && reply.obj.ConcurrencyInfo) {
                reply.obj.ConcurrencyInfo.map(function (item) {
                    if (item.SlotInfo) {

                        item.SlotInfo.map(function (slot) {
                            if (slot && slot.HandlingType && slot.HandlingType === "CALL" && slot.HandlingRequest) {
                                var sessionId = slot.HandlingRequest;
                                engagementService.GetEngagementSessions(sessionId, [sessionId]).then(function (data) {
                                    if (data) {
                                        var reply = data[0];
                                        if (reply) {
                                            var notifyData = {
                                                company: reply.company,
                                                direction: reply.direction,
                                                channelFrom: reply.channel_from,
                                                channelTo: reply.channel_to,
                                                channel: reply.channel,
                                                skill: "----",
                                                sessionId: sessionId,
                                                displayName: reply.channel_from
                                            };

                                            $scope.addTab('Engagement - ' + reply.channel_from, 'Engagement', 'engagement', notifyData, sessionId);
                                        }
                                    }

                                }, function (err) {
                                    console.log(err);
                                    $scope.showAlert("Get Engagement Sessions", "error", "Fail To Get Engagement Sessions Data.");
                                });
                            }
                        })
                    }
                    /*else{
                                            $scope.showAlert("Get Engagement Sessions", "error", "Fail To Get Engagement Sessions Data.");
                                        }*/
                })
            }
            else {
                $scope.showAlert("Get Engagement Sessions", "error", "Fail To Get Engagement Sessions Data.");
            }

        }, function (err) {
            console.log(err);
            $scope.showAlert("Get Engagement Sessions", "error", "Fail To Get Engagement Sessions Data.");
        });


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

    $scope.show_windows_phone_list = function () {
        $('#consoleBody').removeClass('disable-scroll');
        $scope.addTab('Facetone Phones', 'windows_phone_list', 'windows_phone_list', "windows_phone_list", "windows_phone_list");
    };
//ToDo


    //ToDo
    $scope.addNewTicketInboxTemp = function () {
        $('#consoleBody').addClass('disable-scroll');
        $scope.addTab('Ticket-Inbox', 'Ticket-Inbox', 'Ticket-Inbox', "Ticket-Inbox", "Ticket-Inbox");
    };
    $scope.openKnowladgePortal = function () {
        $('#consoleBody').addClass('disable-scroll');
        $scope.addTab('Knowledge-Portal', 'Knowladge-Portal', 'Knowladge-Portal', "Knowladge-Portal", "Knowladge-Portal");
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
    $scope.states = [
        {obj: {}, type: "searchKey", value: "#ticket:search:"},
        {obj: {}, type: "searchKey", value: "#ticket:channel:"},
        {obj: {}, type: "searchKey", value: "#ticket:tid:"},
        {obj: {}, type: "searchKey", value: "#ticket:priority:"},
        {obj: {}, type: "searchKey", value: "#ticket:reference:"}, {
            obj: {},
            type: "searchKey",
            value: "#ticket:status:"
        }, {
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
            value: "#thirdparty:reference:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#thirdparty:phone:"
        }, {
            obj: {},
            type: "searchKey",
            value: "#thirdparty:ssn:"
        }];

//$scope.searchResult = [];

    $scope.bindSearchData = function (item) {
        $('#commonSearch').focus();

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

            // if(item.type != "searchKey"){
            // 	$(".main-search-input .dropdown-menu").addClass('ng-hide');
            // }

            $scope.searchExternalUsers = {};
            $scope.searchText = "";
        }
        else if (item && item.obj && item.type === "ticket") {
            item.obj.tabType = 'ticketView';
            item.obj.index = item.obj.reference;
            $rootScope.$emit('openNewTab', item.obj);

            // if(item.type != "searchKey"){
            // 	$(".main-search-input .dropdown-menu").addClass('ng-hide');
            // }

            $scope.searchText = "";
        } else if (item && item.obj && item.type === "profile") {
            item.obj.tabType = 'userProfile';
            item.obj.index = item.obj._id;
            //$rootScope.$emit('openNewTab', item.obj);
            openNewUserProfileTab(item.obj, item.obj.index, undefined, undefined);

            // if(item.type != "searchKey"){
            // 	$(".main-search-input .dropdown-menu").addClass('ng-hide');
            // }

            $scope.searchText = "";
        }
    };

    $scope.isPanelOpen = false;

    $scope.createNewProfile = function () {
        openNewUserProfileTab(undefined, 'createNewProfile', undefined, undefined);
        //$scope.isPanelOpen=!$scope.isPanelOpen;
        $scope.newPanelVisible = false;
    };

    $scope.createNewInternalTicket = function () {
        $scope.addTab("New Agent Ticket", "AgentTicket", "AgentTicket", "AgentTicket", "AgentTicket");
        $scope.newPanelVisible = false;
    }

    $scope.newPanelVisible = false;
    $scope.toggleNewMainPanle = function () {
        $scope.newPanelVisible = !$scope.newPanelVisible;
    }

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
                            case "#thirdparty:reference":
                            case "#thirdparty:phone":
                            case "#thirdparty:ssn":
                                var searchResult = [];
                                if (queryText.indexOf("#") !== -1) {
                                    var postData = {
                                        /*"PROFILE_SEARCH_DATA": {
                                            "SearchFiled": queryPath.split(":")[1],
                                            "SearchValue": queryText.replace("#", "")
                                        }*/

                                        "PROFILE_SEARCH_DATA": {}

                                    };
                                    postData.PROFILE_SEARCH_DATA[queryPath.split(":")[1]] = queryText.replace("#", "");
                                    if (queryText.replace("#", "") === "" || queryText.replace("#", "") === undefined) return;
                                    return integrationAPIService.GetIntegrationProfileSearch(postData).then(function (response) {

                                        if (response && response.IsSuccess) {
                                            response.Result.map(function (item) {
                                                if (item) {
                                                    searchResult.push({
                                                        obj: item,
                                                        type: "profile",
                                                        value: item.firstname + " " + item.lastname
                                                    });
                                                }

                                            })
                                        } else {
                                            $scope.showAlert("Profile Search", "error", response.Exception.Message);

                                        }
                                        return searchResult;
                                        /*if (response && response.IsSuccess) {
                                            return  response.Result.map(function (item) {
                                                return {
                                                    obj: item,
                                                    type: "profile",
                                                    value: item.firstname + " " + item.lastname
                                                };
                                            })
                                        } else {
                                            $scope.showAlert("Profile Search", "error", response.Exception.Message);
                                            return searchResult;
                                        }*/


                                        /*if(response){
                                          return  response.map(function (item) {
                                                return {
                                                    obj: item,
                                                    type: "profile",
                                                    value: item.firstname + " " + item.lastname
                                                };
                                            })
                                        }
                                        else {
                                            return searchResult;
                                        }*/
                                        /*angular.forEach(response, function (item) {
                                            if (item && item.firstname) {
                                                searchResult.push({
                                                    obj: item,
                                                    type: "profile",
                                                    value: item.firstname + " " + item.lastname
                                                });
                                            }
                                        });
                                        return searchResult;*/

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

    $scope.logged_user_name = "";
    $scope.getMyProfile = function () {
        profileDataParser.companyName = authService.GetCompanyInfo().companyName;
        $scope.companyName = authService.GetCompanyInfo().companyName;

        userService.getMyProfileDetails().then(function (response) {

            if (response.data.IsSuccess) {
                profileDataParser.myProfile = response.data.Result;
                $scope.logged_user_name = response.data.Result ? response.data.Result.username : "";
                $scope.loginAvatar = profileDataParser.myProfile.avatar;
                $scope.firstName = profileDataParser.myProfile.firstname == null ? $scope.loginName : profileDataParser.myProfile.firstname;
                shared_data.firstName = $scope.firstName;
                $scope.lastName = profileDataParser.myProfile.lastname;
                $scope.outboundAllowed = profileDataParser.myProfile.allowoutbound;
                profileDataParser.myBusinessUnit = (profileDataParser.myProfile.group && profileDataParser.myProfile.group.businessUnit) ? profileDataParser.myProfile.group.businessUnit : 'default';

                //temporary disable business wise filtering dashboard counts
                //profileDataParser.myBusinessUnitDashboardFilter = (profileDataParser.myProfile.group && profileDataParser.myProfile.group.businessUnit)? profileDataParser.myProfile.group.businessUnit: '*';
                getUnreadMailCounters(profileDataParser.myProfile._id);
                ///get use resource id
                //update code damith
                //get my rating
                pickMyRatings(profileDataParser.myProfile._id);


            }
            else {
                profileDataParser.myProfile = {};
                profileDataParser.myBusinessUnit = 'default';
                profileDataParser.myBusinessUnitDashboardFilter = '*';
            }


            getCurrentState.breakState();
            getCurrentState.getResourceState();
            getCurrentState.getResourceTasks();

        }, function (error) {
            authService.IsCheckResponse(error);
            profileDataParser.myProfile = {};
        });


    };
    $scope.getMyProfile();
    $scope.getMyTicketMetaData = function () {

        internal_user_service.GetMyTicketConfig(function (success, data) {

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
        //document.write("I'm not sure what time it is!");
        $scope.timeBaseMsg = "-";
    }

//logOut
    $scope.isLogingOut = false;
    $scope.logOut = function () {

        console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 01 ~ 10   ---------------------------");
        $scope.isLogingOut = true;
        /*$scope.veeryPhone.unregisterWithArds(function (done) {
            identity_service.Logoff(function () {
                $timeout.cancel(getAllRealTimeTimer);
                localStorageService.set("facetoneconsole", null);
                SE.disconnect();
                $('.ui-pnotify').fadeOut();
                $('.alert').fadeOut();
                $state.go('login');
            });
        });*/

        $rootScope.$emit("execute_command", {
            message: 'Phone uninitialized-' + shared_data.phone_strategy,
            command: "uninitialize_phone"
        });

        function logout_identity() {
            console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 03 ~ 10   ---------------------------");
            identity_service.Logoff(function () {
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 05 ~ 10   ---------------------------");
                $timeout.cancel(getAllRealTimeTimer);
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 06 ~ 10   ---------------------------");
                localStorageService.set("facetoneconsole", null);
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 07 ~ 10   ---------------------------");
                chatService.DisconnectChat();
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 08 ~ 10   ---------------------------");
                $('.ui-pnotify').fadeOut();
                $('.alert').fadeOut();
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 09 ~ 10   ---------------------------");
                $state.go('login');
                console.log("---------------------------     EXECUTING LOGOUT PROCESS - COMPLETED   ---------------------------");
            }, function (error) {
                $scope.showAlert("Agent Console", "error", "Fail To Execute Logout Process.");
                console.error(error);
            });
        }

        var resid = authService.GetResourceId();
        resourceService.UnregisterWithArds(resid).then(function (response) {
            console.log("---------------------------     EXECUTING LOGOUT PROCESS - STEPS 02 ~ 10   ---------------------------");
            $scope.registerdWithArds = !response;
            logout_identity();
        }, function (error) {
            $scope.showAlert("Agent Console", "error", "Fail To Execute Agent Unregistering Process");
            console.error(error);
        });


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
        if (selectedUser.callstatus === 'busy') {
            $scope.showAlert('Softphone', 'error', "Agent is Busy");
        } else if (selectedUser.callstatus === 'offline') {
            $scope.showAlert('Softphone', 'error', "Agent is Offline");
        }
        else {
            try {
                var extention = selectedUser.veeryaccount.display;
                if (extention) {
                    $scope.call.number = extention;
                    $scope.setAgentExtension(extention);

                }
                else {
                    $scope.showAlert('Error', 'error', "Fail To Find Extention.");
                }
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', "Fail To Read Agent Data.");
            }

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
        $scope.windowHeight = jsUpdateSize() - 103 + "px";
        document.getElementById('notificationWrapper').style.height = $scope.windowHeight;
    };
//Detect Document Height
//update code damith
    window.onload = function () {
        $scope.windowHeight = jsUpdateSize() - 103 + "px";
        $scope.windowHeightLeftMenu = jsUpdateSize() - 200 + "px";
        document.getElementById('notificationWrapper').style.height = $scope.windowHeight;
        document.getElementById('windowHeightLeftMenu').style.height = $scope.windowHeight;
    };

    window.onresize = function () {
        $scope.windowHeight = jsUpdateSize() - 103 + "px";
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

            /** Kasun_Wijeratne_12_MARCH_2018 */
            if ($('.user-p-right-h-052017 .nav-link')) {
                $('.user-p-right-h-052017 .nav-link').css('font-size', '14px');
            }
            /** Kasun_Wijeratne_12_MARCH_2018 - ENDS */

            // Kasun_Wijeratne_28_MAY_2018
            $('#call_notification_panel').css('right', (parseInt($('#call_notification_panel').css('right').split('px')[0]) - 180) + 'px');
            $('#AgentDialerUi').css('right', (parseInt($('#AgentDialerUi').css('right').split('px')[0]) - 180) + 'px');
            // Kasun_Wijeratne_28_MAY_2018
        }
        else {
            $scope.getViewportHeight();
            //getAllRealTimeTimer = $timeout(getAllRealTime, 1000);
            document.getElementById("mySidenav").style.width = "230px";
            document.getElementById("main").style.marginRight = "215px";
            chatService.Request('allstatus');
            $scope.onlineClientUser = chatService.GetClientUsers();
            chatService.SetChatPosition(true);

            /** Kasun_Wijeratne_12_MARCH_2018 */
            if ($('.user-p-right-h-052017 .nav-link')) {
                $('.user-p-right-h-052017 .nav-link').css('font-size', '12px');
            }
            /** Kasun_Wijeratne_12_MARCH_2018 - ENDS */

            // Kasun_Wijeratne_28_MAY_2018
            $('#call_notification_panel').css('right', (parseInt($('#call_notification_panel').css('right').split('px')[0]) + 180) + 'px');
            $('#AgentDialerUi').css('right', (parseInt($('#AgentDialerUi').css('right').split('px')[0]) + 180) + 'px');
            // Kasun_Wijeratne_28_MAY_2018
        }


        $scope.isUserListOpen = !$scope.isUserListOpen;

        /** Kasun_Wijeratne_9_MARCH_2018
         * --------------------------------------------------------------------------------------------------------------------------
         This variable is defined to let Chat panel state (Open/Close) shared among other controllers which depends on Chat panel state
         ----------------------------------------------------------------------------------------------------------------------------*/
        $rootScope.userListStateGLOBAL = !$rootScope.userListStateGLOBAL;
        /**---------------------------------------------------------------------------------------------------------------------------
         Kasun_Wijeratne_9_MARCH_2018 */

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
        $('#uNotifiWrp').animate({bottom: '0', left: '0'}, 400, function () {
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
        localStorageService.set("facetoneconsole", null);
        chatService.Status('offline', 'chat');
        chatService.Status('offline', 'call');
        if (getAllRealTimeTimer) {
            $timeout.cancel(getAllRealTimeTimer);
        }
        $rootScope.$emit("execute_command", {
            message: 'Phone Uninitializing-' + shared_data.phone_strategy,
            command: "uninitialize_phone"
        });
        $scope.tabs = [];
        chatService.UnsubscribeConnection("console_ctrl");
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
                if (res.IsSuccess) {

                    $scope.currentBreak = requestOption;
                    $('#loginScreeen').removeClass('display-none').addClass('display-block');
                    $('body').addClass('overflow-hidden');
                    shared_data.userProfile = $scope.profile;
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
                    chatService.Status('offline', 'call');
                    shared_data.agent_status = "Break";
                    shared_data.allow_mode_change = false;
                } else {
                    $scope.showAlert(requestOption, "warn", 'break request failed');
                }
            }, function (error) {
                authService.IsCheckResponse(error);
                $scope.showAlert("Break Request", "error", "Fail To Register With " + requestOption);
            });
        },
        endBreakOption: function (requestOption) {
            shared_data.userProfile = $scope.profile;
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
                    shared_data.allow_mode_change = false;
                    if (shared_data.phone_initialize) {
                        chatService.Status('available', 'call');
                    }

                    //chatService.Status('online', 'call');
                    $rootScope.$emit("execute_command", {
                        message: 'set_agent_status_available',
                        command: "set_agent_status_available"
                    });
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
                if (res.IsSuccess) {
                    shared_data.currentModeOption = requestOption;
                    $scope.currentModeOption = requestOption;

                    shared_data.userProfile = $scope.profile;
                    modeList.forEach(function (option) {
                        $(option).removeClass('active-font');
                    });
                    $('#userStatus').addClass('offline').removeClass('online');
                    $scope.showAlert(requestOption, "success", 'update resource state success');
                    $('#' + requestOption).addClass('active-font').removeClass('top-drop-text');
                    $('#agentPhone').removeClass('display-none');
                } else {
                    $scope.showAlert(requestOption, "warn", res.Exception ? res.Exception.Message : res.CustomMessage);
                }
            }, function (error) {
                authService.IsCheckResponse(error);
                $scope.showAlert("Break Request", "error", "Fail To Register With " + requestOption);
            });
        },
        inboundOption: function (requestOption) {
            if (shared_data.currentModeOption === "Outbound" && !shared_data.allow_mode_change) {
                $scope.showAlert("Mode Change Request", "error", "You are only allowed to change to Inbound mode while you are in Idle state");
                return;
            }
            resourceService.EndBreakRequest(authService.GetResourceId(), requestOption).then(function (data) {
                if (data.IsSuccess) {
                    shared_data.currentModeOption = requestOption;
                    $scope.currentModeOption = requestOption;
                    shared_data.userProfile = $scope.profile;
                    modeList.forEach(function (option) {
                        $(option).removeClass('active-font').addClass('top-drop-text');
                    });
                    $scope.showAlert("Available", "success", "Update resource state success.");
                    $('#userStatus').addClass('online').removeClass('offline');
                    $('#Inbound').addClass('active-font').removeClass('top-drop-text');

                    // getCurrentState.breakState();
                    //changeLockScreenView.hide();
                    //$scope.isUnlock = false;
                    //return;
                    $('#agentPhone').removeClass('display-none');
                } else {
                    $scope.showAlert(requestOption, "warn", data.Exception ? data.Exception.Message : data.CustomMessage);
                }
            });
        }
    };//end

    $rootScope.$on('current_mode', function (events, args) {
        if (args) {
            $scope.changeRegisterStatus.changeStatus("CALL");
        }
    })


//change agent Register status
    $scope.changeRegisterStatus = {

        availableToRemoveTask: function (type) {
            var checkStatus = false;
            if (type) {
                $scope.resourceTaskObj.forEach(function (val) {
                    if (val.task.toLowerCase() == 'call' && val.RegTask && val.RegTask.toLowerCase() == "call") {
                        checkStatus = true;
                    }
                });


            }
            else {
                return false;
            }

            return checkStatus;

        },
        changeStatus: function (type) {

            if (!shared_data.phone_initialize && checkPhonestOnTasks && type.toLowerCase() == "call" && !this.availableToRemoveTask(type)) {
                shared_function.showWarningAlert("Agent Status", "Please Initialize Soft Phone.");
            }
            else {
                shared_data.userProfile = $scope.profile;
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
                userService.GetContactVeeryFormat().then(function (res) {
                    if (res.IsSuccess) {
                        resourceService.ChangeRegisterStatus(authService.GetResourceId(), type, res.Result, profileDataParser.myBusinessUnit).then(function (data) {
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
            }


            //
        }
    };//end

    $scope.resourceTaskObj = [];
    $scope.breakTimeStart = 0;
    $scope.agentPhoneStatusData = undefined;
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
                            shared_data.currentModeOption = $scope.currentModeOption;
                            return;
                        } else if (data.Result.Mode === "Inbound") {
                            $('#userStatus').addClass('online').removeClass('offline');
                            $('#Inbound').addClass('active-font');
                            $('#agentPhone').removeClass('display-none');
                            $scope.currentModeOption = "Inbound";
                            shared_data.currentModeOption = $scope.currentModeOption;
                            return;
                        } else {
                            $('#userStatus').addClass('offline').removeClass('online');
                            //$('#Inbound').addClass('font-color-green bold');
                            $scope.currentModeOption = "Offline";
                            shared_data.currentModeOption = $scope.currentModeOption;
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
                            resourceService.RegisterWithArds(authService.GetResourceId(), "", profileDataParser.myBusinessUnit).then(function (data) {
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
                $scope.agentPhoneStatusData = undefined;
                resourceService.GetCurrentRegisterTask(authService.GetResourceId()).then(function (data) {
                    if (data && data.IsSuccess) {
                        if (data.Result) {
                            if (data.Result.obj) {
                                if (data.Result.obj.LoginTasks) {
                                    for (var i = 0; i < $scope.resourceTaskObj.length; i++) {
                                        data.Result.obj.LoginTasks.forEach(function (value, key) {
                                            if ($scope.resourceTaskObj[i].task == data.Result.obj.LoginTasks[key]) {

                                                var call_task_concurent_data = $filter('filter')(data.Result.obj.ConcurrencyInfo, {HandlingType: value});
                                                if (call_task_concurent_data && call_task_concurent_data[0]) {
                                                    if (!call_task_concurent_data[0].IsRejectCountExceeded) {
                                                        $scope.resourceTaskObj[i].RegTask = data.Result.obj.LoginTasks[key];
                                                        $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');
                                                    }
                                                }
                                                /*$scope.resourceTaskObj[i].RegTask = data.Result.obj.LoginTasks[key];
                                                $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');*/
                                            }


                                        })

                                    }

                                }
                                angular.forEach(data.Result.obj.LoginTasks, function (task) {
                                    if (task && task.toLowerCase() === "call") {
                                        data.Result.obj.ConcurrencyInfo.filter(function (item) {
                                            if (item && item.HandlingType && item.HandlingType.toLowerCase() === "call") {
                                                if (item.SlotInfo) {
                                                    item.SlotInfo.filter(function (slot) {
                                                        if (slot && slot.HandlingType && slot.HandlingType.toLowerCase() === "call" && slot.State && slot.State.toLowerCase() === "afterwork" && slot.FreezeAfterWorkTime) {
                                                            $scope.agentPhoneStatusData = {
                                                                HandlingRequest: slot.HandlingRequest,
                                                                MaxFreezeTime: slot.MaxFreezeTime,
                                                                FreezeAfterWorkTime: slot.FreezeAfterWorkTime
                                                            };

                                                            if ($scope.isRegistor) {
                                                                $scope.mapPhoneStatus();
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                        shared_data.call_task_registered = true;
                                    }
                                });

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

                        var tempTaskObj = [];
                        angular.copy($scope.resourceTaskObj, tempTaskObj);

                        getCurrentState.breakState();

                        $scope.showAlert("Agent Task", "success", "Delete resource info success.");
                        if (type === "CALL") {
                            $rootScope.$emit("execute_command", {
                                message: 'Phone uninitialized-' + shared_data.phone_strategy,
                                command: "uninitialize_phone"
                            });
                            shared_data.call_task_registered = false;
                        }


                        angular.copy(tempTaskObj, $scope.resourceTaskObj);


                        $('#regStatusNone').removeClass('reg-status-done').addClass('task-none ');
                        $scope.resourceTaskObj.forEach(function (value, i) {
                            if ($scope.resourceTaskObj[i].RegTask != null) {
                                $('#regStatusNone').removeClass('task-none').addClass('reg-status-done');
                            }
                        });

                    }
                }, function (error) {
                    authService.IsCheckResponse(error);
                    $scope.showAlert("Agent Task", "error", "Fail To remove sharing resource.");
                });
            }
        }
    })();


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
                identity_service.VerifyPwd(param, function (res) {
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
        send_command_to_veeryPhone('set_ivr_extension', {ivr: ivr});
    };

    $scope.setAgentExtension = function (ivr) {
        send_command_to_veeryPhone('set_agent_extension', {extension: ivr});
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
    chatService.SubscribeStatus("console_ctrl", function (status) {
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


    chatService.SubscribeCallStatus("console_sub_call_status", function (status) {
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
    chatService.SubscribeChatAll("console_cont_chat", function (message) {
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
                    if (chatService.need_to_show_new_chat_window(260)) {
                        $scope.showTabChatPanel(obj);
                        $scope.usercounts -= 1;
                        if ($scope.usercounts < 0)
                            $scope.usercounts = 0;
                    }
                }
                else {
                    obj.chatcount = 1;

                    if ($scope.usercounts) {
                        $scope.usercounts += 1;
                    } else {
                        $scope.usercounts = 1;
                    }
                    if (message.who != 'client') {
                        if (chatService.need_to_show_new_chat_window(260)) {
                            $scope.showTabChatPanel(obj);
                        }

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

    $scope.showAutoHideChat = function () {

        setTimeout(function() {
            var chat = chatService.get_hide_chat();
            if (chat) {
                $scope.showTabChatPanel(chat);
            }
        }, 1000);


    };

    $scope.showTabChatPanel = function (chatUser) {

        chatService.SetChatUser(chatUser);


        if (chatUser.chatcount) {

            $scope.usercounts -= 1;
            if ($scope.usercounts < 0)
                $scope.usercounts = 0;
        }
        chatUser.user_in_chat = 1;
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

    $window.onbeforeunload = function (e) {

        localStorageService.set("facetoneconsole", null);
        if ($state.current.name != "login") {
            var confirmationMessage = "Please Logout from System Before You Close the Tab/Browser.";
            e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
            return confirmationMessage;
        }

        chatService.Status('offline', 'chat');
        chatService.Status('offline', 'call');
        /* identity_service.Logoff();
         identity_service.Logoff();
         chatService.Status('offline', 'call');*/
        //save info somewhere
        // return true;
    };

    $scope.exceedAllowedIdelTime = function () {
        $scope.exceedAllowedIdel = false;
        var msg = "You Have Been Logged Out Because Your Session Has Expired.[Maximum Allowed Idle Time Exceeded]";
        showNotification(msg, 50000);
        console.log("----------------------------- You Have Been Logged Out Because Your Session Has Expired.[Maximum Allowed Idle Time Exceeded] --------------------------")
        $scope.logOut();
        // alert(msg);
    };
    $scope.exceedAllowedIdel = false;
    $scope.showOnlyOneMsg = false;
    $scope.$on('IdleStart', function () {
        if ($scope.inCall === false && $state.current.name === "console" && !$scope.agentInBreak && $scope.showOnlyOneMsg === false) {
            $scope.safeApply(function () {
                $scope.exceedAllowedIdel = true;
                $scope.showOnlyOneMsg = true;
            });
            console.log("---------------------------     IDLE-START     ---------------------------");
            $scope.Gaceperiod = consoleConfig.graceperiod * 60;
            $ngConfirm({
                icon: 'fa fa-universal-access',
                title: 'Idle Time Exceeded!',
                content: '<div ng-hide="exceedAllowedIdel" class="suspend-header-txt"> <h5>You were idle too long...!</h5> <span style="color:red;"> You Have Been Logged Out Because Your Session Has Expired.</span></div> <div ng-show="exceedAllowedIdel" class="suspend-header-txt"> <h5>Maximum Allowed Idle Time Exceeded.</h5> <span> <b><i><span style="color:red;">Attention! </span></i></b>  You will be automatically logged out in </span> </br> <timer countdown="Gaceperiod" interval="1000" >{{mminutes}} minute{{minutesS}}, {{sseconds}} second{{secondsS}}. </timer> </div>',
                scope: $scope,
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Ok',
                        btnClass: 'btn-red',
                        action: function () {
                            $scope.exceedAllowedIdel = false;
                        }
                    }
                },
                columnClass: 'col-md-6 col-md-offset-3',
                /*boxWidth: '50%',*/
                useBootstrap: true
            });

            showNotification("Maximum Allowed Idle Time Exceeded. You Will be Automatically Logged out in " + consoleConfig.graceperiod + " Minutes.", 15000);
        }
    });

    $scope.$on('IdleEnd', function () {
        console.log("---------------------------     IDLE-END     ---------------------------");
    });

    $scope.$on('IdleTimeout', function () {
        console.log("---------------------------     IDLE-TIMEOUT     ---------------------------");
        $scope.exceedAllowedIdel = false;
        $scope.exceedAllowedIdelTime();
    });

    Idle.watch();


    $scope.loadFiledAccessConfig = function () {

        userService.getAccessConfig().then(function (resAccess) {
            shared_data.userAccessFields = resAccess;
        }, function (errConfig) {
            shared_data.userAccessFields = undefined;

        });
    };
    $scope.loadFiledAccessConfig();

    $scope.RecievedInvitations = function () {
        internal_user_service.getMyReceivedInvitations().then(function (resInvites) {

            $scope.pendingInvites = resInvites.map(function (item) {

                item.time = item.created_at;
                item.messageType = "invitation";
                item.title = "Invitation";
                item.header = item.message;

                return item;


            });
            /*$scope.pendingInvites=resInvites;*/
            $scope.pendingInviteCnt = resInvites.length;
        }, function (errInvites) {
            $scope.showAlert("Error", "error", "Error in loading Invitations");
        });
    };

    $scope.RecievedInvitations();

    $scope.acceptInvitation = function (invite) {

        internal_user_service.acceptInvitation(invite).then(function (resAccept) {


            $scope.pendingInvites.splice($scope.pendingInvites.indexOf($scope.pendingInvites.map(function (item) {
                return item._id = invite._id;
            })), 1);
            $scope.showMesssageModal = false;
            if ($scope.pendingInviteCnt > 0) {
                $scope.pendingInviteCnt = $scope.pendingInviteCnt - 1;
            }
            else {
                $scope.pendingInviteCnt = 0;
            }
            $scope.showAlert("Success", "success", "You have accepted the Invitation from " + invite.from);

        }, function (errAccept) {
            $scope.showAlert("Error", "error", "Error in Accepting Invitation");
        });
    };
    $scope.rejectInvitation = function (invite) {

        internal_user_service.rejectInvitation(invite).then(function (resAccept) {


            $scope.pendingInvites.splice($scope.pendingInvites.indexOf($scope.pendingInvites.map(function (item) {
                return item._id = invite._id;
            })), 1);
            $scope.showMesssageModal = false;
            if ($scope.pendingInviteCnt > 0) {
                $scope.pendingInviteCnt = $scope.pendingInviteCnt - 1;
            }
            else {
                $scope.pendingInviteCnt = 0;
            }
            $scope.showAlert("Success", "success", "You have rejected the invitation from " + invite.from);

        }, function (errAccept) {
            $scope.showAlert("Error", "error", "Error in rejecting invitation from " + invite.from);
        });
    };
    $scope.cancelInvitation = function (invite) {

        internal_user_service.cancelInvitation(invite).then(function (resAccept) {


            $scope.pendingInvites.splice($scope.pendingInvites.indexOf($scope.pendingInvites.map(function (item) {
                return item._id = invite._id;
            })), 1);
            $scope.showMesssageModal = false;
            if ($scope.pendingInviteCnt > 0) {
                $scope.pendingInviteCnt = $scope.pendingInviteCnt - 1;
            }
            else {
                $scope.pendingInviteCnt = 0;
            }
            $scope.showAlert("Success", "success", "You have canceled the invitation from " + invite.from);

        }, function (errAccept) {
            $scope.showAlert("Error", "error", "Error in canceling invitation from " + invite.from);
        });
    };

    $scope.addDashBoard();


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
}).config(function (IdleProvider, KeepaliveProvider, consoleConfig) {
    var Gaceperiod = consoleConfig.graceperiod * 60;
    var idleTime = consoleConfig.maximumAllowedIdleTime * 60;
    IdleProvider.idle(idleTime);
    IdleProvider.timeout(Gaceperiod);
    KeepaliveProvider.interval(idleTime + Gaceperiod);

    /*IdleProvider.idle(5);
  IdleProvider.timeout(5);
  KeepaliveProvider.interval(10);*/
});

agentApp.controller("notificationModalController", function ($scope, $uibModalInstance, MessageObj, DiscardNotifications, AddToDoList) {


    $scope.showMesssageModal = true;
    $scope.MessageObj = MessageObj;
    console.log(MessageObj);


});