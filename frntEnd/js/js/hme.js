




$(document).ready(() =>{
    $.get('/getName', function(data) {
  
        $('#nme').html(data);
      }).fail(function() {
        console.error('Failed to fetch default image.');
      });
})