/**
 * Created by Pawan on 1/11/2018.
 */
agentApp.factory("accessConfigService", function ($http, baseUrls, authService) {


    var getAccessConfig = function () {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl +"ExternalUserConfig"

        }).then(function(response)
        {
            if (response.data && response.data.IsSuccess && response.data.Result) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };





    return {
        getAccessConfig: getAccessConfig

    }
});