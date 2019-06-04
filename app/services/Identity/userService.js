/**
 * Created by Veery Team on 9/9/2016.
 */


agentApp.factory("userService", function ($http, baseUrls, authService) {


    var getExternalUserProfileByContact = function (category, contact) {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/ByContact/" + category + "/" + contact
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    /*var loadUser = function ($query) {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "Users"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
    var getUserList = function () {
        var authToken = authService.GetToken();

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "Users"

        }).then(function (response) {
            return response;
        });
    };*/
    var getUserGroupList = function () {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "UserGroups"
        }).then(function (response) {
            return response;
        });
    };
    var searchExternalUsers = function (searchText) {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/Search/" + searchText
        }).then(function (response) {
            return response.data;
        });
    };
    var getsearchExternalUsers = function () {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "ExternalUsers"
        }).then(function (response) {
            return response.data;
        });
    };

    var getMyProfileDetails = function () {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "Myprofile"
        }).then(function (response) {
            return response;
        });
    };

    var mapFormSubmissionToProfile = function (formSubId, profileId) {

        return $http({
            method: 'PUT',
            url: baseUrls.userServiceBaseUrl + 'ExternalUser/' + profileId + '/FormSubmission',
            data: JSON.stringify({form_submission: formSubId})
        }).then(function (response) {
            return response.data;
        });
    };

    var createExternalUser = function (profile) {
        return $http({
            method: 'Post',
            url: baseUrls.userServiceBaseUrl + "ExternalUser",
            data: profile
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var updateExternalUser = function (profile) {
        return $http({
            method: 'put',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/" + profile._id,
            data: profile
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var UpdateExternalUserProfileContact = function (profileId, contactInfo) {

        return $http({
            method: 'PUT',
            url: baseUrls.userServiceBaseUrl + 'ExternalUser/' + profileId + '/Contact/' + contactInfo.contact,
            data: JSON.stringify(contactInfo)
        }).then(function (response) {
            return response.data;
        });
    };

    var getExternalUserProfileByField = function (field, value) {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/ByField/" + field + "/" + value
        }).then(function (response) {
            return response.data;
        });
    };

    var getExternalUserProfileBySsn = function (ssn) {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/BySSN/" + ssn
        }).then(function (response) {
            return response.data;
        });
    };
    var getExternalUserProfileByID = function (ID) {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl+"ExternalUser/"+ID
        }).then(function (response) {
            return response.data;
        });
    };

    /*var getPhoneConfig = function () {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + "Phone/Config"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var addPhoneConfig = function () {
        return $http({
            method: 'POST',
            url: baseUrls.userServiceBaseUrl + "Phone/Config"
        }).then(function (response) {
            return response.data;
        });
    };*/
    var getGroupMembers = function (groupID) {

        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl + 'UserGroup/' + groupID + "/members",
        }).then(function (resp) {
            return resp.data;
        })
    };
    var deleteContact = function (id, contact) {
        return $http({
            method: 'delete',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/" + id + "/Contact/" + contact
        }).then(function (response) {
            return response.data;
        });
    };

    var deleteSocialContact = function (id, socialName) {
        var body = {};
        body[socialName] = '';
        return $http({
            method: 'put',
            url: baseUrls.userServiceBaseUrl + "ExternalUser/" + id,
            data: body
        }).then(function (response) {
            return response.data;
        });
    };

    var loadCutomerTags = function () {

        return $http({
            method: 'get',
            url: baseUrls.userServiceBaseUrl + "CustomerTags"
        }).then(function (response) {
            return response.data;
        });
    };

    var getSingleFileUploadLimit = function () {


        return $http({
            method: 'GET',
            url: baseUrls.fileService + "FileService/MaxUploadSize"

        }).then(function (response) {
            return response;
        });
    };

    var getAllUsers = function (callback) {
        var url = baseUrls.UserServiceBaseUrl + "Users";
        $http.get(url).then(function (res) {
            if (res.data && res.data.Result) {
                userListSerivce.users = [];
                userListSerivce.users = res.data.Result;
                callback(true);
            }
        }, function (err) {
            callback(true);
            console.log(err);
        });
    };
    var getContactVeeryFormat = function () {

        return $http({
            method: 'get',
            url: baseUrls.userServiceBaseUrl + "Myprofile/veeryformat/veeryaccount"
        }).then(function (response) {
            return response.data;
        });

    };

    var getOrganizationDetails = function () {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl +"Mylanguages"

        }).then(function(response)
        {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
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

    var getNavigationAccess = function () {
       var mynavigations = {};
      return  $http.get(baseUrls.userServiceBaseUrl + "MyAppScopes/MyAppScopes/AGENT_CONSOLE").then(function(response)
      {
          if (response.data && response.data.IsSuccess && response.data.Result) {
              response.data.Result[0].menus.forEach(function (item) {
                  mynavigations[item.menuItem] = true;
              });
          }
          return mynavigations;
      },function (err) {
          console.error(err);
          return undefined;
      });

    };

    return {
        getAccessConfig:getAccessConfig,
        getOrganizationDetails: getOrganizationDetails,
        GetContactVeeryFormat: getContactVeeryFormat,
        getAllUsers:getAllUsers,
        GetExternalUserProfileByContact: getExternalUserProfileByContact,
        /*LoadUser: loadUser,
        getUserList: getUserList,*/
        getUserGroupList: getUserGroupList,
        searchExternalUsers: searchExternalUsers,
        getsearchExternalUsers: getsearchExternalUsers,
        getMyProfileDetails: getMyProfileDetails,
        mapFormSubmissionToProfile: mapFormSubmissionToProfile,
        CreateExternalUser: createExternalUser,
        UpdateExternalUser: updateExternalUser,
        UpdateExternalUserProfileContact: UpdateExternalUserProfileContact,
        getExternalUserProfileByField: getExternalUserProfileByField,
        getExternalUserProfileBySsn: getExternalUserProfileBySsn,
 getExternalUserProfileByID:getExternalUserProfileByID,
       /* getPhoneConfig: getPhoneConfig,
        AddPhoneConfig: addPhoneConfig,*/
        getGroupMembers: getGroupMembers,
        DeleteContact: deleteContact,
        DeleteSocialContact: deleteSocialContact,
        loadCutomerTags: loadCutomerTags,
        getSingleFileUploadLimit: getSingleFileUploadLimit,
        getNavigationAccess:getNavigationAccess

    }
});

