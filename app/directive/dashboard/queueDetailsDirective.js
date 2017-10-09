agentApp.directive('queuedetails', function ($timeout) {
    return {
        restrict: "EA",
        scope: {
            queue: "="
        },
        templateUrl: 'app/views/dashboard/partials/queueDetails.html',
        link: function (scope) {

            scope.isExceeded = false;


            scope.$on('timer-tick', function (e, data) {

                //scope.checkTimeExceed();
                if (data.millis && scope.queue.queueDetails && scope.queue.queueDetails.MaxWaitTime && data.millis >= (scope.queue.queueDetails.MaxWaitTime * 1000)) {
                    scope.isExceeded = true;

                }
                else {
                    scope.isExceeded = false;

                }

            });


        }
    }
});