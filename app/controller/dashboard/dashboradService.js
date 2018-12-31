/**
 * Created by team verry on 9/29/2016.
 */


agentApp.factory("dashboradService", function ($http, baseUrls, authService, $state, profileDataParser) {

    var getTotalTicketCount = function (status) {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardEvent/TotalCount/"+profileDataParser.myBusinessUnitDashboardFilter+"/" + status + "/user_" + authService.GetResourceIss() + "/*"
        }).then(function (response) {
            if (response.status === 200) {
                if (response.data.IsSuccess && response.data.Result) {
                    return response.data.Result;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        });

    };

    var getCurrentTicketCount = function (status) {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardEvent/CurrentCount/"+profileDataParser.myBusinessUnitDashboardFilter+"/" + status + "/user_" + authService.GetResourceIss() + "/*"
        }).then(function (response) {
            if (response.status === 200) {
                if (response.data.IsSuccess && response.data.Result) {
                    return response.data.Result;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        });

    };

    var getCreatedTicketSeries = function () {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardGraph/NewTicketByUser/"+profileDataParser.myBusinessUnitDashboardFilter+"/30"
        }).then(function (response) {
            if (response.data) {
                if (response.data.IsSuccess && response.data.Result && response.data.Result.length > 0 && response.data.Result[0].datapoints && response.data.Result[0].datapoints) {
                    return response.data.Result[0].datapoints;
                } else {
                    return {};
                }
            } else {

                return {};
            }
        });

    };

    var getResolvedTicketSeries = function () {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardGraph/ClosedTicketByUser/"+profileDataParser.myBusinessUnitDashboardFilter+"/30"
        }).then(function (response) {
            if (response.data) {
                if (response.data.IsSuccess && response.data.Result && response.data.Result.length > 0 && response.data.Result[0].datapoints && response.data.Result[0].datapoints) {
                    return response.data.Result[0].datapoints;
                } else {
                    return {};
                }
            } else {

                return {};
            }
        });
    };

    var getDeferenceResolvedTicketSeries = function () {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardGraph/ClosedVsOpenTicketByUser/"+profileDataParser.myBusinessUnitDashboardFilter+"/30"
        }).then(function (response) {
            if (response.data) {
                if (response.data.IsSuccess && response.data.Result && response.data.Result.length > 0 && response.data.Result[0].datapoints && response.data.Result[0].datapoints) {
                    return response.data.Result[0].datapoints;
                } else {
                    return {};
                }
            } else {

                return {};
            }
        });

    };

    var productivityByResourceId = function (id) {

        return $http({
            method: 'get',
            url: baseUrls.resourceService + id + "/Productivity",
            params:{bu:profileDataParser.myBusinessUnit}
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getQueueDetails = function () {
        return $http({
            method: 'get',
            url: baseUrls.dashBordUrl + "DashboardEvent/QueueDetails/"+profileDataParser.myBusinessUnitDashboardFilter
        }).then(function (response) {
            if (response.data.IsSuccess && response.data.Result) {
                return response.data.Result;
            } else {
                return 0;
            }
        });
    };

    var getNewTicketCountViaChenal = function (chenal) {
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl + "DashboardEvent/TotalCount/"+profileDataParser.myBusinessUnitDashboardFilter+"/NEWTICKET/via_" + chenal + "/*"
        }).then(function (response) {
            if (response.data) {
                if (response.data.IsSuccess && response.data.Result) {
                    return response.data.Result;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        });

    };

    var getStoredNotices = function () {
        return $http({
            method: 'GET',
            url: baseUrls.notification + "/DVP/API/1.0.0.0/NotificationService/NoticeBoard"
        }).then(function (response) {
            return response.data;
        });

    };

    var getAgentActivity = function () {
        return $http({
            method: 'GET',
            url: baseUrls.cdrProcessor + "CallCDR/MyAgentStatus"
        }).then(function (response) {
            return response.data;
        });
    };

    var getAgentPerformance = function (id) {
        return $http({
            method: 'GET',
            url: baseUrls.resourceService + "Resource/" + id + "/AgentPerformance"
        }).then(function (response) {
            return response.data;
        });
    };

    var getMyQueueDetails = function (skills) {
        return $http({
            method: 'get',
            url: baseUrls.resourceService + "MyQueues",
            params: {Skills: skills}
        }).then(function (response) {
            if (response.data.IsSuccess && response.data.Result) {
                return response.data.Result;
            } else {
                return 0;
            }
        });
    };

    var checkMyQueue = function (recID, resId, callTaskId) {
        return $http({
            method: 'get',
            url: baseUrls.resourceService + "IsMyQueue/" + recID + "/Resource/" + resId + "/ByTasks",
            params: {tasks: JSON.stringify([callTaskId])}
        }).then(function (response) {
            if (response) {
                return response;
            } else {
                return false;
            }
        });

    };
    var getMyQueueData = function (resId) {
        return $http({
            method: 'get',
            url: baseUrls.resourceService + "MyQueueData/" +resId
        }).then(function (response) {
            if (response) {
                return response;
            } else {
                return false;
            }
        });

    }


    return {
        ProductivityByResourceId: productivityByResourceId,
        GetCreatedTicketSeries: getCreatedTicketSeries,
        GetResolvedTicketSeries: getResolvedTicketSeries,
        GetTotalTicketCount: getTotalTicketCount,
        GetDeferenceResolvedTicketSeries: getDeferenceResolvedTicketSeries,
        GetQueueDetails: getQueueDetails,
        getStoredNotices: getStoredNotices,
        GetAgentActivity: getAgentActivity,
        GetAgentPerformance: getAgentPerformance,
        getMyQueueDetails: getMyQueueDetails,
        checkMyQueue: checkMyQueue,
        GetCurrentTicketCount: getCurrentTicketCount,
        getMyQueueData:getMyQueueData
    }
});

