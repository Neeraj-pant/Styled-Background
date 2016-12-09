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
                google_opt.style.display = 'block';
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
    	// Clear Evert Stored Data
 		
 		/*
    	chrome.storage.sync.remove('stored_image_arr', function (obj) {alert('removed stored images');});
    	chrome.storage.sync.remove('thumb_images', function (obj) {alert('removed thumb images');});
    	chrome.storage.sync.remove('page_background_image', function (obj) {alert('removed background image');});
    	chrome.storage.sync.remove('image_change_time', function (obj) {alert('removed Image Change Time');});
    	return;
    	*/

		searchGoogle();
		selectedPageBackground()
		getImageIds();
    }

    function searchGoogle() {
        var search_box = document.getElementsByClassName('google-search-submit')[0];

        search_box.addEventListener('click', function () {
            window.location.href = "https://www.google.com/search?q=" + this.value;
        })
    }


    function selectedPageBackground() {
        chrome.storage.sync.get("page_background_image", function (obj) {
            if (obj.page_background_image != undefined) {
                page_wraper.style.backgroundImage = 'url(' + obj.page_background_image + ')';
            } else {
                page_wraper.style.backgroundImage = 'url(images/back1.png)';
            }
        });
    }


    function getImageIds() {
        chrome.storage.sync.get('stored_image_arr', function (obj) {
            // console.log(obj)
            if (obj.stored_image_arr != undefined && obj.stored_image_arr.length >= 1) {
                for (var i = 0; i < obj.stored_image_arr.length; i++) {
                    var new_item = obj.stored_image_arr[i];
                    old_images_arr.push(new_item);
                }
            } else {
                chrome.storage.sync.set({'stored_image_arr': old_images_arr}, function () {
                });
                is_first = true;
            }
        });


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
            // Images id from 706 - 754 is not available
            var exclude_arr = [];
            for (var z = 706; z <= 754; z++) {
                exclude_arr.push(z);
            }

            var j = (is_first) ? 1 : 2;
            while (j <= 3) {
                if (!old_images_arr.includes(new_image_id) && new_image_id != 0 && !exclude_arr.includes(new_image_id)) {
                    old_images_arr.push(new_image_id);
                    j++;
                }
                new_image_id = Math.floor(Math.random() * 1084);
            }

            setTimeout(function () {
                chrome.storage.sync.set({'stored_image_arr': old_images_arr}, function () {});
                var date = getCurrentDate();
                chrome.storage.sync.set({'image_change_time': date}, function () {});
                setImageThumb();
            }, 400);
        }else{
	        setImageThumb();
	    }
    }



    function setImageThumb() {
        chrome.storage.sync.get('thumb_images', function (obj) {
            var list_parent = document.getElementById('thumbs');
            if (obj.thumb_images != undefined && obj.thumb_images.length != 0) {
                for (var i = 0; i <= 2; i++) {
                    var list = document.createElement('li');
                    var thumb_img = obj.thumb_images[i][0];
                    var background = "https://unsplash.it/1366/768?image=" + obj.thumb_images[i][1];
                    var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>"
                        + " <label for='ext-image-" + i + "'>" + thumb_img + "</label>";
                    list.innerHTML = new_thumb;
                    list_parent.appendChild(list);
                }
            	changeBackgroundImage();
            } else {
                chrome.storage.sync.get('stored_image_arr', function (obj) {
                	if(obj.stored_image_arr != undefined || obj.stored_image_arr.length != 0){
	                    var display_arr = obj.stored_image_arr.reverse();
	                    var thumbs_arr = [];
	                    var win_height = window.innerHeight;
	                    var win_width = window.innerWidth;

	                    // https://source.unsplash.com/category/nature/1600x900
	                    
	                    for (var i = 0; i <= 2; i++) {
	                        var list = document.createElement('li');
	                        var thumb_img = "<img src='https://unsplash.it/200/200?image=" + display_arr[i] + "'>";
	                        var background = "https://unsplash.it/"+win_width+"/"+win_height+"?image=" + display_arr[i];
	                        var new_thumb = "<input type='radio' class='img-option' id='ext-image-" + i + "' name='image-select' value='" + background + "'>"
	                            + " <label for='ext-image-" + i + "'>" + thumb_img + "</label>";
	                        list.innerHTML = new_thumb;
	                        list_parent.appendChild(list);
	                        thumbs_arr.push([thumb_img, display_arr[i]]);
	                    }
	                    chrome.storage.sync.set({'thumb_images': thumbs_arr}, function () {
	            			changeBackgroundImage();
	                    });
	                }
                });
            }
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
            img_opt[i].addEventListener('change', function () {
                getImageBase64(this.value);
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

	function getImageBase64(url){
		var convertFunction = convertFileToDataURLviaFileReader;
		convertFunction(url, function(base64Img) {
			chrome.storage.sync.set({'page_background_image': base64Img}, function () {
                page_wraper.style.backgroundImage = 'url(' + base64Img + ')';
            });
		});
	}
	
	//getImageBase64();


})()

