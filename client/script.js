$(function() {
    var socket = io();
    $('#upload-input').change(function() {
        $('#upload-form').submit();
        $('#upload-input').val('');
        $("#adder").animate({"top":"0%"}, 500);
        $("#toblur").css({"-webkit-filter":"blur(10px)", "filter":"blur(10px)"});
        $("#loading").css({"opacity":"1"});
    });
    $("#adder-done").click(function() {
        $("#adder").animate({"top":"-100vh"}, 500);
    });
    $('#add').click(function() {
        $('#upload-input').click();
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
                $("#adder-partnumber").text(response.partNumber);
                $("#adder-manufacturer").html("Manufacturer: "+response.manufacturer);
                $("#adder-description").html("Description: "+response.description);
                $("#loading").animate({"opacity":"0"}, 200);
                $({blurRadius: 10}).animate({blurRadius: 0}, {
                    duration: 200,
                    easing: 'linear', // or "linear"
                    step: function() {
                        $('#toblur').css({
                            "-webkit-filter": "blur("+this.blurRadius+"px)",
                            "filter": "blur("+this.blurRadius+"px)"
                        });
                    }
                });
            }
        });
        return false;
    });
    
    $("#retrieval").click(function() {
        socket.emit('get part', $('#partnumber').val());
    });
    
    socket.on('get part', function(data) {
        console.log(data);
    });
});

