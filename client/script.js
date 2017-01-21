$(function() {
    var socket = io();
    $('#upload-input').change(function() {
        $('#upload-form').submit();
        $('#upload-input').val('');
    });
    $('#upload').click(function() {
        
        $('#upload-form').submit();
        $('#upload-input').val('');
    });
    $('#upload-form').submit(function() {
	$(this).ajaxSubmit({
	    error: function(xhr) {
		console.log('Error: ' + xhr.status);
	    },

	    success: function(response) {
                console.log("Successful"); 
            }
        });
        return false;
    });
    socket.on('get part', function(data)
    {
    });
});
