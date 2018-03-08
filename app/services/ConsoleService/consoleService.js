/**
 * Created by Pawan on 1/16/2018.
 */
agentApp.factory("consoleService", function ($http, baseUrls, authService) {


    var getMyReceivedInvitations = function () {
        return $http({
            method: 'get',
            url: baseUrls.userServiceBaseUrl + "ReceivedInvitations"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var acceptInvitation = function (invite) {
        return $http({
            method: 'put',
            url: baseUrls.userServiceBaseUrl + "Invitation/Accept/"+invite._id+"/company/"+invite.company+"/tenant/"+invite.tenant
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
    var rejectInvitation = function (invite) {
        return $http({
            method: 'put',
            url: baseUrls.userServiceBaseUrl + "Invitation/Reject/"+invite._id+"/company/"+invite.company+"/tenant/"+invite.tenant
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
    var cancelInvitation = function (invite) {
        return $http({
            method: 'put',
            url: baseUrls.userServiceBaseUrl + "Invitation/Cancel/"+invite._id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };


    return {
        getMyReceivedInvitations: getMyReceivedInvitations,
        acceptInvitation: acceptInvitation,
        rejectInvitation: rejectInvitation,
        cancelInvitation: cancelInvitation
    }
});