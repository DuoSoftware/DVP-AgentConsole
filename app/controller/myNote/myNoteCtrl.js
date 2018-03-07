/**
 * Created by Damith on 10/20/2016.
 */
agentApp.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});
agentApp.controller('myNoteCtrl', function ($scope, myNoteServices, authService) {


    //####Click take a note
    //
    $("#txtTakeNote").on('click', function () {
        $('#addNoteRow').addClass('display-none');
        $('#addNoteWindow').removeClass('display-none');
    });

    $scope.myDate = {};
    //sample test layout
    $scope.noteLists = [];
    $scope.note = {};
    $scope.note.priority = 'low';
    $scope.myDate = moment(new Date());
    $scope.isLoadinMyNote = false;

    //UI FUNCTIONS
    var uiFuntions = function () {
        return {
            loadingMyNote: function () {
                $('#loadinMyNote').removeClass('display-none');
                $('#myNoteEmty').addClass('display-none');
            },
            foundMyNote: function () {
                $('#loadinMyNote').addClass('display-none');
                $('#myNoteEmty').addClass('display-none');
            },
            myNoteNotFound: function () {
                $('#loadinMyNote').addClass('display-none');
                $('#myNoteEmty').removeClass('display-none')
            }
        }
    }();

    //#Addnew note
    $scope.addNewNote = function () {
        return {
            close: function () {
                $('#addNoteWindow').addClass('display-none');
                $('#addNoteRow').removeClass('display-none');
            },
            done: function (title, priority, note) {
                $scope.note = {};
                $scope.note.priority = 'low';
                var note = {
                    title: title,
                    priority: priority,
                    note: note
                };
                console.log(note);
                if (note) {
                    if (!note.title && !note.note) {
                        showAlert('Reminder Note', 'error', "Filed required..");
                        return;
                    }
                }
                myNoteServices.CreateMyNote(note).then(function (res) {
                    if (res.data.IsSuccess) {

                        if (res.data.Result) {
                            item = res.data.Result;
                            //item.sizeY = "auto";


                            $scope.noteLists.push(item);

                        }
                        if ($scope.noteLists.length == 0) {
                            uiFuntions.myNoteNotFound();
                            return;
                        }
                        uiFuntions.foundMyNote();
                        showAlert('Reminder Note', 'success', res.data.CustomMessage);
                    }
                }, function (err) {
                    authService.IsCheckResponse(err);
                    showAlert('Reminder Note', 'success', 'Error in CreateMyNote');
                    console.log(err);
                });


                $('#addNoteWindow').addClass('display-none');
                $('#addNoteRow').removeClass('display-none');
            },
            selectColor: function (priority) {
                $scope.note.priority = priority;
            }
        }
    }();
    //end

    //#Delete my note
    $scope.myNoteDelete = function ($index, note) {
        myNoteServices.DeleteMyNote(note).then(function (res) {
            if (res.data.IsSuccess) {
                $scope.noteLists.splice($index, 1);
                showAlert('Reminder Note', 'success', 'Delete Todo Successful..');
                if ($scope.noteLists.length == 0) {
                    uiFuntions.myNoteNotFound();
                    return;
                }
                uiFuntions.foundMyNote();

            } else {
                showAlert('Reminder Note', 'success', res.data.CustomMessage);
            }
        }, function (err) {
            authService.IsCheckResponse(err);
            console.log(err);
            showAlert('Reminder Note', 'error', 'Error in DeleteMyNote');
        });
    };
    //end

    //#Reminder me main functions
    $scope.reminderMe = function () {
        var loadingReminder = function () {
            $('#reminderSelect').addClass('display-none');
            $('#reminderLoading').removeClass('display-none');
        };

        var loadedReminder = function () {
            $('#reminderLoading').addClass('display-none');
            $('#reminderSelect').removeClass('display-none');
            $scope.isDataSaving = false;
        };

        return {
            create: function ($index, note) {
                $('#reminderMode').removeClass('display-none');
                $('html, body').animate({scrollTop: 0}, 'fast');
                $scope.reminderObj = note;
            },
            close: function () {
                $('#reminderMode').addClass('display-none');
            },
            createDueDate: function () {
                loadingReminder();
                $scope.isSavingReminder = true;
                myNoteServices.ReminderMyNote($scope.reminderObj, $scope.dueDate).then(function (res) {
                    $scope.isSavingReminder = false;
                    if (res.data.IsSuccess) {
                        showAlert('Reminder Note', 'success', 'Reminder saved successfully');
                        $scope.reminderMe.close();
                    } else {
                        showAlert('Reminder Note', 'error', res.data.CustomMessage);
                    }
                    loadedReminder();
                }, function (err) {
                    $scope.isSavingReminder = false;
                    authService.IsCheckResponse(err);
                    showAlert('Reminder Note', 'error', 'Error in DeleteMyNote');
                    loadedReminder();
                });
            }


        }

    }();
    //end

    //#GetAll my note
    $scope.myNoteServices = function () {
        return {
            getAllNote: function () {
                uiFuntions.loadingMyNote();
                myNoteServices.GetAllMyToDo().then(function (res) {
                    if (res.data.IsSuccess) {
                        $scope.noteLists = res.data.Result.map(function (item) {

                            //item.sizex = "";
                            //item.sizeY= "100";

                            return item;

                        });
                        if ($scope.noteLists.length == 0) {
                            uiFuntions.myNoteNotFound();
                            return;
                        }
                        uiFuntions.foundMyNote();
                    }
                }, function (err) {
                    authService.IsCheckResponse(err);
                    console.log(err);
                    showAlert('Reminder Note', 'error', 'Error in GetAllMyToDo');
                    uiFuntions.myNoteNotFound();
                });
            }
        }
    }();
    $scope.myNoteServices.getAllNote();
    //End

    //Gridster option
    $scope.gridsterOpts = {
        columns: 6, // the width of the grid, in columns
        pushing: true, // whether to push other items out of the way on move or resize
        floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
        swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
        width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [15, 15], // the pixel distance between each widget
        outerMargin: true, // whether margins apply to outer edges of the grid
        sparse: false, // "true" can increase performance of dragging and resizing for big grid (e.g. 20x50)
        isMobile: false, // stacks the grid items if true
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
        minColumns: 1, // the minimum columns the grid must have
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        minSizeX: 1, // minimum column width of an item
        maxSizeX: null, // maximum column width of an item
        minSizeY: 1, // minumum row height of an item
        maxSizeY: null, // maximum row height of an item
        widget_base_dimensions: [100, 150],
        resizable: {
            enabled: true
        },
        draggable: {
            enabled: true, // whether dragging items is supported
            start: function (event, $element, widget) {
            } // optional callback fired when drag is started,
        }
    };


});