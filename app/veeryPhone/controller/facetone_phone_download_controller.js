/**
 * Created by Rajinda Waruna on 24/04/2019.
 */

agentApp.controller('facetone_phone_download_controller', function ($rootScope, $scope, fileService) {


    $scope.iswebrtcok = "low";
    $scope.iswebsocketok = "low";
    $scope.isWebSocketsBlocked = "low";
    $('#x86').removeClass('gradient-green');
    $('#x64').removeClass('gradient-green');

    function Check_setting() {
        $scope.iswebrtcok = DetectRTC.isWebRTCSupported ? "normal" : "high";
        $scope.iswebsocketok = DetectRTC.isWebSocketsSupported ? "normal" : "high";
        $scope.isWebSocketsBlocked = DetectRTC.isWebSocketsBlocked ? "high" : "normal";
        console.log(DetectRTC.osName + " : " + DetectRTC.osVersion);

        if (navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1) {
            $('#x64').addClass('gradient-green');
            $('#x86').removeClass('gradient-green');
        } else {
            $('#x86').addClass('gradient-green');
            $('#x64').removeClass('gradient-green');
        }
    }
    Check_setting();

    $('#downloading').addClass(' display-none');
    $scope.downloadFile = function (file) {
        var file_name ="FacetonePhone_"+file+".msi";
        $('#downloading').removeClass(' display-none');
        fileService.downloadLatestFile(file_name,file_name).then(function (data) {
            console.log("done-----------------------")
            $('#downloading').addClass(' display-none');
        }, function (error) {
            console.error(error);
            $('#downloading').addClass(' display-none');
        });
    };
});