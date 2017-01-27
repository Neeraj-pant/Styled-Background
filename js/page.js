	var selected_background;
	var bing_frame = document.getElementById('frame');
	var bing_opt = document.getElementById('bing-wrapper');
	var google_opt = document.getElementById('google-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
	var time_wraper = document.getElementById('current-time');

	var page_wraper = document.getElementsByClassName('back-page')[0];

	var quote_wraper = document.getElementById("quote");
	var is_next_day = false;

	chrome.storage.sync.get("selected_background", function(obj) {
		switch (obj.selected_background) {
			case 'google':
				window.location.href = "https://www.google.com";
				break;
			case 'custom':
				custom_opt.style.display = 'block';
				customImagePageInit();
				break;
			default:
				bing_opt.style.display = 'block';
				bing_frame.src = 'https://www.bing.com';
				break;
		}
	});


	function customImagePageInit() {

		// Clear Every Stored Data
		
		/*
		chrome.storage.sync.remove('thumb_images', function (obj) {alert('removed thumb images');});
		chrome.storage.sync.remove('page_background_image', function (obj) {alert('removed background image');});
		chrome.storage.sync.remove('image_change_time', function (obj) {alert('removed Image Change Time');});
		chrome.storage.sync.remove('quote', function(obj) {alert('Removed Quote')});
		chrome.storage.sync.remove('fav_images', function(obj) {alert('Removed Fav images')});
		localStorage.clear();
		return;
		//*/

		selectedPageBackground();
		displayDailyQuote();
		getImageIds();
		createImageThumbs();

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
				var animate = setInterval(function() {
					page_wraper.style.opacity = 1;
					clearInterval(animate);
				}, 5);
			} else {
				page_wraper.style.backgroundImage = 'url(images/back1.png)';
				var animate = setInterval(function() {
					page_wraper.style.opacity = 1;
					clearInterval(animate);
				}, 5);
			}
		});
	}


	function displayDailyQuote(){
		chrome.storage.sync.get('quote', function(obj) {
			if (obj.quote != undefined) {
				quote_wraper.innerHTML = obj.quote;
			}
		});
	}


	function getImageIds() {
		chrome.storage.sync.get('image_change_time', function(obj) {
			if (obj.image_change_time != undefined) {
				var now = getCurrentDate();
				var old = obj.image_change_time;
				is_next_day = (now.day != old.day) ? true : true;
				generateImageRandomIds();
			} else {
				is_next_day = true;
				generateImageRandomIds();
			}
		});
	}


	function generateImageRandomIds() {
		if (is_next_day) {
			var url = "https://source.unsplash.com/daily";
			var convertFunction = convertFileToDataURLviaFileReader;
			convertFunction(url, function(base64Img) {
				localStorage.setItem(0, base64Img);
				var date = getCurrentDate();
				chrome.storage.sync.set({ 'image_change_time': date }, function() {});
				generateNewThumbs();
			});
			getQuote();
		}
	}


	function generateNewThumbs() {
		var win_width = screen.width;
		var win_height = screen.height;
		var url = "https://source.unsplash.com/random/" + win_width + "x" + win_height;
		var i = 1;
		var old_val = '';

		var arrange_thumb = function() {
			if (i <= 2) {
				chrome.storage.sync.get('fav_images', function(obj){
					if(obj.fav_images != undefined){
						if(obj.fav_images[i] == "true"){
							i++;
							arrange_thumb();
						}else{
							var convertFunction = convertFileToDataURLviaFileReader;
							convertFunction(url, function(base64Img) {
								if(old_val != base64Img){
									localStorage.setItem(i, base64Img);
									i++;
									old_val = base64Img;
									arrange_thumb();
								}
							});
						}
					}
				});
			}else{
				createImageThumbs();
			}
		}
		arrange_thumb();
	}

	function createImageThumbs() {
		var list_parent = document.getElementById('thumbs');
		list_parent.innerHTML = '';
		var fav_images = '';
		var is_fav = false;
		var star_src = 'images/star.png';

		chrome.storage.sync.get('fav_images', function(obj){
			if(obj.fav_images != undefined){
				fav_images = obj.fav_images;
			}

			for (var i = 0; i < localStorage.length; i++) {
				var list = document.createElement('li');
				var thumb_img = localStorage.getItem(i);
				var background = localStorage.key(i);

				if(fav_images[i] == 'true'){
					is_fav = true;
					star_src = 'images/star_fill.png';
				}else{
					star_src = 'images/star.png';
				}

				if( i != 0 ){
					var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>" + " <label for='ext-image-" + i + "'><img src='" + thumb_img + "'></label><span class='make-fav'><img src="+star_src+" class='fav-img' data-fav="+is_fav+" data-id='"+i+"'></span>";
				}else{
					var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>" + " <label for='ext-image-" + i + "'><img src='" + thumb_img + "'></label>";
				}

				list.innerHTML = new_thumb;
				list_parent.appendChild(list);

				if( i == localStorage.length - 1 ){
					chrome.storage.sync.get('page_background_image', function(obj) {
						if(obj.page_background_image == undefined){
							setTimeout(function(){
								document.getElementsByClassName('img-option')[0].click();
							}, 500);
						}
						fav_image_action();
					});
				}
			}
			changeBackgroundImage();
		});
	}


	function getCurrentDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		var yyyy = today.getFullYear();
		var hours = today.getHours();
		var minutes = today.getMinutes();

		return {
			'year': yyyy,
			'month': mm,
			'day': dd,
			'hours': hours,
			'minutes': minutes
		};
	}


	function changeBackgroundImage() {
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
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.send();
	}

	function convertFileToDataURLviaFileReader2(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'text/javascript';
		xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			}
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.send();
	}

	function getQuote() {
		var random_num = Math.floor(Math.random() * 437)
		var quote = quotes[random_num];
		chrome.storage.sync.set({ 'quote': quote }, function() {});
		displayDailyQuote();
	}


	function displayCurrentTime() {
		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		var s = now.getSeconds();
		if(h < 10){
			h = '0' + h;
		}
		if(m < 10){
			m = '0' + m;
		}
		var time = h + ' : ' + m; // + ' : ' + s;
		time_wraper.innerHTML = time;
	}


	function fav_image_action() {
		var stars = document.getElementsByClassName("fav-img");
		var favs = {};

		for (var i = 0; i < stars.length; i++) {
			stars[i].addEventListener('click', function(){
				var id = this.dataset.id;

				if(this.dataset.fav == "true"){
					this.src = 'images/star.png';
					this.dataset.fav = false;
					fav_image_action_popup('Removed from Favourite !', 'error');
				}else{
					this.src = 'images/star_fill.png';
					this.dataset.fav = true;
					fav_image_action_popup('Saved Image as Favourite !', 'success');
				}
				var fav_value = this.dataset.fav;
				chrome.storage.sync.get('fav_images', function(obj){
					if(obj.fav_images != undefined){
						for (var j = 1; j <= obj.fav_images.length; j++) {
							favs[j] = obj.fav_images[j];
						}
					}
					favs[id] = fav_value;
					chrome.storage.sync.set({'fav_images': favs}, function(){});
				});
			});
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
			document.getElementById('alert').className = '';
		}, 2000);
	}

	var today = new Date()
	var curHr = today.getHours()

	if (curHr < 12) {
	  console.log('good morning')
	} else if (curHr < 18) {
	  console.log('good afternoon')
	} else {
	  console.log('good evening')
	}
