(function() {
	var selected_background;
	var bing_frame = document.getElementById('frame');
	var bing_opt = document.getElementById('bing-wrapper');
	var google_opt = document.getElementById('google-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
	var time_wraper = document.getElementById('current-time');

	var page_wraper = document.getElementsByClassName('back-page')[0];
	var new_image_id = Math.floor(Math.random() * 1084);

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
				quote_wraper.getElementsByTagName('a')[0].href = "http://wordsmith.org";
			}
		});	
	}


	function getImageIds() {
		chrome.storage.sync.get('image_change_time', function(obj) {
			if (obj.image_change_time != undefined) {
				var now = getCurrentDate();
				var old = obj.image_change_time;
				is_next_day = (now.day != old.day) ? true : false;
			} else {
				is_next_day = true;
			}
			generateImageRandomIds();
		});
	}


	function generateImageRandomIds() {
		if (is_next_day) {
			var url = "https://source.unsplash.com/daily";
			var convertFunction = convertFileToDataURLviaFileReader;
			var data = [];
			var index = localStorage.length;
			if (index != 0) {
				for (var i = 0; i < index; i++) {
					data[i] = localStorage.getItem(i);
				}
				
				var temp = data[0];
				data[0] = data[1];
				data[1] = data[2];
				data[2] = temp;

				localStorage.clear();
				for (var j = 0; j < index; j++) {
					localStorage.setItem(j, data[j]);
				}
			}
			convertFunction(url, function(base64Img) {
				localStorage.setItem(0, base64Img);
				var date = getCurrentDate();
				chrome.storage.sync.set({ 'image_change_time': date }, function() {});
				
				if(localStorage.length <= 1){
					generateNewThumbs();
				}
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
				var convertFunction = convertFileToDataURLviaFileReader;
				convertFunction(url, function(base64Img) {
					if(old_val != base64Img){
						localStorage.setItem(i, base64Img);
						i++;
						arrange_thumb();
						old_val = base64Img;
					}
				});
			} else {
				createImageThumbs();
			}
		}
		arrange_thumb();
	}

	function createImageThumbs() {
		var list_parent = document.getElementById('thumbs');
		for (var i = 0; i < localStorage.length; i++) {
			var list = document.createElement('li');
			var thumb_img = localStorage.getItem(i);
			var background = localStorage.key(i);
			var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>" + " <label for='ext-image-" + i + "'><img src='" + thumb_img + "'></label>";
			list.innerHTML = new_thumb;
			list_parent.appendChild(list);

			if( i == 1 ){
				list_parent.querySelector("input").click();
			}
		}
		changeBackgroundImage();
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
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var quote = this.responseText;
				quote = quote.substring(18, quote.length - 4);
				quote = quote.replace(/\<br\>/g,"");
				chrome.storage.sync.remove('quote', function (obj) {});
				chrome.storage.sync.set({ 'quote': quote }, function() {});
				displayDailyQuote();
			}
		};
		xhttp.open("GET", "http://wordsmith.org/words/quote.js", true);
		xhttp.send();
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

	var today = new Date()
	var curHr = today.getHours()

	if (curHr < 12) {
	  console.log('good morning')
	} else if (curHr < 18) {
	  console.log('good afternoon')
	} else {
	  console.log('good evening')
	}

})()
