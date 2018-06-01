/**
 * Created by team verry on 9/23/2016.
 */

agentApp.controller('agentDashboardCtrl', function ($scope, $rootScope, $http, $timeout, $filter, dashboradService,
                                                    ticketService, engagementService, profileDataParser,
                                                    authService, dashboardRefreshTime, myNoteServices, $anchorScroll,  fileService, chatService) {


    chatService.SubscribeDashboard("agent_dashboard_cnt_new",function (event) {

            console.log(event);
            switch (event.roomName) {

                case 'QUEUE:QueueDetail':

                    if (event.Message) {

                        //
                        if (event.Message.QueueInfo.CurrentMaxWaitTime) {
                            var d = moment(event.Message.QueueInfo.CurrentMaxWaitTime).valueOf();
                            event.Message.QueueInfo.MaxWaitingMS = d;
                        }

                        var item = event.Message.QueueInfo;
                        if (item.CurrentMaxWaitTime) {
                            var d = moment(item.CurrentMaxWaitTime).valueOf();
                            item.MaxWaitingMS = d;

                            if (item.EventTime) {

                                var serverTime = moment(item.EventTime).valueOf();
                                tempMaxWaitingMS = serverTime - d;
                                event.Message.QueueInfo.MaxWaitingMS = moment().valueOf() - tempMaxWaitingMS;

                            }
                        }

                        $scope.queueDetails[event.Message.QueueName] = event.Message;
                    } else {
                        console.log("No Message found");
                    }

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


    // var gradientFill = openclose.createLinearGradient(500, 0, 100, 0);
    // gradientFill.addColorStop(0, "rgba(143,213,57, 0.6)");
    // gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.0)");

    $scope.createVsOpenConfig = {
        type: 'line',
        data: {
            labels: $scope.dataRange,
            datasets: [{
                label: "Created Ticket",
                data: [],
                fill: true,
                lineTension: 0,
                /*lineTension: 0,*/
                borderDash: [0, 0],
                borderColor: "rgba(143,213,57,1)",
                backgroundColor: "rgba(143,213,57,0.2)",
                pointBorderColor: "rgba(143,213,57,0.2)",
                pointBackgroundColor: "rgba(143,213,57,1)",
                pointBorderWidth: 6
            }, {
                label: "Resolved Ticket",
                data: [],
                lineTension: 0,
                fill: true,
                /* lineTension: 0,*/
                borderDash: [0, 0],
                borderColor: "rgba(43,201,226,1)",
                backgroundColor: "rgba(70,205,115,0)",
                pointBorderColor: "rgba(43,201,226,0.2)",
                pointBackgroundColor: "rgba(43,201,226,1)",
                pointBorderWidth: 6
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
                        color: "rgba(244,245,244,0)",
                        zeroLineColor: "rgba(244,245,244,1)"
                    },
                    ticks: {
                        userCallback: function (dataLabel, index) {
                            return index % 3 === 0 ? dataLabel : '';
                        },
                        fontColor: '#223448',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'DAYS'
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        // fontColor: '#ebdfc7',
                        // fontSize: 13
                    }
                }], yAxes: [{
                    display: true,
                    beginAtZero: false,
                    gridLines: {
                        color: "rgba(244,245,244,1)",
                        zeroLineColor: "rgba(244,245,244,1)"

                    },
                    scaleLabel: {
                        display: true,
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
                        zeroLineColor: "rgba(244,245,244,1)"
                    },
                    ticks: {
                        userCallback: function (dataLabel, index) {
                            return index % 3 === 0 ? dataLabel : '';
                        },
                        fontColor: '#223448',
                        fontFamily: 'AvenirNextLTPro-Regular',
                        fontSize: 10
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'DAYS'
                        // fontFamily: 'AvenirNextLTPro-Regular',
                        // fontColor: '#ebdfc7',
                        // fontSize: 13
                    }
                }],
                yAxes: [{
                    display: true,
                    beginAtZero: false,
                    gridLines: {
                        color: "rgba(244,245,244,1)",
                        zeroLineColor: "rgba(244,245,244,1)"
                    },
                    scaleLabel: {
                        display: true,
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

    $.each($scope.deferenceConfig.data.datasets, function (i, dataset) {
        dataset.borderColor = "rgba(24,141,242,1)";
        dataset.backgroundColor = "rgba(24,141,242,0.6)";
        dataset.pointBorderColor = "rgba(24,141,242,1)";
        dataset.pointBackgroundColor = "rgba(24,141,242,0.5)";
        dataset.pointBorderWidth = 1;
    });
    // var deference = document.getElementById("deferencecanvas").getContext("2d");
    // window.deferenceChart = new Chart(deference, $scope.deferenceConfig);

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
        }
    };

    /* -------------------- Chart Configurations End-----------------------------------------*/


    $scope.userCompanyData = authService.GetCompanyInfo();


    function secondToHours(seconds) {
        return (seconds / 3600).toFixed(2);
    }

    $scope.productivity = {};
    var loadProductivity = function (id) {
        dashboradService.ProductivityByResourceId(id).then(function (response) {
            if (response) {

                if (response.length === 0)
                    return;
                $scope.doughnutData.datasets[0].data = [secondToHours(response.AcwTime), secondToHours(response.BreakTime),
                    secondToHours(response.OnCallTime), secondToHours(response.OutboundCallTime), secondToHours(response.IdleTime), secondToHours(response.HoldTime)];
                // window.myDoughnutChart.update();
                $scope.doughnutObj = {
                    labels: $scope.doughnutData.labels,
                    data: $scope.doughnutData.datasets[0].data
                };

                $scope.productivity.OnCallTime = response.OnCallTime.toString().toHHMMSS();
                $scope.productivity.StaffedTime = response.StaffedTime.toString().toHHMMSS();
                $scope.productivity.BreakTime = response.BreakTime.toString().toHHMMSS();
                $scope.productivity.OutboundCallTime = response.OutboundCallTime.toString().toHHMMSS();
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
    //ToDo
    //GetCreatedicketSeries();

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
    GetDeferenceResolvedTicketSeries();

    //
    $scope.queueDetails = {};
    var GetQueueDetails = function () {
        dashboradService.GetQueueDetails().then(function (response) {
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
    };
    GetQueueDetails();



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
        engagementService.GetEngagementSessions(1111, profileDataParser.RecentEngagements).then(function (response) {
            $scope.recentEngagements = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            // $scope.showAlert("Engagement Details", "error", "Fail To Load Recent Engagements.");
        });
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
        loadProductivity(authService.GetResourceId());
    };

    //ToDo
    var getAllRealTime = function () {
        //GetQueueDetails();
        //getAllRealTimeTimer = $timeout(getAllRealTime, 5000);
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
        GetQueueDetails();
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


    $scope.loadNotices = function () {

        dashboradService.getStoredNotices().then(function (res) {

            if (res.IsSuccess) {

                $scope.NoticeList = res.Result;

                $scope.NoticeListTemp = $scope.NoticeList.map(function (notice) {

                    if (notice.attachments && notice.attachments.length > 0) {
                        angular.forEach(notice.attachments, function (attachment) {

                            attachment.linkData = $scope.internalThumbFileUrl + "" + attachment.url + "/SampleAttachment";
                            console.log(attachment.linkData);
                            notice.linkData = $scope.internalThumbFileUrl + "" + attachment.url + "/SampleAttachment";
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
    }

    //**** END NOTICE *******//


}).config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        chartColors: ['#8DA97C',
            '#BECE60',
            '#AEE776',
            '#62D292',
            '#E6F23C',
            '#248C17',
            '#A4C5B5',
            '#2B9495',
            '#CAB63C']
    });
}]);


