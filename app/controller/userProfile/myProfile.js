/**
 * Created by Veery Team on 9/19/2016.
 */

angular.module('veeryAgentApp').factory('profileDataParser', function(){

    return {
        myProfile: undefined,
        userList:[],
        RecentEngagements:[],
        isInitiateLoad:true,
        myTicketMetaData:undefined,
        mySecurityLevel:0,
        statusNodes:{},
        myResourceID:undefined
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
