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
        company:"",
        uploadLimit:0
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
