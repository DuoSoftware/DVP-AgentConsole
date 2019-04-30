agentApp.controller('addNewAgentTicketCtrl', function ($scope,$filter,ticketService,tagService,profileDataParser,package_service) {

    $scope.isPanelOpen=false;

    $scope.closeModal =  function()
    {
        $scope.isPanelOpen=false;
    }
    $scope.ticketBUnit = profileDataParser.myBusinessUnit;
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
    $scope.setUserTitles = function (userObj) {

        var title = "";


        if (userObj.firstname && userObj.lastname) {
            title = userObj.firstname + " " + userObj.lastname;
        }
        else {
            if (userObj.firstname) {
                title = userObj.firstname;
            }
            else if (userObj.lastname) {
                title = userObj.lastname;
            }
            else {
                title = userObj.name;
            }

        }

        return title;
    }

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

    $scope.getAvailableTicketTypes();
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
                return [];a
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

                        var tags = $filter('filter')($scope.tags, {_id: item}, true);
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
    $scope.businessUnits = package_service.BusinessUnits;

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
        $scope.availableTags = $scope.tagCategories;
        $scope.tagSelectRoot = 'root';
    };

    $scope.onChipDeleteTag = function (chip) {
        setToDefault();

    };

    $scope.loadTagCategories = function () {
        tagService.GetTagCategories().then(function (response) {
            $scope.tagCategories = response;
            $scope.availableTags = $scope.tagCategories;
        }, function (err) {
            authService.IsCheckResponse(err);
            $scope.showAlert("Load Tags", "error", "Fail To Get Tag List.")
        });
    };
    $scope.loadTagCategories();

    $scope.reloadTagAndCategories = function () {
        $scope.loadTags();
        $scope.loadTagCategories();
    };



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
    $scope.setPriority = function (priority) {
        $scope.newAgentTicket.priority = priority;
    };

    $scope.setBUnit = function (bUnit) {
        $scope.ticketBUnit = bUnit;
    };
    $scope.saveAgentTicket = function () {

        if ($scope.postTags) {
            $scope.newAgentTicket.tags = $scope.postTags.map(function (obj) {
                return obj.name;
            });
        }
        if ($scope.newAgentTicket.assignee) {

            console.log($scope.newAgentTicket.assignee);

            $scope.newAgentTicket.assignee = $scope.newAgentTicket.assignee;
            $scope.newAgentTicket.assignee_group = $scope.newAgentTicket.assignee;
        }

        $scope.newAgentTicket.channel="internal";


        if($scope.ticketBUnit)
        {
            $scope.newAgentTicket.businessUnit=$scope.ticketBUnit;
        }
        ticketService.AddAgentTicket($scope.newAgentTicket).then(function (response) {

            if (response.data.IsSuccess) {
                $scope.showAlert("Agent ticket saving", "success", "Agent ticket saved successfully");
                $scope.newAgentTicket = {};
                $scope.postTags = [];
            }
            else {
                $scope.showAlert("Agent ticket saving", "error", "Agent ticket saving failed");
                console.log("Agent ticket adding failed");
            }

        }), function (error) {
            $scope.showAlert("Agent ticket saving", "error", "Agent ticket saving failed");
            console.log("Agent ticket adding failed", error);
        }
    };

});