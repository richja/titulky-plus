document.getElementById("nastaveni").addEventListener("click", function(){
	// chrome.tabs.create({url: "options.html"});

	var optionsUrl = chrome.extension.getURL('pages/options.html');

	chrome.tabs.query({url: optionsUrl}, function(tabs) {
		if (tabs.length) {
			chrome.tabs.update(tabs[0].id, {active: true});
			window.close();
		} else {
			chrome.tabs.create({url: optionsUrl});
			window.close();
		}
	});
});
