/**
 * Created by Pawan on 9/28/2016.
 */

var fileModule = angular.module("fileServiceModule", ["download"]);
agentApp.factory("fileService", function ($http, baseUrls, authService, download) {


    var downloadAttachment = function (attachment) {
        $http({
            url: baseUrls.fileService + "/InternalFileService/File/Download/" + authService.GetCompanyInfo().tenant + "/" + authService.GetCompanyInfo().company + "/" + attachment.url + "/SampleAttachment",
            method: "get",
            //data: json, //this is your json data string
            headers: {
                'Content-type': 'application/json'

            },
            responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {

            /*
             var blob = new Blob([data], {type: "application/image/png"});
             var objectUrl = URL.createObjectURL(blob);
             window.open(objectUrl);
             */

            var myBlob = new Blob([data]);
            var blobURL = (window.URL || window.webkitURL).createObjectURL(myBlob);
            var anchor = document.createElement("a");
            anchor.download = attachment.file;
            anchor.href = blobURL;
            anchor.click();

        }).error(function (data, status, headers, config) {
            //upload failed
        });

    };

    /* scope.CheckExternalUserAvailabilityBySSN = function (ssn, profile) {
         var deferred = $q.defer();

         $http({
             url: baseUrls.fileService+ "/FileService/File/DownloadLatest/" + fileName,
             method: "get",
             //data: json, //this is your json data string
             headers: {
                 'Content-type': 'application/json'
             },
             responseType: 'arraybuffer',
             reportProgress: true,
             uploadEventHandlers: {
                 progress: function (e) {
                     console.log("ff888888888888888888888888888888888888888888888888888888")
                 }
             }
         }).success(function (data, status, headers, config) {

             /!*
              var blob = new Blob([data], {type: "application/image/png"});
              var objectUrl = URL.createObjectURL(blob);
              window.open(objectUrl);
              *!/

             var myBlob = new Blob([data]);
             var blobURL = (window.URL || window.webkitURL).createObjectURL(myBlob);
             var anchor = document.createElement("a");
             anchor.download = fileSaveAs;
             anchor.href = blobURL;
             anchor.click();
             deferred.resolve(true);
         }).error(function (data, status, headers, config) {
             console.error(status)
             deferred.resolve(false);
         });

         return deferred.promise;
     };*/

    var downloadLatestFile = function (fileName, fileSaveAs) {
        return $http({
            url: baseUrls.fileService + "/FileService/File/DownloadLatest/" + fileName,
            method: "get",
            //data: json, //this is your json data string
            headers: {
                'Content-type': 'application/json'
            },
            responseType: 'arraybuffer',
            reportProgress: true,
            uploadEventHandlers: {
                progress: function (e) {
                    console.log("ff888888888888888888888888888888888888888888888888888888")
                }
            }
        }).success(function (data, status, headers, config) {

            /*
             var blob = new Blob([data], {type: "application/image/png"});
             var objectUrl = URL.createObjectURL(blob);
             window.open(objectUrl);
             */

            var myBlob = new Blob([data]);
            var blobURL = (window.URL || window.webkitURL).createObjectURL(myBlob);
            var anchor = document.createElement("a");
            anchor.download = fileSaveAs;
            anchor.href = blobURL;
            anchor.click();
            return true;
        }).error(function (data, status, headers, config) {
            console.error(status)
            return false;
        });

    };


    return {
        UploadUrl: baseUrls.fileService + "FileService/File/Upload",
        GreetingUploadUrl: baseUrls.fileService + "FileService/Agent/FileUpload",
        downloadAttachment: downloadAttachment,
        downloadLatestFile: downloadLatestFile,

        Headers: {'Authorization': authService.GetToken()}
    }
});

