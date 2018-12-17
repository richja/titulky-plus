'use strict';

var config = {
	vyhledavani: false,
	domu: true,
	premium: false,
	hlavicka: false,
	odkazy: true,
	udalost: true,
	rozpracovane: '',
	poznamky: ''
};

var restore = () => chrome.storage.local.get(config, prefs => {
	document.getElementById('vyhledavani').checked = prefs.vyhledavani;
	document.getElementById('domu').checked = prefs.domu;
	document.getElementById('premium').checked = prefs.premium;
	document.getElementById('hlavicka').checked = prefs.hlavicka;
	document.getElementById('odkazy').checked = prefs.odkazy;
	document.getElementById('udalost').checked = prefs.udalost;
	document.getElementById('rozpracovane').value = prefs.rozpracovane;
	document.getElementById('poznamky').value = prefs.poznamky;
});
restore();

document.getElementById('save').addEventListener('click', () => {
	const info = document.getElementById('status');

	try {
	chrome.storage.local.set({
	  vyhledavani: document.getElementById('vyhledavani').checked,
	  domu: document.getElementById('domu').checked,
	  premium: document.getElementById('premium').checked,
	  hlavicka: document.getElementById('hlavicka').checked,
	  odkazy: document.getElementById('odkazy').checked,
	  udalost: document.getElementById('udalost').checked,
	  rozpracovane: removeTags(document.getElementById('rozpracovane').value),
	  poznamky: removeTags(document.getElementById('poznamky').value)
	}, () => {
	  info.textContent = 'Nastavení bylo uloženo';
	  restore();
	});
	}
	catch (e) {
	 info.textContent = e.message;
	}
	window.setTimeout(() => info.textContent = '', 3000);
});

document.getElementById('reset').addEventListener('click', () => chrome.storage.local.set(config, restore));

/* ************* SANITIZER ******************* */

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');
	
function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
}