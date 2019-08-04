/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('shared_data', function () {
    return {pwd:"",initialize_try_count:0, phone_initialize:false,phone_initializing:false, allow_mode_change:false, agent_status:"Offline", call_task_registered:false, currentModeOption:"",firstName:"",phone_config:{},last_received_call:"",callDetails: {number:"", skill:"", direction:"",sessionId:"",callrefid:""},acw_time:10,phone_strategy:"",userProfile : {},userAccessFields : {}};//veery_web_rtc_phone
});