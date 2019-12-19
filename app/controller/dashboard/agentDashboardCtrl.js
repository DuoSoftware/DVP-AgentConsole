/**
 * Created by team verry on 9/23/2016.
 */

agentApp.controller('agentDashboardCtrl', function ($scope, $rootScope, $http, $timeout, $filter, dashboradService,
                                                    ticketService, engagementService, profileDataParser,
                                                    authService, dashboardRefreshTime, myNoteServices, $anchorScroll, profileDataParser, fileService, chatService,userService) {

    $scope.myQueueDetails = {};

    // Kasun_Wijeratne_16_OCT_2018
    function objectify(array) {
        return array.reduce(function(p, c) {
            p[c[0]] = c[1];
            return p;
        }, {});
    }
    function calculateTotalQueued (queue) {
        var count = 0;
        queue.forEach(function (sq) {
            if(sq[1].QueueInfo.CurrentWaiting === 0) return;
            count += sq[1].QueueInfo.CurrentWaiting;
        });
        return count;
    }
    function setDescQueue (obj, type) {
        var objToArr = [];
        for (var o in obj) {
            objToArr.push([o, obj[o]]);
        }

        objToArr.sort(function(a, b) {
            return a[1].QueueInfo.CurrentWaiting - b[1].QueueInfo.CurrentWaiting;
        });
        var sortedArry = objToArr.reverse();

        if(type === 'my') {
            $scope.myTotalQueued = 0;
            $scope.myTotalQueued = calculateTotalQueued(sortedArry);
        } else {
            $scope.totalQueued = 0;
            $scope.totalQueued = calculateTotalQueued(sortedArry);
        }

        return objectify(sortedArry);
    }
    // END - Kasun_Wijeratne_16_OCT_2018

    $scope.$watch(function () {
		$scope.dashboardWidth = document.getElementById('tab_view').clientWidth;
	});

    chatService.SubscribeConnection("agent_dashboard", function (isConnected) {

        if (isConnected) {
            GetMyQueueData();
            $('#queue_details').removeClass('display-none');
            $('#queue_details_reload').addClass('display-none');
        } else {
            $scope.queueDetails = {};
            $scope.myQueueDetails = {};

            $('#queue_details').addClass('display-none');
            $('#queue_details_reload').removeClass('display-none');
        }
    });

    chatService.SubscribeDashboard("agentdashboard_controller_dashboard",function (event) {

            console.log(event);


            switch (event.roomName) {

                case 'QUEUE:QueueDetail':

                    if (event.Message) {
                        var queueID = "";
                        //
                        // if (event.Message.QueueInfo.CurrentMaxWaitTime) {
                        //     var d = moment(event.Message.QueueInfo.CurrentMaxWaitTime).valueOf();
                        //     event.Message.QueueInfo.MaxWaitingMS = d;
                        // }

                        var item = event.Message.queueDetail.QueueInfo;
                        if (item.CurrentMaxWaitTime) {
                            var d = moment(item.CurrentMaxWaitTime).valueOf();
                            item.MaxWaitingMS = d;

                            if (item.EventTime) {

                                var serverTime = moment(item.EventTime).valueOf();
                                tempMaxWaitingMS = serverTime - d;
                                item.MaxWaitingMS = moment().valueOf() - tempMaxWaitingMS;

                            }
                        }


                        var queueIDData = event.Message.queueDetail.QueueId.split('-');

                        queueIDData.forEach(function (item, i) {

                            if (i != queueIDData.length - 1) {
                                if (i == queueIDData.length - 2) {
                                    queueID = queueID + item;
                                }
                                else {
                                    queueID = queueID.concat(item, ":");
                                }

                            }

                        });


                        /*if (event.Message.QueueInfo.CurrentMaxWaitTime) {
                         var d = moment(event.Message.QueueInfo.CurrentMaxWaitTime).valueOf();
                         item.MaxWaitingMS = d;

                         if (event.Message.QueueInfo.EventTime) {

                         var serverTime = moment(event.Message.QueueInfo.EventTime).valueOf();
                         tempMaxWaitingMS = serverTime - d;
                         event.Message.QueueInfo.MaxWaitingMS = moment().valueOf() - tempMaxWaitingMS;

                         }

                         }*/
                        if ($scope.queueDetails[event.Message.queueDetail.QueueId]) {
                            if ($scope.queueDetails[event.Message.queueDetail.QueueId].queueDetails) {
                                event.Message.queueDetails = $scope.queueDetails[event.Message.queueDetail.QueueId].queueDetails;

                            }
                            $scope.safeApply(function () {

                                $scope.queueDetails[event.Message.queueDetail.QueueId] = event.Message.queueDetail;
                            });


                        }
                        else {
                            $scope.safeApply(function () {

                                $scope.queueDetails[event.Message.QueueId] = event.Message.queueDetail;
                            });

                           /* if (profileDataParser.myCallTaskID && profileDataParser.myResourceID) {
                                dashboradService.checkMyQueue(queueID, profileDataParser.myResourceID, profileDataParser.myCallTaskID).then(function (resQueue) {

                                    if (resQueue.data.Result && resQueue.data.Result.isMyQueue && resQueue.data.Result.queueDetails) {
                                        event.Message.queueDetails = resQueue.data.Result.queueDetails;

                                        $scope.safeApply(function () {

                                            $scope.myQueueDetails[event.Message.QueueId] = event.Message;
                                        });


                                    }
                                }, function (errQueue) {

                                    console.log("Error in checking My queue status");
                                });
                            }*/

                            if(profileDataParser.myQueues)
                            {
                                profileDataParser.myQueues.filter(function (queueItem) {

                                    if(queueID==queueItem.RecordID)
                                    {
                                        event.Message.queueDetails=queueItem;

                                        $scope.safeApply(function () {

                                            $scope.myQueueDetails[event.Message.queueDetail.QueueId] = event.Message.queueDetail;
                                        });
                                    }
                                });
                            }



                        }

                        //$scope.queueDetails[event.Message.QueueId] = event.Message;


                        if ($scope.myQueueDetails[event.Message.queueDetail.QueueId]) {

                            if ($scope.myQueueDetails[event.Message.queueDetail.QueueId].queueDetails) {
                                event.Message.queueDetails = $scope.myQueueDetails[event.Message.queueDetail.QueueId].queueDetails;
                            }

                            $scope.myQueueDetails[event.Message.queueDetail.QueueId] = event.Message.queueDetail;
                            $scope.safeApply(function () {

                                $scope.myQueueDetails[event.Message.queueDetail.QueueId] = event.Message.queueDetail;
                            });

                        }

                        /*
                         else {

                         if (profileDataParser.myCallTaskID) {
                         dashboradService.checkMyQueue(queueID, profileDataParser.myResourceID, profileDataParser.myCallTaskID).then(function (resQueue) {

                         if (resQueue.data.Result && resQueue.data.Result.queueDetails && resQueue.data.Result.isMyQueue) {
                         event.Message.queueDetails = resQueue.data.Result.queueDetails;
                         $scope.myQueueDetails[event.Message.QueueId] = event.Message;

                         $scope.safeApply(function () {

                         $scope.myQueueDetails[event.Message.QueueId] = event.Message;
                         });
                         $scope.safeApply(function () {

                         $scope.queueDetails[event.Message.QueueId] = event.Message;
                         });
                         }
                         }, function (errQueue) {
                         console.log("Error in checking My queue status");
                         });
                         }
                         }*/
                    } else {
                        console.log("No Message found");
                    }

                    // Kasun_Wijeratne_16_OCT_2018
                        $scope.myQueueDetails = setDescQueue($scope.myQueueDetails, 'my');
                        $scope.queueDetails = setDescQueue($scope.queueDetails, '');
                    // END - Kasun_Wijeratne_16_OCT_2018

                    break;
            }

        }
    );


    // call $anchorScroll()
    $anchorScroll();


    $scope.showNoticeModal = false;

    $scope.showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3',
        });
    };

    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    };

    $scope.dataRange = [];
    var enumerateDaysBetweenDates = function (startDate, endDate) {
        $scope.dataRange = [];

        var currDate = startDate.add('days', 1).clone().startOf('day');
        var lastDate = endDate.clone().startOf('day');

        while (currDate.add('days', 1).diff(lastDate) < 0) {
            $scope.dataRange.push(currDate.format("DD-MMM"));//$scope.dataRange.push(moment.unix(currDate.clone().toDate()).format("DD-MMM"));
        }
    };
    enumerateDaysBetweenDates(moment().subtract(1, 'month'), moment().add(1, 'days'));

    var randomColorFactor = function () {
        return Math.round(Math.random() * 255);
    };
    var randomColor = function (opacity) {
        return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
    };

    /* -------------------- Chart Configurations -----------------------------------------*/
    /*Open Vs Close Chart Configurations*/
    $scope.createVsOpenConfig = {
        type: 'line',
        data: {
            labels: $scope.dataRange,
            datasets: [{
                label: "Created Ticket",
                data: [],
                fill: true,
                /*lineTension: 0,*/
                borderDash: [0, 0],
                borderColor: "rgba(130,233,166,1)",
                backgroundColor: "rgba(130,233,166,0.4)",
                pointBorderColor: "rgba(130,233,166,0)",
                pointBackgroundColor: "rgba(130,233,166,0)",
                pointBorderWidth: 5
            }, {
                label: "Resolved Ticket",
                data: [],
                fill: true,
                /* lineTension: 0,*/
                borderDash: [0, 0],
                borderColor: "rgba(43,201,226,1)",
                backgroundColor: "rgba(43,201,226,0.5)",
                pointBorderColor: "rgba(43,201,226,0)",
                pointBackgroundColor: "rgba(43,201,226,0)",
                pointBorderWidth: 5
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true
            }, tooltips: {
                mode: 'label'
            },
            hover: {
                mode: 'label'
            },
            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: "rgba(244,245,244,0.5)",
                        zeroLineColor: "rgba(244,245,244,1)"
                    },
                    ticks: {
                        userCallback: function (dataLabel, index) {
                            return index % 3 === 0 ? dataLabel : '';
                        }
                    },
                    scaleLabel: {
                        display: false,
                        labelString: 'Days'
                    }
                }],
                yAxes: [{
                    display: true,
                    beginAtZero: false,
                    gridLines: {
                        color: "rgba(244,245,244,0.5)",
                        zeroLineColor: "rgba(244,245,244,1)"
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'COUNT'
                    }
                }]
            }
        }
    };

    // $.each($scope.createVsOpenConfig.data.datasets, function (i, dataset) {
    //     dataset.borderColor = "rgba(231,133,94,1)";
    //     dataset.backgroundColor = "rgba(231,133,94,0.6)";
    //     dataset.pointBorderColor = "rgba(231,133,94,1)";
    //     dataset.pointBackgroundColor = "rgba(231,133,94,0.5)";
    //     dataset.pointBorderWidth = 1;
    // });

    var openclose = null;


    var openclose = document.getElementById("openclosecanvas").getContext("2d");
    window.opencloseChart = new Chart(openclose, $scope.createVsOpenConfig);

    /* Deference  Chart Configurations*/
    $scope.deferenceConfig = {
        type: 'line',
        data: {
            labels: $scope.dataRange,
            datasets: [{
                label: "Deference",
                data: [],
                fill: true,
                /*lineTension: 0,*/
                borderDash: [0, 0],
                borderColor: "rgba(255,170,0,1)",
                backgroundColor: "rgba(255,170,0,0.1)",
                pointBorderColor: "rgba(14,23,86,0)",
                pointBackgroundColor: "rgba(14,23,86,0)",
                pointBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: false,
                labels: {
                    fontColor: 'red'
                }
            },
            title: {
                display: false
            }, tooltips: {
                mode: 'label'
            },
            hover: {
                mode: 'label'
            },
            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: "rgba(244,245,244,0)",
                        zeroLineColor: "rgba(244,245,244,0)"
                    },
                    ticks: {
                        userCallback: function (dataLabel, index) {
                            return '';
                        },
                        fontColor: '#223448',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    },
                    scaleLabel: {
                        display: false,
                        labelString: 'DAYS'
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        // fontColor: '#ebdfc7',
                        // fontSize: 13
                    }
                }],
                yAxes: [{
                    display: false,
                    beginAtZero: false,
                    gridLines: {
                        color: "rgba(244,245,244,0)",
                        zeroLineColor: "rgba(244,245,244,1)"

                    },
                    scaleLabel: {
                        display: false,
                        labelString: 'COUNT'
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        // fontColor: '#ebdfc7',
                        // fontSize: 13
                    },
                    ticks: {
                        fontColor: '#223448',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    }
                }]
            }
        }
    };

    $scope.ticketDeferenceConfig = {
        type: 'line',
        data: {
            labels: $scope.dataRange,
            datasets: [{
                label: "Deference",
                data: [],
                fill: true,
                /*lineTension: 0,*/
                borderDash: [0, 0]
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: false,
                labels: {
                    fontColor: 'red'
                }
            },
            title: {
                display: false
            }, tooltips: {
                mode: 'label'
            },
            hover: {
                mode: 'label'
            },
            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: "rgba(244,245,244,0)",
                        zeroLineColor: "rgba(244,245,244,0)"
                    },
                    ticks: {
                        userCallback: function (dataLabel, index) {
                            return index % 3 === 0 ? dataLabel : '';
                        },
                        fontColor: '#fff',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    },
                    scaleLabel: {
                        display: false,
                        labelString: 'DAYS',
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        fontColor: '#fff'
                        // fontSize: 13
                    }
                }],
                yAxes: [{
                    display: false,
                    beginAtZero: false,
                    gridLines: {
                        color: "rgba(244,245,244,0.3)",
                        zeroLineColor: "rgba(244,245,244,1)"

                    },
                    scaleLabel: {
                        display: false,
                        labelString: 'COUNT'
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        // fontColor: '#ebdfc7',
                        // fontSize: 13
                    },
                    ticks: {
                        fontColor: '#223448',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    }
                }]
            }
        }
    };

    $.each($scope.ticketDeferenceConfig.data.datasets, function (i, dataset) {
        dataset.borderColor = "rgba(24,141,242,1)";
        dataset.backgroundColor = "rgba(24,141,242,0.6)";
        dataset.pointBorderColor = "rgba(24,141,242,1)";
        dataset.pointBackgroundColor = "rgba(24,141,242,0.5)";
        dataset.pointBorderWidth = 1;
    });
    var deference = document.getElementById("deferencecanvas").getContext("2d");
    window.deferenceChart = new Chart(deference, $scope.deferenceConfig);

    /*productivity*/
    $scope.doughnutData = {
        labels: ["ACW", "Break", "InCall", "OutCall", "Idle", "Hold"],
        datasets: [
            {
                data: [0, 0, 0, 0, 0]
            }]
    };
    // var doughnutChart = document.getElementById("doughnutChart");
    // ,
    // backgroundColor: [
    //     "#45eaca",
    //     "#ebdfc7",
    //     "#098a6c",
    //     "#223448"
    // ],
    //     hoverBackgroundColor: [
    //     "#ffa918",
    //     "#36A2EB",
    //     "#37dba9",
    //     "#8298ae",
    //     "#d90000"
    // ],
    //     borderWidth: [0, 0, 0, 0, 0],

    // window.myDoughnutChart = new Chart(doughnutChart, {
    //     type: 'doughnut',
    //     data: $scope.doughnutData,
    //     options: {
    //         responsive: false,
    //         title: {
    //             display: false
    //         },
    //         legend: {
    //             display: true,
    //             position: 'bottom',
    //             padding: 5,
    //             labels: {
    //                 fontColor: 'rgb(130, 152, 174)',
    //                 fontSize: 10,
    //                 boxWidth: 10
    //             }
    //         }
    //     }
    // });
    // doughnutChart.setAttribute("style", "width: 300px;height: 300px;margin-top: 15px;");


    //update doughnutChar damith

    $scope.options = {
        type: 'doughnut',
        responsive: false,
        legend: {
            display: true,
            position: 'bottom',
            padding: 5,
            labels: {
                fontColor: 'rgb(130, 152, 174)',
                fontSize: 10,
                boxWidth: 10
            }
        },
        title: {
            display: true
        },
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.labels[tooltipItem.index];
                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ': ' + secondsToTime(datasetLabel) ;
                }
            }
        }
    };

    function secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        return hours + ":" + minutes + ":" + seconds;
    }

    /* -------------------- Chart Configurations End-----------------------------------------*/


    $scope.userCompanyData = authService.GetCompanyInfo();



    $scope.productivity = {};
    var loadProductivity = function (id) {
        dashboradService.ProductivityByResourceId(id).then(function (response) {
            if (response) {

                if (response.length === 0)
                    return;
                $scope.doughnutData.datasets[0].data = [response.AcwTime, response.BreakTime,
                    response.OnCallTime, response.OutboundCallTime, response.IdleTime, response.HoldTime];
                // window.myDoughnutChart.update();
                $scope.doughnutObj = {
                    labels: $scope.doughnutData.labels,
                    data: $scope.doughnutData.datasets[0].data
                };
                console.log( response.AcwTime);
                console.log( response.HoldTime);
                $scope.productivity.OnCallTime = response.OnCallTime.toString().toHHMMSS();
                $scope.productivity.InboundCallTime = response.InboundCallTime.toString().toHHMMSS();
                $scope.productivity.StaffedTime = response.StaffedTime.toString().toHHMMSS();
                $scope.productivity.BreakTime = response.BreakTime.toString().toHHMMSS();
                $scope.productivity.OutboundCallTime = response.OutboundCallTime.toString().toHHMMSS();
                $scope.productivity.OutboundTime = response.OutboundTime.toString().toHHMMSS();
                $scope.productivity.AcwTime = response.AcwTime.toString().toHHMMSS();
                $scope.productivity.HoldTime = response.HoldTime.toString().toHHMMSS();
                $scope.productivity.AvgTalkTimeInbound = response.AvgTalkTimeInbound.toString().toHHMMSS();
                $scope.productivity.AvgTalkTimeOutbound = response.AvgTalkTimeOutbound.toString().toHHMMSS();
                $scope.productivity.IncomingCallCount = response.IncomingCallCount;
                $scope.productivity.MissCallCount = response.MissCallCount;
                $scope.productivity.TransferCallCount = response.TransferCallCount;
                $scope.productivity.OutgoingCallCount = response.OutgoingCallCount;
            } else {
                //$scope.showAlert("Productivity", "error", "Fail To Load Productivity.");
            }

        }, function (err) {
            authService.IsCheckResponse(err);
            // $scope.showAlert("Productivity", "error", "Fail To Load Productivity.");
        });
    };
    loadProductivity(authService.GetResourceId());

    $scope.newTicketCount = 0;
    var GetOpenTicketCount = function () {
        dashboradService.GetCurrentTicketCount('NEWTICKET').then(function (response) {
            $scope.newTicketCount = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.newTicketCount = 0;
            //$scope.showAlert("Ticket", "error", "Fail To Load Tickets.");
        });
    };
    GetOpenTicketCount();

    $scope.closeTicketCount = 0;
    var GetResolveTicketCount = function () {
        dashboradService.GetCurrentTicketCount('CLOSEDTICKET').then(function (response) {
            $scope.closeTicketCount = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.closeTicketCount = 0;
            //$scope.showAlert("Ticket", "error", "Fail To Load Tickets.");
        });
    };
    GetResolveTicketCount();

    $scope.ProgressTicketCount = 0;
    var GetProgressTicketCount = function () {
        dashboradService.GetCurrentTicketCount('PROGRESSINGTICKET').then(function (response) {
            $scope.ProgressTicketCount = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.ProgressTicketCount = 0;
            $scope.showAlert("Ticket", "error", "Fail To Load Tickets.");
        });
    };
    GetProgressTicketCount();

    var GetCreatedicketSeries = function () {
        dashboradService.GetCreatedTicketSeries().then(function (response) {
            if (angular.isArray(response)) {
                $scope.createVsOpenConfig.data.datasets[0].data = response.map(function (c, index) {
                    return c[0] ? Math.ceil(c[0]) : 0;
                });
                window.opencloseChart.update();
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            //$scope.showAlert("Ticket", "error", "Fail To Load Tickets Data.");
        });
    };
    GetCreatedicketSeries();

    var GetResolvedTicketSeries = function () {
        dashboradService.GetResolvedTicketSeries().then(function (response) {
            if (angular.isArray(response)) {
                $scope.createVsOpenConfig.data.datasets[1].data = response.map(function (c, index) {
                    return c[0] ? Math.ceil(c[0]) : 0;
                });
                window.opencloseChart.update();
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            // $scope.showAlert("Ticket", "error", "Fail To Load Tickets Data.");
        });
    };
    GetResolvedTicketSeries();

    var GetDeferenceResolvedTicketSeries = function () {
        dashboradService.GetDeferenceResolvedTicketSeries().then(function (response) {
            if (angular.isArray(response)) {
                $scope.deferenceConfig.data.datasets[0].data = response.map(function (c, index) {
                    return c[0] ? Math.ceil(c[0]) : 0;
                });
                window.deferenceChart.update();
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            //$scope.showAlert("Ticket", "error", "Fail To Load Tickets Data.");
        });
    };
    //ToDo
    //GetDeferenceResolvedTicketSeries();

    //
    $scope.totalQueued = 0;
    $scope.myTotalQueued = 0;

    $scope.queueDetails = {};
    var GetQueueDetails = function () {
        dashboradService.GetQueueDetails().then(function (response) {
            if (response) {
                response.forEach(function (item) {


                    if (item.QueueInfo.CurrentMaxWaitTime && item.QueueInfo.CurrentMaxWaitTime != 0) {
                        var d = moment(item.QueueInfo.CurrentMaxWaitTime).valueOf();
                        item.QueueInfo.MaxWaitingMS = d;
                    }


                    var queueIDData = item.QueueId.split('-');

                    var queueID = "";
                    queueIDData.forEach(function (qItem, i) {

                        if (i != queueIDData.length - 1) {
                            if (i == queueIDData.length - 2) {
                                queueID = queueID + qItem;
                            }
                            else {
                                queueID = queueID.concat(qItem, ":");
                            }

                        }

                    });

                    if (item.QueueInfo.CurrentMaxWaitTime) {
                        var d = moment(item.QueueInfo.CurrentMaxWaitTime).valueOf();
                        item.QueueInfo.MaxWaitingMS = d;

                        if (item.QueueInfo.EventTime) {

                            var serverTime = moment(item.QueueInfo.EventTime).valueOf();
                            tempMaxWaitingMS = serverTime - d;
                            item.QueueInfo.MaxWaitingMS = moment().valueOf() - tempMaxWaitingMS;

                        }

                    }


                    if ($scope.queueDetails[item.QueueId]) {

                        if ($scope.queueDetails[item.QueueId].queueDetails) {
                            item.queueDetails = $scope.queueDetails[item.QueueId].queueDetails;
                        }

                        $scope.safeApply(function () {

                            $scope.queueDetails[item.QueueId] = item;
                        });

                    }
                    else {
                        $scope.safeApply(function () {

                            $scope.queueDetails[item.QueueId] = item;
                        });
                    }


                    if ($scope.myQueueDetails[item.QueueId]) {
                        if ($scope.myQueueDetails[item.QueueId].queueDetails) {
                            item.queueDetails = $scope.myQueueDetails[item.QueueId].queueDetails;
                        }


                        $scope.safeApply(function () {

                            $scope.myQueueDetails[item.QueueId] = item;
                        });

                    }
                    else {

                        if(profileDataParser.myQueues)
                        {
                            profileDataParser.myQueues.filter(function (myItem) {

                                if(myItem.RecordID==queueID)
                                {
                                    myItem.queueDetails=myItem;
                                    $scope.safeApply(function () {

                                        $scope.myQueueDetails[item.QueueId] = myItem;
                                    });
                                }
                            })
                        }
                    }


                });

                // Kasun_Wijeratne_16_OCT_2018
                $scope.myQueueDetails = setDescQueue($scope.myQueueDetails, 'my');
                $scope.queueDetails = setDescQueue($scope.queueDetails, '');
                // END - Kasun_Wijeratne_16_OCT_2018
            }
        }, function (err) {
            if (getAllRealTimeTimer) {
                $timeout.cancel(getAllRealTimeTimer);
            }
            //authService.IsCheckResponse(err);
            $scope.queueDetails = {};
            // $scope.showAlert("Queue Details", "error", "Fail To Load Queue Details.");
        });
    };

    var loadQueueDataWithBuSkills = function()
    {

        var paramObj ={
            bu:undefined,
            grpId:undefined
        };
        if(profileDataParser&&profileDataParser.myBusinessUnit)
        {
            paramObj.bu=profileDataParser.myBusinessUnit;
        }
        if(profileDataParser && profileDataParser.myProfile && profileDataParser.myProfile.group && profileDataParser.myProfile.group._id )
        {
            paramObj.grpId=profileDataParser.myProfile.group._id;
        }
        dashboradService.getMyQueueDataWithBuAndGroupSkills(authService.GetResourceId(),paramObj).then(function (resQueues) {

            profileDataParser.myQueues= profileDataParser.myQueues.concat(resQueues.data.Result);
            GetQueueDetails();

        },function (errQueues) {
            $scope.showAlert("Queue Details", "error", "Fail To Load My Queue Details.");
            GetQueueDetails();
        });
    }

    var GetMyQueueData = function () {



        if(profileDataParser && !profileDataParser.myProfile)
        {
            userService.getMyProfileDetails().then(function (response) {
                if (response.data.IsSuccess) {
                    profileDataParser.myProfile = response.data.Result;
                    profileDataParser.myBusinessUnit = (profileDataParser.myProfile.group && profileDataParser.myProfile.group.businessUnit) ? profileDataParser.myProfile.group.businessUnit : 'default';
                    loadQueueDataWithBuSkills();
                }
                else {
                    $scope.showAlert("Queue Details", "error", "Fail To Load My Queue Details.");
                    GetQueueDetails();
                }
            });
        }
        else{
            loadQueueDataWithBuSkills();
        }




    };
    GetMyQueueData();



    /* var GetMyQueueDetails = function () {
     console.log(profileDataParser.myProfile);
     dashboradService.getMyQueueDetails().then(function (response) {
     if (response) {
     response.forEach(function (item) {


     if (item.QueueInfo.CurrentMaxWaitTime && item.QueueInfo.CurrentMaxWaitTime != 0) {
     var d = moment(item.QueueInfo.CurrentMaxWaitTime).valueOf();
     item.QueueInfo.MaxWaitingMS = d;
     }

     $scope.queueDetails[item.QueueName] = item;


     });
     }
     }, function (err) {
     if (getAllRealTimeTimer) {
     $timeout.cancel(getAllRealTimeTimer);
     }
     //authService.IsCheckResponse(err);
     $scope.queueDetails = {};
     // $scope.showAlert("Queue Details", "error", "Fail To Load Queue Details.");
     });
     }

     GetMyQueueDetails();*/


    $scope.recentTickets = [];
    var GetMyRecentTickets = function () {
        ticketService.GetMyRecentTickets().then(function (response) {
            $scope.recentTickets = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            // $scope.showAlert("Ticket Details", "error", "Fail To Load Ticket Details.");
        });
    };
    GetMyRecentTickets();

    $scope.recentEngagements = [];
    var GetMyRecentEngagements = function () {
       /* engagementService.GetEngagementSessions(1111, profileDataParser.RecentEngagements).then(function (response) {
            $scope.recentEngagements = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            // $scope.showAlert("Engagement Details", "error", "Fail To Load Recent Engagements.");
        }); data not displayed in new UI. ????????*/
    };
    GetMyRecentEngagements();

    $scope.viewTicket = function (data) {
        data.tabType = 'ticketView';
        data.index = data.reference;
        $rootScope.$emit('openNewTab', data);
    };


    $scope.refreshTime = parseInt(dashboardRefreshTime);
    var loadGrapData = function () {
        GetDeferenceResolvedTicketSeries();
        GetResolvedTicketSeries();
        GetCreatedicketSeries();
        loadProductivity(authService.GetResourceId());
    };

    var loadRecentData = function () {
        GetMyRecentEngagements();
        GetMyRecentTickets();
        GetOpenTicketCount();
        GetResolveTicketCount();
        GetProgressTicketCount();
        loadProductivity(authService.GetResourceId());
    };

    var getAllRealTime = function () {
        //GetQueueDetails();
        getAllRealTimeTimer = $timeout(getAllRealTime, 5000);
    };


    var loadRecentDataTimer = $timeout(loadRecentData, $scope.refreshTime * 300);
    var loadGrapDataTimer = $timeout(loadGrapData, $scope.refreshTime * 36000);
    //var getAllRealTimeTimer = $timeout(getAllRealTime, 5000);
    //var getQueueDetails = $timeout(getAllRealTime, 5000);

    $scope.$on("$destroy", function () {
        /*if (getAllRealTimeTimer) {
         $timeout.cancel(getAllRealTimeTimer);
         }*/
        if (loadRecentDataTimer) {
            $timeout.cancel(loadRecentDataTimer);
        }
        if (loadGrapDataTimer) {
            $timeout.cancel(loadGrapDataTimer);
        }
        if (getAllRealTime) {
            $timeout.cancel(loadGrapDataTimer);
        }

        chatService.UnsubscribeConnection("agent_dashboard");
        // if(getQueueDetails){
        //     $timeout.cancel(getQueueDetails);ƒ
        // }
    });
    $scope.isLoadinDashboard = false;
    $scope.dashboardReload = function () {
        $scope.isLoadinDashboard = true;
        getAllRealTime();
        loadRecentData();
        loadGrapData();
        //GetQueueDetails();
        GetMyQueueData();

        $scope.isLoadinDashboard = false;
    };
    $scope.dashboardReload();

    //update code by damith
    /**** rating ****/
    $scope.rate = 7;
    $scope.max = 10;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };

    $scope.ratingStates = [
        {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    ];

    $scope.uiBratingValue = "5";


    //$scope.myProfileId = profile.myProfileId;
    //$scope.pickMyRatings($scope.myProfileId);

    //####### ************************************************* /////
    //******** UPDATE CODE DAMITH MY NOTE ******//
    $scope.myDate = {};
    //sample test layout
    $scope.noteLists = [];
    $scope.note = {};
    $scope.note.priority = 'low';
    $scope.myDate = moment(new Date());
    $scope.isLoadinMyNote = false;
    //UI FUNCTIONS
    var uiFuntions = function () {
        return {
            loadingMyNote: function () {
                $('#loadinMyNote').removeClass('display-none');
                $('#myNoteEmty').addClass('display-none');
            },
            foundMyNote: function () {
                $('#loadinMyNote').addClass('display-none');
                $('#myNoteEmty').addClass('display-none');
            },
            myNoteNotFound: function () {
                $('#loadinMyNote').addClass('display-none');
                $('#myNoteEmty').removeClass('display-none')
            }
        }
    }();


    //get all my notes
    $scope.myNoteServices = function () {
        return {
            getAllNote: function () {
                //uiFuntions.loadingMyNote();
                myNoteServices.GetAllMyToDo().then(function (res) {
                    if (res.data.IsSuccess) {
                        $scope.noteLists = res.data.Result.map(function (item) {

                            //item.sizex = "";
                            //item.sizeY= "100";
                            if (angular.isUndefined(item.due_at)) {
                                item.dueDate = false;
                            } else {
                                item.dueDate = true;
                            }

                            return item;

                        });
                        if ($scope.noteLists.length == 0) {
                            //uiFuntions.myNoteNotFound();
                            return;
                        }
                        uiFuntions.foundMyNote();
                    }
                }, function (err) {
                    authService.IsCheckResponse(err);
                    console.log(err);
                    //showAlert('Reminder Note', 'error', 'Error in GetAllMyToDo');
                    //uiFuntions.myNoteNotFound();
                });
            }
        }
    }();
    $scope.myNoteServices.getAllNote();

    //#Delete my note
    $scope.myNoteDelete = function ($index, note) {
        myNoteServices.DeleteMyNote(note).then(function (res) {
            if (res.data.IsSuccess) {
                //$('#' + note._id).addClass('fadeOutLeft');
                showAlert('Reminder Note', 'success', 'Delete Todo Successful..');
                $scope.noteLists.splice($index, 1);
                if ($scope.noteLists.length == 0) {
                    //uiFuntions.myNoteNotFound();
                    return;
                }
                //uiFuntions.foundMyNote();

            } else {
                showAlert('Reminder Note', 'success', res.data.CustomMessage);
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            console.log(err);
            showAlert('Reminder Note', 'error', 'Error in DeleteMyNote');
        });
    };
    //end


    //#Reminder me main functions
    $scope.reminderMe = function () {
        var loadingReminder = function () {
            $('#reminderSelect').addClass('display-none');
            $('#reminderLoading').removeClass('display-none');
        };
        //
        var loadedReminder = function () {
            $('#reminderLoading').addClass('display-none');
            $('#reminderSelect').removeClass('display-none');
        };

        return {
            create: function ($index, note) {
                //$('#reminderMode').removeClass('display-none');
                //('html, body').animate({scrollTop: 0}, 'fast');
                $scope.reminderObj = note;
            },
            close: function () {
                $('#dateTimeWrp').addClass('display-none').removeClass('display-block');
            },
            createDueDate: function () {
                loadingReminder();
                var myDate = $('#dueTimePicker').val();
                console.log(myDate);
                myNoteServices.ReminderMyNote($scope.reminderObj, myDate).then(function (res) {
                    console.log(res);
                    loadedReminder();
                    if (res.data.IsSuccess) {
                        showAlert('Reminder Note', 'success', 'Reminder saved successfully');
                        $scope.reminderMe.close();
                        //due_at
                    } else {
                        showAlert('Reminder Note', 'error', res.data.CustomMessage);
                    }

                }, function (err) {
                    loadedReminder();
                    authService.IsCheckResponse(err);
                    console.log(err);
                    showAlert('Reminder Note', 'error', 'Error in DeleteMyNote');

                });
            },
            checkMyNote: function (note) {
                myNoteServices.CheckMyNote(note).then(function (res) {
                    if (res.data.IsSuccess) {
                        note.check = true;
                        showAlert('Reminder Note', 'success', res.data.CustomMessage);
                    }

                }, function (err) {
                    console.log(err);
                });
            }


        }

    }();
    //end

    //#Addnew note
    $scope.addNewNote = function () {

        var loadingSave = function () {
            $('#enableSaveNotebtn').addClass('display-none');
            $('#loadingSaveNote').removeClass('display-none');
        };
        //
        var loadedSave = function () {
            $('#loadingSaveNote').addClass('display-none');
            $('#enableSaveNotebtn').removeClass('display-none');
        };

        return {
            close: function () {
                $('#addNoteWindow').addClass('display-none');
                $('#addNoteRow').removeClass('display-none');
            },
            done: function (title, priority, note) {
                $scope.note = {};
                $scope.note.priority = 'default-color';
                var note = {
                    title: title,
                    priority: priority,
                    note: note
                };


                console.log(note);
                if (note) {
                    if (!note.title && !note.note) {
                        showAlert('Reminder Note', 'error', "Filed required..");
                        return;
                    }
                }
                loadingSave();
                myNoteServices.CreateMyNote(note).then(function (res) {
                    loadedSave();
                    if (res.data.IsSuccess) {

                        if (res.data.Result) {
                            item = res.data.Result;
                            item.dueDate = false;
                            //item.sizeY = "auto";

                            $scope.noteLists.push(item);
                            $scope.note.priority = 'low';

                        }
                        if ($scope.noteLists.length == 0) {
                            //uiFuntions.myNoteNotFound();
                            return;
                        }
                        //uiFuntions.foundMyNote();
                        $("#newTicket").removeClass('elastic');
                        showAlert('Reminder Note', 'success', 'Note Created Successfully.');
                    }
                }, function (err) {
                    loadedSave();
                    authService.IsCheckResponse(err);
                    showAlert('Reminder Note', 'success', 'Error in CreateMyNote');
                    console.log(err);
                });

            },
            selectColor: function (priority) {
                $scope.note.priority = priority;
            }
        }
    }();


    var clientY = 0;
    $scope.isOpenDueDatetimeView = false;
    $scope.mouseCoordinate = function ($event) {
        //if (!$scope.isOpenDueDatetimeView) {
        $scope.y = $event.clientY;
        //}
    };

    var mouseX;
    var mouseY;
    $(document).mousemove(function (e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });


    $scope.openDueTimeView = function ($event, note) {
        $('#dateTimeWrp').addClass('display-block');
        var x = $event.clientX;
        var y = $event.clientY;
        var coor = "X coords: " + x + ", Y coords: " + y;
        var offset = $("#dateTimeWrp").offset();
        $scope.reminderObj = note;
        // $scope.isOpenDueDatetimeView = true;
        $('#dateTimeWrp').css({'top': mouseY - 200, 'left': mouseX}).fadeIn('slow');
    };


    //**** END MY NOTE *******//

    //**** START NOTICE *******//
    $scope.NoticeList;
    $rootScope.$on('noticeReceived', function (events, args) {
        //$scope.NoticeList.push(args);
        $scope.loadNotices();
    });


    $scope.isImage = function (fileType) {


        if (fileType && fileType.toString().split("/")[0] == "image") {
            return true;
        }
        else {
            return false;
        }


    };


    $scope.internalThumbFileUrl = baseUrls.fileService + "InternalFileService/File/Download/" + $scope.userCompanyData.tenant + "/" + $scope.userCompanyData.company + "/";
    $scope.FileServiceUrl = baseUrls.fileService + "InternalFileService/File/Download/" + $scope.userCompanyData.tenant + "/" + $scope.userCompanyData.company + "/";

    $scope.downloadAttachment = function (attachment) {
        fileService.downloadAttachment(attachment);
    };

    $scope.viewImage = function (attachment) {
        if ($scope.isImage(attachment.type)) {
            document.getElementById("image-viewer").href = $scope.FileServiceUrl + attachment.url + "/SampleAttachment";

            $('#image-viewer').trigger('click');
        }

    }


    $scope.NoticeListTemp = [];

    $scope.NoticeObj = {};


    $scope.showNotice = function (notice) {
        $scope.showNoticeModal = true;
        $scope.NoticeObj = notice;


        if (notice.from) {
            if ($filter('filter')(profileDataParser.assigneeUsers, {_id: notice.from})) {
                $scope.NoticeObj.senderAvatar = $filter('filter')(profileDataParser.assigneeUsers, {_id: notice.from})[0].avatar;
                $scope.NoticeObj.senderName = $filter('filter')(profileDataParser.assigneeUsers, {_id: notice.from})[0].username;
            }
            else if ($filter('filter')($scope.userGroups, {name: notice.from})) {
                $scope.NoticeObj.senderAvatar = $filter('filter')(profileDataParser.assigneeUserGroups, {_id: notice.from})[0].avatar;
                $scope.NoticeObj.senderName = $filter('filter')(profileDataParser.assigneeUserGroups, {_id: notice.from})[0].name;
            }
        }


    };

    $scope.hideNoticeDetails = function () {
        $scope.showNoticeModal = false;
    };

    //**** END NOTICE *******//


    //get user activity
    var getUserActivityList = function () {
        dashboradService.GetAgentActivity().then(function (res) {
            console.log(res);
            if (res && res.Result) {
                $scope.agentActivitysObj = res.Result;
            }
        });
    };
    getUserActivityList();


    //update screen resize

    window.onload = window.onresize = function () {
        var height = $("#grphCreateVsOpen").outerHeight();
        //console.log(height);

        $('#ticketSummary').css('height', height);

    };

    //get agent performance
    var getAgentPerformance = function (id) {
        dashboradService.GetAgentPerformance(id).then(function (res) {
            if (res && res.Result) {
                $scope.agentPerformance = res.Result;
            }
        });
    };
    getAgentPerformance(authService.GetResourceId());

    $scope.isCheckPerfomance = function (val) {
        var intValue = parseInt(val);
        if (intValue > 0) {
            return true;
        } else {
            return false;
        }
    };

    $scope.isMyQueue = false;

    $scope.changeQueueView = function (_queueView) {
        switch (_queueView) {
            case 'all':
                $('#allQueue').addClass('active');
                $('#myQueue').removeClass('active');
                $scope.isMyQueue = false;

                break;
            case 'my':
                $('#allQueue').removeClass('active');
                $('#myQueue').addClass('active');
                $scope.isMyQueue = true;
                $scope.myQueueDetails = setDescQueue($scope.myQueueDetails, 'my');

                break;
        }
    };

    $scope.createNewNote = function (_windowType) {
        if (_windowType == 'close') {
            $("#newTicket").removeClass('elastic');
        } else {
            $("#newTicket").addClass('elastic');
        }
    };

    $scope.loadNotices = function () {

        dashboradService.getStoredNotices().then(function (res) {

            if (res.IsSuccess) {

                $scope.NoticeList = res.Result;

                $scope.NoticeListTemp = $scope.NoticeList.map(function (notice) {

                    if (notice.attachments && notice.attachments.length > 0) {
                        angular.forEach(notice.attachments, function (attachment) {

                            attachment.linkData = $scope.internalThumbFileUrl + "" + attachment.url + "/SampleAttachment";
                            notice.linkData = $scope.internalThumbFileUrl + "" + attachment.url + "/SampleAttachment";

                            var _type = attachment.type.split('/');
                            notice.type = _type[0];
                            notice.extension = _type[1];
                        });


                    }

                    return notice;
                });

            }
            else {
                $scope.showAlert("Error", "error", "Failed to load notices");
            }
        }, function (err) {
            $scope.showAlert("Error", "error", "Error in loading notices");
        })

    }

    $scope.loadNotices();


}).config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        chartColors: ['#66597D',
            '#42B4AF',
            '#E86F7D',
            '#62D292',
            '#2B82BE',
            '#F07A2E',
            '#76DDFB',
            '#021B45',
            '#CAB63C']
    });
}]).filter('orderObjectBy', function () {
    return function (input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }
        array.sort(function (a, b) {
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
});