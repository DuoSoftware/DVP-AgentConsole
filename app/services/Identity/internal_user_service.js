/**
 * Created by Rajinda Waruna on 12/06/2018.
 */

agentApp.factory('internal_user_service', function ($http, baseUrls) {
    return {
        BusinessUnits: [],
        GetBusinessUnits: function (tenant, company) {
            return $http({
                method: 'GET',
                url: baseUrls.internal_user_service_base_url + "Organisation/Name/" + tenant + "/" + company
            }).then(function (response) {
                return response;
            });
        },
        LoadUser: function ($query) {

            return $http({
                method: 'GET',
                url: baseUrls.internal_user_service_base_url + "Users"
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return undefined;
                }
            });
        },
        getUserList: function () {
            return $http({
                method: 'GET',
                url: baseUrls.internal_user_service_base_url + "Users"

            }).then(function (response) {
                return response;
            });
        },
        GetMyTicketConfig: function (callback) {
            $http.get(baseUrls.internal_user_service_base_url + 'MyAppMeta')
                .success(function (data, status, headers, config) {
                    callback(true, data);
                }).error(function (data, status, headers, config) {
                //login error
                callback(false, data);
            });
        },
        SaveMyTicketConfig: function (param, callback) {
            $http.put(baseUrls.internal_user_service_base_url + 'MyAppMeta', param)
                .success(function (data, status, headers, config) {
                    callback(true, data);
                }).error(function (data, status, headers, config) {
                //login error
                callback(false, data);
            });
        },
        UpdateMyPwd: function (param, callback) {
            $http.put(baseUrls.internal_user_service_base_url + 'Myprofile/Password', param)
                .success(function (data, status, headers, config) {
                    callback(true, data);
                }).error(function (data, status, headers, config) {
                //login error
                callback(false, data);
            });
        },
        getUsers: function () {
            return $http({
                method: 'GET',
                url: baseUrls.internal_user_service_base_url + 'Users'
            }).then(function (resp) {
                return resp.data;
            })
        },
        addUser: function (userObj) {
            var jsonStr = JSON.stringify(userObj);
            return $http({
                method: 'POST',
                url: baseUrls.internal_user_service_base_url + 'User',
                data: jsonStr
            }).then(function (resp) {
                return resp.data;
            })
        },
        deleteUser: function (username) {
            return $http({
                method: 'DELETE',
                url: baseUrls.internal_user_service_base_url + 'User/' + username
            }).then(function (resp) {
                return resp.data;
            })
        },
        updateUserMeta: function (user, usermeta) {
            return $http({
                method: 'PUT',
                url: baseUrls.internal_user_service_base_url + "Users/" + user + "/UserMeta",
                data: usermeta

            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.IsSuccess;
                } else {
                    return false;
                }
            });
        },
        getMyReceivedInvitations: function () {
            return $http({
                method: 'get',
                url: baseUrls.internal_user_service_base_url + "ReceivedInvitations"
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return undefined;
                }
            });
        },
        acceptInvitation: function (invite) {
            return $http({
                method: 'put',
                url: baseUrls.internal_user_service_base_url + "Invitation/Accept/" + invite._id + "/company/" + invite.company + "/tenant/" + invite.tenant
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return undefined;
                }
            });
        },
        rejectInvitation: function (invite) {
            return $http({
                method: 'put',
                url: baseUrls.internal_user_service_base_url + "Invitation/Reject/" + invite._id + "/company/" + invite.company + "/tenant/" + invite.tenant
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return undefined;
                }
            });
        },
        cancelInvitation: function (invite) {
            return $http({
                method: 'put',
                url: baseUrls.internal_user_service_base_url + "Invitation/Cancel/" + invite._id
            }).then(function (response) {
                if (response.data && response.data.IsSuccess) {
                    return response.data.Result;
                } else {
                    return undefined;
                }
            });
        }


    };
});