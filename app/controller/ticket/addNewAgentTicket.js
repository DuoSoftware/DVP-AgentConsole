agentApp.controller('addNewAgentTicketCtrl', function ($scope,ticketService,tagService) {


    $scope.showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3',
        });
    };
    $scope.newAgentTicket = {};
    $scope.availableTicketTypes = [];

    $scope.getAvailableTicketTypes = function () {
        ticketService.getAvailableTicketTypes().then(function (response) {

            if (response && response.IsSuccess) {

                $scope.availableTicketTypes = response.Result;
            }
            else {
                $scope.availableTicketTypes = [];
            }
        }, function (error) {
            $scope.availableTicketTypes = [];
        });
    };

    $scope.loadTags = function () {
        tagService.GetAllTags().then(function (response) {
            $scope.tags = response;
        }, function (err) {
            // authService.IsCheckResponse(err);
            $scope.showAlert("Load Tags", "error", "Fail To Get Tag List.")
        });
    };

    function createTagFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(group) {
            return (group.name.toLowerCase().indexOf(lowercaseQuery) != -1);
        };
    }

    $scope.queryTagSearch = function (query) {
        if (query === "*" || query === "") {
            if ($scope.availableTags) {
                return $scope.availableTags;
            }
            else {
                return [];
            }

        }
        else {
            var results = query ? $scope.availableTags.filter(createTagFilterFor(query)) : [];
            return results;
        }

    };

    $scope.tagSelectRoot = 'root';
    $scope.onChipAddTag = function (chip) {
        if (!chip.tags || (chip.tags.length === 0)) {
            setToDefault();
            return;
        }

        if (chip.tags) {
            if (chip.tags.length > 0) {

                var tempTags = [];
                angular.forEach(chip.tags, function (item) {

                    if (!angular.isObject(item)) {

                        var tags = $filter('filter')($scope.tagList, {_id: item}, true);
                        tempTags = tempTags.concat(tags);

                    } else {
                        tempTags = tempTags.concat(item);
                    }
                });
                $scope.availableTags = tempTags;

                return;
            }
        }


    };
    $scope.loadPostTags = function (query) {
        return $scope.postTags;
    };

    var removeDuplicate = function (arr) {
        var newArr = [];
        angular.forEach(arr, function (value, key) {
            var exists = false;
            angular.forEach(newArr, function (val2, key) {
                if (angular.equals(value.name, val2.name)) {
                    exists = true
                }
                ;
            });
            if (exists == false && value.name != "") {
                newArr.push(value);
            }
        });
        return newArr;
    };

    $scope.newAddTags = [];
    $scope.postTags = [];

    var setToDefault = function () {
        var ticTag = undefined;
        angular.forEach($scope.newAddTags, function (item) {
            if (ticTag) {
                ticTag = ticTag + "." + item.name;
            } else {
                ticTag = item.name;
            }

        });
        if (ticTag) {
            $scope.postTags.push({name: ticTag});
            $scope.postTags = removeDuplicate($scope.postTags);
        }

        $scope.newAddTags = [];
        $scope.availableTags = $scope.tagCategoryList;
        $scope.tagSelectRoot = 'root';
    };

    $scope.onChipDeleteTag = function (chip) {
        setToDefault();

    };

    $scope.loadTagCategories = function () {
        tagService.GetTagCategories().then(function (response) {
            $scope.tagCategories = response;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load Tags", "error", "Fail To Get Tag List.")
        });
    };
    $scope.loadTagCategories();

    $scope.userList = profileDataParser.userList;
    $scope.assigneeList = profileDataParser.assigneeList;


    $scope.assigneeUsers = profileDataParser.assigneeUsers;

    angular.forEach($scope.assigneeUsers, function (assignee) {
        assignee.displayname = $scope.setUserTitles(assignee);
        if (!assignee.avatar) {
            assignee.avatar = 'assets/img/avatar/defaultProfile.png';
        }

    });


    $scope.assigneeGroups = profileDataParser.assigneeUserGroups;
    if ($scope.assigneeGroups) {
        $scope.assigneeTempGroups = $scope.assigneeGroups.map(function (value) {
            value.displayname = value.name;
            if (!value.avatar) {
                value.avatar = 'assets/img/avatar/defaultProfile.png';
            }
            return value;
        });
    }

    $scope.assigneeUserData = $scope.assigneeUsers.concat($scope.assigneeTempGroups);

    scope.saveAgentTicket = function () {

        if (scope.ticket.channel) {
            scope.newAgentTicket.channel = scope.ticket.channel;
        }
        if (scope.ticket.custom_fields) {
            scope.newAgentTicket.custom_fields = scope.ticket.custom_fields;
        }

        if (scope.postTags) {
            scope.newAgentTicket.tags = scope.postTags.map(function (obj) {
                return obj.name;
            });
        }
        if (scope.newAgentTicket.assignee) {
            /*var subTicketAssignee=JSON.parse(subTicket.assignee);
             if(subTicketAssignee.listType == "User")
             {
             subTicket.assignee=subTicketAssignee;
             }
             else
             {
             subTicket.assignee_group=subTicketAssignee
             }*/
            console.log(scope.newAgentTicket.assignee);

            // subTicket.assignee = JSON.parse(subTicket.assignee);
            scope.newAgentTicket.assignee = scope.newAgentTicket.assignee;
            scope.newAgentTicket.assignee_group = scope.newAgentTicket.assignee;
        }

        ticketService.AddAgentTicket(scope.newAgentTicket).then(function (response) {

            if (response.data.IsSuccess) {
                scope.showAlert("Sub ticket saving", "success", "Sub ticket saved successfully");
                scope.newAgentTicket = {};
                scope.postTags = [];
            }
            else {
                scope.showAlert("Sub ticket saving", "error", "Sub ticket saving failed");
                console.log("Sub ticket adding failed");
            }

        }), function (error) {
            scope.showAlert("Sub ticket saving", "error", "Sub ticket saving failed");
            console.log("Sub ticket adding failed", error);
        }
    };

});