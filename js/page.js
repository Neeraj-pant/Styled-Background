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

		jQuery(window).resize(function(){
			location.reload();
		});

		addPageJs();
		colorScheme();
		customPageLayout();

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

	// Color Tile Show, Hide
	$(".color-panel-toggle").click(function(){
		$(".color-tile").toggleClass('color-in');
		$(this).toggleClass('arrow-out');
	});

}



function colorScheme(){
	$("#image-svg").css('fill', '#64ffaa');
	// $(".upload-image").css('background-image', '#64ffaa');
	$("#header").css('background-color', 'rgba(0, 0, 0, 0.32)');


}

function customPageLayout()
{
	var page_wraper = $(".back-page");
	var header = $("#header");
	var sidebar = $("#sidebar");
	var win_height = $(window).height();

	page_wraper.css('background', '#000 url(images/back1.png) 0 0/100% no-repeat');
	page_wraper.height(win_height);
	sidebar.height(win_height - header.height() - 20);

}








