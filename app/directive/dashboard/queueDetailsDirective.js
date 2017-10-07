agentApp.directive('queuedetails', function ($timeout) {
    return {
        restrict: "EA",
        scope: {
            queue: "="
        },
        templateUrl: 'app/views/dashboard/partials/queueDetails.html',
        link: function (scope) {
            scope.isNotified = false;
            scope.isExceeded=false;
            scope.checkTimeExceed = function () {


                if(scope.queue.QueueInfo.CurrentMaxWaitTime !=0 && scope.queue.queueDetails && scope.queue.queueDetails.MaxWaitTime)
                {
                    var diffTime= moment().diff(moment(scope.queue.QueueInfo.CurrentMaxWaitTime),'seconds',true);
                    if(diffTime>scope.queue.queueDetails.MaxWaitTime)
                    {
                        scope.isExceeded=true;
                        scope.isNotified = true;
                    }
                    else
                    {
                        scope.isExceeded=false;
                        scope.isNotified = false;
                    }
                }
                else
                {
                    scope.isExceeded=false;
                    scope.isNotified = false;
                }





              /*  if(scope.queue.QueueInfo.CurrentMaxWaitTime !=0  && scope.queue.QueueInfo.EventTime && scope.queue.queueDetails.MaxWaitTime)
                {




                    if (scope.queue.QueueInfo.CurrentMaxWaitTime) {

                        var currWait =0;
                        var d = moment(scope.queue.QueueInfo.CurrentMaxWaitTime).valueOf();

                        if (scope.queue.QueueInfo.EventTime) {

                            var serverTime = moment(scope.queue.QueueInfo.EventTime).valueOf();
                            tempMaxWaitingMS = serverTime - d;

                            var myTime = moment().valueOf();

                            var timeDiff= myTime-tempMaxWaitingMS;



                            if(tempMaxWaitingMS==0)
                            {
                                currWait=myTime-d;
                            }
                            else
                            {
                                currWait=timeDiff;
                            }

                            if(currWait>(scope.queue.queueDetails.MaxWaitTime*1000))
                            {
                                scope.isExceeded=true;
                                scope.isNotified = true;
                            }
                            else
                            {
                                scope.isExceeded=false;
                                scope.isNotified = false;
                            }

                        }
                    }


                    /!* var curMaxTime =  moment(scope.queue.QueueInfo.CurrentMaxWaitTime);
                     var curTime =moment(moment.now());
                     var diffTime = curTime.diff(curMaxTime);
                     if(diffTime>(scope.queue.queueDetails.MaxWaitTime*1000))
                     {
                     scope.isExceeded=true;
                     scope.isNotified = true;
                     }
                     else
                     {
                     scope.isExceeded=false;
                     scope.isNotified = false;
                     }*!/



                }
                else
                {
                    scope.isExceeded=false;
                    scope.isNotified = false;
                }*/
            }
            scope.checkTimeExceed();

            scope.$on('timer-tick',function (e) {

                scope.checkTimeExceed();

            });







        }
    }
});