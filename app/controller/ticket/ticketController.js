/**
 * Created by Veery Team on 8/19/2016.
 */

agentApp.controller('ticketCtrl', function ($scope, $http, $filter, $timeout, $state, ticketService, moment,
                                            $rootScope, userService,
                                            profileDataParser, authService,$anchorScroll) {



    $anchorScroll();

    $scope.ticketList = {
        toDo: [],
        inProgress: [],
        done: [],
        loadCompleted: false,
        loadListStatus: "MY",
        toDoSt:false,
        inProgressSt:false,
        doneSt:false


    };


    String.prototype.toHH = function () {


    }
    $scope.userList = [];
    $scope.userGroupList = [];
    $scope.isDefault = true;



    $("#mybtn").click(function () {
        $(this).toggleClass("active");
        if ($scope.ticketList.loadListStatus == "MY") {

        }
        if ($scope.ticketList.loadListStatus == "GROUP") {
            $("#grpbtn").toggleClass("active");
        }

    });
    $("#grpbtn").click(function () {
        $(this).toggleClass("active");
        if ($scope.ticketList.loadListStatus == "MY") {
            $("#mybtn").toggleClass("active");
        }

    });

    $("#mybtn").click();
// ................. All users and user groups ..............................
    $scope.assigneeList = [];


    $scope.setUserTitle = function (ticket) {

        var title="";
        if(ticket.assignee)
        {
            if(ticket.assignee.firstname && ticket.assignee.lastname)
            {
                title=ticket.assignee.firstname+" "+ ticket.assignee.lastname;
            }
            else
            {
                if(ticket.assignee.firstname)
                {
                    title=ticket.assignee.firstname;
                }
                else if(ticket.assignee.lastname)
                {
                    title=ticket.assignee.lastname;
                }
                else
                {
                    title=ticket.assignee.name;
                }
            }


        }
        else if(ticket.assignee_group)
        {
            title=ticket.assignee_group.name;

        }
        else
        {
            title="Unassigned";
        }


        return title;
    }

    var pickAllGroups = function () {
        userService.getUserGroupList().then(function (response) {
            $scope.userGroupList = response.data.Result;
            $scope.ticketList.loadCompleted = true;
            /*pickToDoList(1);
             pickProcessingTickets(1);
             pickCompletedTickets(1);*/
            pickMyToDoList(1);
            pickMyProcessingTickets(1);
            pickMyCompletedTickets(1);

            if ($scope.userGroupList) {
                for (var j = 0; j < $scope.userGroupList.length; j++) {
                    var userGroup = $scope.userGroupList[j];
                    userGroup.listType = "Group";
                }

                $scope.userGroupList.sort(function (a, b) {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    return 0;
                });

                $scope.assigneeList = $scope.userGroupList.concat($scope.assigneeList);
                profileDataParser.assigneeList = $scope.assigneeList;

            }

        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
        });
    };

    var pickAllUsers = function () {
        $scope.assigneeList = [];
        userService.getUserList().then(function (response) {
            $scope.userList = response.data.Result;
            profileDataParser.userList = $scope.userList;

            if ($scope.users) {
                for (var i = 0; i < $scope.users.length; i++) {
                    var user = $scope.users[i];
                    user.listType = "User";
                }

                $scope.users.sort(function (a, b) {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    return 0;
                });

                $scope.assigneeList = $scope.users;
                profileDataParser.assigneeList = $scope.assigneeList;

            }

            pickAllGroups();

        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
        });
    };




// ................. All Tickets ..............................
    var pickToDoList = function (page) {


       if(profileDataParser.statusNodes["NEW"] && profileDataParser.statusNodes["NEW"].length>0)
       {
           var checkStatus = "";

           angular.forEach(profileDataParser.statusNodes["NEW"],function (node) {
               checkStatus+="status="+node+"&";
           });

           ticketService.getNewTickets(page,checkStatus).then(function (response) {


               if (response.data.IsSuccess) {
                   if (response.data.Result.length == 0) {
                       $scope.isNewTicketLoadComplete = true;
                       $scope.ticketList.toDoSt=true;
                   }
                   else {
                       for (var i = 0; i < response.data.Result.length; i++) {

                           response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                           response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                           if (response.data.Result[i].status.length > 20) {
                               response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";





                           }


                           /* if(response.data.Result[i].assignee)
                            {

                            var assigneeData = $filter('filter')( $scope.userList, {
                            _id: response.data.Result[i].assignee

                            });

                            response.data.Result[i].assignee_name=assigneeData[0].name;
                            }*/

                           /*if(response.data.Result[i].assignee_group)
                            {

                            var assigneeGroupData = $filter('filter')( $scope.userGroupList, {
                            _id: response.data.Result[i].assignee_group

                            });


                            response.data.Result[i].assignee_group_name=assigneeGroupData[0].name;
                            }*/


                           if (i == response.data.Result.length - 1) {

                               $scope.ticketList.toDo = $scope.ticketList.toDo.concat(response.data.Result);
                               $scope.ticketList.toDoSt=true;


                           }
                       }
                   }

               }
               else {
                   if (response.data.Exception) {
                       console.log("Error in loading New tickets " + response.data.Exception);
                   }
                   else {
                       console.log("Empty response for new tickets");
                   }
                   $scope.ticketList.toDoSt=true;
               }


           }, function (error) {
               authService.IsCheckResponse(error);
               console.log(error);
               $scope.ticketList.toDoSt=true;
           });
       }




    };

    var pickProcessingTickets = function (page) {
        ticketService.getOpenTickets(page).then(function (response) {

            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isOpenTicketLoadComplete = true;
                    $scope.ticketList.inProgressSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {
                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";

                        }


                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.inProgress = $scope.ticketList.inProgress.concat(response.data.Result);
                            $scope.ticketList.inProgressSt=true;

                        }
                    }
                }

            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading open tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for open tickets");
                }
                $scope.ticketList.inProgressSt=true;

            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.inProgressSt=true;
        });
    };


    var pickCompletedTickets = function (page) {
        ticketService.getClosedTickets(page).then(function (response) {


            if (response.data.IsSuccess) {

                if (response.data.Result.length == 0) {
                    $scope.isCompletedTicketLoadComplete = true;
                    $scope.ticketList.doneSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";

                        }


                        if (i == response.data.Result.length - 1) {

                            $scope.ticketList.done = $scope.ticketList.done.concat(response.data.Result);
                            $scope.ticketList.doneSt=true;
                        }
                    }
                    ;
                }

            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading closed tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for closed tickets");
                }
                $scope.ticketList.doneSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.doneSt=true;
        });
    };

// ................. My Tickets ..............................

    var pickMyToDoList = function (page) {
        ticketService.getMyNewTickets(page).then(function (response) {
            if (response.data.IsSuccess) {

                if (response.data.Result.length == 0) {
                    $scope.isNewTicketLoadComplete = true;
                    $scope.ticketList.toDoSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {
                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();

                        if(response.data.Result[i]&&response.data.Result[i].submitter){
                            response.data.Result[i].submitter.avatar = "/assets/img/defaultProfile.png";
                            response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);
                        }

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";
                        }


                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.toDo = $scope.ticketList.toDo.concat(response.data.Result);
                            $scope.ticketList.toDoSt=true;


                        }
                    }
                }
            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading My new tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My new tickets");
                }
                $scope.ticketList.toDoSt=true;
            }
        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.toDoSt=true;
        });

    };

    var pickMyProcessingTickets = function (page) {
        ticketService.getMyOpenTickets(page).then(function (response) {


            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isOpenTicketLoadComplete = true;
                    $scope.ticketList.inProgressSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();

                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);
                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";

                        }


                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.inProgress = $scope.ticketList.inProgress.concat(response.data.Result);
                            $scope.ticketList.inProgressSt=true;
                        }
                    }
                }
            }

            else {
                if (response.data.Exception) {
                    console.log("Error in loading  My open tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My open tickets");
                }
                $scope.ticketList.inProgressSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.inProgressSt=true;
        });
    };


    var pickMyCompletedTickets = function (page) {
        ticketService.getMyClosedTickets(page).then(function (response) {


            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isCompletedTicketLoadComplete = true;
                    $scope.ticketList.doneSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";

                        }

                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.done = $scope.ticketList.done.concat(response.data.Result);
                            $scope.ticketList.doneSt=true;
                        }
                    }
                    ;
                }
            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading  My Closed tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My Closed tickets");
                }
                $scope.ticketList.doneSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.doneSt=true;
        });
    };

    // ................. My Tickets ..............................

    var pickGroupToDoList = function (page) {

        ticketService.getMyGroupTickets(page).then(function (response) {

            console.log("My Group New Tickets: "+response.data.Result);

            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isNewTicketLoadComplete = true;
                    $scope.ticketList.toDoSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";

                        }


                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.toDo = $scope.ticketList.toDo.concat(response.data.Result);
                            $scope.ticketList.toDoSt=true;

                        }
                    }
                }
            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading   My Group new tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My Group new tickets");
                }

                $scope.ticketList.toDoSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.toDoSt=true;
        });

    };

    var pickGroupProcessingTickets = function (page) {
        ticketService.getMyGroupOpenTickets(page).then(function (response) {

            console.log("My Group Open Tickets: "+response.data.Result);

            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isOpenTicketLoadComplete = true;
                    $scope.ticketList.inProgressSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";
                        }


                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.inProgress = $scope.ticketList.inProgress.concat(response.data.Result);
                            $scope.ticketList.inProgressSt=true;
                        }
                    }
                    ;
                }
            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loading My Group open tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My Group open tickets");
                }
                $scope.ticketList.inProgressSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.inProgressSt=true;
        });
    };


    var pickGroupCompletedTickets = function (page) {
        ticketService.getMyGroupClosedTickets(page).then(function (response) {
            console.log("My Group Completed Tickets: "+response.data.Result);

            if (response.data.IsSuccess) {
                if (response.data.Result.length == 0) {
                    $scope.isCompletedTicketLoadComplete = true;
                    $scope.ticketList.doneSt=true;
                }
                else {
                    for (var i = 0; i < response.data.Result.length; i++) {

                        response.data.Result[i].timeDelay = moment(response.data.Result[i].updated_at).fromNow();
                        response.data.Result[i].displayname=$scope.setUserTitle(response.data.Result[i]);

                        if (response.data.Result[i].status.length > 20) {
                            response.data.Result[i].stateTitle = response.data.Result[i].status.substring(0, 20) + "....";
                        }

                        if (i == response.data.Result.length - 1) {
                            $scope.ticketList.done = $scope.ticketList.done.concat(response.data.Result);
                            $scope.ticketList.doneSt=true;
                        }
                    }
                    ;
                }
            }
            else {
                if (response.data.Exception) {
                    console.log("Error in loadingMy Group closed tickets " + response.data.Exception);
                }
                else {
                    console.log("Empty response for My Group closed tickets");
                }
                $scope.ticketList.doneSt=true;
            }


        }, function (error) {
            authService.IsCheckResponse(error);
            console.log(error);
            $scope.ticketList.doneSt=true;
        });
    };


// ....................... Switch between All/My/Group Tickets ...................
    $scope.switchTickets = function (listName) {

        $scope.ticketList.toDo = [];
        $scope.ticketList.inProgress = [];
        $scope.ticketList.done = [];
        $scope.ticketList.doneSt=false;
        $scope.ticketList.toDoSt=false;
        $scope.ticketList.inProgressSt=false;

        if ($scope.ticketList.loadListStatus == listName) {

            $scope.ticketList.loadListStatus = "DEFAULT";

            setToInitiate();
            pickToDoList(1);
            pickProcessingTickets(1);
            pickCompletedTickets(1);
        }
        else {
            if (listName == "MY") {

                $scope.ticketList.loadListStatus = listName;
                setToInitiate();
                pickMyToDoList(1);
                pickMyProcessingTickets(1);
                pickMyCompletedTickets(1);
            }
            else {

                $scope.ticketList.loadListStatus = listName;
                setToInitiate();
                pickGroupToDoList(1);
                pickGroupProcessingTickets(1);
                pickGroupCompletedTickets(1);
            }

        }

    };
    var setToInitiate = function () {
        $scope.NewTicketPage = 1;
        $scope.OpenTicketPage = 1;
        $scope.CompletedTicketPage = 1;
        $scope.isNewTicketLoadComplete = false;
        $scope.OpenTicketPage = 1;
        $scope.isOpenTicketLoadComplete = false;
        $scope.CompletedTicketPage = 1;
        $scope.isCompletedTicketLoadComplete = false;
        $scope.ticketList.doneSt=false;
        $scope.ticketList.toDoSt=false;
        $scope.ticketList.inProgressSt=false;

    };
    setToInitiate();
    pickAllUsers();


    $scope.showMoreNewTickets = function () {

        if ($scope.ticketList.loadListStatus == "DEFAULT") {
            if (!$scope.isNewTicketLoadComplete) {
                $scope.NewTicketPage = $scope.NewTicketPage + 1;

                pickToDoList($scope.NewTicketPage);

            }

        }
        else if ($scope.ticketList.loadListStatus == "MY") {
            if (!$scope.isNewTicketLoadComplete) {
                $scope.NewTicketPage = $scope.NewTicketPage + 1;

                pickMyToDoList($scope.NewTicketPage);
            }
        }
        else {
            if (!$scope.isNewTicketLoadComplete) {
                $scope.NewTicketPage = $scope.NewTicketPage + 1;

                pickGroupToDoList($scope.NewTicketPage);
            }
        }

    };
    $scope.showMoreOpenTickets = function () {

        if ($scope.ticketList.loadListStatus == "DEFAULT") {
            if (!$scope.isOpenTicketLoadComplete) {
                $scope.OpenTicketPage = $scope.OpenTicketPage + 1;

                pickProcessingTickets($scope.OpenTicketPage);

            }

        }
        else if ($scope.ticketList.loadListStatus == "MY") {
            if (!$scope.isOpenTicketLoadComplete) {
                $scope.OpenTicketPage = $scope.OpenTicketPage + 1;

                pickMyProcessingTickets($scope.OpenTicketPage);
            }
        }
        else {
            if (!$scope.isOpenTicketLoadComplete) {
                $scope.OpenTicketPage = $scope.OpenTicketPage + 1;

                pickGroupCompletedTickets($scope.OpenTicketPage);
            }
        }

    };
    $scope.showMoreCompletedTickets = function () {

        if ($scope.ticketList.loadListStatus == "DEFAULT") {
            if (!$scope.isCompletedTicketLoadComplete) {
                $scope.CompletedTicketPage = $scope.CompletedTicketPage + 1;

                pickCompletedTickets($scope.CompletedTicketPage);

            }

        }
        else if ($scope.ticketList.loadListStatus == "MY") {
            if (!$scope.isCompletedTicketLoadComplete) {
                $scope.CompletedTicketPage = $scope.CompletedTicketPage + 1;

                pickMyCompletedTickets($scope.CompletedTicketPage);
            }
        }
        else {
            if (!$scope.isCompletedTicketLoadComplete) {
                $scope.CompletedTicketPage = $scope.CompletedTicketPage + 1;

                pickGroupCompletedTickets($scope.CompletedTicketPage);
            }
        }

    };


    $scope.gotoTicket = function (data) {

        data.tabType = 'ticketView';
        data.index = data.reference;
        $rootScope.$emit('openNewTab', data);
        $scope.closeTicketInbox();

    };

    $('#scrltodo').scroll(function () {
        var raw = $('#scrltodo')[0];
        if (raw.scrollTop + raw.offsetHeight >= (raw.scrollHeight) * 0.9) {
            $scope.showMoreNewTickets();
        }

    });
    $('#scrlopen').scroll(function () {
        var raw = $('#scrlopen')[0];
        if (raw.scrollTop + raw.offsetHeight >= (raw.scrollHeight) * 0.9) {
            $scope.showMoreOpenTickets();
        }


    });
    $('#scroldone').scroll(function () {
        var raw = $('#scroldone')[0];
        if (raw.scrollTop + raw.offsetHeight >= (raw.scrollHeight) * 0.9) {
            $scope.showMoreCompletedTickets();
        }


    });


    $scope.closeTicketInbox = function () {
        $('#mainTicketWrapper').addClass('display-none').removeClass('display-block fadeIn');

    };


    $scope.reloadTickets = function () {
        //$state.reload();

        $scope.ticketList.toDo = [];
        $scope.ticketList.inProgress = [];
        $scope.ticketList.done = [];
        $scope.ticketList.doneSt=false;
        $scope.ticketList.toDoSt=false;
        $scope.ticketList.inProgressSt=false;

        setToInitiate();
        $scope.ticketList.loadCompleted = true;
        $scope.ticketList.loadListStatus = "MY";
        pickMyToDoList(1);
        pickMyProcessingTickets(1);
        pickMyCompletedTickets(1);
    }

    $rootScope.$on('reloadInbox', function (events, args) {
        $scope.reloadTickets();
    });





});

app.controller('ModalInstanceCtrl', function ($scope, $sce, $uibModalInstance, baseUrls, file) {

    $scope.selectedFile = file;

    $scope.ok = function () {
        $uibModalInstance.close($scope.selectedFile.Filename);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //var uri_enc = encodeURIComponent(uri);
    /*{{internalUrl}}File/Download/{{tenant}}/{{company}}/{{file.UniqueId}}/{{file.Filename}}*/
    /*baseUrls.fileServiceInternalUrl + "File/Download/" + file.TenantId + "/" + file.CompanyId + "/" + file.UniqueId + "/" + file.Filename*/
    $scope.config = {
        preload: "auto",
        sources: [
            {
                src: $sce.trustAsResourceUrl(file.url),
                type: file.type
            }
        ],
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
});