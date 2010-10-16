$(document).ready(function(){
    $('#name-input').keyup(function(e){
        if (e.keyCode == '13') {
            $.get('/user/join?name='+$('#name-input').attr('value'), function(data) {
                if (!data.error) {
                    $('#login-console').append('Login successful');
                }
            }, 'JSON');
        }
    });
});