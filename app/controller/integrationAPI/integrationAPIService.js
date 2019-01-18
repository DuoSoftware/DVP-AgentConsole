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
            getIntegrationAPIData: getIntegrationAPIData,
            GetIntegrationDetails: getIntegrationDetails,
            GetIntegrationAPIDetails: getIntegrationAPIDetails
        };
    };

    var module = angular.module("veeryAgentApp");
    module.factory("integrationAPIService", integrationAPIService);

}());


