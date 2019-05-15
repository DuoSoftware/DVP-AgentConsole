/** * Created by Damith on 1/18/2017. */agentApp.factory('chatService', function ($rootScope, $q, identity_service, baseUrls) {    //connected to the IP Messaging services    var chatSubscribers = {};    var statusSubcribers = {};    var eventSubscriber = {};    var ticketSubscriber = {};    var chatSubscribeAll = {};    var callSubscribers = {};    var pendingSubcribers;    var connectionSubcribers = {};    var dashboardSubscriber = {};    var OnConnected = function () {        console.log("OnConnected..............");        var token = identity_service.getToken();        SE.authenticate({            success: function (data) {                console.log("authenticate..............");                /*if (connectionSubcribers) {                    connectionSubcribers(true);                }*/                angular.forEach(connectionSubcribers, function (func, key) {                    func(true);                });                SE.subscribe({room: 'QUEUE:QueueDetail'});                SE.subscribe({room: 'ARDS:break_exceeded'});                SE.subscribe({room: 'ARDS:freeze_exceeded'});                SE.subscribe({room: 'ARDS:ResourceStatus'});                /*SE.request({type: "pendingall", from: null});                SE.request({type: "allstatus", from: null});                SE.request({type: "allcallstatus", from: null});*/            },            error: function (data) {                console.log("authenticate error..............");            },            token: token        });    };    var OnEcho = function (o) {        console.log("OnEcho..............");    };    //var OnEvent = function (o) {    //    console.log("OnEvent..............");    //};    var OnStatus = function (o) {        console.log("OnStatus..............");        angular.forEach(statusSubcribers, function (func, key) {            func(o);        });    };    var OnEvent = function (event, o) {        console.log("OnEvent..............");        angular.forEach(eventSubscriber, function (func, key) {            func(event, o);        });    };    var OnTickerEvent = function (event, o) {        console.log("OnTickerEvent..............");        if (o.Message && o.Message.reference && ticketSubscriber && ticketSubscriber[o.Message.reference]) {            ticketSubscriber[o.Message.reference](event, o);        }    };    var OnDashBoardEvent = function (event) {        console.log("OnDshboardEvent..............");        angular.forEach(dashboardSubscriber, function (func, key) {            func(event);        });        /*dashboardSubscriber.forEach(function (func) {            func(event);        });*/    };    var OnMessage = function (o) {        console.log("OnMessage..............");        if (o) {            if (chatSubscribers[o.from]) {                chatSubscribers[o.from]('message', o);            } else {                angular.forEach(chatSubscribeAll, function (func, key) {                    func(o);                });                /*if (chatSubscribeAll.length > 0) {                    chatSubscribeAll.forEach(function (func) {                        func(o);                    });                }*/            }            $rootScope.$broadcast("updates");        }    };    var OnOldMessages = function (o) {        console.log("OnOldMessage..............");        if (o) {            if (chatSubscribers[o.from]) {                chatSubscribers[o.from]('oldmessages', o);            }        }    };    var OnSeen = function (o) {        console.log("OnMessage..............");        if (o) {            if (chatSubscribers[o.from]) {                chatSubscribers[o.from]('seen', o);            }        }    };    var OnTyping = function (o) {        console.log("OnTyping..............");        if (o && chatSubscribers[o.from]) {            chatSubscribers[o.from]('typing', o);        }    };    var OnTags = function (o) {        console.log("OnTags..............");        if (o && chatSubscribers[o.from]) {            chatSubscribers[o.from]('tags', o);        }    };    var OnPending = function (o) {        if (pendingSubcribers) {            pendingSubcribers(o);        }    };    var OnTypingstoped = function (o) {        console.log("OnTypingstoped..............");        if (o && chatSubscribers[o.from]) {            chatSubscribers[o.from]('typingstoped', o);        }    };    var OnDisconnect = function (o) {        console.log("OnDisconnect..............");        /*if (connectionSubcribers)        {            connectionSubcribers(false);        }*/        angular.forEach(connectionSubcribers, function (func, key) {            func(false);        });    };    var OnClient = function (o) {        console.log(o);        var user = o;        user.type = 'client';        user.status = 'online';        user.username = o.jti;        user._id = o.jti;        user.firstname = o.name;        user.company = o.company;        user.tenant = o.tenant;        user.lastname = '';        user.isNewChat = true;        user.profile = o.profile;        user.sessionId = o.sessionId;        if (o.channel) {            user.channel = o.channel;        }        if (user) {            var item = chatUserObj.filter(function (item) {                return item.username == user.username;            });            if (Array.isArray(item) && item.length == 0) {                user.index = chatUserObj.length;                chatUserObj.push(user);            }            var itemClient = clientUserObj.filter(function (item) {                return item.username == user.username;            });            if (Array.isArray(itemClient) && itemClient.length == 0) {                user.index = clientUserObj.length;                clientUserObj.push(user);            }            $rootScope.$broadcast("updates");            var audio = new Audio('assets/sounds/chattone.mp3');            audio.play();        }    };    var OnExistingclient = function (o) {        var user = o;        user.type = 'client';        user.status = 'online';        user.username = o.jti;        user._id = o.jti;        user.firstname = o.firstname;        user.company = o.company;        user.tenant = o.tenant;        user.lastname = '';        user.isNewChat = false;        user.sessionId = o.sessionId;        if (o.channel) {            user.channel = o.channel;        }        if (user) {            var item = chatUserObj.filter(function (item) {                return item.username == user.username;            });            if (Array.isArray(item) && item.length == 0) {                user.index = chatUserObj.length;                chatUserObj.push(user);            }            var itemClient = clientUserObj.filter(function (item) {                return item.username == user.username;            });            if (Array.isArray(itemClient) && itemClient.length == 0) {                user.index = clientUserObj.length;                clientUserObj.push(user);            }            $rootScope.$broadcast("updates");        }    };    var OnSessionend = function (o) {        console.log(o);    };    var OnLeft = function (o) {        console.log(o);    };    var OnError = function (o) {        console.log("OnError..............");    };    var OnAccept = function (o) {        console.log("OnAccept..............");    };    var OnLatestMessage = function (o) {        console.log("OnLatestMessage..............");        if (o) {            chatSubscribers[o.from]('latestmessages', o);        }    };    var OnChatStatus = function (o) {        if (o && chatSubscribers[o.from]) {            chatSubscribers[o.from]('chatstatus', o);        }    };    var OnCallStatus = function (o) {        console.log("OnStatus..............");        angular.forEach(callSubscribers, function (func, key) {            func(o);        });        /*callSubscribers.forEach(function (func) {            func(o);        });*/    };    var callBackEvents = {        OnConnected: OnConnected,        OnEcho: OnEcho,        OnEvent: OnEvent,        OnStatus: OnStatus,        OnTickerEvent: OnTickerEvent,        OnMessage: OnMessage,        OnOldMessages: OnOldMessages,        OnSeen: OnSeen,        OnTyping: OnTyping,        OnTags: OnTags,        OnTypingstoped: OnTypingstoped,        OnDisconnect: OnDisconnect,        OnClient: OnClient,        OnExistingclient: OnExistingclient,        OnSessionend: OnSessionend,        OnLeft: OnLeft,        OnAccept: OnAccept,        OnLatestMessage: OnLatestMessage,        OnError: OnError,        OnPending: OnPending,        OnChatStatus: OnChatStatus,        OnCallStatus: OnCallStatus,        OnDashBoardEvent: OnDashBoardEvent    };    var connect = function () {        SE.init({            serverUrl: baseUrls.ipMessageURL,            callBackEvents: callBackEvents        });    };    var request = function (status, from) {        SE.request({type: status, from: from});    };    var tags = function (from, to) {        SE.request({type: "tags", from: from, to: to});    };    var oldmessages = function (requester, from, to, id, who) {        SE.request({type: 'previous', requester: requester, from: from, to: to, id: id, who: who});    };    var latestmessages = function (requester, from, who) {        SE.request({type: 'latestmessages', from: from, who: who});    };    var newmessages = function (requester, from, who) {        SE.request({type: 'next', from: from, to: to, id: id, who: who});    };    var status = function (presence, presence_type) {        SE.status({presence: presence, presence_type: presence_type});    };    var DisconnectChat = function () {        SE.disconnect();    };    // chat user mapping ----------------------------    var chatUserObj = [];    var clientUserObj = [];    var deleted_first_chat_user = [];    var getCurrentChatUser = function () {        return chatUserObj;    };    var getCurrentClient = function () {        return clientUserObj;    };    var setChatUser = function (user) {        if (user) {            user.isNewChat = false;            //user.chat_status = true;            var item = chatUserObj.filter(function (item) {                return item.username == user.username;            });            if (Array.isArray(item) && item.length == 0) {                user.index = chatUserObj.length;                chatUserObj.push(user);                $rootScope.$broadcast("updates");            }        }    };    var SetChatPosition = function (nav) {        if (nav)            $rootScope.$broadcast("opennav");        else            $rootScope.$broadcast("closenav");    };    var DelChatUser = function (username) {        if (username) {            var index = chatUserObj.findIndex(function (item) {                return item.username == username;            });            delete chatSubscribers[username];            chatUserObj.splice(index, 1);            chatUserObj.forEach(function (userObj, index) {                chatUserObj[index].index = index;            })        }        $rootScope.$broadcast("updates");    };    var delClientUser = function (username) {        if (username) {            var index = clientUserObj.findIndex(function (item) {                return item.username == username;            });            delete chatSubscribers[username];            clientUserObj.splice(index, 1);            clientUserObj.forEach(function (userObj, index) {                clientUserObj[index].index = index;            })        }        $rootScope.$broadcast("updates");    };    var need_to_show_new_chat_window = function (start) {        var position = start + chatUserObj.length * 260;        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;        return width > position + 400;    };    var get_hide_chat = function () {        var u = deleted_first_chat_user[0];        deleted_first_chat_user.splice(0, 1);        return u;    };    var DelFirstUser = function (username) {        if (chatUserObj.length > 0) {            deleted_first_chat_user.push(chatUserObj[0]);            DelChatUser(chatUserObj[0].username);        }        /*if (chatUserObj.length > 0) {            index = 0;            chatUserObj.splice(index, 1);            chatUserObj.forEach(function (userObj, index) {                chatUserObj[index].index = index;            })        }        $rootScope.$broadcast("updates");*/    };    var SubscribeChat = function (sub, func) {        chatSubscribers[sub] = func;    };    var SubscribeStatus = function (sub, func) {        statusSubcribers[sub] = func;    };    var SubscribeCallStatus = function (sub, func) {        callSubscribers[sub] = func;    };    var SubscribeEvents = function (sub, func) {        eventSubscriber[sub] = func;    };    var SubscribeTicketEvents = function (ref, func) {        ticketSubscriber[ref] = func;    };    var UnSubscribeTicketEvents = function (ref) {        if (ticketSubscriber[ref]) {            delete ticketSubscriber[ref];        }    };    /*var SubscribeConnection = function (func) {        connectionSubcribers = func;    };*/    var SubscribeConnection = function (sub, func) {        connectionSubcribers[sub] = func;    };    var UnsubscribeConnection = function (sub) {        delete connectionSubcribers[sub];    };    var SubscribePending = function (func) {        pendingSubcribers = func;    };    var SubscribeDashboard = function (sub, func) {        dashboardSubscriber[sub] = func;    };    var SubscribeChatAll = function (sub, func) {        chatSubscribeAll[sub] = func;    };    return {        connectToChatServer: connect,        Status: status,        Request: request,        OldMessages: oldmessages,        Tags: tags,        NewMessages: newmessages,        LatestMessages: latestmessages,        OnEvent: OnEvent,        OnTyping: OnTyping,        SetChatUser: setChatUser,        DelChatUser: DelChatUser,        DelClientUser: delClientUser,        GetCurrentChatUser: getCurrentChatUser,        GetClientUsers: getCurrentClient,        onUserStatus: OnStatus,        SubscribeChat: SubscribeChat,        SubscribeStatus: SubscribeStatus,        SubscribeChatAll: SubscribeChatAll,        SubscribePending: SubscribePending,        DelFirstUser: DelFirstUser,        SetChatPosition: SetChatPosition,        SubscribeCallStatus: SubscribeCallStatus,        SubscribeEvents: SubscribeEvents,        SubscribeConnection: SubscribeConnection,        UnsubscribeConnection: UnsubscribeConnection,        SubscribeDashboard: SubscribeDashboard,        DisconnectChat: DisconnectChat,        SubscribeTicketEvents: SubscribeTicketEvents,        UnSubscribeTicketEvents: UnSubscribeTicketEvents,        need_to_show_new_chat_window: need_to_show_new_chat_window,        get_hide_chat:get_hide_chat    }});