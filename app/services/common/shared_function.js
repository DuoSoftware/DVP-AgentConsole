/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('shared_function', function ($ngConfirm) {
    return {showWarningAlert:function (title, msg) {
            $ngConfirm({
                icon: 'fa fa-universal-access',
                title: 'Warning...!',
                content: '<div class="suspend-header-txt"> <h5> ' + title + ' </h5> <span>' + msg + ' </span></div>',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Ok',
                        btnClass: 'btn-red',
                        action: function () {
                        }
                    }
                },
                columnClass: 'col-md-6 col-md-offset-3',
                /*boxWidth: '50%',*/
                useBootstrap: true
            });

            console.log(msg);
        },showAlert : function (title, type, content) {
            new PNotify({
                title: title,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        },test:function (msg) {
            alert(msg);
        }};
});