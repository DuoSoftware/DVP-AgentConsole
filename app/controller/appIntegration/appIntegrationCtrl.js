/**
 * Created by Marlon on 14/03/2019.
 */
agentApp.controller('appIntegrationCtrl', function ($scope, authService, integrationAPIService) {

    console.log($scope.profileDetail);
    var appConfig = []; //[{"appID": 12, "data": [{"xcol1":"dd", "xcol2":"ee"},{"ycol1":"aa", "ycol2":"bb"}]}]
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

    $scope.limit = 10;
    $scope.showApp = false;
    $scope.selected = {"value": -1};
    $scope.currentApp = {};
    $scope.loadData = function (appID, isRefresh) {

        $scope.currentApp = {};
        $scope.showApp = true;
        var isCurrentAppSet = false;
        if (!isRefresh) {
            var appDataPosition = appConfig.findIndex(function (x) {
                return x.appID === appID; // check if the app(card) already exist
            });

            if (appDataPosition >= 0) { //if data already present get from cache

                $scope.currentApp = appConfig[appDataPosition];
                isCurrentAppSet = true;
            }
        }

        if (!isCurrentAppSet) {
            integrationAPIService.GetDefaultIntegrationData(appID, $scope.profileDetail).then(function (response) {

                var _tempData = response.map(function (el) {
                    var o = Object.assign({}, el);
                    o._isSelected = false; // a status need to maintain
                    return o;
                });

                currAppPosition = $scope.apps.findIndex(function (x) {
                    return x._id === appID; // check if the app(card) already exist
                });

                var _tempApp = {"appID": appID, "data": _tempData, "actions": $scope.apps[currAppPosition].actions};
                appConfig.push(_tempApp);
                $scope.currentApp = _tempApp;
                console.log($scope.apps[currAppPosition].actions);


            });
        }


    };


});