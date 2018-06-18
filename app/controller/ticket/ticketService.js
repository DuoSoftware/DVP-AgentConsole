/**
 * Created by Veery Team on 9/8/2016.
 */

agentApp.factory("ticketService", function ($http, baseUrls, authService) {


    var getAllTicketsByRequester = function (requester, page) {
        return $http({
            method: 'get',
            url: baseUrls.ticketUrl + "Tickets/Requester/" + requester + "/15/" + page
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getExternalUserTicketCounts = function (requester) {
        return $http({
            method: 'get',
            url: baseUrls.ticketUrl + "ExternalUserTicketCounts/" + requester
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var saveTicket = function (ticket) {
        return $http({
            method: 'Post',
            url: baseUrls.ticketUrl + "Ticket",
            data: ticket
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var getResourceIss = function () {
        return authService.GetResourceIss();
    };

    // .........................  get all tickets with status .................................

    var getNewTickets = function (page) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/10/" + page + "?status=new"
        }).then(function (response) {
            return response;
        });
    };

    var getOpenTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/10/" + page + "?status=open&status=progressing"
        }).then(function (response) {
            return response;
        });
    };

    var getClosedTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/10/" + page + "?status=parked&status=solved&status=closed"
        }).then(function (response) {
            return response;
        });
    };

    // .........................  get My tickets with status .................................

    var getMyRecentTickets = function () {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "RecentTickets"
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var getMyNewTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTickets/10/" + page + "?status=new"
        }).then(function (response) {
            return response;
        });
    };

    var getMyOpenTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTickets/10/" + page + "?status=open&status=progressing"
        }).then(function (response) {
            return response;
        });
    };

    var getMyClosedTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTickets/10/" + page + "?status=parked&status=solved&status=closed"
        }).then(function (response) {
            return response;
        });
    };

    // .........................  get My group tickets with status .................................

    var getMyGroupTickets = function (page) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyGroupTickets/10/" + page + "?status=new"
        }).then(function (response) {
            return response;
        });
    };

    var mapFormSubmissionToTicket = function (formSubId, ticketId) {
        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + 'Ticket/' + ticketId + '/FormSubmission',
            data: JSON.stringify({form_submission: formSubId})
        }).then(function (response) {
            return response.data;
        });
    };
    var getMyGroupOpenTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyGroupTickets/10/" + page + "?status=open&status=progressing"
        }).then(function (response) {
            return response;
        });
    };

    var getMyGroupClosedTickets = function (page) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyGroupTickets/10/" + page + "?status=parked&status=solved&status=closed"
        }).then(function (response) {
            return response;
        });
    };


    var getTicket = function (ticketID) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/Details"
        }).then(function (response) {
            return response;
        });
    };

    var updateTicket = function (ticketID, ticketObject) {
        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID,
            data: ticketObject
        }).then(function (response) {
            return response;
        });
    };

    var updateTicketByReference = function (cusReference, postData) {
        return $http({
            method: 'put',
            url: baseUrls.ticketUrl + "TicketByReference/" + cusReference + "/Comment",
            data: postData
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return false;
            }
        });
    };

    var createTicketView = function (ticketView) {
        var authToken = authService.GetToken();

        return $http({
            method: 'POST',
            url: baseUrls.ticketUrl + "TicketView",
            data: ticketView
        }).then(function (response) {
            return response;
        });
    };

    var getTicketView = function (id) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketView/" + id
        }).then(function (response) {
            return response;
        });
    };

    var getTicketCountByView = function (id) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketView/" + id + "/TicketCount"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return "*";
            }
        });
    };

    var getTicketViews = function () {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketViews"
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var getTicketsByView = function (id, page, sorted_by, pageSize) {

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketView/" + id + "/Tickets/" + pageSize + "/" + page + '&sorted_by=' + sorted_by
        }).then(function (response) {
            return response.data.Result;
        });
    };

    var AddNewCommentToTicket = function (ticketId, commentObject) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/Comment",
            data: commentObject
        }).then(function (response) {
            return response;
        });

    };

    var pickTicket = function (ticketId) {

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/pick"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });

    };

    var AssignUserToTicket = function (ticketId, userId) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/AssignUser/" + userId
        }).then(function (response) {
            return response;
        });

    };

    var AssignUserGroupToTicket = function (ticketId, groupId) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/AssignGroup/" + groupId
        }).then(function (response) {
            return response;
        });

    };

    var getTicketNextLevel = function (ticketType, currentStatus) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "/TicketStatusFlow/NextAvailableStatus/" + ticketType + "/" + currentStatus
        }).then(function (response) {
            return response;
        });
    };

    var updateTicketStatus = function (ticketID, newStatus) {
        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/Status",
            data: newStatus
        }).then(function (response) {
            return response;
        });
    };

    var AddSubTicket = function (ticketID, subTicket) {
        var authToken = authService.GetToken();

        return $http({
            method: 'POST',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/SubTicket",
            data: subTicket
        }).then(function (response) {
            return response;
        });
    };


    var getExternalUserRecentTickets = function (id) {
        return $http({
            method: 'get',
            url: baseUrls.ticketUrl + "ExternalUserRecentTickets/" + id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getFormsForCompany = function () {

        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "FormProfile"
        }).then(function (response) {
            return response.data;
        });

    };

    var getFormByIsolatedTag = function (isolated_tags) {

        var payload = {
            isolated_tags: isolated_tags
        };

        return $http({
            method: 'POST',
            url: baseUrls.ticketUrl + 'FormMasters/FormsByTags',
            data: JSON.stringify(payload)
        }).then(function (response) {
            return response.data;
        });
    };

    var getFormSubmissionByRef = function (ref) {

        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "FormSubmission/" + ref
        }).then(function (response) {
            return response.data;
        });

    };

    var updateFormSubmissionData = function (refId, updateValues) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "FormSubmission/" + refId,
            data: JSON.stringify(updateValues)
        }).then(function (response) {
            return response.data;
        });

    };

    var createFormSubmissionData = function (saveValues) {

        var authToken = authService.GetToken();

        return $http({
            method: 'POST',
            url: baseUrls.ticketUrl + "FormSubmission",
            data: JSON.stringify(saveValues)
        }).then(function (response) {
            return response.data;
        });

    };

    var createTimer = function (ticketId) {
        var reqData = {ticket: ticketId};
        return $http({
            method: 'Post',
            url: baseUrls.ticketUrl + "Timer",
            data: reqData
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var startTimer = function () {
        var reqBody = {note: ""};
        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "MyTimer/start",
            data: reqBody
        }).then(function (response) {
            if (response) {
                return response.data.IsSuccess;
            } else {
                return undefined;
            }
        });
    };

    var pauseTimer = function (trackerId) {
        var reqBody = {note: ""};
        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "MyTimer/" + trackerId + "/pause",
            data: reqBody
        }).then(function (response) {
            if (response) {
                return response.data.IsSuccess;
            } else {
                return undefined;
            }
        });
    };

    var stopTimer = function (trackerId) {
        var reqBody = {note: ""};
        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "MyTimer/" + trackerId + "/stop",
            data: reqBody
        }).then(function (response) {
            if (response) {
                return response.data.IsSuccess;
            } else {
                return undefined;
            }
        });
    };

    var searchTicket = function (searchText) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketSearch/" + searchText + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByField = function (field, value) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketsByField/" + field + "/" + value
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByChannel = function (channel) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/Channel/" + channel + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByGroupId = function (groupId) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/Group/" + groupId + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByPriority = function (priority) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/Priority/" + priority + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByStatus = function (status) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/" + status + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var searchTicketByRequester = function (requester) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/Requester/" + requester + "/25/1"
        }).then(function (response) {
            return response.data;
        });
    };

    var AddNewAttachmentToTicket = function (ticketId, attachmentObject) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/Attachment",
            data: attachmentObject
        }).then(function (response) {
            return response;
        });

    };

    var RemoveAttachmentFromTicket = function (ticketId, attachmentID) {

        var authToken = authService.GetToken();

        return $http({
            method: 'DELETE',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/Attachment/" + attachmentID
        }).then(function (response) {
            return response;
        });

    };

    var PickLoggedTime = function (ticketId) {

        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Timers/Ticket/" + ticketId

        }).then(function (response) {
            return response;
        });

    };
    var WatchTicket = function (ticketId) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/Watch"
        }).then(function (response) {
            return response;
        });

    };
    var StopWatchTicket = function (ticketId) {

        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketId + "/StopWatch"
        }).then(function (response) {
            return response;
        });

    };

    /*var pickCompanyInfo = function (tenant, company) {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "Organisation/Name/" + tenant + "/" + company
        }).then(function (response) {
            return response;
        });
    };*/


    var updateTicketEstimateTime = function (ticketID, estimTime) {
        var authToken = authService.GetToken();

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/EstimatedTime",
            data: {
                time_estimation: estimTime
            }
        }).then(function (response) {
            return response;
        });
    };

    var getMyTimer = function () {
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTimer"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getAvailableTicketTypes = function () {
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "AvailableTicketTypes"
        }).then(function (response) {
            if (response.data) {
                return response.data;
            } else {
                return undefined;
            }
        });
    };

    var AddAttachmentToSlot = function (ticketID, slotname, attachmentID) {

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/slot/" + slotname + "/attachment/" + attachmentID,

        }).then(function (response) {
            return response;
        });
    };

    var DeleteAttachmentFromSlot = function (ticketID, slotname, attachmentID) {

        return $http({
            method: 'DELETE',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/slot/" + slotname + "/attachment/" + attachmentID,

        }).then(function (response) {
            return response;
        });
    };
    var UpdateTicketSecurityLevel = function (ticketID, level) {

        return $http({
            method: 'PUT',
            url: baseUrls.ticketUrl + "Ticket/" + ticketID + "/SecurityLevel?level=" + level,

        }).then(function (response) {
            return response;
        });
    };

    /*------------ config ticker data -----------*/
   /* var GetMyTicketConfig = function (callback) {
        $http.get(baseUrls.userServiceBaseUrl + 'MyAppMeta')
            .success(function (data, status, headers, config) {
                callback(true, data);
            }).error(function (data, status, headers, config) {
            //login error
            callback(false, data);
        });
    };

    var SaveMyTicketConfig = function (param, callback) {
        $http.put(baseUrls.userServiceBaseUrl + 'MyAppMeta', param)
            .success(function (data, status, headers, config) {
                callback(true, data);
            }).error(function (data, status, headers, config) {
            //login error
            callback(false, data);
        });
    };*/


    /*------------ get inbox ticker count -----------*/
    var getAllCountByTicketStatus = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/count?"+ status
        }).then(function (response) {
            return response;
        });
    };

    var getTicketByStatus = function (page, status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "Tickets/10/" + page + "?status=" + status
        }).then(function (response) {
            return response;
        });
    };


    //my ticket
    var getAllByMyTickes = function (page, status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTickets/10/" + page + "?status=" + status
        }).then(function (response) {
            return response;
        });
    };

    var getCountByMyticketStatus = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyTickets/count?"+ status
        }).then(function (response) {
            return response;
        });
    };

    // my group
    var getAllMyGroupTickets = function (page, status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyGroupTickets/10/" + page + "?status=" + status
        }).then(function (response) {
            return response;
        });
    };

    var getCountByMyGroupStatus = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "MyGroupTickets/count?" + status
        }).then(function (response) {
            return response;
        });
    };


    //submitted by me get count
    var getCountSubmittedByMeTicket = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketsSubmittedByMe/count?status=" + status
        }).then(function (response) {
            return response;
        });
    };


    var getCountWatchedByMeTicket = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketsWatchedByMe/count?status=" + status
        }).then(function (response) {
            return response;
        });
    };

    //collaborated by me
    var getCountCollaboratedByMeTicket = function (status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + "TicketsCollaboratedByMe/count?status=" + status
        }).then(function (response) {
            return response;
        });
    };

    //getAllTickets
    var getAllTickets = function (page, status, ticketType, sorted_by, pageSize) {
        var authToken = authService.GetToken();
        var url = baseUrls.ticketUrl + ticketType + "/" + pageSize + "/" + page + "?" + status + '&sorted_by=' + sorted_by;


        console.log(url);

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + ticketType + "/" + pageSize + "/" + page + "?" + status + '&sorted_by=' + sorted_by
        }).then(function (response) {
            return response;
        });
    };

    //getTicketCount
    var getTicketsCount = function (ticketType, status) {
        var authToken = authService.GetToken();
        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl + ticketType + "/count?" + status
        }).then(function (response) {
            return response;
        });
    };

    var getStatusNodes = function () {

        return $http({
            method: 'GET',
            url: baseUrls.ticketUrl +'TicketStatusNodes'
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return null;
            }
        });
    };



    return {
        GetAllTicketsByRequester: getAllTicketsByRequester,
        SaveTicket: saveTicket,
        GetResourceIss: getResourceIss,
        getNewTickets: getNewTickets,
        getOpenTickets: getOpenTickets,
        getClosedTickets: getClosedTickets,
        GetMyRecentTickets: getMyRecentTickets,
        getMyNewTickets: getMyNewTickets,
        getMyOpenTickets: getMyOpenTickets,
        getMyClosedTickets: getMyClosedTickets,
        getMyGroupTickets: getMyGroupTickets,
        getMyGroupOpenTickets: getMyGroupOpenTickets,
        getMyGroupClosedTickets: getMyGroupClosedTickets,
        getTicket: getTicket,
        updateTicket: updateTicket,
        UpdateTicketByReference: updateTicketByReference,
        CreateTicketView: createTicketView,
        GetTicketView: getTicketView,
        GetTicketCountByView: getTicketCountByView,
        GetTicketViews: getTicketViews,
        GetTicketsByView: getTicketsByView,
        AddNewCommentToTicket: AddNewCommentToTicket,
        AssignUserGroupToTicket: AssignUserGroupToTicket,
        getTicketNextLevel: getTicketNextLevel,
        createTimer: createTimer,
        startTimer: startTimer,
        pauseTimer: pauseTimer,
        stopTimer: stopTimer,
        getFormsForCompany: getFormsForCompany,
        AssignUserToTicket: AssignUserToTicket,
        updateTicketStatus: updateTicketStatus,
        updateFormSubmissionData: updateFormSubmissionData,
        AddSubTicket: AddSubTicket,
        GetExternalUserRecentTickets: getExternalUserRecentTickets,
        createFormSubmissionData: createFormSubmissionData,
        mapFormSubmissionToTicket: mapFormSubmissionToTicket,
        PickTicket: pickTicket,
        searchTicket: searchTicket,
        searchTicketByField: searchTicketByField,
        searchTicketByChannel: searchTicketByChannel,
        searchTicketByGroupId: searchTicketByGroupId,
        searchTicketByPriority: searchTicketByPriority,
        searchTicketByStatus: searchTicketByStatus,
        searchTicketByRequester: searchTicketByRequester,
        AddNewAttachmentToTicket: AddNewAttachmentToTicket,
        RemoveAttachmentFromTicket: RemoveAttachmentFromTicket,
        getFormSubmissionByRef: getFormSubmissionByRef,
        PickLoggedTime: PickLoggedTime,
        WatchTicket: WatchTicket,
        StopWatchTicket: StopWatchTicket,
        GetExternalUserTicketCounts: getExternalUserTicketCounts,
        //pickCompanyInfo: pickCompanyInfo,
        getMyTimer: getMyTimer,
        updateTicketEstimateTime: updateTicketEstimateTime,
        getAvailableTicketTypes: getAvailableTicketTypes,
        AddAttachmentToSlot: AddAttachmentToSlot,
        DeleteAttachmentFromSlot: DeleteAttachmentFromSlot,
        getFormByIsolatedTag: getFormByIsolatedTag,
        UpdateTicketSecurityLevel: UpdateTicketSecurityLevel,

        getAllCountByTicketStatus: getAllCountByTicketStatus,
        getTicketByStatus: getTicketByStatus,
        getAllCountByMyticketStatus: getCountByMyticketStatus,
        getAllByMytickes: getAllByMyTickes,
        getAllMyGroupTickets: getAllMyGroupTickets,
        getCountByMyGroupStatus: getCountByMyGroupStatus,
        getCountSubmittedByMeTicket: getCountSubmittedByMeTicket,
        getCountWatchedByMeTicket: getCountWatchedByMeTicket,
        getCountCollaboratedByMeTicket: getCountCollaboratedByMeTicket,
        getAllTickets: getAllTickets,
        getTicketsCount: getTicketsCount,


        getStatusNodes: getStatusNodes
    }
});

