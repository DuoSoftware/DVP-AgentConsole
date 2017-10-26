/**
 * Created by Veery Team on 8/15/2016.
 */


var agentApp = angular.module('veeryAgentApp', ['ngRoute', 'ui', 'ui.bootstrap',
    'ui.router', 'jkuri.slimscroll', 'veerySoftPhoneModule', 'base64',
    'angular-jwt', 'btford.socket-io', 'LocalStorageModule',
    'authServiceModule', 'ngTagsInput', 'schemaForm',
    'yaru22.angular-timeago', 'timer', 'ngSanitize',
    'uuid', 'angularFileUpload', 'download', 'fileServiceModule',
    'com.2fdevs.videogular',
    'ui.tab.scroll', 'ngAnimate', 'mgcrea.ngStrap', 'gridster',
    'ui.bootstrap.datetimepicker', 'moment-picker',
    'angular.filter', 'satellizer', 'mdo-angular-cryptography',
    'ui.bootstrap.accordion', 'jsonFormatter', 'bw.paging',
    'pubnub.angular.service', 'ui.slimscroll',
    'ngImgCrop', 'jkAngularRatingStars', 'rzModule', "chart.js",
    'angular-carousel', 'ngEmbed', 'ngEmojiPicker', 'luegg.directives',
    'angularProgressbar', 'cp.ngConfirm', 'angucomplete-alt', 'as.sortable',
    'angular-timeline', 'angular-json-tree', 'ngDropover', 'angularAudioRecorder', 'ngAudio','cfp.hotkeys'
]);


agentApp.constant('moment', moment);

var baseUrls = {
    'authUrl': 'http://userservice.app1.veery.cloud',//http://userservice.app1.veery.cloud
    'userServiceBaseUrl': 'http://userservice.app1.veery.cloud/DVP/API/1.0.0.0/',//http://userservice.app1.veery.cloud/DVP/API/1.0.0.0/
    'notification': 'http://notificationservice.app1.veery.cloud',
    'ardsliteserviceUrl': 'http://ardsliteservice.app1.veery.cloud/DVP/API/1.0.0.0/ARDS/',//ardsliteservice.app1.veery.cloud
    'engagementUrl': 'http://interactions.app1.veery.cloud/DVP/API/1.0.0.0/',//interactions.app1.veery.cloud
    'ticketUrl': 'http://liteticket.app1.veery.cloud/DVP/API/1.0.0.0/',//liteticket.app1.veery.cloud
    'ivrUrl': 'http://eventservice.app1.veery.cloud/DVP/API/1.0.0.0/EventService/Events/SessionId/',
    'mailInboxUrl': 'http://interactions.app1.veery.cloud/DVP/API/1.0.0.0/Inbox/',
    'ardsMonitoringServiceUrl': 'http://ardsmonitoring.app1.veery.cloud/DVP/API/1.0.0.0/ARDS/MONITORING',
    'fileService': 'http://fileservice.app1.veery.cloud/DVP/API/1.0.0.0/',
    'fileServiceInternalUrl': 'http://fileservice.app1.veery.cloud/DVP/API/1.0.0.0/InternalFileService/',
    'resourceService': 'http://resourceservice.app1.veery.cloud/DVP/API/1.0.0.0/ResourceManager/', // http://resourceservice.app1.veery.cloud
    'dashBordUrl': 'http://dashboardservice.app1.veery.cloud/',
    'toDoUrl': 'http://todolistservice.app1.veery.cloud/DVP/API/1.0.0.0/',    //todolistservice.app1.veery.cloud
    'monitorrestapi': 'http://monitorrestapi.app1.veery.cloud/DVP/API/1.0.0.0/',//monitorrestapi.app1.veery.cloud
    'integrationapi': 'http://integrationapi.app1.veery.cloud/DVP/API/1.0.0.0/IntegrationAPI/',
    'sipuserUrl': 'http://sipuserendpointservice.app1.veery.cloud/DVP/API/1.0.0.0/', //sipuserendpointservice.app1.veery.cloud
    'pwdVerifyUrl': 'http://userservice.app1.veery.cloud/auth/verify',
    'qaModule': 'http://qamodule.app1.veery.cloud/DVP/API/1.0.0.0/QAModule/',
    'contactUrl': 'http://contacts.app1.veery.cloud/DVP/API/1.0.0.0/ContactManager/', //contacts.app1.veery.cloud
    'dialerUrl': 'http://dialerapi.app1.veery.cloud/DVP/DialerAPI/ClickToCall/', //dialerapi.app1.veery.cloud
    'agentDialerUrl': 'http://agentdialerservice.app1.veery.cloud/DVP/API/1.0.0.0/AgentDialer/', //agentdialerservice.app1.veery.cloud
    'ipMessageURL': 'http://ipmessagingservice.app.veery.cloud/',//'http://ipmessagingservice.app1.veery.cloud',
    'templateUrl': 'http://templates.app1.veery.cloud/DVP/API/1.0.0.0/', //dialerapi.app1.veery.cloud
    'cdrProcessor': 'http://cdrprocessor.app.veery.cloud/DVP/API/1.0.0.0/', //dialerapi.app1.veery.cloud
};

var recordingTime = 20;

agentApp.constant('baseUrls', baseUrls);
agentApp.constant('recordingTime', recordingTime);

agentApp.constant('dashboardRefreshTime', 60000);
agentApp.constant('turnServers', [{
    url: "stun:stun.l.google.com:19302"
}, {
    url: "stun:stun.counterpath.net:3478"
}, {
    url: "stun:numb.viagenie.ca:3478"
}]);
//{url:"stun:stun.l.google.com:19302"},{url:"stun:stun.counterpath.net:3478"},{url:"stun:numb.viagenie.ca:3478"}
//{url:"turn:turn@172.16.11.133:80",credential:"DuoS123"}

var phoneSetting = {
    'TransferPhnCode': '*6',
    'TransferExtCode': '*3',
    'TransferIvrCode': '*9',
    'EtlCode': '#',
    'SwapCode': '1',
    'ConferenceCode': '0',
    'ExtNumberLength': 6
};
agentApp.constant('phoneSetting', phoneSetting);

//myconsole current  version config
var versionController = {
    'version': 'v2.6.1.4'
};
agentApp.constant('versionController', versionController);

agentApp.config(function (scrollableTabsetConfigProvider) {
    scrollableTabsetConfigProvider.setShowTooltips(true);
    scrollableTabsetConfigProvider.setTooltipLeftPlacement('bottom');
    scrollableTabsetConfigProvider.setTooltipRightPlacement('left');
});

agentApp.config(["$httpProvider", "$stateProvider", "$urlRouterProvider",
    "$authProvider", "gridsterConfig",
    function ($httpProvider, $stateProvider, $urlRouterProvider, $authProvider) {


        var authProviderUrl = 'http://userservice.app1.veery.cloud/';
        $authProvider.loginUrl = authProviderUrl + 'auth/login';
        $authProvider.signupUrl = authProviderUrl + 'auth/signup';

        $urlRouterProvider.otherwise('/login');
        $stateProvider.state("console", {
            url: "/console",
            templateUrl: "app/views/console-view.html",
            data: {
                requireLogin: true
            }
        }).state('login', {
            url: "/login",
            templateUrl: "app/auth/login.html",
            data: {
                requireLogin: false
            }
        }).state('reset-password-token', {
            url: "/reset-password-token",
            templateUrl: "app/auth/password-reset-token.html",
            data: {
                requireLogin: false
            }
        }).state('reset-password', {
            url: "/reset-password",
            templateUrl: "app/auth/password-reset.html",
            data: {
                requireLogin: false
            }
        }).state("activate", {
            url: "/activate/:token",
            templateUrl: "app/auth/activateAccount.html",
            data: {
                requireLogin: false
            }
        }).state('reset-password-email', {
            url: "/reset-password-email",
            templateUrl: "app/auth/password-reset-email.html",
            data: {
                requireLogin: false
            }
        })
    }
], function (scrollableTabsetConfigProvider) {
    scrollableTabsetConfigProvider.setShowTooltips(true);
    scrollableTabsetConfigProvider.setTooltipLeftPlacement('bottom');
    scrollableTabsetConfigProvider.setTooltipRightPlacement('left');
});

agentApp.config(['$cryptoProvider', function ($cryptoProvider) {
    $cryptoProvider.setCryptographyKey('1111111111111111');
}]);

agentApp.constant('config', {
    Auth_API: 'http://userservice.162.243.230.46.xip.io/',
    appVersion: 1.0,
    client_Id_secret: 'ae849240-2c6d-11e6-b274-a9eec7dab26b:6145813102144258048'
});

//Authentication
agentApp.run(function ($rootScope, loginService, $location, $state, $document,$window) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;
        if (requireLogin) {
            if (!loginService.getToken()) {
                event.preventDefault();
                $state.go('login');
            }
            // get me a login modal!
        }
    });

    var decodeToken = loginService.getTokenDecode();
    if (!decodeToken) {
        $state.go('login');
        return
    }


    angular.element($window).bind('focus', function() {

        console.log('Console Focus......................');
    }).bind('blur', function() {

        console.log('Console Lost Focus......................');
    });
});


//agentApp.directive('scrollable', function ($document, $interval, $timeout, $window) {
//    return {
//        restrict: 'A',
//        link: function ($scope, wrappedElement, attributes) {
//            var element = wrappedElement[0],
//                navTabsElement,
//                scrollTimer,
//                dragInfo = {};
//
//            init();
//
//            function startScroll($event) {
//                if ($event.target == element) {
//                    // TODO should use requestAnimationFrame
//                    scrollTimer = $interval(function () {
//                        navTabsElement.scrollLeft += ($event.clientX > 200) ? 5 : -5;
//                    }, 1000 / 60);
//                }
//            };
//
//            function stopScroll($event) {
//                $interval.cancel(scrollTimer);
//            }
//
//            function onDocumentMouseMove($event) {
//                var differenceX = $event.pageX - dragInfo.lastPageX;
//
//                dragInfo.lastPageX = $event.pageX;
//                dragInfo.moved = true;
//
//                navTabsElement.scrollLeft -= differenceX;
//            }
//
//            function onDocumentMouseUp($event) {
//                //$event.preventDefault();
//                //$event.stopPropagation();
//                //$event.cancelBubble = true;
//
//                $document.off('mousemove', onDocumentMouseMove);
//                $document.off('mouseup', onDocumentMouseUp);
//
//                // wow
//                if (dragInfo.moved === true) {
//                    [].forEach.call(navTabsElement.querySelectorAll('li a'), function (anchor) {
//                        var anchorScope = angular.element(anchor).scope();
//                        anchorScope.oldDisabled = anchorScope.disabled;
//                        anchorScope.disabled = true;
//                    });
//                    $timeout(function () {
//                        [].forEach.call(navTabsElement.querySelectorAll('li a'), function (anchor) {
//                            var anchorScope = angular.element(anchor).scope();
//                            anchorScope.disabled = anchorScope.oldDisabled;
//                            delete anchorScope.oldDisabled;
//                        });
//                    });
//                }
//            }
//
//            function onNavTabsMouseDown($event) {
//                var currentlyScrollable = element.classList.contains('scrollable');
//
//                if (currentlyScrollable === true) {
//                    $event.preventDefault();
//
//                    dragInfo.lastPageX = $event.pageX;
//                    dragInfo.moved = false;
//
//                    $document.on('mousemove', onDocumentMouseMove);
//                    $document.on('mouseup', onDocumentMouseUp);
//                }
//            }
//
//            function onWindowResize() {
//                checkForScroll();
//            }
//
//            function checkForScroll() {
//                console.log('checking tabs for scroll');
//                var currentlyScrollable = element.classList.contains('scrollable'),
//                    difference = 1;
//
//                // determine whether or not it should actually be scrollable
//                // the logic is different if the tabs are currently tagged as scrollable
//                if (currentlyScrollable === true) {
//                    difference = navTabsElement.scrollWidth - navTabsElement.clientWidth;
//                } else {
//                    difference = navTabsElement.clientHeight - navTabsElement.querySelector('.nav-tabs > li').clientHeight;
//                }
//                console.log(difference);
//
//                if (difference > 2) {
//                    element.classList.add('scrollable');
//                } else {
//                    element.classList.remove('scrollable');
//                }
//            }
//
//            function bindEventListeners() {
//                wrappedElement.on('mousedown', function ($event) {
//                    startScroll($event);
//                });
//
//                wrappedElement.on('click', function ($event) {
//                    console.log(this);
//                    $(this)
//                    console.log('CLICK', $event.defaultPrevented);
//                });
//
//                wrappedElement.on('mouseup mouseleave', function ($event) {
//                    stopScroll($event);
//                });
//
//                angular.element(navTabsElement).on('mousedown', onNavTabsMouseDown);
//
//                $window.addEventListener('resize', onWindowResize);
//
//                $scope.$on('$destroy', function () {
//                    wrappedElement.off('mousedown mouseup mouseleave');
//                    angular.element(navTabsElement).off('mousedown', onNavTabsMouseDown);
//                    $window.removeEventListener('resize', onWindowResize);
//                });
//            }
//
//            $scope.$on('checkTabs', function () {
//                $timeout(checkForScroll, 10);
//            });
//
//            function init() {
//                // wait for tabs, sucks
//                $timeout(function () {
//                    navTabsElement = element.querySelector('.nav-tabs');
//
//                    bindEventListeners();
//                    onWindowResize();
//                });
//            }
//        }
//    }
//});


agentApp.filter('secondsToDateTime', [function () {
    return function (seconds) {
        if (!seconds) {
            return new Date(1970, 0, 1).setSeconds(0);
        }
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

agentApp.filter('millisecondsToDateTime', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setMilliseconds(seconds);
    };
}]);


//Password verification
agentApp.directive('passwordVerify', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function (scope, elem, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // watch own value and re-validate on change
            scope.$watch(attrs.ngModel, function () {
                validate();
            });

            // observe the other value and re-validate on change
            attrs.$observe('passwordVerify', function (val) {
                validate();
            });

            var validate = function () {
                // values
                var val1 = ngModel.$viewValue;
                var val2 = attrs.passwordVerify;
                // set validity
                var status = !val1 || !val2 || val1 === val2;
                ngModel.$setValidity('passwordVerify', status);
                // return val1
            };
        }
    }
});


agentApp.directive('execOnScrollToTop', function () {

    return {

        restrict: 'A',
        link: function (scope, element, attrs) {
            var fn = scope.$eval(attrs.execOnScrollToTop);

            element.on('scroll', function (e) {

                if (!e.target.scrollTop) {
                    console.log("scrolled to top...");
                    scope.$apply(fn);
                }

            });
        }

    };

});


agentApp.directive('execOnScrollToBottom', function () {

    return {

        restrict: 'A',
        link: function (scope, element, attrs) {
            var fn = scope.$eval(attrs.execOnScrollToBottom),
                clientHeight = element[0].clientHeight;

            element.on('scroll', function (e) {
                var el = e.target;

                if ((el.scrollHeight - el.scrollTop) === clientHeight) { // fully scrolled
                    console.log("scrolled to bottom...");
                    scope.$apply(fn);
                }
            });
        }

    };

});

agentApp.directive('passwordStrengthBox', [
    function () {
        return {
            require: 'ngModel',
            restrict: 'E',
            scope: {
                password: '=ngModel',
                confirm: '=',
                box: '='
            },

            link: function (scope, elem, attrs, ctrl) {
                //password validation
                scope.isShowBox = false;
                scope.isPwdValidation = {
                    minLength: false,
                    specialChr: false,
                    digit: false,
                    capitalLetter: false
                };
                scope.$watch('password', function (newVal) {
                    scope.strength = isSatisfied(newVal && newVal.length >= 8) +
                        isSatisfied(newVal && /[A-z]/.test(newVal)) +
                        isSatisfied(newVal && /(?=.*[A-Z])/.test(newVal)) +
                        isSatisfied(newVal && /(?=.*\W)/.test(newVal)) +
                        isSatisfied(newVal && /\d/.test(newVal));

                    if (!ctrl || !newVal || scope.strength != 5) {
                        ctrl.$setValidity('newPassword', false);
                    } else {
                        ctrl.$setValidity('newPassword', true);
                    }

                    //length
                    if (newVal && newVal.length >= 8) {
                        scope.isPwdValidation.minLength = true;
                    } else {
                        scope.isPwdValidation.minLength = false;
                    }

                    // Special Character
                    if (newVal && /(?=.*\W)/.test(newVal)) {
                        scope.isPwdValidation.specialChr = true;
                    } else {
                        scope.isPwdValidation.specialChr = false;
                    }

                    //digit
                    if (newVal && /\d/.test(newVal)) {
                        scope.isPwdValidation.digit = true;
                    } else {
                        scope.isPwdValidation.digit = false;
                    }

                    //capital Letter
                    if (newVal && /(?=.*[A-Z])/.test(newVal)) {
                        scope.isPwdValidation.capitalLetter = true;
                    } else {
                        scope.isPwdValidation.capitalLetter = false;
                    }


                    //check password confirm validation
                    // if (scope.confirm) {
                    //     var origin = scope.confirm;
                    //     if (origin !== newVal) {
                    //         ctrl.$setValidity("unique", false);
                    //     } else {
                    //         ctrl.$setValidity("unique", true);
                    //     }
                    // };

                    function isSatisfied(criteria) {
                        return criteria ? 1 : 0;
                    }
                }, true);
            },
            template: '<div ng-if="strength != ' + 5 + ' "' +
            'ng-show=strength' +
            ' class="password-leg-wrapper login-lg-wrapper animated fadeIn ">' +
            '<ul>' +
            '<li>' +
            '<i ng-show="isPwdValidation.minLength" class="ti-check color-green"></i>' +
            '<i ng-show="!isPwdValidation.minLength" class="ti-close color-red"></i>' +
            ' Min length 8' +
            '</li>' +
            '<li><i ng-show="isPwdValidation.specialChr" class="ti-check color-green "></i>' +
            '<i ng-show="!isPwdValidation.specialChr" class="ti-close color-red"></i>' +
            ' Special Character' +
            '</li>' +
            '<li><i ng-show="isPwdValidation.digit" class="ti-check color-green"></i>' +
            '<i ng-show="!isPwdValidation.digit" class="ti-close color-red"></i>' +
            ' Digit' +
            '</li>' +
            '<li><i ng-show="isPwdValidation.capitalLetter" class="ti-check color-green"></i>' +
            '<i ng-show="!isPwdValidation.capitalLetter" class="ti-close color-red"></i>' +
            ' Capital Letter' +
            ' </li>' +
            '</ul>' +
            '</div>'
        }
    }
]);
