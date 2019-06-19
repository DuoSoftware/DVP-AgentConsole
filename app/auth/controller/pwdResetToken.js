/**
 * Created by damith on 3/15/17.
 */
agentApp.controller('pwdResetToken', function ($rootScope, $scope, $state, $http,
                                               identity_service,
                                               config, $base64, $auth) {


    $scope.token = null;
    $scope.password = null;
    $scope.confirmPwd = null;

    $scope.isLoadingPwd = false;
    $scope.ResetPassword = function () {
        $scope.isLoadingPwd = true;
        identity_service.resetPassword($scope.token, $scope.password, function (isSuccess) {
            $scope.isLoadingPwd = false;
            if (isSuccess) {
                showAlert('Success', 'success', "Your password has been reset successfully.");
                $state.go('company');
            } else {
                showAlert('Error', 'error', "Reset Failed");
            }
        })

    };


    $scope.pwdBox = false;

    $('#password').on('focus', function () {
        $scope.pwdBox = true;
    });
    $('#password').focusout(function () {
        $scope.pwdBox = false;
    });

});


