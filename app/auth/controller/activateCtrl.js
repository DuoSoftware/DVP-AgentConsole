/**
 * Created by Damith on 6/1/2016.
 */

agentApp.controller('activateCtrl', function ($rootScope, $scope, $stateParams, $state, $http,
                                             identity_service) {


    var showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3',
            animate: {
                animate: true,
                in_class: "bounceIn",
                out_class: "bounceOut"
            }
        });
    };

    $scope.ActivateAccount = function () {


        identity_service.activateAccount($stateParams.token, function (isSuccess) {
            if (isSuccess) {
                showAlert('Success', 'success', "Your Account Has Been Activated, Please Login");
                $state.go('company');
            } else {
                showAlert('Error', 'error', "Account activation failed");
                $state.go('company');
            }
        })


    }

    $scope.BackToLogin = function () {


        $state.go('company');


    }

    $scope.ActivateAccount();


});