// Saves options to chrome.storage
function save_options() {
	var vyhledavani = document.getElementById('vyhledavani').checked;
	var domu = document.getElementById('domu').checked;
	var premium = document.getElementById('premium').checked;
	var hlavicka = document.getElementById('hlavicka').checked;
	var udalost = document.getElementById('udalost').checked;
	var rozpracovane = document.getElementById('rozpracovane').value;
	var poznamky = document.getElementById('poznamky').value;

	chrome.storage.sync.set({
		vyhledavani: vyhledavani,
		domu: domu,
		premium: premium,
		hlavicka: hlavicka,
		udalost: udalost,
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
		premium: false,
		hlavicka: false,
		udalost: true,
		rozpracovane: '',
		poznamky: ''
	}, function(items) {
		document.getElementById('vyhledavani').checked = items.vyhledavani;
		document.getElementById("domu").checked = items.domu;
		document.getElementById("premium").checked = items.premium;
		document.getElementById("hlavicka").checked = items.hlavicka;
		document.getElementById("udalost").checked = items.udalost;
		document.getElementById("rozpracovane").value = items.rozpracovane;
		document.getElementById("poznamky").value = items.poznamky;
	});
}

function add_textarea (argument) {
	var notes = document.querySelectorAll(".notes").length;

	var label = document.createElement("label"),
		label_text = document.createTextNode("Šablona #"+notes),
		textarea = document.createElement("textarea"),
		br = document.createElement("br");
	textarea.class = "notes";
	textarea.name = "poznamky"+notes;
	textarea.id = "poznamky"+notes;

	var preparedNode = "<label>Šablona #"+notes+"<br><textarea class = \"notes\" name =\"poznamky"+notes+"\" id=\"poznamky"+notes+"\"></textarea></label><br>";

	// document.getElementById("poznamka").referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	document.getElementById("poznamky").parentNode.insertBefore(textarea,document.getElementById("poznamka"));
	document.getElementById("poznamky").parentNode.insertBefore(br,document.getElementById("poznamka"))

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
		save_options);

document.getElementById('nova').addEventListener('click',
		add_textarea);