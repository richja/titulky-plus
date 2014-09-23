function searchMovieCsfd (title,year,caller) {
	$.get("http://csfdapi.cz/movie?search="+title,function(data) {
		var id = false;
		for (var resultsCount = data.length,i=0; i < resultsCount; i++) {
			if (year == data[i]["year"]) {
				id = data[i]["id"];
				break;
			}
		}

		if (id) {
			$.get("http://csfdapi.cz/movie/"+id,function(data) {
				window[caller](data);
			});
		}
	});
}

function searchMovieImdb (imdb) {
	$.get("http://www.omdbapi.com/?i="+imdb,function(data) {
		data = JSON.parse(data);
		if (data.imdbRating) {
			searchMovieCsfd(spaceTitle(data.Title),data.Year.slice(0,4),"makeMagicCsfd");
			makeMagicImdb(data.imdbRating);
		}
	});	
}


function spaceTitle (title) {
	return title.replace(new RegExp(" ", 'g'), "+").replace("&","");
}

function clearTitle (title) {
	return title.split( / s\d{2}e\d{2}.*/i)[0];
}

function addCsfdLink(data) {
	var url = data["csfd_url"];
	$("textarea[name='SQLsNote']").val(function(index, old) {
		return url + "\n" + old;
	});
}

function autocompleteByTitle (title) {
	$(".plus-poster,.plus-poster + img").remove();
	title = clearTitle(title);
	$.get("http://www.omdbapi.com/?t="+title,function(data) {
		var result = JSON.parse(data);
		if (!result.Response) return;
		console.log(result);
		$("input[name='SQLnRokUvedeni']").val(result.Year.slice(0,4));
		$("input[name='SQLsIMDB']").val(result.imdbID.slice(2));
		$("#side1cont").prepend("<div class=\"tab plus-poster\">PLAKÁT</div><img src =\""+result.Poster+"\">");

	var pattern = /s(\d{2})e(\d{2}).*/i,
		matches = pattern.exec($("input[name='SQLsNazev']").val());

	if (matches && matches.length > 2)
	{
		$("input[name='Serial']").click();
		$("input[name='SQLnSerialSezona']").val(parseInt(matches[1],10));
		$("input[name='SQLnSerialEpizoda']").val(parseInt(matches[2],10));
	}
	});
}

function makeMagicCsfd (data) {
	var rating = data["rating"],
		url = data["csfd_url"];

	$("a[target='imdb']").after("<a href=\""+url+"\" target=\"csfd\"><img src=\"chrome-extension://"+chrome.runtime.id+"/csfd.png\" alt=\"CSFD.cz\"></a>");
	if (typeof rating !== "undefined") {
		var ratingBg = "plus-rating-blue";
		if (rating >= 70) ratingBg = "plus-rating-red";
		if (rating <= 30) ratingBg = "plus-rating-black";
		$("#contcont").prepend("<div title =\"Hodnocení filmu na CSFD\" class =\"plus-rating "+ratingBg+"\"><a href=\""+url+"\" target=\"csfd\">"+rating+"%</a></div>");
	}
	else {
		$("#contcont").prepend("<div title =\"Hodnocení filmu na ČSFD - prozatím nelze hodnotit\" class =\"plus-rating\"><a href=\""+url+"\" target=\"csfd\"><img src =\"chrome-extension://"+chrome.runtime.id+"/lock.png\"></a></div>");
	}
}

function makeMagicImdb (rating) {

	var ratingBg = "plus-rating-blue";
	if (rating >= 7.0) ratingBg = "plus-rating-red";
	if (rating <= 3.0) ratingBg = "plus-rating-black";
	var url = $("a[target='imdb']").attr("href");
	$("#contcont").prepend("<div title =\"hodnocení na IMDB\" class =\"plus-rating plus-rating-imdb "+ratingBg+"\"><a href=\""+url+"\" target=\"_blank\">"+rating+"</a></div>");
}

/*function getItems () {
	chrome.storage.sync.get({
		vyhledavani: false,
		domu: true,
		rozpracovane: '',
		poznamky: ''
	}, function(items) {
		console.log(items);
		return items;
	});
}*/

$(document).ready(function() {

	// aktivni input pro vyhledavani hned po nacteni
	if (location.href === "http://www.titulky.com/") $("#searchTitulky").focus();

	// kdokoliv je prihlasen, odkaz na vytvoreni noveho prekladu
	$("a[href$='Logoff=true']").closest("table").after("<a href =\"http://www.titulky.com/index.php?Preklad=0\" class =\"plus-new\">Nový překlad</a>");

	// pouze prihlaseni
	if ($("a[href$='Logoff=true']").length)
	{
		$("#search_submit").after("<a title =\"Vyhledat přesnou shodu (pouze pro premium uživatele)\" href =\"\" class=\"tlacitko plus-search\">Vyhledat přesně</a>");
		$(".plus-search").click(function(event){
			window.location.href ="http://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ARelease=&ARok=&ANazev="+$("#searchTitulky").val();
			return false;
		});
		$("#tablesearch").css("margin-bottom","20px");
	}

	// sekce pozadavky
	if (location.href.indexOf("Stat=6") !== -1)
	{
		$(".detailh:first").text("Poslední").attr("width",70);
		$(".detailh").eq(1).after('<td class="detailh ucase" width="40">CSFD</td>');
		$(".detailh").eq(2).after('<td class="detailh ucase" width="40">Subs</td>');
		var records = $('.soupis tr td:nth-child(2)').slice(1),
			titles = $('.soupis tr td:nth-child(3)').slice(1);
		records.each(function(index,value) {
			var title = $(titles[index]).text().split(" ("),
				spaceTitle = title[0].replace(new RegExp(" ", 'g'), "+"),
				imdb = $(records[index]).text().trim();
			$(value).after("<td><a title =\"Vyhledat titulky na subtitleseeker.com\" target =\"_blank\" href =\"http://www.subtitleseeker.com/"+imdb+"/"+spaceTitle+"/Subtitles/\">Subs</a></td>");
			$(value).after("<td><a title =\"Vyhledat film na ČSFD\" target =\"_blank\" href =\"http://www.csfd.cz/hledat/?q="+title[0]+"\">CSFD</a></td>");
		});
	}

	// sekce vlastní pozadavky
	if (location.href.indexOf("PozadavekTitulku=") !== -1)
	{
		// get list of wanted movies
		var movies = $('.soupis tr td:nth-child(3)').slice(1);
		if (movies.length)
		{
			var list = [],
				pattern = /\s\((Video)?\s?\d{4}\)/i;
			$(movies).each(function(index,value){
				list.push($(value).text().split(pattern)[0]);
			});

			$.get("http://www.titulky.com/index.php?Stat=5",function(data) {

				var rawHTML = document.createElement('div'),
					links = [],
					titles = [],
					startDates = [],
					endDates = [];
				rawHTML.innerHTML = data;

				// $(rawHTML).find(".soupis b > a").each(function(index, value) {
				$(rawHTML).find(".row1,.row2").each(function(index, value) {
					// console.log($(value));
					var hrefNode = $($(value).find("b > a")),
						startDate = $($($(value).find("td"))[2]).text(),
						endDate = $($($(value).find("td"))[3]).text();
					if (titles.indexOf($(hrefNode).text()) === -1)
					{
						if ($(hrefNode).text().indexOf(", The") !==-1) {
							var editedTitle = "The "+$(hrefNode).text().replace(", The", "");
							titles.push(editedTitle.split(pattern)[0]);
						}
						else
						{
							titles.push($(hrefNode).text().split(pattern)[0]);
						}
						links.push($(hrefNode).attr("href"));
						startDates.push(startDate);
						endDates.push(endDate);
					}
				});

				/*console.log(titles.filter(function(item){
					return item.indexOf("Le Week-End") > -1;
					// return item.indexOf($(value).text()) > -1;
				}));
				*/

				$(list).each(function (index,value) {
					if (titles.indexOf(value) !== -1)
					{
						var titleIndex = titles.indexOf(value),
							itemLink = links[titleIndex],
							itemStartDate = startDates[titleIndex];
							itemEndDate = endDates[titleIndex];

						$('.soupis tr td:nth-child(3)').slice(1).eq(index).append(" <a href =\""+itemLink+"\">překládá se</a> <i class =\"plus-right\">("+itemStartDate+" - "+itemEndDate+")</i>");
					}
				});
			});
		}
	}

	// detail titulku
	if ($("h1").length && $("a[target='imdb']").length)
	{
		var titleArray = $("h1").text().split(" ("),
			title = titleArray[0],
			spaceTitle = title.replace(new RegExp(" ", 'g'), "+").replace("&",""),
			year = titleArray[1].substring(0,4),
			imdb = $("a[target='imdb']").attr("href").split("title/")[1].slice(0,-1);

	// pouze prihlaseni
		if ($("a[href$='Logoff=true']").length)
		{
	// odkaz pro prime vyhledani dalsich verzi, pouze prihlase premium, zadny fulltext
			$("a[href^='index.php?Fulltext']").after("<a title =\"Další verze titulků konkrétního filmu (pouze pro premium uživatele)\" class =\"plus-version\" href=\"http://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ANazev="+title+"&ARelease=&ARok="+year+"\">Další přesné verze</a>");
		}

		// searchMovieCsfd(spaceTitle,year,"makeMagicCsfd");
		searchMovieImdb(imdb);
	}

	// ropracovane detail
	if (location.href.indexOf("Stat=5&item=") !== -1)
	{
		var link = $($(".soupis .row2").children()[6]).children().attr("href");
		$(".soupis").eq(1).before("<a class =\"tlacitko plus-state-update\" href ="+link+">Aktualizovat stav překladu</a>");
	}

	// vysledky vyhledavani
	if (location.href.indexOf("Fulltext") !== -1)
	{
		var search = $("#searchTitulky").val().toLowerCase();
		if (search.length)
		{
			$.get("http://www.omdbapi.com/?s="+search,function(data)
			{
				data = JSON.parse(data);
				if (typeof data.Search !== "undefined")
				{
					var year = data["Search"][0]["Year"];
				}
				$(".soupis td:nth-child(1)").slice(1).filter(function()
				{
					return $(this).text().trim().toLowerCase().replace(new RegExp(/ s\d{2}e\d{2}.*/), "") == search;
				}).closest("tr").addClass("plus-topped");
				$(".plus-topped:first").attr("id","titulek").attr("name","titulek");
				window.location.hash="titulek";
			});
		}
	}

	// sekce novy preklad ci uprava ropracovaneho
	if (location.href.indexOf("Preklad=") !== -1)
	{
		$("input[name='SQLsAlternativniNazev']").css("width","200px");
		$("#nazev1").css("width","300px");

	// sekce novy preklad (pouze)
		if (location.href.indexOf("Preklad=0") !== -1)
		{
			chrome.storage.sync.get({
				rozpracovane: '',
			}, function(items) {
				$("textarea[name='SQLsPoznamka']").text(items.rozpracovane);
			});

			// prida datum k odhadu dle poctu dni
			$("input[name='SQLnOdhadDnu']").after("<div title =\"Odpovídající datum dokončení dle odhadu ve dnech\" class =\"plus-date\"></div>");

			$("input[name='SQLnOdhadDnu']").keyup(function(){
				var days = parseInt($("input[name='SQLnOdhadDnu']").val(),10);
				date = new Date();
				date.setDate(date.getDate() + days);
				if (days)
				{
					$(".plus-date").text(date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear());
				}
				else
				{
					$(".plus-date").text("");
				}
			});
		}
	}

	chrome.storage.sync.get({
		vyhledavani: false,
		domu: true,
		premium: false,
		hlavicka: false,
		rozpracovane: '',
		poznamky: '',
		release: true
	}, function(items) {
		// console.log(items);

	// vysledky hledani (fulltext i prime)
		if (location.href.indexOf("Fulltext") !== -1 || location.href.indexOf("Searching") !== -1)
		{
			$(".soupis").before("<label><input type=\"checkbox\" id=\"ukazovatko\" name =\"ukazovatko\"><span class =\"plus-switcher-label\">Zobrazit/skrýt verze</span></label>");

			$(".soupis tr td:nth-child(2)").slice(1).each(function(index,value)
			{
				var release = $(value,value).find(".fixedTip").attr("title");
				if (typeof release === "undefined")	release = "";

				if (release !== "")
				{
					$(".r,.r1").eq(index).after("<tr class =\"plus-release\"><td colspan=\"10\">"+release+"</td></tr>");
				}

				if (items.release)
				{
					$("#ukazovatko").prop("checked",true);
				}
				else {
					$(".plus-release").hide();
				}
			});

			$("#ukazovatko").change(function(){

				var switcher = $(this).prop("checked");

				chrome.storage.sync.set({
					release: switcher,
				});
				$(".plus-release").toggle();
			});
		}

	// pridej hlavicku webu
		if (items.hlavicka && !$("#head_a").length)
		{
			$("#head_b")
				.css("bottom","-3px")
				.before("<div id =\"head_a\"><div id =\"head_a1\"><a href =\"http://www.titulky.com\"><img id=\"headlogotitulky\" src=\"http://www.titulky.com/css/logo.png\" alt=\"České a slovenské titulky\"></a></div></div>");
			$("#head_a,#head_b").wrapAll("<div id ='head'>");
		}

		if (items.vyhledavani)
		{
	// vyhledavej vzdy naprimo, bez fulltextu
			$("form[name='searchformsub']").submit(function(event){
				window.location.href = "http://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ARelease=&ARok=&ANazev="+$("#searchTitulky").val();
				return false;
			});
		}

		if (items.domu)
		{
	// tlacitko domu na kazde strance
			// $("#menu li:first").before("<li><a href =\"http://www.titulky.com\">Domů</a></li>");
			$("#menu li a:first").text("Domů");
		}

		if (items.premium)
		{
			$("#menu a[href$='Napoveda=2']").parent().before("<li><a href =\"http://premium.titulky.com\">Premium</a></li>");
		}

		// skryt "neuzitecne odkazy"
		// $("#menu li").slice(-6,-3).hide()

	// editace titulku na premium
		if (location.href.indexOf("http://premium.titulky.com/index.php?Set=") !== -1)
		{
	// sablona poznamek pro nove vlozeny titulek
			$("input[name='SQLsNazev']").after("<input type=\"button\" class=\"button plus-autocomplete\" value=\"Automaticky vyplnit\" title =\"Automaticky vyplní rok a IMDB číslo dle názvu filmu\">");

			$(".plus-autocomplete").click(function() {
				autocompleteByTitle($("input[name='SQLsNazev']").val());
			});

			if (!$("textarea[name='SQLsNote']").val())
			{
				$("textarea[name='SQLsNote']").val(items.poznamky);
			}

			$(".button[value='najít']").after("<input type=\"button\" class=\"button plus-note-csfd\" value=\"vložit ČSFD odkaz\" title =\"Vloží odkaz na ČSFD.cz do poznámky (musí být vyplněn název a rok)\">");

			$(".plus-note-csfd").click(function(){
				searchMovieCsfd($("input[name='SQLsNazev']").val(),$("input[name='SQLnRokUvedeni']").val(),"addCsfdLink");
			});
		}
	});

});