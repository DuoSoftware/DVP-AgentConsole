/**
 * Created by Veery Team on 6/1/2016.
 */

agentApp.controller('loginCtrl', function ($rootScope, $scope, $state, $http,
                                           identity_service,
                                           config, $base64, $auth,localStorageService) {

	$rootScope.copywriteYear = new Date().getFullYear();

    var para = {
        userName: null,
        password: null,
        clientID: $base64.encode(config.client_Id_secret)
    };

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

    $scope.validateMultipleTab =function () {
        var keyVal = localStorageService.get("facetoneconsole");
        if(keyVal==='facetoneconsole'){
            var msg = "Not Allowed To Open Multiple Instance";
            showAlert('Error', 'error', msg);
            showNotification(msg, 20000);
            return false;
        }
        localStorageService.set("facetoneconsole", "facetoneconsole");
        return true;
    };
    $scope.isLogin = false;
    $scope.onClickLogin = function () {

        $('#usersName').removeClass('shake');
        $('#pwd').removeClass('shake');
        para.userName = $scope.userNme;
        para.password = $scope.pwd;
        para.companyName = $scope.companyName;
        para.scope = ["all_all", "profile_veeryaccount", "write_ardsresource", "write_notification", "read_myUserProfile", "read_productivity", "profile_veeryaccount", "resourceid"];

        if (para.userName == null || para.userName.length == 0) {
            showAlert('Error', 'error', 'Please check user name..');
            return;
        }
        if (para.password == null || para.password.length == 0) {
            showAlert('Error', 'error', 'Please check login password..');
            return;
        }

        para.console = 'AGENT_CONSOLE';

        //parameter option
        //username
        //password
        //decode clientID
        $scope.isLogin = true;
        $scope.loginFrm.$invalid = true;

        /*

         identity_service.Login(para, function (result) {
         if (result) {
         $state.go('console');
         } else {
         $('#usersName').addClass('shake');
         $('#pwd').addClass('shake');
         showAlert('Error', 'error', 'Please check login details...');
         $scope.isLogin = false;
         $scope.loginFrm.$invalid = false;
         }
         });
         */

        $auth.login(para)
            .then(function () {
                if(!$scope.validateMultipleTab()){
                    $scope.isLogin = false;
                    $scope.loginFrm.$invalid = false;
                    return;
                }
                $state.go('console');
            })
            .catch(function (error) {
                $scope.isLogin = false;
                $scope.loginFrm.$invalid = false;
                if (error.status == 449) {
                    showAlert('Error', 'error', 'Activate your account before login...');
                    return;
                }
                if(error.data && error.data.message && error.status == 401)
                {
                    showAlert('Error', 'error', error.data.message);
                    return;
                }
                $('#usersName').addClass('shake');
                $('#pwd').addClass('shake');
                showAlert('Error', 'error', 'Please check login details...');
            });

    };

    $scope.CheckLogin = function () {
        if ($auth.isAuthenticated()) {
            if(!$scope.validateMultipleTab()){
                return;
            }
            $state.go('console');
        }
    };

    $scope.CheckLogin();


    //Recover email forget password
    $scope.ResetPassword = function () {
        identity_service.forgetPassword($scope.recoverEmail, function (isSuccess) {
            if (isSuccess) {
                showAlert('Success', 'success', "Please check email");
                $state.go('login');
            } else {
                showAlert('Error', 'error', "Reset Failed");
            }
        })
    };


    $scope.BackToLogin = function () {
        $state.go('login');
    };

    $scope.goToRestEmail = function () {
        $state.go('reset-password-email');
    };

    $scope.goToRestToken = function () {
        $state.go('reset-password-token');
    };


}).directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});