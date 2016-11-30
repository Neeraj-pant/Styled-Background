chrome.storage.sync.get("selected_background", function (obj) {
	var bing_frame = document.getElementById('frame');
	var bing_opt = document.getElementById('bing-wrapper');
	var google_opt = document.getElementById('google-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
    if(obj.selected_background == 'bing'){
    	bing_opt.style.display = 'block';
    	google_opt.style.display = 'none';
    	custom_opt.style.display = 'none';
    	bing_frame.src = 'https://www.bing.com';
    }
    else if(obj.selected_background == 'google'){
    	google_opt.style.display = 'block';
    	bing_opt.style.display = 'none';
    	custom_opt.style.display = 'none';
    }
    else if(obj.selected_background == 'custom'){
    	custom_opt.style.display = 'block';
    	bing_opt.style.display = 'none';
    	google_opt.style.display = 'none';
    }
});

var ext_time = setInterval(function(){
	var frame = jQuery('.frame');
	if(frame.length == 1){
		frame.height(jQuery(window).height());
		frame.width(jQuery(window).width());

		jQuery(document).resize(function(){
			location.reload();
		});

		addPageJs();
		colorScheme();

		clearInterval(ext_time);
	}
});

function addPageJs()
{
	$('.control').click( function(){
	  $('body').addClass('mode-search');
	  $('.input-search').focus();
	});

	$('.icon-close').click( function(){
	  $('body').removeClass('mode-search');
	});

	$(document).on('click', ".search-text", function(){
		window.location.href = "https://www.google.com/search?q="+$(this).text();
	});

}

function colorScheme(){
	$("#image-svg").css('fill', '#64ffaa');
	// $(".upload-image").css('background-image', '#64ffaa');
	$("#header").css('background-color', 'rgba(0, 0, 0, 0.32)');

}

function searchSuggestion()
{
	$("#google-search").on('keyup', function(){
		var res = $(this).val();
		$.ajax({
			url : "https://www.google.com/complete/search?sclient=psy-ab&q="+res
		})
		.done(function(data){
			$(".myObjects").html('');
			$.each( data, function( key, value ) {
				if(typeof value == 'object'){
					$.each( value, function( s_key, s_value ) {
						if(s_value[0] != '' && s_value[0] != 'undefined'){
							$(".myObjects").append("<p class='search-text'>"+s_value[0]+"<p/>");
							$(".search-text").each(function(k, val){
								console.log(val);
								if(val.text() == '' || val.text() == undefined){
									val.remove();
								}
							});
						}
					});
				}
			});
		});
	});
}


