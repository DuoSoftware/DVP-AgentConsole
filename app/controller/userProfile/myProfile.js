/**
 * Created by Veery Team on 9/19/2016.
 */

angular.module('veeryAgentApp').factory('profileDataParser', function(){

    return {
        myProfile: undefined,
        myBusinessUnit: null,
        myBusinessUnitDashboardFilter: '*',
        userList:[],
        RecentEngagements:[],
        isInitiateLoad:true,
        myTicketMetaData:undefined,
        mySecurityLevel:0,
        statusNodes:{},
        myResourceID:undefined,
        myCallTaskID:undefined,
        myQueues:[],
        companyName:"",
        uploadLimit:0
    }
});

angular.module('veeryAgentApp').factory('businessUnitFactory', function($http){

    var getAllBusinessUnits = function()
    {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "BusinessUnits"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            }
            return [];
        });

    };

    return {
        BusinessUnits: [],
        GetBusinessUnits: getAllBusinessUnits
    }
});

/*
agentApp.factory("profileDataParser", function () {

   /!* var myProfile={};
    var userList=[];*!/

    return {
        myProfile: {},
        userList:[]
    }





});*/
