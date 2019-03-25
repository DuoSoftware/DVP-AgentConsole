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

    var username= profileDataParser.myProfile.username;
    //update new UI code

    $scope.articlePath =[];
    var pathObj = {
        name:"All Categories",
        item:null,
        type:"all"
    };

    $scope.articlePath.push(pathObj);




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

    $scope.generateClass = function(item)
    {
        if($scope.loadedList=="folder" && item.articles && item.articles.length>0 )
        {
            var cls= "categorybox-other"
            return cls;
        }
        else
        {
            var cls= "categorybox"
            return cls;
        }
    }


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

    $scope.showFolderArticles = function()
    {
        if($scope.loadedList=="folder")
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    var voteFilter = function(item)
    {
        var retObj={
            likes:0,
            dislikes:0,
            isVoted:false,
            myVote:undefined
        };


        if(!item.votes)
        {
            return retObj;
        }
        item.votes.forEach(function (vote) {

            if(vote.vote)
            {
                retObj.likes++;
            }else
            {
                retObj.dislikes++;
            }

            if(vote.author.username == username)
            {
                retObj.isVoted=true;
                retObj.myVote=vote.vote;
            }



        });
        return retObj;

    }

    $scope.loadNextLevel = function (item) {


        switch ($scope.loadedList) {
            case "category":
                if(item.folders && item.folders.length>0)
                {
                    knowladgeportalservice.searchCategoryFullData(item._id).then(function (resp) {
                        $scope.currentList=resp.folders;
                        $scope.loadedList="folder";

                        var pathObj = {
                            name:item.title.substring(0,10),
                            item:item,
                            type:"category"
                        }
                        $scope.articlePath=  $scope.articlePath.filter(function (value) {
                            return value.type!="category";
                        })
                        $scope.articlePath.push(pathObj);


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
                    knowladgeportalservice.searchFolderFullData(item._id).then(function (resp) {
                        $scope.currentList=resp.articles;
                        $scope.loadedList="article";
                        $scope.dynClass="categorybox-other";

                        var pathObj = {
                            name:item.title.substring(0,10),
                            item:item,
                            type:"folder"
                        }
                        $scope.articlePath=  $scope.articlePath.filter(function (value) {
                            return value.type!="folder";
                        })
                        $scope.articlePath.push(pathObj);
                    });



                }
                else
                {

                }
                break;
            case "article":
                $scope.showFullArticle=true;

                knowladgeportalservice.searchArticleFullData(item._id).then(function (resp) {

                    resp.filteredVotes= voteFilter(resp);
                    $scope.currentArticle=resp;
                    $scope.documentData = resp.document;

                    var pathObj = {
                        name:item.title.substring(0,10),
                        item:resp,
                        type:"article"
                    };

                    $scope.articlePath=  $scope.articlePath.filter(function (value) {
                        return value.type!="article";
                    });

                    if($scope.articlePath.indexOf(pathObj))

                        $scope.articlePath.push(pathObj);
                });

                /*$scope.currentArticle=item;*/
                /* $scope.currentArticle.filteredVotes=voteFilter(item);
                 $scope.documentData = item.document;*/
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

    $scope.changeLoadedList = function(item,name)
    {
        $scope.loadedList=name;
        $scope.loadNextLevel(item);
    }

    $scope.navigationFixer = function (item) {

        switch (item.type) {
            case "all":
                $scope.articlePath.splice(1);
                loadCategoryList();
                $scope.showFullArticle=false;

                break;
            case  "category":

                $scope.loadedList="category";

                $scope.loadNextLevel(item.item);
                $scope.showFullArticle=false;
                $scope.articlePath.splice(2);
                break;

            case  "folder":
                $scope.loadedList="folder";


                $scope.loadNextLevel(item.item);
                $scope.showFullArticle=false;
                $scope.articlePath.splice(3);
                break;
            case  "article":
                $scope.loadNextLevel(item.item);
                $scope.showFullArticle=true;
                break;

        }

    }


    $scope.isVoted = function (votes,state) {

        if( votes && votes.myVote && state==votes.myVote && votes.isVoted)
        {
            var cls = "markvote";
            return cls;
        }
        else {
            return null;
        }
    }

    $scope.changeVote = function (newVote) {

        var voteObj = $scope.currentArticle.filteredVotes;

        if(!voteObj.isVoted)
        {
            $scope.currentArticle.filteredVotes.myVote=newVote;
            if(newVote)
            {
                $scope.currentArticle.filteredVotes.likes++;

            }
            else
            {
                $scope.currentArticle.filteredVotes.dislikes++;
            }
            $scope.currentArticle.filteredVotes.isVoted=true;
            knowladgeportalservice.addVote($scope.currentArticle._id,newVote).then(function (resp) {

            },function (err) {

            });
        }
        else
        {
            if(voteObj.myVote!=newVote )
            {
                if(voteObj.myVote)
                {
                    $scope.currentArticle.filteredVotes.dislikes++;

                    if($scope.currentArticle.filteredVotes.likes!=0);
                    $scope.currentArticle.filteredVotes.likes--;
                }
                else
                {
                    if($scope.currentArticle.filteredVotes.dislikes!=0);
                    $scope.currentArticle.filteredVotes.dislikes--;
                    $scope.currentArticle.filteredVotes.likes++;
                }

                $scope.currentArticle.filteredVotes.myVote=newVote;

                var myVoteObj = $scope.currentArticle.votes.filter(function (val) {

                    if(val.author && val.author.username)
                        return val.author.username == username;

                });


                if(myVoteObj[0])
                {
                    knowladgeportalservice.updateVote(myVoteObj[0]._id,newVote).then(function (resp) {

                    },function (err) {

                    });
                }




            }
        }



    }

    $scope.addNewComment = function () {

        if($scope.currentArticle && $scope.newComment)
        {
            knowladgeportalservice.addComment($scope.currentArticle._id,$scope.newComment).then(function (resp) {
                $scope.currentArticle.comments.push(resp);
                $scope.newComment="";
            })
        }

    }


}).filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

