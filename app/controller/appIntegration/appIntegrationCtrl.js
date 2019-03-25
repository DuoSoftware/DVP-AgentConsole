/**
 * Created by Marlon on 14/03/2019.
 */
agentApp.controller('appIntegrationCtrl', function ($scope, authService, integrationAPIService, $uibModal) {

    $scope.initform = function (builder) {
        $scope.builder = builder;
    };

    $scope.showAlert = function (tittle, type, msg) {
        new PNotify({
            title: tittle,
            text: msg,
            type: type,
            styling: 'bootstrap3',
            icon: true
        });
    };

    var appConfig = [];
    var currAppPosition = -1;
    // $scope.checkAll = function () {
    //     if ($scope.selectedAll) {
    //         $scope.selectedAll = true;
    //     } else {
    //         $scope.selectedAll = false;
    //     }
    //     angular.forEach($scope.currentApp, function (item) {
    //         item.Selected = $scope.selectedAll;
    //     });
    //
    // };
    // $scope.value1 = {"status": false};
    // $scope.selectAll = function() {
    //     angular.forEach(appConfig[currAppPosition].data, function (elem) {
    //         elem.isSelected = $scope.value1.status;
    //         console.log(appConfig[currAppPosition].data);
    //     });
    // };
    //
    // $scope.select = function(e, idx){
    //
    //     console.log(appConfig[currAppPosition].data);
    // };

    $scope.selectOnlyOne = function (position) {
        angular.forEach($scope.currentApp.data, function (checkboxes, index) {
            if (position != index) {
                $scope.currentApp.data[index]._isSelected = false;
            }
        });
    };

    integrationAPIService.GetIntegrationApps().then(function (response) {
            $scope.apps = response;
        }
    );

    $scope.limit = 10; // limited for current release
    $scope.showApp = false;
    $scope.selected = {"value": -1};
    $scope.currentApp = {};
    $scope.loadData = function (appID, defaultIntegrationID, isRefresh) {

        $scope.currentApp = {};
        $scope.showApp = true;
        var isCurrentAppSet = false;

        var appDataPosition = appConfig.findIndex(function (x) {
            return x.appID === appID; // check if the app(card) already exist
        });

        if (!isRefresh) {

            if (appDataPosition >= 0) { //if data already present get from cache

                $scope.currentApp = appConfig[appDataPosition];
                isCurrentAppSet = true;
            }
        }

        if (!isCurrentAppSet) {
            integrationAPIService.InvokeAppIntegration(defaultIntegrationID, {"User": $scope.profileDetail}).then(function (response) {
                var _tempData = [];
                if (response === null) {
                    $scope.showAlert('App Integration', 'error', 'Error calling third party API');
                }
                else {
                            _tempData = response.Result.map(function (el) {
                            var o = Object.assign({}, el);
                            o._isSelected = false; // a status need to maintain
                            return o;
                        });
                      }

                currAppPosition = $scope.apps.findIndex(function (x) {
                    return x._id === appID; // check if the app(card) already exist
                });

                var _tempApp = {"appID": appID, "defaultIntegrationID":defaultIntegrationID, "data": _tempData, "actions": $scope.apps[currAppPosition].actions};

                if (appDataPosition >= 0) { //if data already present replace it.
                    appConfig[appDataPosition] = _tempApp
                }
                else {
                    appConfig.push(_tempApp);
                }
                $scope.currentApp = _tempApp;
            });
        }


    };

    $scope.selectedActionIdx = -1;

    $scope.executeAction = function(actionIdx){
        $scope.actionIdx = actionIdx;
        if($scope.currentApp.actions) {
            $scope.model = {};
            $scope.schema = {
                type: "object",
                properties: {}
            };
            $scope.form = [];
            $scope.builder($scope.schema, $scope.form, $scope.currentApp.actions[actionIdx].dynamic_form_id.fields);
            $scope.form.push({
                type: "submit",
                title: "Submit",
                fieldHtmlClass: "style = display:inline-block"
                },{
                    type: "button",
                    title: "Cancel",
                    fieldHtmlClass: "style = display:inline-block",
                    onClick: "closeDynamicForm();"
                });
            $scope.formName = $scope.currentApp.actions[actionIdx].dynamic_form_id.name;
            $scope.loadDynamicForm();
        }
        else{
            $scope.submitIntegrationData();
        }

    };
    var modalInstance;
    $scope.loadDynamicForm = function (){
        modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            templateUrl: "app/views/engagement/edit-form/app-dynamic-form.html",
            size: 'md',
            scope: $scope
        });
    };

    $scope.closeDynamicForm = function(){
        modalInstance.close();
    };

    $scope.submitIntegrationData = function (){

        var selectedDataRowIdx = $scope.currentApp.data.findIndex(function (x) {
            return x._isSelected === true; // get the index of the selected row
        });

        var submitObj = {
            "User": $scope.profileDetail,
            "Form": $scope.model,
            "Grid": $scope.currentApp.data[selectedDataRowIdx]
        };

        integrationAPIService.InvokeAppIntegration($scope.currentApp.actions[$scope.actionIdx].integration, submitObj).then(function (res) {
            if (res === null) {
                $scope.showAlert('App Integration', 'error', 'Error calling third party API');
            }
            else {
                $scope.notification = res.Message;
                $scope.notificationColor = (res.Success) ? '#00ff00' : '#ff0000';
            }
        });

        modalInstance.close();
    };


});