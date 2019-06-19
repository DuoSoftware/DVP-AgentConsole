/**
 * Created by Veery Team on 6/1/2016.
 */

agentApp.controller('companynamectrl', function ($rootScope, $scope, $state, $http,
                                           identity_service,
                                           config, $base64, $auth,localStorageService,$q) {



    $scope.companyName="";
    $scope.isExsists=true;



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
    $scope.checkCompanyNameAvailability = function(form)
    {
        var deferred = $q.defer();

        try {
            identity_service.getOrganizationExsistance($scope.companyName).then(function (res) {

                if(res)
                {
                    //showAlert("Info","error","Company Name is Already Taken");
                    $scope.isExsists=true;
                    form.companyName.$invalid=false;
                    $state.go('login',{company:$scope.companyName});

                    deferred.resolve(true);


                }
                else {



                    $scope.isExsists=false;

                    form.companyName.$invalid=true;

                    deferred.reject(false);

                }
            },function (err) {
                showAlert("Error","error","Error in validating Company Name ");
                $scope.isExsists=true;

                form.companyName.$invalid=true;


                deferred.reject(false);
            });
        }
        catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;


    }

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

    $scope.authenticate = function(provider)
    {

        if(!$scope.companyName)
        {
            showAlert("Choose a Company Name","info","Before Login Please choose a Name for your Company");
        }
        else {
            para.companyname = $scope.companyName;
            para.scope = ["all_all", "profile_veeryaccount", "write_ardsresource", "write_notification", "read_myUserProfile", "read_productivity", "profile_veeryaccount", "resourceid"];
            $auth.authenticate(provider,para).then(function () {
                if(!$scope.validateMultipleTab()){
                    $scope.isLogin = false;
                    //$scope.loginFrm.$invalid = false;
                    return;
                }
                $state.go('console');
            }).catch(function (error) {
                $scope.isLogin = false;
                //$scope.loginFrm.$invalid = false;
                if (error.status == 449) {
                    showAlert('Error', 'error', 'Activate your account before login...');
                    return;
                }
                if(error && error.message )
                {
                    if(error.message=="The popup window was closed")
                    {
                        showAlert('Info', 'info', error.message);
                    }
                    else
                    {
                        showAlert('Error', 'error', error.message);
                    }

                    return;
                }
                if(error.data && error.data.message && error.status == 401)
                {
                    if(error.data.message=="The popup window was closed")
                    {
                        showAlert('Info', 'info', error.data.message);
                    }
                    else
                    {
                        showAlert('Error', 'error', error.data.message);
                    }

                    return;
                }
                $('#usersName').addClass('shake');
                $('#pwd').addClass('shake');
                showAlert('Error', 'error', 'Please check login details...');
            })
        }

    }


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