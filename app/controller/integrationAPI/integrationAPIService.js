/**
 * Created by dinusha on 11/17/2016.
 */

(function () {

    var integrationAPIService = function ($http, baseUrls) {

        var getIntegrationURLMetaData = function (refName) {

            var url = baseUrls.integrationapi + 'IntegrationInfo/Reference/' + refName;

            return $http({
                method: 'GET',
                url: url
            }).then(function (resp) {
                return resp.data;
            })
        };

        // var getDefaultIntegrationData  = function (appID, inputObject) {
        //
        //     var url = baseUrls.integrationapi + 'DefaultIntegration/' + appID;
        //
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         data: JSON.stringify(inputObject)
        //     }).then(function (resp) {
        //         // if (resp.data && resp.data.IsSuccess) {
        //         //     return resp.data.Result;
        //         // } else {
        //         //     return null;
        //         // }
        //         return [{"Col1":"data11", "Col2":"data12"},{"Col1":"data21", "Col2":"data22"}];
        //     })
        // };
        var getDefaultIntegrationData  = function (appID, inputObject) {

            var url = "http://localhost:3000?id="+appID; // TODO add connrect url once the service is ready

            return $http({
                method: 'GET',
                url: url
            }).then(function (resp) {
                return resp.data.Result;
            })
        };
        var getIntegrationApps  = function () {

            var url = baseUrls.integrationapi+"AppList";

            return $http({
                method: 'GET',
                url: url
            }).then(function (resp) {
                return resp.data.Result;
            })
        };
        var getIntegrationAPIData = function (id, inputObject) {

            var url = baseUrls.integrationapi + 'CallAPI/' + id;

            return $http({
                method: 'POST',
                url: url,
                data: JSON.stringify(inputObject)
            }).then(function (resp) {
                if (resp.data && resp.data.IsSuccess) {
                    return resp.data.Result;
                } else {
                    return null;
                }
            })
        };

        var getIntegrationDetails = function (type,data) {

            var url = baseUrls.integrationapi + type+"/CallAPIs";
            return $http({
                method: 'POST',
                url: url,
                data:data
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return null;
                }
            })
        };

        var getIntegrationProfileSearch= function (data) {

            var url = baseUrls.integrationapi +"PROFILE_SEARCH_DATA/CallAPIs";
            return $http({
                method: 'POST',
                url: url,
                data:data
            }).then(function (response) {
                return response.data;
            })
        };

        var getIntegrationAPIDetails = function () {
            return $http({
                method: 'GET',
                url: baseUrls.integrationapi +"IntegrationInfo"
            }).then(function(response)
            {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return null;
                }
            });
        };
        return {
            getIntegrationURLMetaData: getIntegrationURLMetaData,
            GetDefaultIntegrationData: getDefaultIntegrationData,
            getIntegrationAPIData: getIntegrationAPIData,
            GetIntegrationDetails: getIntegrationDetails,
            GetIntegrationProfileSearch: getIntegrationProfileSearch,
            GetIntegrationAPIDetails: getIntegrationAPIDetails,
            GetIntegrationApps: getIntegrationApps
        };
    };

    var module = angular.module("veeryAgentApp");
    module.factory("integrationAPIService", integrationAPIService);

}());


