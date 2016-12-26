(function () {
    var selected_background;
    var bing_frame = document.getElementById('frame');
    var bing_opt = document.getElementById('bing-wrapper');
    var google_opt = document.getElementById('google-wrapper');
    var custom_opt = document.getElementById('custom-wrapper');

    var page_wraper = document.getElementsByClassName('back-page')[0];
    var new_image_id = Math.floor(Math.random() * 1084);

    var old_images_arr = [];
    var is_first = false;
    var is_next_day = false;


    chrome.storage.sync.get("selected_background", function (obj) {
        selected_background = obj.selected_background;
        switch (selected_background) {
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
		getImageIds();
        createImageThumbs();
    }


    function selectedPageBackground() {
        chrome.storage.sync.get('page_background_image', function(obj){
            if (obj.page_background_image != undefined) {
                var url = localStorage.getItem(obj.page_background_image);
                page_wraper.style.backgroundImage = 'url(' + url + ')';
            } else {
                page_wraper.style.backgroundImage = 'url(images/back1.png)';
            }
        });
    }


    function getImageIds() {
        chrome.storage.sync.get('image_change_time', function (obj) {
            if (obj.image_change_time != undefined) {
                var now = getCurrentDate();
                var old = obj.image_change_time;
                is_next_day = ( now.day != old.day ) ? true : false;
            } else {
                is_next_day = true;
            }
			generateImageRandomIds();
        });
    }


    function generateImageRandomIds() {
        if (is_next_day) {
            var url="https://source.unsplash.com/daily";
            var convertFunction = convertFileToDataURLviaFileReader;
            convertFunction(url, function(base64Img){
                var index = localStorage.length;
                localStorage.setItem(0, base64Img);
                var date = getCurrentDate();
                chrome.storage.sync.set({'image_change_time': date}, function () {});
                generateNewThumbs();
            });
        }
    }


    function generateNewThumbs() {
        var url="https://source.unsplash.com/random/"+win_width+"x"+win_height;
        var i = 1;
        var arrange_thumb = function(){
            if( i <= 2 ){
                var convertFunction = convertFileToDataURLviaFileReader;
                convertFunction(url, function(base64Img){
                    localStorage.setItem(i, base64Img);
                    i++;
                    arrange_thumb();
                });
            }else{
                createImageThumbs();
            }
        }
        arrange_thumb();
    }

    function createImageThumbs() {
        var list_parent = document.getElementById('thumbs');
        for(var i = 0; i < localStorage.length; i++){
            var list = document.createElement('li');
            var thumb_img = localStorage.getItem(i);
            var background = localStorage.key(i);
            var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>"
                + " <label for='ext-image-" + i + "'><img src='" + thumb_img + "'></label>";
            list.innerHTML = new_thumb;
            list_parent.appendChild(list);
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
            img_opt[i].addEventListener('change', function () {
                image_src = localStorage.getItem(this.value);
                chrome.storage.sync.set({'page_background_image': this.value}, function () {
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

})()

