var bing_opt = document.getElementById('bing-option');
var google_opt = document.getElementById('google-option');
var custom_opt = document.getElementById('custom-option');
var all_option = document.getElementsByName('selector');

chrome.storage.sync.get("selected_background", function (obj) {
     if(obj.selected_background == 'bing'){
        bing_opt.checked = true;
    }
    else if(obj.selected_background == 'google'){
        google_opt.checked = true;
    }
    else if(obj.selected_background == 'custom'){
        custom_opt.checked = true;
    }
});

all_option.forEach(function(item,index,arr) {
    item.addEventListener('click', function(){
        chrome.storage.sync.set({'selected_background': this.value}, function() {});
    });
});
