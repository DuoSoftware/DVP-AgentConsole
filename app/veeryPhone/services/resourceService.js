/**
 * Created by Veery Team on 12/31/2015.
 */

var resourceModule = angular.module("veerySoftPhoneModule", []);
resourceModule.factory("resourceService", function ($http, $log, $filter, baseUrls, shared_data, authService) {
//Format is Authorization: Bearer [token]
    var breakRequest = function (resourceId, reason) {
        return $http({
            method: 'put',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId + "/state/NotAvailable/reason/" + reason
        }).then(function (response) {
            return response.data;
        });
    };

    var endBreakRequest = function (resourceId, reason) {

        return $http({
            method: 'put',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId + "/state/Available/reason/" + reason
        }).then(function (response) {
            return response.data;
        });

    };
//{"ResourceId":resourceId,"HandlingTypes":["CALL"]}
    var registerWithArds = function (resourceId, contact, businessUnit) {
        /*{
         "Type": "CALL",
         "Contact": contact
         }*/
        return $http({
            method: 'post',
            url: baseUrls.ardsliteserviceUrl + "resource" +
            "",
            data: {
                "ResourceId": resourceId,
                "HandlingTypes": [],
                "BusinessUnit": businessUnit
            }

        }).then(function (response) {
            return response.data.IsSuccess;
        });

    };

    var unregisterWithArds = function (resourceId) {
        return $http({
            method: 'delete',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId
        }).then(function (response) {
            return response.data.IsSuccess;
        });

    };


    var getOnlineAgentList = function () {
        return $http({
            method: 'get',
            url: baseUrls.ardsMonitoringServiceUrl + "/resources"
        }).then(function (response) {
            return response.data;
        });

    };

    var changeRegisterStatus = function (resourceId, type, contactName, businessUnit) {
        return $http({
            method: 'put',
            url: baseUrls.ardsliteserviceUrl + "resource/share",
            data: {
                "ResourceId": resourceId,
                "HandlingTypes": [{
                    "Type": type,
                    "Contact": contactName
                }],
                "BusinessUnit": businessUnit
            }
        }).then(function (response) {
            return response.data;
        });
    };

    var getResourceState = function (resourceId) {
        return $http({
            method: 'get',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId + "/state"
        }).then(function (response) {
            return response.data;
        });
    };

    var getResource = function (resourceId) {
        return $http({
            method: 'get',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId
        }).then(function (response) {
            return response.data;
        });
    };

    var getAcwTime = function () {
        return $http({
            method: 'get',
            url: baseUrls.ardsliteserviceUrl + "requestmeta/CALLSERVER/CALL"
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var freezeAcw = function (callSessionId, endFreeze) {
        return $http({
            method: 'put',
            url: baseUrls.ardsliteserviceUrl + "resource/" + authService.GetResourceId() + "/concurrencyslot/session/" + callSessionId,
            data: {
                "RequestType": "CALL",
                "State": endFreeze ? "Freeze" : "endFreeze",
                "Reason": "",
                "OtherInfo": "End Freeze by Agent"
            }
        }).then(function (response) {
            console.log("callSessionId : " + callSessionId + " endFreeze : " + endFreeze + " response : " + response);
            return response.data.IsSuccess;
        });
    };

    var endAcw = function (callSessionId, endFreeze) {
        return $http({
            method: 'put',
            url: baseUrls.ardsliteserviceUrl + "resource/" + authService.GetResourceId() + "/concurrencyslot/session/" + callSessionId,
            data: {
                "RequestType": "CALL",
                "State": "Available",
                "Reason": "End ACW by Agent",
                "OtherInfo": "End ACW by Agent."
            }
        }).then(function (response) {
            console.log("callSessionId : " + callSessionId + " endFreeze : " + endFreeze + " response : " + response);
            return response.data.IsSuccess;
        });
    };

    var mapResourceToVeery = function (publicIdentity) {
        /*dynamic data = new JObject();
         data.SipURI = profile.publicIdentity.Replace("sip:", "");
         data.ResourceId = profile.id;*/
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/BindResourceToVeeryAccount",
            data: {
                "SipURI": publicIdentity.replace("sip:", ""),
                "ResourceId": authService.GetResourceId()
            }
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var sipUserPassword = function (userName) {
        return $http({
            method: 'get',
            url: baseUrls.sipuserUrl + "SipUser/User/" + userName + "/Password"
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var ivrList = function () {
        return $http({
            method: 'get',
            url: baseUrls.sipuserUrl + "SipUser/ExtensionsByCategory/IVR"
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var getResourceTasks = function (resourceId) {
        return $http({
            method: 'get',
            url: baseUrls.resourceService + "Resource/" + resourceId + "/Tasks"
        }).then(function (response) {
            return response.data;
        });
    };

    var getCurrentRegisterTask = function (resourceId) {
        return $http({
            method: 'get',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId
        }).then(function (response) {
            return response.data;
        });
    };

    var removeSharing = function (resourceId, task) {
        return $http({
            method: 'DELETE',
            url: baseUrls.ardsliteserviceUrl + "resource/" + resourceId + "/removesSharing/" + task.toString().toUpperCase()
        }).then(function (response) {
            return response.data;
        });
    };

    var getActiveDynamicBreakTypes = function () {
        return $http({
            method: 'get',
            url: baseUrls.resourceService + "BreakTypes/Active"
        }).then(function (response) {
            return response.data;
        });
    };

    var call = function (number, extension) {
        return $http({
            method: 'get',
            url: baseUrls.dialerUrl + number + "/" + extension
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return false;
            }
        });
    };

    var transferCall = function (number, callrefid, legId) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/transfer",
            params: {
                callrefid: callrefid,
                legId: legId,
                number: number

            }
        }).then(function (response) {
            if (response.data) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var transferIVR = function (number, callrefid, legId) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/transfer",
            params: {
                callrefid: callrefid,
                legId: legId,
                number: number

            }
        }).then(function (response) {
            if (response.data) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var etlCall = function (sessionId) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/hungup",
            params: {
                callrefid: "123"
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };
    var callHungup = function (sessionId) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/hungup",
            params: {
                callrefid: sessionId
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return response.data && response.data.CustomMessage === "Call not found for channel id";
            }
        });
    };

    var callHold = function (callrefid, opration) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/hold/" + opration,
            params: {
                callrefid: callrefid
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var callMute = function (callrefid, opration) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/mute/" + opration,
            params: {
                callrefid: callrefid
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var sendDtmf = function (callrefid, digit) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/dtmf",
            params: {
                callrefid: callrefid,
                digit: digit
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var callAnswer = function (callrefid) {
        return $http({
            method: 'post',
            url: baseUrls.monitorrestapi + "MonitorRestAPI/Direct/answer",
            params: {
                callrefid: callrefid
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var validate_status_with_ards = function (resource_id) {
        return $http({
            method: 'get',
            url: baseUrls.ardsMonitoringServiceUrl + "resource/" + resource_id + "/task/call/status"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return null;
            }
        });
    };

    var get_current_data = function (resource_id) {
        return $http({
            method: 'get',
            url: baseUrls.ardsliteserviceUrl + "resource/"+resource_id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return null;
            }
        });
    };

    return {
        CallHungup: callHungup,
        EtlCall: etlCall,
        Call: call,
        TransferCall: transferCall,
        TransferIVR: transferIVR,
        CallHold: callHold,
        CallMute: callMute,
        SendDtmf: sendDtmf,
        CallAnswer: callAnswer,
        BreakRequest: breakRequest,
        EndBreakRequest: endBreakRequest,
        RegisterWithArds: registerWithArds,
        UnregisterWithArds: unregisterWithArds,
        getOnlineAgentList: getOnlineAgentList,
        ChangeRegisterStatus: changeRegisterStatus,
        GetResourceState: getResourceState,
        GetResource: getResource,
        GetAcwTime: getAcwTime,
        FreezeAcw: freezeAcw,
        EndAcw: endAcw,
        MapResourceToVeery: mapResourceToVeery,
        SipUserPassword: sipUserPassword,
        GetResourceTasks: getResourceTasks,
        GetCurrentRegisterTask: getCurrentRegisterTask,
        RemoveSharing: removeSharing,
        IvrList: ivrList,
        GetActiveDynamicBreakTypes: getActiveDynamicBreakTypes,
        validate_status_with_ards: validate_status_with_ards,
        Get_current_data: get_current_data
    }

});

/*move to shared_data*/
/*resourceModule.factory('shared_data', function () {
    return {userProfile : {},userAccessFields : {}}
});*/
