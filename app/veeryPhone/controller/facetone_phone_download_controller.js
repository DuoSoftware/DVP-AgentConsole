/**
 * Created by Rajinda Waruna on 24/04/2019.
 */

agentApp.controller('facetone_phone_download_controller', function ($rootScope, $scope, fileService) {


    $scope.iswebrtcok = "fa fa-close";
    $scope.iswebsocketok = "fa fa-close";
    $scope.isWebSocketsBlocked = "fa fa-close";
    $('#x86').removeClass('gradient-green');
    $('#x64').removeClass('gradient-green');
    $('#downloading').addClass(' display-none');

    function Check_setting() {
        try{
            $scope.iswebrtcok = DetectRTC.isWebRTCSupported ? "fa fa-check" : "fa fa-close";
            $scope.iswebsocketok = DetectRTC.isWebSocketsSupported ? "fa fa-check" : "fa fa-close";
            $scope.isWebSocketsBlocked = DetectRTC.isWebSocketsBlocked ? "fa fa-close" : "fa fa-check";
            console.log(DetectRTC.osName + " : " + DetectRTC.osVersion);

            if (navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1) {
                $('#x64').addClass('gradient-green');
                $('#x86').removeClass('gradient-green');
                $scope.isx86 = false;
            } else {
                $('#x86').addClass('gradient-green');
                $('#x64').removeClass('gradient-green');
                $scope.isx86 = true;
            }
        }catch (ex){
            console.error(ex);
        }

    }
    Check_setting();


    $scope.downloadFile = function (file) {
        var file_name ="FacetonePhone_"+file+".msi";
        $('#downloading').removeClass(' display-none');
        fileService.downloadLatestFile(file_name,file_name).then(function (data) {
            console.log("done-----------------------");
            $('#downloading').addClass(' display-none');
        }, function (error) {
            console.error(error);
            $('#downloading').addClass(' display-none');
        });
    };
});