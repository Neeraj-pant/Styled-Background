chrome.storage.sync.get("selected_background", function (obj) {
	var bing_opt = document.getElementById('bing-wrapper');
	var google_opt = document.getElementById('google-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
    if(obj.selected_background == 'bing'){
    	bing_opt.style.display = 'block';
    	google_opt.style.display = 'none';
    	custom_opt.style.display = 'none';
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

		clearInterval(ext_time);
	}
});

var url = "http://www.google.com&output=embed";
window.location.replace(url);


