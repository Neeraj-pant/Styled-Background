	var selected_background;
	var bing_frame = document.getElementById('frame');
	var bing_opt = document.getElementById('bing-wrapper');
	var google_opt = document.getElementById('google-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
	var time_wraper = document.getElementById('current-time');
	var page_wraper = document.getElementsByClassName('back-page')[0];
	var quote_wraper = document.getElementById("quote");
	var is_next_day = false;
	var image_refreshed = new Array();
	const IMAGE_LIMIT = 2;
	const QUOTE_LIMIT = 100;
	const DEFAULT_IMAGE = 'images/default1.jpg';

	for( var x = 0; x <= IMAGE_LIMIT; x++){
		image_refreshed[x] = false;
	}

	chrome.storage.sync.get("selected_background", function(obj) {
		switch (obj.selected_background) {
			case 'google':
				window.location.href = "https://www.google.com";
				break;
			case 'bing':
				bing_opt.style.display = 'block';
				bing_frame.src = 'https://www.bing.com';
				break;
			default:
				custom_opt.style.display = 'block';
				customImagePageInit();
				break;
		}
	});


	function customImagePageInit() {
		// Clear Every Stored Data for Test purpose only
		/*
		chrome.storage.sync.clear();
		localStorage.clear();
		return;
		//*/

		selectedPageBackground();
		displayDailyQuote();
		display_greeting();
		getImageIds();

		var time_change = 1000*2;
		displayCurrentTime();
		nIntervId = setInterval(function(){
			displayCurrentTime();
		}, time_change);
	}


	function selectedPageBackground() {
		chrome.storage.sync.get('page_background_image', function(obj) {
			if (obj.page_background_image != undefined) {
				var url = localStorage.getItem(obj.page_background_image);
				page_wraper.style.backgroundImage = 'url(' + url + ')';
				page_wraper.style.opacity = 1;
			} else {
				page_wraper.style.backgroundImage = 'url('+DEFAULT_IMAGE+')';
				page_wraper.style.opacity = 1;
				var intro = document.getElementById("startup");
				intro.style.display = "block";
				intro.innerHTML = "";
				var intro_image = document.createElement("img");
				intro_image.src = "images/intro.jpg";
				intro_image.title = "Click to Close Guide.";
				intro.appendChild(intro_image);
				intro.addEventListener('click', function(){
					intro.style.display = 'none';
				});
			}
		});
	}


	function displayDailyQuote(){
		chrome.storage.sync.get('quote', function(obj) {
			if (obj.quote != undefined) {
				quote_wraper.innerHTML = obj.quote;
			}else{
				getQuote();
			}
		});
	}


	function getImageIds() {
		chrome.storage.sync.get('image_change_time', function(obj) {
			if (obj.image_change_time != undefined) {
				var now = getCurrentDate();
				var old = obj.image_change_time;
				is_next_day = (now.day != old.day) ? true : false;
				if(is_next_day){
					if(navigator.onLine){
						chrome.storage.sync.set({'image_processed': image_refreshed}, function(){
							generateImageRandomIds();
						});
					}else{
						for( var x = 0; x <= IMAGE_LIMIT; x++){
							image_refreshed[x] = true;
						}
						chrome.storage.sync.set({'image_processed': image_refreshed}, function(){
							generateImageRandomIds();
						});
					}
				}else{
					chrome.storage.sync.get('image_processed', function(obj){
						if(obj.image_processed != undefined){
							for(var i = 0; i <= IMAGE_LIMIT; i++){
								image_refreshed[i] = obj.image_processed[i];
							}
						}
						generateImageRandomIds();
					});
				}
			} else {
				is_next_day = true;
				chrome.storage.sync.get('image_processed', function(obj){
					if(obj.image_processed != undefined){
						for(var i = 0; i <= IMAGE_LIMIT; i++){
							image_refreshed[i] = obj.image_processed[i];
						}
					}
					generateImageRandomIds();
				});
			}
			if(navigator.onLine){
				for(var i = 0; i <= IMAGE_LIMIT; i++){
					image_refreshed[i] = false;
				}
			}
		});
	}


	function generateImageRandomIds(id) {
		var id = id || 0;
		if(!navigator.onLine){
			is_next_day = false;
		}
		if (is_next_day) {
			createImageThumbs();
			var url = "https://source.unsplash.com/random";
			var convertFunction = convertFileToDataURLviaFileReader;
			convertFunction(url, function(base64Img) {
				localStorage.setItem(0, base64Img);
				var date = getCurrentDate();
				chrome.storage.sync.set({ 'image_change_time': date }, function() {});
				image_refreshed[0] = true;
				chrome.storage.sync.set({'image_processed': image_refreshed}, function(){});
				createImageThumbs(1);
				generateNewThumbs();
			});
			getQuote();
		}else if(id != 0 && navigator.onLine){
			createImageThumbs(0, id);
			generateNewThumbs(id);
		}
		else{
			getUnprocessedImages();
		}
	}


	function getUnprocessedImages() {
		var f = 0;
		for(var i = 0; i < image_refreshed.length; i++){
			if(image_refreshed[i] == false && navigator.onLine){
				generateNewThumbs(i);
				f = 1;
				createImageThumbs();
			}
		}
		if(f == 0){
			createImageThumbs();
		}
	}


	function generateNewThumbs(id) {
		var single_image = id || 0;
		var win_width = screen.width;
		var win_height = screen.height;
		var i = 1;
		var updated = [];
		var draw_image = false;

		if(single_image != 0){
			i = single_image;
		}

		var arrange_thumb = function() {
			if (i <= IMAGE_LIMIT) {
				if( i != single_image && single_image != 0 || image_refreshed[i] == true){
					i++;
					arrange_thumb();
				}else{
					chrome.storage.sync.get('fav_images', function(obj){
						if(obj.fav_images != undefined){
							if(obj.fav_images[i] == "true"){
								draw_image = false;
								image_refreshed[i] = true;
								chrome.storage.sync.set({'image_processed': image_refreshed}, function(){});
								i++;
								arrange_thumb();
							}else{
								draw_image = true;
							}
						}else{
							draw_image = true;
						}

						if(draw_image) {
							win_height += i;
							win_width += i;
							var url = "https://source.unsplash.com/random/" + win_width + "x" + win_height;

							var convertFunction = convertFileToDataURLviaFileReader;
							convertFunction(url, function(base64Img) {
								localStorage.setItem(i, base64Img);
								image_refreshed[i] = true;
								chrome.storage.sync.set({'image_processed': image_refreshed}, function(){});
								i++;
								createImageThumbs();
								arrange_thumb();
							});
						}
					});
				}
			}else{
				createImageThumbs(1);
			}
		}
		arrange_thumb(localStorage.length);
	}


	function createImageThumbs(use_loader, id) {
		var use_loader = use_loader || 0;
		var refresh_one = id || 0;

		var list_parent = document.getElementById('thumbs');
		list_parent.innerHTML = ' ';
		var fav_images = '';
		var is_fav = false;
		var star_src = 'images/star.png';
		var border_color = "transparent";
		var loading_class = '';

		chrome.storage.sync.get('fav_images', function(obj){
			if(obj.fav_images != undefined){
				fav_images = obj.fav_images;
			}

			list_parent.innerHTML = '';

			for (var i = 0; i < localStorage.length; i++) {
				var list = document.createElement('li');
				var thumb_img = localStorage.getItem(i);
				var background = localStorage.key(i);
				if(fav_images[i] == 'true'){
					border_color = "#eb9c2d";
					is_fav = true;
					star_src = 'images/star_fill.png';
					loading_class = '';
				}else{
					border_color = "transparent";
					is_fav = false;
					star_src = 'images/star.png';
					if(image_refreshed[i] == false && navigator.onLine){
						loading_class = 'loading-image'
					}else{
						loading_class = '';
					}
				}

				if( i != 0 ){
					var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>" + " <label for='ext-image-" + i + "'><img style='border-color:"+border_color+";' src='" + thumb_img + "'><span class='"+loading_class+"'></span></label><span class='make-fav'><img src="+star_src+" class='fav-img' data-fav="+is_fav+" data-id='"+i+"'></span>";
				}else{
					var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>" + " <label for='ext-image-" + i + "'><img src='" + thumb_img + "'><span class='"+loading_class+"'></span></label>";
				}

				list.innerHTML = new_thumb;
				list_parent.appendChild(list);

				if((is_next_day && use_loader == 0) || image_refreshed == false || ( i == id && id != 0)){
					change_star_visibility('none');
				}

				//if( i == localStorage.length - 1 ){
					chrome.storage.sync.get('page_background_image', function(obj) {
						if(obj.page_background_image == undefined){
							setTimeout(function(){
								document.getElementsByClassName('img-option')[0].click();
							}, 500);
						}
						fav_image_action();
					});
				//}
			}
			changeBackgroundImage();
		});
	}


	function getCurrentDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1;
		var yyyy = today.getFullYear();
		var hours = today.getHours();
		var minutes = today.getMinutes();
		return {'year': yyyy, 'month': mm, 'day': dd, 'hours': hours, 'minutes': minutes};
	}


	function changeBackgroundImage() {
		selectedPageBackground();
		var img_opt = document.getElementsByClassName('img-option');
		for (var i = 0; i < img_opt.length; i++) {
			img_opt[i].addEventListener('change', function() {
				image_src = localStorage.getItem(this.value);
				chrome.storage.sync.set({ 'page_background_image': this.value }, function() {
					page_wraper.style.backgroundImage = 'url(' + image_src + ')';
				});
			});
		}
	}


	function convertFileToDataURLviaFileReader(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			}
			if(xhr.response){
				reader.readAsDataURL(xhr.response);
			}
		};
		xhr.open('GET', url);
		xhr.send();
	}


	function convertFileToDataURLviaFileReader2(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'text/javascript';
		xhr.onload =	 function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			}
			if(xhr.response){
				reader.readAsDataURL(xhr.response);
			}
		};
		xhr.open('GET', url);
		xhr.send();
	}


	function getQuote() {
		var random_num = Math.floor(Math.random() * QUOTE_LIMIT)
		var quote = quotes[random_num];
		chrome.storage.sync.set({ 'quote': quote }, function() {});
		displayDailyQuote();
	}


	function displayCurrentTime() {
		var now = new Date();
		var month = now.getMonth();
		var h = now.getHours();
		var m = now.getMinutes();
		var s = now.getSeconds();
		var dd = now.getDate();
		var day = now.getDay();
		var yyyy = now.getFullYear();
		
		var m_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		if(h < 10){
			h = '0' + h;
		}
		if(m < 10){
			m = '0' + m;
		}
		var time = h + ' : ' + m;
		time += "<span>"+days[day]+" "+dd+" / "+m_names[month]+" / "+yyyy+"</span>"
		time_wraper.innerHTML = time;
	}


	function fav_image_action() {
		var stars = document.getElementsByClassName("fav-img");
		var favs = [];

		for (var i = 0; i < stars.length; i++) {
			stars[i].addEventListener('click', function(){
				var id = this.dataset.id;

				if(this.dataset.fav == "true"){
					this.src = 'images/star.png';
					this.dataset.fav = false;
					fav_image_action_popup('Image Removed from Favourite !', 'error');
					document.querySelector('label[for=ext-image-'+id+ '] img').style.borderColor = "#fff";
					get_image_fav_time(id);
				}else{
					this.src = 'images/star_fill.png';
					this.dataset.fav = true;
					fav_image_action_popup('Image Saved as Favourite !', 'success');
					document.querySelector('label[for=ext-image-'+id+ '] img').style.borderColor = "#eb9c2d";
					set_image_fav_time(id);
				}
				var fav_value = this.dataset.fav;
				chrome.storage.sync.get('fav_images', function(obj){
					if( obj.fav_images != undefined){
						favs =  obj.fav_images;
					}
					favs[id] = fav_value;
					chrome.storage.sync.set({'fav_images': favs}, function(){});
				});
			});
		}
	}


	function set_image_fav_time(id){
		var day = getCurrentDate();
		var fav_time = {};

		chrome.storage.sync.get('fav_images_time', function(obj){
			if(obj.fav_images_time != undefined){
				var obj_length = Object.keys(obj.fav_images_time).length;
				for(var i = 1; i <= obj_length; i++){
					fav_time[i] = obj.fav_images_time[i];
				}
			}
			fav_time[id] = day;
			chrome.storage.sync.set({'fav_images_time': fav_time}, function(){});
		});
	}


	function get_image_fav_time(id){
		if(navigator.onLine){
			chrome.storage.sync.get('fav_images_time', function(obj){
				if(typeof obj.fav_images_time[id] == 'object'){
					var day = getCurrentDate();
					if(day.day != obj.fav_images_time[id].day){
						image_refreshed[id] = false;
						chrome.storage.sync.set({'image_processed': image_refreshed}, function(){
							change_star_visibility('none');
							generateImageRandomIds(id);
						});
					}
				}
			});
		}
	}


	function change_star_visibility(display){
		var fav_icon = document.getElementsByClassName('make-fav');
			for(var i = 0; i <= fav_icon.length - 1; i++ ){
				fav_icon[i].style.display = display;
			}
	}


	function fav_image_action_popup(message, type) {
		var alert = document.getElementById('alert');
		var inner_element = alert.getElementsByClassName('content')[0];
		inner_element.innerHTML = message;
		if(type == 'success'){
			inner_element.style.color = "#078a07";
		}else{
			inner_element.style.color = "#9a0909";
		}
		document.getElementById('alert').className = 'active';
		setTimeout(function(){
			inner_element.innerHTML = '';
			document.getElementById('alert').className = '';
		}, 2500);
	}


	function display_greeting(){
		var today = new Date()
		var curHr = today.getHours()
		var message = '';
		var pos = document.getElementById("greetings");

		if (curHr < 12) {
		  message = "Good Morning";
		} else if (curHr < 18) {
		  message = "Good Afternoon";
		} else {
		  message = "Good Evening";
		}

		pos.innerHTML = message;
	}
