agentApp.controller('knowlagePortalController', function ($scope, $rootScope,$q, mailInboxService,
                                                          profileDataParser, authService, $http,
                                                          $anchorScroll, knowladgeportalservice) {


    $scope.catList=[];
    $scope.currentList=[];
    $scope.searchCriteria="";
    $scope.isArticlesLoaded=false;
    $scope.loadedList="";
    $scope.showFullArticle=false;
    $scope.currentArticle={};
    //ticket inbox
$scope.test="";
    $scope.documentData="";
    $anchorScroll();
    //update new UI code


    $scope.showAlert = function (tittle, type, msg) {
        new PNotify({
            title: tittle,
            text: msg,
            type: type,
            styling: 'bootstrap3',
            icon: false
        });
    };



//UI funtion
//ticket inbox UI funtion

    $scope.$watch('searchCriteria',function (newVal) {
        if(newVal.length==0 && $scope.isArticlesLoaded)
        {
            loadCategoryList();
        }
    })

    var loadCategoryList = function () {
        knowladgeportalservice.getCategoryList().then(function (res) {
            $scope.catList=res;
            $scope.currentList=$scope.catList;

            $scope.isArticlesLoaded=false;
            $scope.loadedList="category";
        },function (err) {

        });
    }

    loadCategoryList();

    $scope.searchArticles = function (e) {

        if(e.keyCode == 13)
        {
            knowladgeportalservice.searchArticle($scope.searchCriteria).then(function (res) {
                $scope.currentList=res;
                $scope.isArticlesLoaded=true;
                $scope.loadedList="article";
            },function (err) {

            });
        }

    }

    $scope.loadNextLevel = function (item) {


        switch ($scope.loadedList) {
            case "category":
                if(item.folders && item.folders.length>0)
                {
                    knowladgeportalservice.searchCategoryFullData(item._id).then(function (resp) {
                        $scope.currentList=resp.folders;
                        $scope.loadedList="folder";
                    },function (err) {

                    });
                }
                else
                {

                }
                break;
            case "folder":
                if(item.articles && item.articles.length>0)
                {
                    $scope.currentList = $scope.currentList.filter(function (value) {

                        return value._id==item._id;
                    });
                    $scope.currentList=$scope.currentList[0].articles;
                    $scope.loadedList="article";
                }
                else
                {

                }
                break;
            case "article":
                $scope.showFullArticle=true;
                $scope.currentArticle=item;
                $scope.documentData = item.document;
                break;
        }


        /*if($scope.loadedList=="category" && item.folders && item.folders.length>0)
        {


            knowladgeportalservice.searchCategoryFullData(item._id).then(function (resp) {
                $scope.currentList=resp.folders;
                $scope.loadedList="folder";
            },function (err) {

            });
        }


        if($scope.loadedList=="folder" && item.articles && item.articles.length>0)
        {
            $scope.currentList = $scope.currentList.filter(function (value) {

                return value._id==item._id;
            });
            $scope.currentList=$scope.currentList[0].articles;
            $scope.loadedList="article";

            /!*knowladgeportalservice.searchFolderFullData(item._id).then(function (resp) {
                $scope.currentList=resp.articles;


            },function (err) {

            });*!/
        }



        if($scope.loadedList=="article" )
        {
            $scope.showFullArticle=true;
            $scope.currentArticle=item;
            $scope.documentData = item.document;
        }*/


    };



}).filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
