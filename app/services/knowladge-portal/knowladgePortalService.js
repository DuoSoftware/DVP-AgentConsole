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

    var searchArticleFullData = function (id) {
        return $http({
            method: 'GET',
            url: baseUrls.articleServiceUrl + "FullArticle/"+id
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var updateVote = function (id,vote) {
        return $http({
            method: 'PUT',
            url: baseUrls.articleServiceUrl + "Vote/"+id,
            data:{vote:vote}
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var addVote = function (id,vote) {
        return $http({
            method: 'PUT',
            url: baseUrls.articleServiceUrl + "Article/"+id+"/Vote",
            data:{vote:vote}
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var addComment = function (id,comment) {
        return $http({
            method: 'PUT',
            url: baseUrls.articleServiceUrl + "Article/"+id+"/Comment",
            data:{comment:comment}
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
        searchFolderFullData:searchFolderFullData,
        searchArticleFullData:searchArticleFullData,
        updateVote:updateVote,
        addVote:addVote,
        addComment:addComment

    };
});