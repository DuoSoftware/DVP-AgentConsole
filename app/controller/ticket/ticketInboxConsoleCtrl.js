agentApp.controller('ticketInboxConsoleCtrl', function ($scope, $rootScope,$q, $sce, mailInboxService,
                                                        profileDataParser, authService, $http,
                                                        $anchorScroll, ticketService) {

    $scope.config = {
        preload: "auto",
        tracks: [
            {
                src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                kind: "subtitles",
                srclang: "en",
                label: "English",
                default: ""
            }
        ],
        theme: {
            url: "bower_components/videogular-themes-default/videogular.css"
        },
        "analytics": {
            "category": "Videogular",
            "label": "Main",
            "events": {
                "ready": true,
                "play": true,
                "pause": true,
                "stop": true,
                "complete": true,
                "progress": 10
            }
        }
    };

    var videogularAPI = null;
    $scope.isPlay = false;
    $scope.onPlayerReady = function (API) {
        videogularAPI = API;

    };
    $scope.closePlayer = function () {
        videogularAPI.stop();
        $scope.isPlay = false;
    };
    $scope.onPlayerComplete = function (api) {
        $scope.closePlayer();
    };

    $scope.playFile = function (id, ticket) {

        if (videogularAPI && id) {
            var info = authService.GetCompanyInfo();
            var fileToPlay = baseUrls.fileService + 'FileService/File/DownloadLatest/' + id + '.mp3';

            $http({
                method: 'GET',
                url: fileToPlay,
                responseType: 'blob'
            }).then(function successCallback(response) {
                if (response.data) {
                    var url = URL.createObjectURL(response.data);
                    var arr = [
                        {
                            src: $sce.trustAsResourceUrl(url),
                            type: 'audio/mp3'
                        }
                    ];

                    $scope.config.sources = arr;
                    videogularAPI.play();
                    $scope.isPlay = true;
                    if(ticket.status != 'listened')
                    {
                        $scope.changeTicketStatusToListened(ticket)
                    }

                }
            }, function errorCallback(response) {


            });


        }


    };

    $scope.changeTicketStatusToClose = function (ticket) {

        var bodyObj =
            {
                status: 'closed'
            };

        ticketService.updateTicketStatus(ticket._id, bodyObj).then(function (response) {
            if (response.data.IsSuccess) {
                ticket.status = 'closed';
                $scope.showAlert("Status changed", "success", "Ticket status changed to Close");
            }
            else {
                $scope.showAlert("Error", "error", "Failed to change Ticket status to Close");
            }

        }), function (error) {
            $scope.showAlert("Error", "error", "Failed to change Ticket status to Close");
        }
    };

    $scope.changeTicketStatusToListened = function (ticket) {

        var bodyObj =
            {
                status: 'listened'
            };

        ticketService.updateTicketStatus(ticket._id, bodyObj).then(function (response) {
            if (response.data.IsSuccess) {
                ticket.status = 'listened';
                $scope.showAlert("Status changed", "success", "Ticket status changed to listened");
            }
            else {
                $scope.showAlert("Error", "error", "Failed to change Ticket status to listened");
            }

        }), function (error) {
            $scope.showAlert("Error", "error", "Failed to change Ticket status to listened");
        }
    };


    //ticket inbox

    $anchorScroll();
    //update new UI code
    var getWindowHeight = function (callback) {
        var height = window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        return callback(height);
    };

    var ticketWindowDynamicHeight = function () {
        getWindowHeight(function (height) {
            document.getElementById('inboxToggleLeft').style.height = height + "px";
            // document.getElementById('inboxRightWrapper').style.height = height - 230 + "px";
            document.getElementById('ticketListView').style.height = height - 230 + "px";
            document.getElementById('inboxToggleLeft').style.height = height - 100 + "px";
            $scope.ticketListHeight = height - 265 + "px";
            $scope.filterMenuScroller = height - 140 + "px";
        });
    };
    ticketWindowDynamicHeight();

    $scope.channel="all";
    $scope.showticketview = 'app/views/ticket/inbox/template/inbox-list-view.html';

    $(function () {
        $(window).resize(function () {
            ticketWindowDynamicHeight();
        });


    });

//all left toggle up
    $scope.isCollapsedInbox = true;
    $scope.isCollapsedMyTicket = false;
    $scope.isCollapsedGroupTicketr = true;
    $scope.isCollapsedFilter = true;
    $scope.isCollapsedSubmitted = true;
    $scope.isCollapsedWatchedByMe = true;
    $scope.isCollapsedCollaboratedByMe = true;
    $scope.isCollapsedVM = true;

//onload sort type
    $scope.sortType = 'updated_at';
    $scope.channel = 'all';
    $scope.pageSize = 20;


//ticket view object
    $scope.ticketList = [];
    $scope.currentSelected = {
        "name": '',
        "totalCount": ''
    };

    $scope.ticketCountObj = {
        'toDo': 0,
        'new': 0,
        'done': 0,
        'inProgress': 0,
        myTicket: {
            'myToDo': 0,
            'myNew': 0,
            'myDone': 0,
            'myInProgress': 0
        },
        myGroup: {
            'toDo': 0,
            'new': 0,
            'done': 0,
            'inProgress': 0
        },
        submittedByMe: {
            'toDo': 0,
            'new': 0,
            'done': 0,
            'inProgress': 0
        },
        watchedByMe: {
            'toDo': 0,
            'new': 0,
            'done': 0,
            'inProgress': 0
        },
        collaboratedByMe: {
            'toDo': 0,
            'new': 0,
            'done': 0,
            'inProgress': 0
        },
        voicemail:{
            'open':0,
            'closed':0
        }
    };
    var ticketListObj = {
        '_id': '',
        'subject': '',
        'channel': '',
        'priority': '',
        'status': '',
        'type': '',
        'updated_at': '',
        'submitter_name': '',
        'submitter_avatar': ''
    };


//UI funtion
//ticket inbox UI funtion

    var ticketUIFun = function () {
        return {
            loadingMainloader: function () {
                $('#ticketMainLoader').removeClass('display-none');
            },
            loadedMainLoader: function () {
                $('#ticketMainLoader').addClass('display-none');
            },
            loadingNewCount: function () {
                $('#newCountLoaded').addClass('display-none');
                $('#newCountLoading').removeClass('display-none');
            },
            loadedNewCount: function () {
                $('#newCountLoaded').removeClass('display-none');
                $('#newCountLoading').addClass('display-none');
            },
            loadingToDo: function () {
                $('#toDoCountLoaded').addClass('display-none');
                $('#todoCountLoading').removeClass('display-none');
            },
            loadedToDo: function () {
                $('#toDoCountLoaded').removeClass('display-none');
                $('#todoCountLoading').addClass('display-none');
            },
            loadingInProgress: function () {
                $('#inProgressCountLoaded').addClass('display-none');
                $('#inProgressCountLoading').removeClass('display-none');
            },
            loadedInProgress: function () {
                $('#inProgressCountLoaded').removeClass('display-none');
                $('#inProgressCountLoading').addClass('display-none');
            },
            loadingDone: function () {
                $('#doneCountLoaded').addClass('display-none');
                $('#doneCountLoading').removeClass('display-none');
            },
            loadedDone: function () {
                $('#doneCountLoaded').removeClass('display-none');
                $('#doneCountLoading').addClass('display-none');
            },
            loadingRefreshBtn: function () {
                $('#btnRefreshLoading').removeClass('display-none');
                $('#btnRefresh').addClass('display-none');
            },
            loadedRefreshBtn: function () {
                $('#btnRefreshLoading').addClass('display-none');
                $('#btnRefresh').removeClass('display-none');
            }

        }
    }();

    var setQuearyString = function (category) {
        var checkStatus="";
        if(profileDataParser.statusNodes[category] && profileDataParser.statusNodes[category].length>0)
        {

            angular.forEach(profileDataParser.statusNodes[category],function (node,index) {

                if(index!=(profileDataParser.statusNodes[category].length-1))
                {
                    checkStatus+="status="+node+"&";
                }
                else
                {
                    checkStatus+="status="+node;
                    return checkStatus;

                }
            });
            return checkStatus;

        }
        else
        {
            return checkStatus;
        }
    }

//Ticket Inbox
//private function
    var inboxPrivateFunction = function () {
        return {
            //get all new ticket count
            newTicketListCount: function (status) {
                var deferred = $q.defer();
                //new count
                ticketUIFun.loadingNewCount();
                var qString=setQuearyString("TODO");

                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }

                ticketService.getAllCountByTicketStatus(qString).then(function (res) {
                    ticketUIFun.loadedNewCount();
                    $scope.ticketCountObj.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;

                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            toDoListCount: function () {
                var deferred = $q.defer();
                //todo ticket
                ticketUIFun.loadingToDo();
                var qString=setQuearyString("INPROGRESS");
                /* ticketService.getAllCountByTicketStatus('open&status=progressing').then(function (res) {
                 ticketUIFun.loadedToDo();
                 $scope.ticketCountObj.toDo = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.toDo = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
                ticketService.getAllCountByTicketStatus(qString).then(function (res) {
                    ticketUIFun.loadedToDo();
                    $scope.ticketCountObj.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            inProgressTicketListCount: function () {
                var deferred = $q.defer();
                //progressing ticket
                ticketUIFun.loadingInProgress();
                var qString=setQuearyString("INPROGRESS");
                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
                /*ticketService.getAllCountByTicketStatus('progressing').then(function (res) {
                 ticketUIFun.loadedInProgress();
                 $scope.ticketCountObj.inProgress = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.inProgress = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                ticketService.getAllCountByTicketStatus(qString).then(function (res) {
                    ticketUIFun.loadedInProgress();
                    $scope.ticketCountObj.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            doneTicketListCount: function () {
                var deferred = $q.defer();
                //closed ticket
                ticketUIFun.loadingDone();
                var qString=setQuearyString("DONE");
                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
                /*ticketService.getAllCountByTicketStatus('parked&status=solved&status=closed').then(function (res) {
                 ticketUIFun.loadedDone();
                 $scope.ticketCountObj.done = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.done = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                ticketService.getAllCountByTicketStatus(qString).then(function (res) {
                    ticketUIFun.loadedDone();
                    $scope.ticketCountObj.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            vmTicketListCountOpen: function () {
                var deferred = $q.defer();
                //closed ticket
                ticketUIFun.loadingDone();
                //var qString=setQuearyString("DONE");

                /*ticketService.getAllCountByTicketStatus('parked&status=solved&status=closed').then(function (res) {
                 ticketUIFun.loadedDone();
                 $scope.ticketCountObj.done = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.done = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                ticketService.getVoicemailTicketCount('status=new&status=listened').then(function (res) {
                    ticketUIFun.loadedDone();
                    $scope.ticketCountObj.voicemail.open = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.voicemail.open = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            vmTicketListCountClose: function () {
                var deferred = $q.defer();
                //closed ticket
                ticketUIFun.loadingDone();
                //var qString=setQuearyString("DONE");

                /*ticketService.getAllCountByTicketStatus('parked&status=solved&status=closed').then(function (res) {
                 ticketUIFun.loadedDone();
                 $scope.ticketCountObj.done = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.done = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                ticketService.getVoicemailTicketCount('status=closed').then(function (res) {
                    ticketUIFun.loadedDone();
                    $scope.ticketCountObj.voicemail.closed = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.voicemail.closed = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            //get count my ticket
            myTicketNewTicketCount: function () {
                var deferred = $q.defer();
                //new ticket
                var qString=setQuearyString("TODO");
                /*ticketService.getAllCountByMyticketStatus('new').then(function (res) {
                 $scope.ticketCountObj.myTicket.myNew = 0;
                 if (res && res.data && res.data.Result) {
                 $scope.ticketCountObj.myTicket.myNew = res.data.Result;
                 $scope.currentSelected.totalCount = res.data.Result;
                 }
                 });*/
                ticketService.getAllCountByMyticketStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myTicket.myNew = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myNew = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            }, myTicketToDoTicketCount: function () {
                var deferred = $q.defer();
                //todo
                /*ticketService.getAllCountByMyticketStatus('open&status=progressing').then(function (res) {
                    $scope.ticketCountObj.myTicket.myToDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myToDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                var qString=setQuearyString("INPROGRESS");
                ticketService.getAllCountByMyticketStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myTicket.myToDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myToDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                        deferred.resolve(res.data.Result);
                    }
                    else
                        deferred.resolve(undefined);
                });
                return deferred.promise;
            },
            myTicketInProgressTicketCount: function () {
                var deferred = $q.defer();
                //progressing
                /*ticketService.getAllCountByMyticketStatus('progressing').then(function (res) {
                    $scope.ticketCountObj.myTicket.myInProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myInProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                var qString=setQuearyString("INPROGRESS");
                ticketService.getAllCountByMyticketStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myTicket.myInProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myInProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            myTicketDoneTicketCount: function () {
                var deferred = $q.defer();
                //closed ticket
                var qString=setQuearyString("DONE");
                /*ticketService.getAllCountByMyticketStatus('parked&status=solved&status=closed').then(function (res) {
                    $scope.ticketCountObj.myTicket.myDone = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myDone = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getAllCountByMyticketStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myTicket.myDone = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myTicket.myDone = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            //get count my group
            groupTicketNewTicketCount: function () {
                var deferred = $q.defer();
                //new ticket
                var qString=setQuearyString("TODO");
                /*ticketService.getCountByMyGroupStatus('new').then(function (res) {
                    $scope.ticketCountObj.myGroup.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getCountByMyGroupStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myGroup.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            groupTicketToDoTicketCount: function () {
                var deferred = $q.defer();
                //todo
                /*ticketService.getCountByMyGroupStatus('open&status=progressing').then(function (res) {
                    $scope.ticketCountObj.myGroup.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                var qString=setQuearyString("INPROGRESS");
                ticketService.getCountByMyGroupStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myGroup.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            groupTicketProgressingTicketCount: function () {
                var deferred = $q.defer();
                //progressing
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getCountByMyGroupStatus('progressing').then(function (res) {
                    $scope.ticketCountObj.myGroup.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getCountByMyGroupStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myGroup.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            groupTicketClosedicketCount: function () {
                var deferred = $q.defer();
                /*ticketService.getCountByMyGroupStatus('parked&status=solved&status=closed').then(function (res) {
                    $scope.ticketCountObj.myGroup.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                var qString=setQuearyString("DONE");
                ticketService.getCountByMyGroupStatus(qString).then(function (res) {
                    $scope.ticketCountObj.myGroup.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.myGroup.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            //ticket filter
            getTicketFilterCount: function (item, e) {
                var deferred = $q.defer();
                item.count = 0;
                ticketService.GetTicketCountByView(item._id).then(function (response) {
                    item.count = response;
                    //$filter('filter')($scope.views, {_id: item._id},true)[0].count=response;
                    deferred.resolve(true);
                }, function (err) {
                    authService.IsCheckResponse(err);
                    $scope.showAlert("Get View Count", "error", "Fail To Count.")
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            //ticket submitted by me
            submittedTicketNewCount: function () {
                var deferred = $q.defer();
                //new
                var qString=setQuearyString("TODO");
                /*ticketService.getTicketsCount('TicketsSubmittedByMe', 'new').then(function (res) {
                    $scope.ticketCountObj.submittedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsSubmittedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.submittedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            submittedTicketToDoCount: function () {
                var deferred = $q.defer();
                //todo
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsSubmittedByMe', 'open&status=progressing').then(function (res) {
                    $scope.ticketCountObj.submittedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsSubmittedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.submittedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            submittedTicketProgressingCount: function () {
                var deferred = $q.defer();
                //progressing
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsSubmittedByMe', 'progressing').then(function (res) {
                    $scope.ticketCountObj.submittedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/

                ticketService.getTicketsCount('TicketsSubmittedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.submittedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            submittedTicketClosedCount: function () {
                var deferred = $q.defer();
                //closed
                /*ticketService.getTicketsCount('TicketsSubmittedByMe', 'parked&status=solved&status=closed').then(function (res) {
                    $scope.ticketCountObj.submittedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                var qString=setQuearyString("DONE");
                ticketService.getTicketsCount('TicketsSubmittedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.submittedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.submittedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            //ticket watched by me
            watchedTicketNewCount: function () {
                var deferred = $q.defer();
                //new
                var qString=setQuearyString("DONE");
               /* ticketService.getTicketsCount('TicketsWatchedByMe', 'new').then(function (res) {
                    $scope.ticketCountObj.watchedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsWatchedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.watchedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            watchedTicketToDoCount: function () {
                var deferred = $q.defer();
                //todo
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsWatchedByMe', 'open&status=progressing').then(function (res) {
                    $scope.ticketCountObj.watchedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsWatchedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.watchedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            watchedTicketProgressCount: function () {
                var deferred = $q.defer();
                //in progressing
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsWatchedByMe', 'progressing').then(function (res) {
                    $scope.ticketCountObj.watchedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsWatchedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.watchedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            watchedTicketDoneCount: function () {
                var deferred = $q.defer();
                //done
                var qString=setQuearyString("DONE");
               /* ticketService.getTicketsCount('TicketsWatchedByMe', 'parked&status=solved&status=closed').then(function (res) {
                    $scope.ticketCountObj.watchedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
               ticketService.getTicketsCount('TicketsWatchedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.watchedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.watchedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            //ticket collaborated by me
            collaboratedTicketNewCount: function () {
                var deferred = $q.defer();
                //new
                var qString=setQuearyString("TODO");
               /* ticketService.getTicketsCount('TicketsCollaboratedByMe', 'new').then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
               ticketService.getTicketsCount('TicketsCollaboratedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.new = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.new = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }deferred.resolve(true);
                });
                return deferred.promise;
            },
            collaboratedTicketToDoCount: function () {
                var deferred = $q.defer();
                //todo
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsCollaboratedByMe', 'open&status=progressing').then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsCollaboratedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.toDo = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.toDo = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            collaboratedTicketInProgressingCount: function () {
                var deferred = $q.defer();
                //todo
                var qString=setQuearyString("INPROGRESS");
                /*ticketService.getTicketsCount('TicketsCollaboratedByMe', 'progressing').then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
                ticketService.getTicketsCount('TicketsCollaboratedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.inProgress = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.inProgress = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            collaboratedTicketDoneCount: function () {
                var deferred = $q.defer();
                //todo
                var qString=setQuearyString("DONE");
               /* ticketService.getTicketsCount('TicketsCollaboratedByMe', 'parked&status=solved&status=closed').then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                });*/
               ticketService.getTicketsCount('TicketsCollaboratedByMe', qString).then(function (res) {
                    $scope.ticketCountObj.collaboratedByMe.done = 0;
                    if (res && res.data && res.data.Result) {
                        $scope.ticketCountObj.collaboratedByMe.done = res.data.Result;
                        $scope.currentSelected.totalCount = res.data.Result;
                    }
                   deferred.resolve(true);
                });
                return deferred.promise;
            },
            picketFilterInboxList: function (currentFilter, page) {
                var deferred = $q.defer();
                ticketUIFun.loadingMainloader();
                var channel_type=$scope.channel;
                if(channel_type && channel_type.toLowerCase()!="all")
                {
                    ticketService.GetTicketsByView(currentFilter._id, page, $scope.sortType, $scope.pageSize,channel_type).then(function (response) {
                        ticketUIFun.loadedMainLoader();
                        if (response) {
                            $scope.ticketList = response.map(function (item, val) {
                                ticketListObj = {};
                                ticketListObj._id = item._id;
                                ticketListObj.tid = item.tid;
                                ticketListObj.subject = item.subject;
                                ticketListObj.channel = item.channel;
                                ticketListObj.priority = item.priority;
                                ticketListObj.status = item.status;
                                ticketListObj.type = item.type;
                                ticketListObj.updated_at = item.updated_at;
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                ticketListObj.assignee_name = '';
                                if (item.assignee) {
                                    ticketListObj.assignee_name = item.assignee.firstname + " " + item.assignee.lastname;
                                    ticketListObj.assignee_avatar = item.assignee.avatar;
                                } else {
                                    if (item.assignee_group) {
                                        ticketListObj.assignee_name = item.assignee_group.name;
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    } else {
                                        ticketListObj.assignee_name = 'unAssigned';
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    }
                                }
                                return ticketListObj;
                            });
                        }
                        deferred.resolve(true);
                    }, function (error) {
                        authService.IsCheckResponse(error);
                        console.log(error);
                        deferred.resolve(true);
                    });
                }
                else
                {
                    ticketService.GetTicketsByView(currentFilter._id, page, $scope.sortType, $scope.pageSize).then(function (response) {
                        ticketUIFun.loadedMainLoader();
                        if (response) {
                            $scope.ticketList = response.map(function (item, val) {
                                ticketListObj = {};
                                ticketListObj._id = item._id;
                                ticketListObj.tid = item.tid;
                                ticketListObj.subject = item.subject;
                                ticketListObj.channel = item.channel;
                                ticketListObj.priority = item.priority;
                                ticketListObj.status = item.status;
                                ticketListObj.type = item.type;
                                ticketListObj.updated_at = item.updated_at;
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                ticketListObj.assignee_name = '';
                                if (item.assignee) {
                                    ticketListObj.assignee_name = item.assignee.firstname + " " + item.assignee.lastname;
                                    ticketListObj.assignee_avatar = item.assignee.avatar;
                                } else {
                                    if (item.assignee_group) {
                                        ticketListObj.assignee_name = item.assignee_group.name;
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    } else {
                                        ticketListObj.assignee_name = 'unAssigned';
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    }
                                }
                                return ticketListObj;
                            });
                        }
                        deferred.resolve(true);
                    }, function (error) {
                        authService.IsCheckResponse(error);
                        console.log(error);
                        deferred.resolve(true);
                    });
                }

                return deferred.promise;
            },
            picketTicketInboxList: function (page, status, ticketType) {
                var deferred = $q.defer();
                console.log($scope.sortType);
                var channel_type=$scope.channel;

                if(ticketType === 'openvm' || ticketType === 'closedvm'){
                    channel_type = 'voicemail';
                    ticketType = 'Tickets';
                }

                ticketUIFun.loadingMainloader();

                if(channel_type && channel_type.toLowerCase()!="all")
                {
                    ticketService.getAllTicketsWithChannelFilter(page, status, ticketType, $scope.sortType, $scope.pageSize,channel_type).then(function (response) {
                        ticketUIFun.loadedMainLoader();
                        if (response && response.data && response.data.Result) {
                            $scope.ticketList = response.data.Result.map(function (item, val) {
                                ticketListObj = {};
                                ticketListObj._id = item._id;
                                ticketListObj.tid = item.tid;
                                ticketListObj.subject = item.subject;
                                ticketListObj.channel = item.channel;
                                ticketListObj.priority = item.priority;
                                ticketListObj.status = item.status;
                                ticketListObj.engagement_session = item.engagement_session;
                                ticketListObj.type = item.type;
                                ticketListObj.updated_at = item.updated_at;
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                if (item.assignee) {
                                    ticketListObj.assignee_name = item.assignee.firstname + " " + item.assignee.lastname;
                                    ticketListObj.assignee_avatar = item.assignee.avatar;
                                } else {
                                    if (item.assignee_group) {
                                        ticketListObj.assignee_name = item.assignee_group.name;
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    } else {
                                        ticketListObj.assignee_name = 'unAssigned';
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    }
                                }
                                return ticketListObj;
                            });

                        }
                        deferred.resolve(true);
                    }, function (error) {
                        authService.IsCheckResponse(error);
                        console.log(error);
                        deferred.resolve(true);
                    });
                }
                else
                {
                    ticketService.getAllTickets(page, status, ticketType, $scope.sortType, $scope.pageSize).then(function (response) {
                        ticketUIFun.loadedMainLoader();
                        if (response && response.data && response.data.Result) {
                            $scope.ticketList = response.data.Result.map(function (item, val) {
                                ticketListObj = {};
                                ticketListObj._id = item._id;
                                ticketListObj.tid = item.tid;
                                ticketListObj.subject = item.subject;
                                ticketListObj.channel = item.channel;
                                ticketListObj.priority = item.priority;
                                ticketListObj.engagement_session = item.engagement_session;
                                ticketListObj.status = item.status;
                                ticketListObj.type = item.type;
                                ticketListObj.updated_at = item.updated_at;
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                if (item.assignee) {
                                    ticketListObj.assignee_name = item.assignee.firstname + " " + item.assignee.lastname;
                                    ticketListObj.assignee_avatar = item.assignee.avatar;
                                } else {
                                    if (item.assignee_group) {
                                        ticketListObj.assignee_name = item.assignee_group.name;
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    } else {
                                        ticketListObj.assignee_name = 'unAssigned';
                                        ticketListObj.assignee_avatar = 'assets/img/avatar/defaultProfile.png';
                                    }
                                }
                                return ticketListObj;
                            });

                        }
                        deferred.resolve(true);
                    }, function (error) {
                        authService.IsCheckResponse(error);
                        console.log(error);
                        deferred.resolve(true);
                    });
                }





                return deferred.promise;
            }
        }
    }();


    $scope.openTicketView = function (_viewType, _selectedViewObj, selectedFilter, page, clickEvent) {
        $scope.showticketview = 'app/views/ticket/inbox/template/inbox-list-view.html';
        $scope.ticketList = [];
        $scope.currentSelected.name = _viewType;
        $scope.currentSelected.totalCount = _selectedViewObj;
        $scope.isFilter = false;
        if (clickEvent != 'goToPage') {
            page = 1;
            $scope.currentPage = page;
        } else {
            page = page ? page : '1';
        }
        _viewType = selectedFilter ? 'filter' : _viewType;
        switch (_viewType) {
            //ticket inbox
            case 'to do':
                var qString=setQuearyString("TODO");

                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
               /* inboxPrivateFunction.picketTicketInboxList(page, 'new', 'Tickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'Tickets');
                break;
            case 'in progress':
                var qString=setQuearyString("INPROGRESS");
                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
                /*inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'Tickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'Tickets');
                break;
            // case 'progressing':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'progressing', 'Tickets');
            //     break;
            case 'done':
                var qString=setQuearyString("DONE");
                if(profileDataParser.myBusinessUnit)
                {
                    qString = qString + '&businessunit=' + profileDataParser.myBusinessUnit;
                }
               /* inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'Tickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'Tickets');
                break;
            //my  ticket
            case 'my to do':
                var qString=setQuearyString("TODO");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'new', 'MyTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyTickets');
                break;
            case 'my in progress':
                var qString=setQuearyString("INPROGRESS");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'MyTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyTickets');
                break;
            case 'my Done':
                var qString=setQuearyString("DONE");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'MyTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyTickets');
                break;
            // case 'my group to do':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'MyTickets');
            //     break;
            //my Group ticket
            case 'my group in progress':

                var qString=setQuearyString("INPROGRESS");

                /*inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'MyGroupTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyGroupTickets');
                break;
            case 'my group to do':
                var qString=setQuearyString("TODO");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'new', 'MyGroupTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyGroupTickets');
                break;
            // case 'my group in progress':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'progressing', 'MyGroupTickets');
            //     break;
            case 'my group done':
                var qString=setQuearyString("DONE");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'MyGroupTickets');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'MyGroupTickets');
                break;
            //ticket filter
            case 'filter':
                $scope.selectedFilter = selectedFilter;
                $scope.isFilter = true;
                inboxPrivateFunction.picketFilterInboxList(selectedFilter, page);
                break;
            //ticket submitted by me
            case'submitted by me to do':
                var qString=setQuearyString("TODO");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'new', 'TicketsSubmittedByMe');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsSubmittedByMe');
                break;
            case'submitted by me in progress':
                var qString=setQuearyString("INPROGRESS");
                //inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'TicketsSubmittedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsSubmittedByMe');
                break;
            // case'submitted by me progress':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'progressing', 'TicketsSubmittedByMe');
            //     break;
            case'submitted by me done':
                var qString=setQuearyString("DONE");
                //inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'TicketsSubmittedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsSubmittedByMe');
                break;
            //ticket watched by me
            case'watched by me to do':
                var qString=setQuearyString("TODO");
                //inboxPrivateFunction.picketTicketInboxList(page, 'new', 'TicketsWatchedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsWatchedByMe');
                break;
            case'watched by me in progress':
                var qString=setQuearyString("INPROGRESS");
               // inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'TicketsWatchedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsWatchedByMe');
                break;
            // case'watched by me inProgress':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'progressing', 'TicketsWatchedByMe');
            //     break;
            case'watched by me done':
                var qString=setQuearyString("DONE");
                /*inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'TicketsWatchedByMe');*/
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsWatchedByMe');
                break;
            //ticket collaborated by me
            case'collaborated by me to do':
                var qString=setQuearyString("TODO");
                //inboxPrivateFunction.picketTicketInboxList(page, 'new', 'TicketsCollaboratedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsCollaboratedByMe');
                break;
            case'collaborated by me in progress':
                var qString=setQuearyString("INPROGRESS");
               // inboxPrivateFunction.picketTicketInboxList(page, 'open&status=progressing', 'TicketsCollaboratedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsCollaboratedByMe');
                break;
            // case'collaborated by me progress':
            //     inboxPrivateFunction.picketTicketInboxList(page, 'progressing', 'TicketsCollaboratedByMe');
            //     break;
            case'collaborated by me done':
                var qString=setQuearyString("DONE");
                //inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'TicketsCollaboratedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, qString, 'TicketsCollaboratedByMe');
                break;

            case'openvm':
                $scope.currentSelected.name = 'Voicemail - Open';
                $scope.showticketview = 'app/views/ticket/inbox/template/inbox-voicemaillist-view.html';
                //inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'TicketsCollaboratedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, 'status=new&status=listened', 'openvm');
                break;

            case'closedvm':
                $scope.currentSelected.name = 'Voicemail - Closed';
                $scope.showticketview = 'app/views/ticket/inbox/template/inbox-voicemaillist-view.html';
                //inboxPrivateFunction.picketTicketInboxList(page, 'parked&status=solved&status=closed', 'TicketsCollaboratedByMe');
                inboxPrivateFunction.picketTicketInboxList(page, 'status=closed', 'closedvm');
                break;

        }
    };


//goto view ticket filter
    $scope.goToFilterTicketView = function (_viewType, _selectedViewObj, selectedFilter, clickEvent) {
        $scope.isFilter = true;
        $scope.selectedFilter = selectedFilter;
        //$scope.ticketList = [];
        $scope.currentSelected.name = _viewType;
        $scope.currentSelected.totalCount = _selectedViewObj;

        if (clickEvent != 'goToPage') {
            page = 1;
            $scope.currentPage = page;
        } else {
            page = page ? page : '1';
        }
        inboxPrivateFunction.picketFilterInboxList(selectedFilter, '1');
    };


//ticket filter


    $scope.loadTicketFilterViews = function (e) {
        ticketService.GetTicketViews().then(function (response) {
            $scope.views = response;
            angular.forEach($scope.views, function (item) {
                inboxPrivateFunction.getTicketFilterCount(item);
            });
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("load Views", "error", "Fail To Load View List.");
        });
    };
    $scope.loadTicketFilterViews();


//ticket list pagination
// $scope.getPageData = function () {
//    // console.log($scope.currentPage);
//
//     $scope.openTicketView($scope.currentSelected.name,
//         $scope.currentSelected.totalCount,
//         '',
//         $scope.currentPage, )
// };


    $scope.currentPage = 1;

    $scope.goToPagination = function () {
        $scope.openTicketView($scope.currentSelected.name,
            $scope.currentSelected.totalCount, $scope.selectedFilter,
            $scope.currentPage, 'goToPage');
    };


//goto ticket view
    $scope.gotoTicket = function (data) {
        data.tabType = 'ticketView';
        data.reference = data._id;
        $rootScope.$emit('openNewTab', data);
    };

//todo test


    getJSONData($http, 'filters', function (data) {
        $scope.jsonFilterObj = data;
    });
    getJSONData($http, 'inboxFilters', function (data) {
        $scope.jsonInboxObj = data;
    });

    getJSONData($http, 'toDo', function (data) {
        $scope.jsonToDoObj = data;
    });

    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.Items, function (item) {
            item.Selected = $scope.selectedAll;
        });

    };

    $scope.numberOfPages = function () {
        return Math.ceil($scope.getData().length / $scope.pageSize);
    };

// for (var i = 0; i < 65; i++) {
//     $scope.data.push("Item " + i);
// };


//on change sort ticket

    $scope.onChangeSortTicktList = function (sortType,channel) {
        $scope.openTicketView($scope.currentSelected.name, $scope.currentSelected.totalCount, $scope.selectedFilter, '1',"");
    };
    /*$scope.onChangeChannelTicktList = function (channelType) {
        $scope.openTicketView($scope.currentSelected.name, $scope.currentSelected.totalCount, $scope.selectedFilter, '1',"",channelType);
    };*/


    var loadMyDefulatTicketView = function () {

        var arr = [];


        ticketUIFun.loadingRefreshBtn();

        //my ticket inbox count
        arr.push(inboxPrivateFunction.myTicketToDoTicketCount());
        arr.push(inboxPrivateFunction.myTicketNewTicketCount());
        arr.push(inboxPrivateFunction.myTicketInProgressTicketCount());
        arr.push(inboxPrivateFunction.myTicketDoneTicketCount());

        //inbox count
        arr.push(inboxPrivateFunction.toDoListCount());
        arr.push(inboxPrivateFunction.newTicketListCount());
        arr.push(inboxPrivateFunction.inProgressTicketListCount());
        arr.push(inboxPrivateFunction.doneTicketListCount());
        arr.push(inboxPrivateFunction.vmTicketListCountOpen());
        arr.push(inboxPrivateFunction.vmTicketListCountClose());



        //my Group inbox count
        arr.push(inboxPrivateFunction.groupTicketNewTicketCount());
        arr.push(inboxPrivateFunction.groupTicketToDoTicketCount());
        arr.push(inboxPrivateFunction.groupTicketProgressingTicketCount());
        arr.push(inboxPrivateFunction.groupTicketClosedicketCount());

        //submitted by me
        arr.push(inboxPrivateFunction.submittedTicketNewCount());
        arr.push(inboxPrivateFunction.submittedTicketToDoCount());
        arr.push(inboxPrivateFunction.submittedTicketProgressingCount());
        arr.push(inboxPrivateFunction.submittedTicketClosedCount());

        //watched by me
        arr.push(inboxPrivateFunction.watchedTicketNewCount());
        arr.push( inboxPrivateFunction.watchedTicketToDoCount());
        arr.push(inboxPrivateFunction.watchedTicketProgressCount());
        arr.push(inboxPrivateFunction.watchedTicketDoneCount());

        //collaborated by me
        arr.push(inboxPrivateFunction.collaboratedTicketNewCount());
        arr.push(inboxPrivateFunction.collaboratedTicketToDoCount());
        arr.push(inboxPrivateFunction.collaboratedTicketInProgressingCount());
        arr.push(inboxPrivateFunction.collaboratedTicketDoneCount());





        $q.all(arr).then(function(resolveData)
        {

            //init load todoList
            $scope.openTicketView('my to do', $scope.ticketCountObj.toDo, '', 1);

            ticketUIFun.loadedRefreshBtn();
            $scope.currentSelected.totalCount = $scope.ticketCountObj.myTicket.myNew;
        }).catch(function(err)
        {
           console.error(err);
        });



    };
    loadMyDefulatTicketView();

//click event refresh all
    $scope.ticketViewAllReload = function () {
        loadMyDefulatTicketView();
    };


}).filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
