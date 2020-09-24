/**
 * Created by Veery Team on 9/5/2016.
 */

agentApp.factory("engagementService", function ($http, baseUrls,authService) {


    var getEngagementIdsByProfile = function (id) {
        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"EngagementByProfile/"+id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSession = function (id) {
        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"Engagement/"+id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSessions = function (engagementId, ids) {
       /* var q='?';
        angular.forEach(ids,function(item){
            q = q + 'session='+item+'&';
        });*/

        return $http({
            method: 'get',
            // params: ids,
            //url: baseUrls.engagementUrl+"Engagement/"+engagementId+"/EngagementSessions"+q
            url: baseUrls.engagementUrl+"EngagementSession/"+ids
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSessionNote = function (engagementId) {

        return $http({
            method: 'get',
            // params: ids,
            url: baseUrls.engagementUrl+"EngagementSession/"+engagementId+"/Note"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    /*var appendNoteToEngagementSession = function (engagementId,note) {

        return $http({
            method: 'post',
            data: note,
            url: baseUrls.engagementUrl+"EngagementSession/"+engagementId+"/Note"
        }).then(function (response) {
            if (response.data) {
                return response.data.IsSuccess;
            } else {
                return false;
            }
        });
    };*/

    // Sanura Wijayaratne - 2020/05/20
    var appendNoteToEngagementSession = function (profileId,engagementId,note) {
        return $http({
            method: 'post',
            data: note,
            url: baseUrls.engagementUrl+"Profile/"+profileId+"/EngagementSession/"+engagementId+"/Note"
        }).then(function (response) {
            if (response.data) {
                return response.data.IsSuccess;
            } else {
                return false;
            }
        });
    };

    var createEngagementSession = function (userId, engagementSession) {

        return $http({
            method: 'post',
            data: engagementSession,
            url: baseUrls.engagementUrl+"Engagement/"+userId+"/EngagementSession"
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var addEngagementSessionForProfile = function (engagement) {

        return $http({
            method: 'post',
            data: engagement,
            url: baseUrls.engagementUrl+"EngagementSessionForProfile"
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var engagementCount = function (userId) {

        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"EngagementSessionCount/"+userId
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };


    var moveEngagementBetweenProfiles = function (session, operation, from , to) {

        return $http({
            method: 'put',
            url: baseUrls.engagementUrl+"EngagementSession/"+session+"/Move/"+operation+"/From/"+from+"/To/"+to
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return false;
            }
        });
    };

    var addIsolatedEngagementSession = function (profileId,session) {

        return $http({
            method: 'put',
            url: baseUrls.engagementUrl+"Engagement/"+profileId+"/IsolatedEngagementSession/"+session
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var sendEmailAndSms = function (msgObj) {
        return $http({
            method: 'post',
            url: baseUrls.engagementUrl+"UMS/Interact",
            data:msgObj
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementsByProfile = function (id,limit,skip,qParams) {

        var channelStr="";

        if(qParams && qParams.length>0)
        {
            qParams.forEach(function (param,i) {

                if(i!=qParams.length-1)
                {
                    channelStr=channelStr+param.toLowerCase()+"&";
                }
                else
                {
                    channelStr=channelStr+param.toLowerCase();
                }

            })
        }


        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"ExternalUserProfile/"+id+"/EngagementSessions?limit="+limit+"&skip="+skip+"&"+channelStr
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };


    return {
        GetEngagementIdsByProfile: getEngagementIdsByProfile,
        GetEngagementSession:getEngagementSession,
        GetEngagementSessions:getEngagementSessions,
        GetEngagementSessionNote:getEngagementSessionNote,
        AppendNoteToEngagementSession:appendNoteToEngagementSession,
        createEngagementSession: createEngagementSession,
        EngagementCount:engagementCount,
        MoveEngagementBetweenProfiles: moveEngagementBetweenProfiles,
        AddIsolatedEngagementSession: addIsolatedEngagementSession,
        AddEngagementSessionForProfile: addEngagementSessionForProfile,
        sendEmailAndSms:sendEmailAndSms,
        getEngagementsByProfile:getEngagementsByProfile
    }
});

