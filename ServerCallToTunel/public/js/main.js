$(document).ready(function() {
  $('#testecall').on('click', function() {
    $.ajax({
      type: 'GET',
      url: '/teste',
      data: {},
      success: function(data) {
        console.log(data);
      },
      dataType: 'json',
      contentType: 'application/json'
    });
  });
});
