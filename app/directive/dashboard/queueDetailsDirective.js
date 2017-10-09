/**
 * Created by Pawan on 10/3/2017.
 */



agentApp.directive('queuedetails', function ($timeout) {
    return {
        restrict: "EA",
        scope: {
            queue: "="
        },
        templateUrl: 'app/views/dashboard/partials/queueDetails.html',
        link: function (scope) {
            scope.isNotified = false;
            scope.isExceeded = false;


            scope.$on('timer-tick', function (e) {


                if (scope.queue.QueueInfo.CurrentMaxWaitTime != 0 && scope.queue.queueDetails.MaxWaitTime) {

                    var curMaxTime = moment(scope.queue.QueueInfo.CurrentMaxWaitTime);
                    var curTime = moment(moment.now());

                    var diffTime = curTime.diff(curMaxTime);

                    if (diffTime > (scope.queue.queueDetails.MaxWaitTime * 1000)) {

                        scope.isExceeded = true;
                        scope.isNotified = true;

                    }
                    else {
                        scope.isExceeded = false;
                        scope.isNotified = false;
                    }


                }
                else {
                    scope.isExceeded = false;
                    scope.isNotified = false;
                }

            });


        }
    }
});