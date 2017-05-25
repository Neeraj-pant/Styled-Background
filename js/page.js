	var selected_background;
	var bing_frame = document.getElementById('frame');
	var bing_opt = document.getElementById('bing-wrapper');
	var custom_opt = document.getElementById('custom-wrapper');
	var time_wraper = document.getElementById('current-time');
	var page_wraper = document.getElementById('back-page');
	var quote_wraper = document.getElementById("quote");
	var is_next_day = false;
	var image_refreshed = new Array();
	var use_default_img = true;

	const IMAGE_LIMIT = 2;
	const QUOTE_LIMIT = 100;
	const DEFAULT_IMAGE = 'images/default.jpg';

	for( var x = 0; x <= IMAGE_LIMIT; x++ ){
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
				load_quotes();
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
		imageExistCheck();

		var time_change = 1000*2;
		displayCurrentTime();
		nIntervId = setInterval(function(){
			displayCurrentTime();
		}, time_change);
	}

	function imageExistCheck() {
		for(var i = 0; i < localStorage.length; i++){
			if(localStorage.getItem(i).length < 10){
				var url = "https://source.unsplash.com/random";
				var convertFunction = convertFileToDataURLviaFileReader;
				convertFunction(url, function(base64Img) {
					localStorage.setItem(i, base64Img);
				});
			}
		}
	}


	function selectedPageBackground() {
		chrome.storage.sync.get('page_background_image', function(obj) {
			if (obj.page_background_image != undefined) {
				use_default_img = false;
				if(obj.page_background_image == DEFAULT_IMAGE){
					var url = DEFAULT_IMAGE;
				}else{
					var url = localStorage.getItem(obj.page_background_image);
				}
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

				chrome.storage.sync.get('page_background_image', function(obj) {
					if(obj.page_background_image == undefined){
						setTimeout(function(){
							document.getElementsByClassName('img-option')[0].click();
						}, 500);
					}
				});
			}
			changeBackgroundImage();
			fav_image_action();
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
		var img_opt = document.getElementsByClassName('img-option');
		for (var i = 0; i < img_opt.length; i++) {
			img_opt[i].addEventListener('change', function() {
				var opt_val = this.value;
				image_src = localStorage.getItem(opt_val);
				chrome.storage.sync.get('page_background_image', function(obj) {
					if(obj.page_background_image == undefined  ){ // || obj.page_background_image == DEFAULT_IMAGE){
						chrome.storage.sync.set({ 'page_background_image': DEFAULT_IMAGE }, function() {
							page_wraper.style.backgroundImage = 'url(' + DEFAULT_IMAGE + ')';
						});
					}else{
						chrome.storage.sync.set({ 'page_background_image': opt_val }, function() {
							page_wraper.style.backgroundImage = 'url(' + image_src + ')';
						});
					}
				});
			});
		}
		page_wraper.className = 'back-animate';	
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



	function load_quotes() {
		quotes = {
			"0" : "As you grow older, you'll find the only things you regret are the things you didn't do.",
			"1" : "Don't worry if plan A fails, there are 25 more letters in the alphabet.",
			"2" : "Live for yourself.",
			"3" : "If people are talking behind your back, be happy that you are the one in front.",
			"4" : "Work hard. Dream big.",
			"5" : "Be not afraid of going slowly, be afraid only of standing still.",
			"6" : "Learn from yesterday, live for today, hope for tomorrow.",
			"7" : "I hear and I forget, I see and I remember. I do and I understand.",
			"8" : "Life must be lived forwards, but can only be understood backwards.",
			"9" : "Without Her love I can do nothing, with Her love there is nothing I cannot do.",
			"10" : "Never give advice in a crowd.",
			"11" : "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
			"12" : "Nature does nothing uselessly.",
			"13" : "Be the change you wish to see in the world.",
			"14" : "Don't ever doubt yourselves or waste a second of your life. It's too short, and you're too special.",
			"15" : "What a wonderful life I've had! I only wish I'd realized it sooner.",
			"16" : "Love the life you live, and live the life you love. - Bob Marley",
			"17" : "Love isn't something you find. Love is something that finds you.",
			"18" : "No matter what has happened. No matter what you've done. No matter what you will do. I will always love you. I swear it.",
			"19" : "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.",
			"20" : "Immature love says: 'I love you because I need you.' Mature love says 'I need you because I love you.'",
			"21" : "Love is like the wind, you can't see it but you can feel it.",
			"22" : "It is better to be hated for what you are than to be loved for what you are not.",
			"23" : "Maybe it's too early to say I love you, but I can't keep it a secret. I've never felt this perfectly happy, and I wanted you to know that you're the reason why.",
			"24" : "Sometimes the heart sees what is invisible to the eye.",
			"25" : "It is not a lack of love, but a lack of friendship that makes unhappy marriages.",
			"26" : "\"All, everything that I understand, I only understand because I love.\" - Leo Tolstoy",
			"27" : "\"When you trip over love, it is easy to get up. But when you fall in love, it is impossible to stand again.\" - Albert Einstein",
			"28" : "The sweetest of all sounds is that of the voice of the one we love.",
			"29" : "Love is life. And if you miss love, you miss life.",
			"30" : "\"The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart.\"  - Helen Keller",
			"31" : "I am thankful for all of those who said NO to me. Its because of them I'm doing it myself. - Albert Einstein",
			"32" : "I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game winning shot and missed. I've failed over",
			"33" : "I don't regret the things I've done, I regret the things I didn't do when I had the chance. - Unknown",
			"34" : "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. - Maya Angelou",
			"35" : "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. - Henry Ford",
			"36" : "Whether you think you can or you think you can't, you're right. - Henry Ford",
			"37" : "You may be disappointed if you fail, but you are doomed if you don't try. - Beverly Sills",
			"38" : "If you cannot do great things, do small things in a great way.",
			"39" : "Failure is the condiment that gives success its flavor.",
			"40" : "Strive not to be a success, but rather to be of value. - Albert Einstein",
			"41" : "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough. - Oprah Winfrey",
			"42" : "Fairy tales are more than true: not because they tell us that dragons exist, but because they tell us that dragons can be beaten.",
			"43" : "In order to succeed, your desire for success should be greater than your fear of failure. - Bill Cosby",
			"44" : "The best revenge is massive success. - Frank Sinatra",
			"45" : "A journey of a thousand miles begins with a single step - Lao Tzu.",
			"46" : "Don't watch the clock; do what it does. Keep going.",
			"47" : "There are two ways to live your life. One is as though nothing is a miracle. The other is as though everything is a miracle - Albert Einstein.",
			"48" : "If you can dream it, you can do it.",
			"49" : "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
			"50" : "The mind is everything. What you think you become.  - Buddha",
			"51" : "Silence is the best way to react while angry.",
			"52" : "A drunk man's words are a sober man's thoughts.",
			"53" : "Of course I am gonna drive. I am too drunk to walk.",
			"54" : "Alcohol gives you infinite patience for stupidity.",
			"55" : "If you truly loved yourself, you could never hurt another. - Buddha",
			"56" : "The heart was made to be broken. - Oscar Wilde",
			"57" : "One word, Frees us of all the weight and pain of life: That word is love. - Sophocles",
			"58" : "The strength of Truth lies in Love and the strength of Love lies in Truth. - Pandurang S. Athavale",
			"59" : "Never pretend to a love which you don't actually feel, for love is not ours to command. - Alan Watts",
			"60" : "Say as you think and speak it from your souls. - William Shakespeare",
			"61" : "I don't have dirty mind, I have Sexy imagination.",
			"62" : "If you want to make your dreams come true, the first thing you have to do is wake up.",
			"63" : "Silence is the best answer to a FOOL.",
			"64" : "Only I can change my life. No one can do it for me. - Carol Burnett",
			"65" : "Try to solve your problem yourself... Don't Depend on other..!",
			"66" : "I don't have time to hate people bcz.. I'm busy loving people who love me.",
			"67" : "Peace comes from within. Do not seek it without. - Buddha",
			"68" : "I never see what has been done; I only see what remains to be done. - Buddha",
			"69" : "Hatred does not cease by hatred, but only by love; this is the eternal rule. - Buddha",
			"70" : "Whatever words we utter should be chosen with care for people will hear them and be influenced by them for good or ill. - Buddha",
			"71" : "Those who are free of resentful thoughts surely find peace. - Buddha",
			"72" : "I do not believe in a fate that falls on men however they act; but I do believe in a fate that falls on them unless they act. - Buddha",
			"73" : "To succeed in your mission, you must have single-minded devotion to your goal. - A. P. J. Abdul Kalam",
			"74" : "You see, God helps only people who work hard. That principle is very clear. - A. P. J. Abdul Kalam",
			"75" : "Let us sacrifice our today so that our children can have a better tomorrow. - A. P. J. Abdul Kalam",
			"76" : "If you want to shine like a sun, first burn like a sun. - A. P. J. Abdul Kalam",
			"77" : "You have to dream before your dreams can come true. - A. P. J. Abdul Kalam",
			"78" : "Do I not destroy my enemies when I make them my friends? - Abraham Lincoln",
			"79" : "All that I am, or hope to be, I owe to my angel mother. - Abraham Lincoln",
			"80" : "Look deep into nature, and then you will understand everything better. - Albert Einstein",
			"81" : "Try not to become a man of success, but rather try to become a man of value. - Albert Einstein",
			"82" : "The true sign of intelligence is not knowledge but imagination. - Albert Einstein",
			"83" : "A champion is someone who gets up when he can't. - Jack Dempsey",
			"84" : "You will not be punished for your anger, you will be punished by your anger. - Buddha",
			"85" : "Friends show their love in times of trouble, not in happiness. - Euripides",
			"86" : "Love is when the other person's happiness is more important than your own. - H. Jackson Brown, Jr.",
			"87" : "The greatest healing therapy is friendship and love. - Hubert H. Humphrey",
			"88" : "If you love someone, set them free. If they come back they're yours; if they don't they never were. - Richard Bach",
			"89" : "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. - Albert Schweitzer",
			"90" : "Tell me and I forget. Teach me and I remember. Involve me and I learn. - Benjamin Franklin",
			"91" : "We are all born ignorant, but one must work hard to remain stupid. - Benjamin Franklin",
			"92" : "Try not to become a man of success, but rather try to become a man of value. - Albert Einstein",
			"93" : "The true sign of intelligence is not knowledge but imagination. - Albert Einstein",
			"94" : "If you don't like something, change it. If you can't change it, change your attitude. - Maya Angelou",
			"95" : "A fool thinks himself to be wise, but a wise man knows himself to be a fool. - William Shakespeare",
			"96" : "It is not in the stars to hold our destiny but in ourselves. - William Shakespeare",
			"97" : "Sometimes life hits you in the head with a brick. Don't lose faith. - Steve Jobs",
			"98" : "In order to carry a positive action we must develop here a positive vision. - Dalai Lama",
			"99" : "If you have only one smile in you give it to the people you love. - Maya Angelou",
			"100" : "Share your smile with the world. It's a symbol of friendship and peace. - Christie Brinkley",
		};
	}