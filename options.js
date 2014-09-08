// Saves options to chrome.storage
function save_options() {
	var vyhledavani = document.getElementById('vyhledavani').checked;
	var domu = document.getElementById('domu').checked;
	var rozpracovane = document.getElementById('rozpracovane').value;
	var poznamky = document.getElementById('poznamky').value;

	chrome.storage.sync.set({
		vyhledavani: vyhledavani,
		domu: domu,
		rozpracovane: rozpracovane,
		poznamky: poznamky
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Nastavení bylo uloženo';
		setTimeout(function() {
			status.textContent = '';
		}, 2000);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		vyhledavani: false,
		domu: true,
		rozpracovane: '',
		poznamky: ''
	}, function(items) {
		document.getElementById("rozpracovane").value = items.rozpracovane;
		document.getElementById("poznamky").value = items.poznamky;
		document.getElementById('vyhledavani').checked = items.vyhledavani;
		document.getElementById("domu").checked = items.domu;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
		save_options);