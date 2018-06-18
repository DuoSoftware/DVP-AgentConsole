/**
 * Created by Rajinda Waruna on 12/06/2018.
 */

agentApp.factory('package_service', function ($http,baseUrls) {
   return {
       pickCompanyInfo : function (tenant, company) {
           return $http({
               method: 'GET',
               url: baseUrls.packageServiceBaseUrl + "Organisation/Name/" + tenant + "/" + company
           }).then(function (response) {
               return response;
           });
       },
       getPhoneConfig: function () {
           return $http({
               method: 'GET',
               url: baseUrls.packageServiceBaseUrl + "Phone/Config"
           }).then(function (response) {
               if (response.data && response.data.IsSuccess) {
                   return response.data.Result;
               } else {
                   return undefined;
               }
           });
       },
       AddPhoneConfig: function () {
           return $http({
               method: 'POST',
               url: baseUrls.packageServiceBaseUrl + "Phone/Config"
           }).then(function (response) {
               return response.data;
           })
       },
    };
});