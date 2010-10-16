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

  
    $('#chat_input').keyup(function(e){
        if (e.keyCode == '13') {
          var message = $('#chat_input').val();
          $('#chat_input').val("");
          $.get('/chat', {eid:game.eid, msg:message}, function(data) {
            // no handling?
          });
        }
    });


});

$(window).unload(function() {
  game.logout();
});
