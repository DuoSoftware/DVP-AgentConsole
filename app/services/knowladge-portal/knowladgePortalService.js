agentApp.factory('knowladgeportalservice', function ($http, baseUrls) {

    var getCategoryList = function () {
        return $http({
            method: 'GET',
            url: baseUrls.articleServiceUrl + "Categories"
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
    var searchArticle = function (text) {
        return $http({
            method: 'GET',
            url: baseUrls.articleServiceUrl + "SearchArticle/"+text
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };


    var searchCategoryFullData = function (id) {
        return $http({
            method: 'GET',
            url: baseUrls.articleServiceUrl + "ViewCategory/"+id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };
    var searchFolderFullData = function (id) {
        return $http({
            method: 'GET',
            url: baseUrls.articleServiceUrl + "FullFolder/"+id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    return {
        getCategoryList:getCategoryList,
        searchArticle:searchArticle,
        searchCategoryFullData:searchCategoryFullData,
        searchFolderFullData:searchFolderFullData
    };
});