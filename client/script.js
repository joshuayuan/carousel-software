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
        $("#adder").animate({"top":"-100vh"}, 500, function()
        {
            $("#adder-partnumber").text("not found.");
        });
    });
    $('#add').click(function() {
        $('#upload-input').click();
    });
    $('#retrieve').click(function() {
        $("#retriever").animate({"top": "0"}, 500);
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
    
    var currentPart = null;
    $("#retriever-search").click(function() {
        socket.emit('get part', $('#partnumber').val());
    });
    
    socket.on('get part', function(data) {
        if (data == null)
        {
            return;
        }
        console.log(data);
        currentPart = data;
        $("#retriever-partnumber").text(data.partNumber);
        $("#retriever-manufacturer").html("Manufacturer: " + data.manufacturer);
        $("#retriever-description").html("Description: " + data.description);
        $("#retriever-info").animate({"opacity": "1.0"}, 200);
    });
    $("#retriever-request").click(function() {
        if (currentPart == null)
            return;
        socket.emit('request part', currentPart.position);
        currentPart = null;
        $("#retriever").animate({"top": "-100vh"}, 500, function()
        {
            $("#retriever-partnumber").text("an unknown component");
            $("#retriever-manufacturer").text("Manufacturer:");
            $("#retriever-description").text("Description:");
            $("#partnumber").val('');
            $("#retriever-info").css({"opacity": "0"});
        });
        $("#retriever-instruction").animate({"top": "0"}, 500);
    });
    $("#retriever-cancel").click(function() {
        currentPart = null;
        $("#retriever").animate({"top": "100vh"}, 500, function()
        {
            $("#retriever-partnumber").text("an unknown component");
            $("#retriever-manufacturer").text("Manufacturer:");
            $("#retriever-description").text("Description:");
            $("#partnumber").val('');
            $("#retriever-info").css({"opacity": "0"});
        });
    });
    $("#retriever-done").click(function() {
        $("#retriever").css({"top": "100vh"}, 500);
        $("#retriever-instruction").animate({"top": "100vh"}, 500);
    });
});

