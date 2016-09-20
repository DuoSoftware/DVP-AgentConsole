/**
 * Created by Pawan on 9/9/2016.
 */

agentApp.directive("ticketTabView", function (moment,ticketService,$rootScope,authService,myProfileDataParser) {
    return {
        restrict: "EA",
        scope: {
            ticketDetails: "@",
            direction: "@",
            channelFrom: "@",
            channelTo: "@",
            channel: "@",
            skill: "@",
            sessionId: "@"
        },
        templateUrl: 'app/views/ticket/ticket-view.html',
        link: function (scope, element, attributes) {

            scope.oldFormModel = null;

            var buildFormSchema = function(schema, form, fields)
            {
                fields.forEach(function (fieldItem)
                {
                    if(fieldItem.field)
                    {
                        var isActive = true;
                        if(fieldItem.active === false)
                        {
                            isActive = false;
                        }

                        //field type parser

                        if(fieldItem.type === 'text')
                        {

                            schema.properties[fieldItem.field] = {
                                type: 'string',
                                title: fieldItem.title,
                                description: fieldItem.description,
                                required: fieldItem.require ? true : false,
                                readonly: !isActive

                            };

                            form.push({
                                "key": fieldItem.field,
                                "type": "text"
                            })
                        }
                        else if(fieldItem.type === 'radio')
                        {
                            schema.properties[fieldItem.field] = {
                                type: 'string',
                                title: fieldItem.title,
                                description: fieldItem.description,
                                required: fieldItem.require ? true : false,
                                readonly: !isActive

                            };

                            var formObj = {
                                "key": fieldItem.field,
                                "type": "radios",
                                "titleMap": []
                            };


                            if(fieldItem.values && fieldItem.values.length > 0)
                            {

                                schema.properties[fieldItem.field].enum = [];

                                fieldItem.values.forEach(function(enumVal)
                                {
                                    schema.properties[fieldItem.field].enum.push(enumVal.name);
                                    formObj.titleMap.push(
                                        {
                                            "value": enumVal.name,
                                            "name": enumVal.name
                                        }
                                    )
                                })

                            }

                            form.push(formObj);
                        }
                        else if(fieldItem.type === 'email')
                        {

                            schema.properties[fieldItem.field] = {
                                type: 'string',
                                title: fieldItem.title,
                                description: fieldItem.description,
                                pattern: "^\\S+@\\S+$",
                                required: fieldItem.require ? true : false,
                                readonly: !isActive

                            };

                            form.push({
                                "key": fieldItem.field,
                                "type": "text"
                            })
                        }
                        else if(fieldItem.type === 'select')
                        {
                            schema.properties[fieldItem.field] = {
                                type: 'string',
                                title: fieldItem.title,
                                required: fieldItem.require ? true : false,
                                readonly: !isActive

                            };

                            var formObj = {
                                "key": fieldItem.field,
                                "type": "select",
                                "titleMap": []
                            };

                            if(fieldItem.values && fieldItem.values.length > 0)
                            {

                                schema.properties[fieldItem.field].enum = [];

                                fieldItem.values.forEach(function(enumVal)
                                {
                                    schema.properties[fieldItem.field].enum.push(enumVal.name);
                                    formObj.titleMap.push(
                                        {
                                            "value": enumVal.name,
                                            "name": enumVal.name
                                        });
                                })

                            }
                            form.push(formObj);
                        }

                        //end field type parser

                    }


                });

                return schema;
            };

             scope.onSubmit = function(form)
             {
                scope.$broadcast('schemaFormValidate');
                if (form.$valid)
                {
                    var arr = [];

                    for (var key in scope.model)
                    {
                        if (scope.model.hasOwnProperty(key))
                        {
                            arr.push({
                                field: key,
                                value: scope.model[key]
                            });

                        }
                    }

                    //save arr


                }
             };


            var convertToSchemaForm = function(formSubmission, callback)
            {

                //get forms profile


                if (formSubmission && formSubmission.form && formSubmission.form.fields && formSubmission.form.fields.length > 0)
                {
                    var schema = {
                        type: "object",
                        properties: {}
                    };

                    var form = [];

                    var model = {};
                    scope.buildModel = true;

                    ticketService.getFormsForCompany().then(function (response)
                    {
                        if(response && response.Result && response.Result.ticket_form)
                        {
                            //compare two forms
                            if(response.Result.ticket_form._id !== formSubmission.form._id)
                            {
                                buildFormSchema(schema, form, response.Result.ticket_form.fields);

                                scope.buildModel = false;

                            }
                            else
                            {
                                buildFormSchema(schema, form, formSubmission.form.fields);
                            }
                        }
                        else
                        {
                            buildFormSchema(schema, form, formSubmission.form.fields);
                        }

                        form.push({
                            type: "submit",
                            title: "Save"
                        });

                        if(formSubmission.fields && formSubmission.fields.length > 0)
                        {
                            formSubmission.fields.forEach(function (fieldValueItem)
                            {
                                if(fieldValueItem.field)
                                {
                                    model[fieldValueItem.field] = fieldValueItem.value;
                                }

                            });
                        }

                        var schemaResponse = {};

                        if(!scope.buildModel)
                        {
                            scope.oldFormModel = model;
                            schemaResponse = {
                                schema: schema,
                                form: form,
                                model: {}
                            }
                        }
                        else
                        {
                            schemaResponse = {
                                schema: schema,
                                form: form,
                                model: model
                            }

                        }

                        callback(schemaResponse);

                    }).catch(function(err)
                    {
                        buildFormSchema(schema, form, formSubmission.form.fields);

                        form.push({
                            type: "submit",
                            title: "Save"
                        });

                        if(formSubmission.fields && formSubmission.fields.length > 0)
                        {
                            formSubmission.fields.forEach(function (fieldValueItem)
                            {
                                if(fieldValueItem.field)
                                {
                                    model[fieldValueItem.field] = fieldValueItem.value;
                                }

                            });
                        }

                        var schemaResponse = {};

                        if(!scope.buildModel)
                        {
                            scope.oldFormModel = model;
                            schemaResponse = {
                                schema: schema,
                                form: form,
                                model: {}
                            }
                        }
                        else
                        {
                            schemaResponse = {
                                schema: schema,
                                form: form,
                                model: model
                            }

                        }

                        callback(schemaResponse);

                    });




                }
                else
                {
                    callback(null);
                }

            };


            scope.subTickets = [];
            scope.relTickets = [];

            scope.ticketID = JSON.parse(scope.ticketDetails).notificationData._id;

            scope.userList=myProfileDataParser.userList;

            scope.loadTicketSummary = function (ticketID) {

                ticketService.getTicket(ticketID).then(function (response) {

                    if (response.data.IsSuccess) {
                        scope.ticket = response.data.Result;

                        if(response.data.Result && response.data.Result.form_submission)
                        {
                            convertToSchemaForm(response.data.Result.form_submission, function(schemaDetails)
                            {
                                if(schemaDetails)
                                {
                                    scope.schema = schemaDetails.schema;
                                    scope.form = schemaDetails.form;
                                    scope.model = schemaDetails.model;
                                }

                            });


                        }

                        if (scope.ticket.created_at) {
                            scope.ticket.created_at = moment(scope.ticket.created_at).local().format("YYYY-MM-DD HH:mm:ss");
                        }
                        if (scope.ticket.due_at) {
                            scope.ticket.due_at = moment(scope.ticket.due_at).local().format("YYYY-MM-DD HH:mm:ss");
                        }
                        else {
                            scope.ticket.due_at = "Not specified";
                        }

                        scope.ticket.updated_at = moment(scope.ticket.updated_at).local().format("YYYY-MM-DD HH:mm:ss");

                        scope.relTickets = scope.ticket.related_tickets;
                        scope.subTickets = scope.ticket.sub_tickets;

                        console.log("ticket ", scope.ticket);
                    }
                    else {
                        console.log("Error in picking ticket");
                    }

                }), function (error) {
                    console.log("Error in picking ticket ", error);
                }
            }


            scope.loadTicketSummary(scope.ticketID);


            scope.showCreateTicket = false;
            scope.test = Math.floor((Math.random() * 6) + 1);
            console.log(scope.test);

            var modalEvent = function () {
                return {
                    ticketModel: function (id, className) {
                        if (className == 'display-block') {
                            $(id).removeClass('display-none').addClass(className + ' fadeIn');
                        } else if (className == 'display-none') {
                            $(id).removeClass('display-block').addClass(className);
                        }
                    }
                }
            }();

            scope.clickAddNewTicket = function () {
                scope.showCreateTicket = !scope.showCreateTicket;
            };

            scope.editTicketSt=false;
            scope.editTicketMode = function () {
                scope.editTicketSt=!scope.editTicketSt;
            }


            scope.loadTicketView = function (ticket) {
                $rootScope.$emit('newTicketTab', ticket);
            }


            scope.showAlert = function (tittle, type, msg) {
                new PNotify({
                    title: tittle,
                    text: msg,
                    type: type,
                    styling: 'bootstrap3'
                });
            };

            //update code damith
            // add edit modal box
            scope.editTicketSt = false;

            scope.tabs = [
                {
                    title: 'COMMENTS', content: 'Dynamic content 1', icon: 'main-icon-2-communication',
                    type: 'comments'
                },
                {
                    title: 'ACTIVITY', content: 'Dynamic content 2', icon: 'main-icon-2-star',
                    type: 'activity'
                },
                {
                    title: 'OTHER', content: 'Dynamic content 2', icon: 'main-icon-2-star',
                    type: 'other'
                }
            ];

            scope.goToComment = function () {
                $('html,body').animate({
                        scrollTop: $(".comment").offset().top
                    },
                    'slow');
            };

            scope.clickShowTickerEditMode = function () {
                scope.editTicketSt = !scope.editTicketSt;
                scope.editTicket = JSON.parse(scope.ticketDetails).notificationData;
            };

            scope.updateTicketDetails = function () {
                ticketService.updateTicket(scope.ticket._id, scope.editTicket).then(function (response) {

                    if(response.data.IsSuccess)
                    {
                        scope.ticket=scope.editTicket;
                        scope.showAlert("Updated","success","Ticket updated successfully");
                        if(scope.ticket.due_at)
                        {
                            scope.ticket.due_at=moment(scope.ticket.due_at).local().format("YYYY-MM-DD HH:mm:ss");
                        }
                        else
                        {
                            scope.ticket.due_at="Not specified";
                        }

                        if(scope.ticket.created_at)
                        {
                            scope.ticket.created_at=moment(scope.ticket.created_at).local().format("YYYY-MM-DD HH:mm:ss");
                        }
                        scope.editTicketSt=false;


                    }
                    else {
                        scope.showAlert("Error", "error", "Ticket updation failed");
                        console.log("Error in updating ", response.data.Exception);
                    }

                }), function (error) {
                    scope.showAlert("Error", "success", "Ticket updation failed");
                    console.log("Error in updating ", error);
                }
            };

            scope.closeTicket = function () {
                $rootScope.$emit('closeTab', scope.ticket._id);

            };

            scope.addComment = function (message,mode) {

                var channel="";
                var eng_session="";
                var reply_session="";
                var reply_chnl_from="";
                var reply_chnl_to="";

                if(scope.ticket.engagement_session)
                {
                    channel=scope.ticket.engagement_session.channel;
                    reply_session=scope.ticket.engagement_session._id;
                    reply_chnl_from=scope.ticket.engagement_session.channel_to;
                    reply_chnl_to=scope.ticket.engagement_session.channel_from;
                }



                var commentObj =
                {
                    "body":  message,
                    "body_type": "text",
                    "type": "comment",
                    "public": mode,
                    "channel":  channel,
                    "engagement_session": eng_session,
                    "reply_session":reply_session


                }

                if(mode=="public")
                {
                    commentObj["channel_from"]=reply_chnl_from;
                    commentObj["channel_to"]=reply_chnl_to;
                }


                ticketService.AddNewCommentToTicket(scope.ticket._id, commentObj).then(function (response) {
                    if (response.data.IsSuccess) {
                        response.data.Result.author=myProfileDataParser.myProfile;
                        scope.ticket.comments.push(response.data.Result);
                        console.log("New comment added ",response);
                        scope.showAlert("New Comment","success","completed");
                    }
                    else {
                        console.log("Error new comment ",response);
                        scope.showAlert("New Comment","error","failed");
                    }

                }), function (error) {
                    console.log("Error new comment ",error);
                    scope.showAlert("New Comment","error","failed");
                };

            };

            scope.isEditAssignee = false;
            scope.editAssignee = function () {
                scope.isEditAssignee = !scope.isEditAssignee;
            };


            scope.changeAssignee = function (newAssignee) {

                ticketService.AssignUserToTicket(scope.ticket._id,newAssignee._id).then(function (response) {
                    if(response.data.IsSuccess)
                    {
                        scope.showAlert("Assign","Ticket assignee changed successfully","success");
                        scope.loadTicketSummary(scope.ticket._id);
                    }
                    else
                    {
                        scope.showAlert("Assign","Ticket assignee changed failed","error");
                    }
                }), function (error) {
                    scope.showAlert("Assign","Ticket assignee changed failed","error");
                }
            }

            //edit assignee
            scope.isEditAssignee = false;
            scope.editAssignee = function () {
                scope.isEditAssignee = !scope.isEditAssignee;
            };
        }
    }
});