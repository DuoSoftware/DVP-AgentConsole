/**
 * Created by Waruna on 5/22/2017.
 */


agentApp.constant('constants', {
    DialerState: {
        1: 'Run',
        2: 'Stop',
        3: 'Pause',
        4: 'Resume'
    }

});

agentApp.controller('agentDialerControl', function ($rootScope, $scope, $http, $anchorScroll, $filter, agentDialerService, authService, constants) {


    $anchorScroll();

    // Kasun_Wijeratne_9_MARCH_2018
	$scope.miniDialer = true;
    // Kasun_Wijeratne_9_MARCH_2018 - ENDS


    //code update damith
    var UIanimation = function () {
        //private

        //access public
        return {
            showCurrentDialerDetails: function () {
                $('#dialerDetails').removeClass('display-none');
                $('#dialerDetails').animate({
                    'height' : '66',
                    'padding' : '10px 10px'
                }, 400);
                $('#tblDialerWrp').animate({height: '160'}, 400);
            },
            hideCurrentDialerDetails: function () {
                $('#dialerDetails').animate({
                    height: '0',
                    padding: '0'
                }, 400, function () {
                    // $('#dialerDetails').addClass('display-none');
                    $('#tblDialerWrp').animate({height: '185'}, 400);
                });
                $('#btn-close').removeClass('display-none');
            }
        }
    }();

    $scope.goToDialer = function () {
        $('#batchSelectScreen').animate({height: 'auto	'}, 400, function () {
            $('#mainDialerScreen').removeClass('display-none').addClass('fadeIn');
            $('.batchSelectScreen').addClass('display-none');
        });
    };

    UIanimation.hideCurrentDialerDetails();

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: "bootstrap3"
        });
    };

    $scope.contactList = [];

    $scope.isLoading = false;
    $scope.currentPage = 0;
    $scope.BatchName = undefined;
    var resid = authService.GetResourceIss();
    $scope.getALlPhoneContact = function () {
        if (!$scope.BatchName) {
            return;
        }
        $scope.isLoading = true;
        if ($('#AgentDialerUi').hasClass("display-none")) {
            return;
        }

        if ($scope.contactList.length == 0) {
            $scope.currentPage = 0;
            //$('#btn-close').removeClass('display-none');
        }
        $scope.currentPage++;
        agentDialerService.GetAllContacts(resid, $scope.BatchName, $scope.currentPage).then(function (response) {
            $scope.isLoading = false;
            if (response && angular.isArray(response) && response.length > 0) {
                // $('#btn-close').addClass('display-none');
                response.map(function (item) {
                    var n = $filter('filter')($scope.contactList, {'ContactNumber': item.ContactNumber});
                    if (n && n.length) {
                        console.log("Duplicate Number");
                    }
                    else {
                        $scope.safeApply(function () {
                            $scope.contactList.push(item);
                        });
                    }


                    /*$scope.safeApply(function () {

                     var n = $filter('filter')($scope.contactList, {'ContactNumber':item.ContactNumber});
                     if(n&&n.length){
                     console.log("Duplicate Number");
                     }
                     else{
                     $scope.contactList.push(item);
                     }

                     });*/
                });
                if ($scope.contactList.length <= 10) {
                    $scope.currentPage = 0;
                    $('#btn-close').removeClass('display-none');
                }
            }

        });
    };

    $scope.getALlPhoneContactByBatchName = function () {
        $scope.currentPage = 0;
        $scope.contactList = [];
        $scope.getALlPhoneContact();
    };
    //
    $scope.getAllContactScreen = function () {
        $scope.isLoading = true;
        $scope.currentPage++;
        agentDialerService.GetAllContacts(resid, $scope.BatchName,
            $scope.currentPage).then(function (response) {
            $scope.isLoading = false;
            if (response && angular.isArray(response) && response.length > 0) {
                //$('#btn-close').addClass('display-none');
                response.map(function (item) {
                    $scope.safeApply(function () {
                        $scope.contactList.push(item);
                    });
                });
            }

        });
    };

    //$scope.getALlPhoneContact();

    $scope.updateContact = function (obj) {
        agentDialerService.UpdateContact(obj).then(function (response) {
            console.log(response);
            $scope.isAutoUpdateDone = true;
            /*if(response)
             {
             $scope.showAlert("Agent Dialer", 'success', "Successfully Update..");
             }
             else{
             $scope.showAlert("Agent Dialer", 'error', "Fail To Update.");
             }*/
        });
    };

    $scope.updateContactStatus = function (obj) {
        if (!$scope.isAutoUpdateDone) {
            $scope.showAlert("Agent Dialer", 'error', "Auto Update Processing. Please Try Aging Later ...");
            return;
        }
        if ($scope.contactList.length <= 10) {
            $scope.getALlPhoneContact();
        }
        if ((obj.DialerState != $scope.temp.DialerState) || (obj.OtherData != $scope.temp.OtherData) || (obj.OtherData != $scope.temp.OtherData)) {
            agentDialerService.UpdateContactStatus(obj).then(function (response) {
                if (response) {
                    $scope.showAlert("Agent Dialer", 'success', "Successfully Update.");

                }
                else {
                    $scope.showAlert("Agent Dialer", 'error', "Fail To Update.");

                }
            });
        }
        else {
            $scope.showAlert("Agent Dialer", 'error', "Existing Data Has All Ready Been Saved.");
        }
    };

    $scope.dialerState = constants.DialerState[2];
    $scope.currentItem = {};

    var makeCall = function () {

        $scope.safeApply(function () {
            if ($scope.dialerState === constants.DialerState[1] && $scope.contactList.length >= 1) {
                $scope.currentItem = $scope.contactList[0];
                $scope.contactList.splice(0, 1);
                $scope.currentItem.DialerState = 'Dial';
                $scope.currentItem.Redial = false;

                var number = $scope.currentItem.ContactNumber;
                if (number) {
                    var data = {
                        callNumber: number,
                        tabReference: undefined
                    };
                    $rootScope.$emit('makecall', data);
                }
            }
            else if ($scope.contactList.length === 0) {
                $scope.pauseDialer();
                //$('#btn-stop').removeClass('display-none');
            }
        });

    };


    $scope.isAutoUpdateDone = false;
    $scope.temp = {};
    $rootScope.$on('dialnextnumber', function (events, args) {
        if ($scope.currentItem.ContactNumber) {
            try {
                $scope.isAutoUpdateDone = false;
                angular.copy($scope.currentItem, $scope.temp);
                $scope.updateContact($scope.temp);
            } catch (e) {
                console.log(e);
            }
        }

        /*if ($scope.dialerState === constants.DialerState[1]) {
         makeCall();
         }*/
        switch ($scope.dialerState) {
            case constants.DialerState[1]:
                makeCall();
                break;
            case constants.DialerState[2]:
                $scope.HeaderDetails();
                break;
            default:

        }

        if ($scope.contactList.length == 10) {
            $scope.getALlPhoneContact();
        }

    });

    $rootScope.$on('dialstop', function (events, args) {
        $scope.stopDialer();
    });

    $rootScope.$on('dialloaddata', function (events, args) {
        /* if ($scope.contactList.length <= 10) {
         $scope.getALlPhoneContact();
         }*/
    });

    $scope.startDialer = function () {
        if ($scope.currentModeOption.toLowerCase() !== 'outbound') {
            $scope.showAlert("Soft Phone", "error", "Cannot make outbound call while you are in inbound mode.");
            return
        }
        $scope.dialerState = constants.DialerState[1];
        $('#btn-start').addClass('display-none');
        $('#btn-pause').removeClass('display-none');
        $('#btn-update').addClass('display-none');
        $('#btn-close').addClass('display-none');
        $('#btn-close-dialer').addClass('display-none');

        //$('#btn-stop').removeClass('display-none');
        $('#btn-resume').addClass('display-none');

        UIanimation.showCurrentDialerDetails();

        makeCall();

    };

    $scope.isMinimizeDialer = false;
    $scope.minimizeDialer = function () {
        $scope.isMinimizeDialer = !$scope.isMinimizeDialer;
        if ($scope.isMinimizeDialer) {
            $('#AgentDialerUi').addClass('dialer-minimize');
        }
        else{
            $('#AgentDialerUi').removeClass('dialer-minimize');
        }
    };

    $scope.stopDialer = function () {

        $('#AgentDialerUi').addClass('display-none');
        $('#btn-pause').addClass('display-none');
        $('#btn-start').removeClass('display-none');
        $('#btn-stop').addClass('display-none');
        $('#btn-resume').addClass('display-none');
        $('#mainDialerScreen').addClass('display-none');
        $('.batchSelectScreen').removeClass('display-none');
        $scope.dialerState = constants.DialerState[2];
        $scope.currentItem = {};
        $scope.miniDialer = true;

        UIanimation.hideCurrentDialerDetails();
    };

    $scope.pauseDialer = function () {
        $('#btn-pause').addClass('display-none');
        $('#btn-update').removeClass('display-none');
        $('#btn-start').addClass('display-none');
        $('#btn-stop').removeClass('display-none');
        $('#btn-resume').removeClass('display-none');
        $('#btn-close-dialer').removeClass('display-none');
        $scope.dialerState = constants.DialerState[3];
    };

    $scope.resumeDialer = function () {
        $scope.startDialer();
    };

    $scope.Disposition = ['Not Responding',
        'No Answer',
        'Callback',
        'Close',
        'New',
        'Dial'
    ];

    $scope.BatchNames = [];
    $scope.HeaderDetails = function () {
        $scope.BatchNames = [];
        $scope.isLoading = true;
        agentDialerService.HeaderDetails(resid).then(function (response) {
            if (response) {
                $scope.BatchNames = response.BatchName;
            }
            $scope.isLoading = false;
        }, function (error) {
            $scope.showAlert("Agent Dialer", 'error', "Fail To Get Page Count.");
            $scope.isLoading = false;
        });
    };

    $scope.HeaderDetails();


    //update code damith

});

