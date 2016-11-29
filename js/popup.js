var bing_opt = document.getElementById('bing-option');
var google_opt = document.getElementById('google-option');
var custom_opt = document.getElementById('custom-option');

var all_option = document.getElementsByName('selector');


all_option.forEach(function(item,index,arr) {
    item.addEventListener('click', function(){
        if(this.value == 'bing')
        {
            chrome.storage.sync.set({'selected_background': 'bing'}, function() {});
        }
        else if(this.value == 'google')
        {
            chrome.storage.sync.set({'selected_background': 'google'}, function() {});
        }
        else if(this.value == 'custom')
        {
            chrome.storage.sync.set({'selected_background': 'custom'}, function() {});
        }
    });
});
