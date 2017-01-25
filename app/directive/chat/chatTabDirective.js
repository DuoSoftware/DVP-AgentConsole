/** * Created by Damith on 1/18/2017. */agentApp.directive('chatTabDirective', function ($rootScope, chatService) {    return {        restrict: "EA",        scope: {            chatUser: "=",            selectedChatUser: "=",            loginName: "=",            loginAvatar: "="        },        templateUrl: 'app/views/chat/chat-view.html',        link: function (scope, ele, attr) {            scope.chatTxt = null;            scope.chatUser.chatcount = 0;            scope.chatUser.isChatLoding = false;            scope.chatUser.windowMimOption = true;            scope.chatUser.position = 0;            scope.openNav = true;            scope.$on("updates", function () {                setUpChatWindowPosition(true);            });            scope.$on("opennav", function () {                scope.openNav = true;                setUpChatWindowPosition();            });            scope.$on("closenav", function () {                scope.openNav = false;                setUpChatWindowPosition();            });            //get chat body scroll event            var minimuChatWidnow = function (currentChtW) {                $('#' + currentChtW.username).animate({                    bottom: "-344"                }, 300);                scope.chatUser.windowMimOption = false;            };            var maximuChatWindow = function (currentChtW) {                $('#' + currentChtW.username).animate({                    bottom: "0"                }, 300);                scope.chatUser.windowMimOption = true;                $('#' + currentChtW.username + " .cht-header").removeClass('rec-new-msg-blink');                ////////////////////////////////////////////////////////////////////////////////////                var pendingMessages = scope.chatUser.messageThread.filter(function (item) {                    return item.status == 'delivered';                });                if (pendingMessages && Array.isArray(pendingMessages))                    pendingMessages.forEach(function (msg) {                        SE.seen({to: scope.chatUser.username, id: msg.id});                    });                /////////////////////////////////////////////////////////////////////////////////////////            };            var msgBodyScrollFun = function () {                return {                    getDivId: function () {                        return scope.chatUser._id;                    },                    goToScrollDown: function () {                        var objDiv = document.getElementById(scope.chatUser._id);                        objDiv.scrollTop = objDiv.scrollHeight;                    },                    goToNewMsgScroller: function (msg) {                        var objDiv = document.getElementById(msg._id);                        $('#' + msg._id).animate({scrollTop: div_terms.top}, "slow");                    }                }            }();            // //UI function            var chatWindowPosition = function () {                if (scope.selectedChatUser.length == 1) {                    //$('#' + scope.chatUser.username).setAttribute("style", "left:" + 18 + "%");                }            };            chatWindowPosition();            chatService.SubscribeChat(scope.chatUser.username, function (type, message) {                switch (type) {                    case 'message':                        //msgBodyScrollFun.goToNewMsgScroller(message);                        if (!scope.chatUser.windowMimOption) {                            $('#' + scope.chatUser.username + " .cht-header").addClass('rec-new-msg-blink');                            message.status = 'delivered';                        } else {                            SE.seen({to: scope.chatUser.username, id: message.id});                            message.status = 'seen';                        }                        scope.chatUser.messageThread.push(message);                        break;                    case 'typing':                        scope.chatUser.typing = true;                        break;                    case 'chatstatus':                        console.log(message);                        if (message && message.lastseen) {                            scope.chatUser.lastseen = message.lastseen;                        }                        break;                    case 'typingstoped':                        scope.chatUser.typing = false;                        break;                    case 'seen':                        console.log(message);                        var seenMess = scope.chatUser.messageThread.filter(function (mes) {                            return mes.id == message.id;                        });                        if (Array.isArray(seenMess)) {                            seenMess.forEach(function (seeM) {                                ///var status = 'notdelivered'                                seeM.status = message.status;                            });                        }                        break;                    case 'latestmessages':                        scope.chatUser.isChatLoding = true;                        scope.chatUser.messageThread = [];                        message.messages.forEach(function (message) {                            message.message = message.data;                            message.id = message.uuid;                            scope.chatUser.messageThread.push(message);                            if (message.status != 'seen' && message.from == scope.chatUser.username) {                                SE.seen({to: scope.chatUser.username, id: message.uuid});                            }                        });                        scope.chatUser.isChatLoding = false;                        msgBodyScrollFun.goToScrollDown();                        break;                }            });            chatService.Request('latestmessages', scope.chatUser.username);            chatService.Request('chatstatus', scope.chatUser.username);            scope.chatUser.messageThread = [];            //user on type            scope.onFocusChat = function (val) {                SE.typing({to: scope.chatUser.username, from: scope.loginName});            };            scope.onFocusOutChat = function (val) {                SE.typingstoped({to: scope.chatUser.username, from: scope.loginName});            };            var sendMessage = function (user, msg) {                if (user) {                    var message = {'to': user.username, 'message': msg, 'type': "text"};                    var ms = SE.sendmessage(message);                    scope.chatUser.messageThread.push(ms);                    scope.chatTxt = null;                }            };            scope.onKeyPressed = function ($event, user, msg) {                var keyCode = $event.which || $event.keyCode;                if (keyCode === 13) {                    sendMessage(user, msg);                }            };            //set chat windows position            var position = 0,                screenSize = 0,                rightNav = 0;            /*             var setUpChatWindowPosition = function () {             if (scope.selectedChatUser.length == 1) {             position = 266;             }             if (scope.selectedChatUser.length == 2) {             position = 545;             }             if (scope.selectedChatUser.length == 3) {             position = 830;             }             scope.chatUser.position = position + "px";             };             */            var setUpChatWindowPosition = function () {                var start = 0;                if (scope.openNav) {                    start = 230;                }                position = start + scope.chatUser.index * 260 + scope.chatUser.index * 20;                var width = window.innerWidth ||                    document.documentElement.clientWidth ||                    document.body.clientWidth;                scope.chatUser.position = position + "px";                if (width > position + 400) {                    console.log(position);                } else {                    chatService.DelFirstUser();                }            };            //chat window option ------            scope.closeThisChat = function (currentChtW) {                chatService.DelChatUser(currentChtW.username);                // $('#' + currentChtW.username).addClass('slideInRight')                // .removeClass('slideInLeft');                //reArrangeChatWindow();                // $('#' + currentChtW.username).animate({                //     bottom: "-390"                // });            };            scope.minimusChatW = function (currentChtW) {                minimuChatWidnow(currentChtW);            };            scope.maximusChatW = function (currentChtW) {                maximuChatWindow(currentChtW);            };            scope.$on('$destroy', function () {                console.log("destroy ");            });            setUpChatWindowPosition();            /**** client to agent chat *****/            scope.acceptClient = function (client) {                //delete client['messageThread'];                var clientObj = {};                clientObj.jti = client.jti;                clientObj.to = client.to;                clientObj.type = client.type;                clientObj.status = client.status;                clientObj.username = client.username;                clientObj._id = client._id;                clientObj.firstname = client.firstname;                clientObj.company = client.company;                clientObj.tenant = client.tenant;                clientObj.lastname = client.lastname;                SE.acceptclient(clientObj);                client.isNewChat = false;            };            //create new profile            scope.createNewProfile = function (client) {            };            //disconnect session            scope.clientChatEndSession=function(client){                SE.sessionend({to: client.username});            };        }    }}).directive('enterSendChat', function () {    return function (scope, element, attrs) {        element.bind("keydown keypress", function (event) {            if (event.which === 13) {                scope.$apply(function () {                    scope.$eval(attrs.myEnter);                });                event.preventDefault();            }        });    };});