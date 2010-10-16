var game = new Game();

$(document).ready(function(){
    $('#name-input').keyup(function(e){
        if (e.keyCode == '13') {
          game.loginSuccess.subscribe(function() {
            $('#login-overlay').fadeOut();
          });
          game.login($('#name-input').attr('value'));
        }
    });
});
