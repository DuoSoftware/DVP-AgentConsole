/*
agentApp.factory('websocketServices', [function() {
    var stack = [];
    var onmessageDefer;
    var socket = {
        ws: new WebSocket("ws://127.0.0.1:11000"),
        checkStatus:function () {
            return socket.ws.readyState == 1;
        },
        send: function(data) {

            if (socket.ws.readyState == 1) {
                socket.ws.send(data);
            }

           /!* data = JSON.stringify(data);
            if (socket.ws.readyState == 1) {
                socket.ws.send(data);
            } else {
                stack.push(data);
            }*!/
        },
        onmessage: function(callback) {
            if (socket.ws.readyState == 1) {
                socket.ws.onmessage = callback;
            } else {
                onmessageDefer = callback;
            }
        }
    };
    socket.ws.onopen = function(event) {
        for (i in stack) {
            socket.ws.send(stack[i]);
        }
        stack = [];
        if (onmessageDefer) {
            socket.ws.onmessage = onmessageDefer;
            onmessageDefer = null;
        }
    };
    return socket;
}]);


*/

agentApp.factory('websocketServices', function ($websocket) {
    var ws ;
    var eventSubscribers = {};
    var initialize = function () {
        var options = {
            maxTimeout :60 * 1000,//5 * 60 * 1000 -> 5min
            reconnectIfNotNormalClose:true
        };
        ws = $websocket('ws://127.0.0.1:11000',undefined,options);
        ws.onMessage(function (event) {
            if (eventSubscribers.onMessage) {
                eventSubscribers.onMessage(event);
            }
        });

        ws.onError(function (event) {
            console.log('connection Error', event);
            if (eventSubscribers.onError) {
                eventSubscribers.onError(event);
            }
        });

        ws.onClose(function (event) {
            console.log('connection closed', event);
            if (eventSubscribers.onClose) {
                eventSubscribers.onClose(event);
            }
        });

        ws.onOpen(function () {
            console.log('connection open');
        });
    };
    return {
        SubscribeEvents: function (funcs) {
            initialize();
            eventSubscribers = funcs
        },
        status: function () {
            return ws.readyState===1;
        },
        send: function (message) {
            if (angular.isString(message)) {
                ws.send(message);
            }
            else if (angular.isObject(message)) {
                ws.send(JSON.stringify(message));
            }
        }

    };
});