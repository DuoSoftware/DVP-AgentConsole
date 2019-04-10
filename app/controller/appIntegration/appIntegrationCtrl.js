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

    $scope.appConfig = {};
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
        angular.forEach($scope.appConfig[$scope.apps[currAppPosition]._id].data, function (checkboxes, index) {
            if (position != index) {
                $scope.appConfig[$scope.apps[currAppPosition]._id].data[index]._isSelected = false;
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
    $scope.loadData = function (appID, defaultIntegrationID, isRefresh) {

        $scope.notification = '';
        $scope.notificationColor = null;
        $scope.showApp = true;

        currAppPosition = $scope.apps.findIndex(function (x) {
            return x._id === appID; // check if the app(card) already exist
        });

        var isAppExist = appID in $scope.appConfig;

        if (!isAppExist || isRefresh) {
            $scope.appConfig[appID] = {isTableLoading: true};
            integrationAPIService.InvokeAppIntegration(defaultIntegrationID, {"User": $scope.profileDetail}).then(function (response) {
                var _tempData = [];
                if (response === null) {
                    $scope.showAlert('App Integration', 'error', 'Error calling third party API');
                    $scope.appConfig[appID].isTableLoading = false;
                }
                else if(!(response.ApiResponse instanceof Array)){
                        $scope.showAlert('App Integration', 'error', 'API returned data are not in the expected format');
                        $scope.appConfig[appID].isTableLoading = false;
                        }
                else{
                    _tempData = response.ApiResponse.map(function (el) {
                        var o = Object.assign({}, el);
                        o._isSelected = false; // a status need to maintain
                        return o;
                    });
                    $scope.appConfig[appID] = { "appID": appID,
                                                "defaultIntegrationID":defaultIntegrationID,
                                                "data": _tempData,
                                                "actions": $scope.apps[currAppPosition].actions,
                                                "header": Object.keys(_tempData[0]),
                                                "isTableLoading": false
                    };
                }
            });
        }


    };

    $scope.selectedActionIdx = -1;
    $scope.model = {};
    $scope.executeAction = function(actionIdx, appID){
        $scope.actionIdx = actionIdx;
        if($scope.appConfig[appID].actions[actionIdx].hasOwnProperty("dynamic_form_id") && $scope.appConfig[appID].actions[actionIdx].dynamic_form_id) {
            $scope.schema = {
                type: "object",
                properties: {}
            };
            $scope.form = [];
            $scope.builder($scope.schema, $scope.form, $scope.appConfig[appID].actions[actionIdx].dynamic_form_id.fields);
            $scope.form.push({
                type: "button",
                title: "Cancel",
                style: "btn-primary",
                onClick: 'closeDynamicForm()'

            },{
                type: "button",
                title: "Submit",
                style: 'btn-primary',
                onClick: 'submitIntegrationData()'
            });

            $scope.formName = $scope.appConfig[appID].actions[actionIdx].dynamic_form_id.name;
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

        var selectedDataRowIdx = $scope.appConfig[$scope.apps[currAppPosition]._id].data.findIndex(function (x) {
            return x._isSelected === true; // get the index of the selected row
        });

        var submitObj = {
            "User": $scope.profileDetail,
            "Form": $scope.model,
            "Grid": $scope.appConfig[$scope.apps[currAppPosition]._id].data[selectedDataRowIdx]
        };

        integrationAPIService.InvokeAppIntegration($scope.appConfig[$scope.apps[currAppPosition]._id].actions[$scope.actionIdx].integration, submitObj).then(function (res) {
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