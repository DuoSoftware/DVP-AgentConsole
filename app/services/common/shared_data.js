/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('shared_data', function () {
    return {phone_initialize:false, agent_status:"Offline", call_task_registered:false, currentModeOption:"",firstName:"",phone_config:{},callDetails: {},acw_time:10,phone_strategy:"",userProfile : {},userAccessFields : {}};//veery_web_rtc_phone
});