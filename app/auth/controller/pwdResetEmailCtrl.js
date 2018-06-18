/**
 * Created by damith on 3/15/17.
 */

agentApp.controller('pwdResetEmailCtrl', function ($rootScope, $scope, $state, $http,
                                                   identity_service,
                                                   config, $base64, $auth) {


    $scope.BackToLogin = function () {
        $state.go('login');
    };

    $scope.isLoadingEmail = false;
    $scope.recoverEmail = null;
    $scope.ResetPassword = function () {
        $scope.isLoadingEmail = true;
        identity_service.forgetPassword($scope.recoverEmail, function (isSuccess) {
            $scope.isLoadingEmail = false;
            if (isSuccess) {
                showAlert('Success', 'success', "Please check email");
                $state.go('reset-password-token');
            } else {
                showAlert('Error', 'error', "Reset Failed");
            }
        })
    };


});