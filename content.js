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

function searchMovieImdb (imdb,title) {
	$.get("http://www.omdbapi.com/?i="+imdb,function(data) {
		data = JSON.parse(data);
		if (data.imdbRating) {
			searchMovieCsfd(title,data.Year.slice(0,4),"makeMagicCsfd");
			// searchMovieCsfd(spaceTitle(data.Title),data.Year.slice(0,4),"makeMagicCsfd");
			makeMagicImdb(data.imdbRating);
		}
	});
}


function spaceTitle (title) {
	return title.replace(new RegExp(" ", 'g'), "+").replace("&","");
}

function clearTitle (title) {
	return title.split(/s\d{2}e\d{2}.*/i)[0];
}

function clearTitleEpisodeOnly (title) {
	return title.split(/e\d{2}.*/i)[0];
}

function addCsfdLink(data) {
	var url = data["csfd_url"];
	$("textarea[name='SQLsNote']").val(function(index, old) {
		return url + "\n" + old;
	});
}

function isTvSeries (title) {
	var pattern = /(s\d{2}e\d{2}.*)/i,
		matches = pattern.exec(title);
	if (matches && matches.length > 1)
	{
		return matches[0];
	}
	else return false;
}

function autocompleteByTitle (title) {
	$(".plus-poster,.plus-poster + img").remove();
	title = clearTitle(title);
	var query = "http://www.omdbapi.com/?t="+title;

	if ($("input[name='SQLnRokUvedeni']").val().length > 0)
	{
		query = "http://www.omdbapi.com/?t="+title+"&y="+$("input[name='SQLnRokUvedeni']").val();
	}

	$.get(query,function(data) {
		var result = JSON.parse(data);
		if (result.Response === "False") return;
		// console.log(result);
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

	searchMovieCsfd(spaceTitle(result.Title),result.Year.slice(0,4),"findAlternativeTitle");

	});
}

function findAlternativeTitle (data) {
	var rawTitle = $("input[name='SQLsNazev']").val();
	title = clearTitle(rawTitle);
	if (typeof data.names === "object")
	{
		for (var prop in data.names)
		{
			if (data.names[prop] !== title)
			{
				if ($("input[name='SQLnSerialSezona']").val() && $("input[name='SQLnSerialEpizoda']").val())
				{
					var session = ($("input[name='SQLnSerialSezona']").val() <= 9) ? "0"+$("input[name='SQLnSerialSezona']").val():$("input[name='SQLnSerialSezona']").val();
					var episode = ($("input[name='SQLnSerialEpizoda']").val() <= 9) ? "0"+$("input[name='SQLnSerialEpizoda']").val():$("input[name='SQLnSerialEpizoda']").val();
					$("input[name='SQLsPuvodniNazev']").val(data.names[prop] + " S" + session + "E"+episode);
				}
				else
				{
					$("input[name='SQLsPuvodniNazev']").val(data.names[prop]);
				}
				return;
			}
		}
	}
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

/*function searchForumForHashOld (lengthValue,hashValue) {
	var hash = location.href.split("#")[1];
	if (typeof hashValue === "string") hash = hashValue;
	$(".detailv td").each(function(index,value){
		if ($(value).text().trim().slice(0,lengthValue) == hash)
		{
			$('html, body').animate({
				scrollTop: $(".detailv").eq(index).prev().offset().top
			}, 1000,"linear",function(){
				$(".detailv").eq(index).children().addClass("plus-animate-post");
			});
		}
		return;
	});
}*/

function searchForumForHash () {
	var hash = location.hash;
	$(hash).parent().next().children().addClass("plus-animate-post");
}

function getUserId () {
	var pattern = /(\d{1,10})/,
		matches = pattern.exec($("#tablelogon a[title='Info']").attr("onclick"));
	return matches[0];
}

function isActiveTranslator () {
	return ($("#tablelogon img").eq(1).attr("src") && $("#tablelogon img").eq(1).attr("src") !== "./img/stars/0.gif") ? true : false;
}

function addNewPostCounter (counter,answers) {
	$("#tablelogon").after("<a href =\"http://www.titulky.com/index.php?UserDetail=me\" title =\"Nepřečtených komentářů pod vašimi titulky / Reakce na vaše komenáře\" class =\"plus-unread-count\">"+counter+" / "+answers+"</a>");
	if (counter > 0 || answers > 0)
	{
		$(".plus-unread-count").addClass("plus-unread-count-red");
	}
}

function updateCommentFeed (lastVisit) {

	$.get("http://www.titulky.com/index.php?UserDetail=me",function(data) {

		var rawHTML = document.createElement('div');
		rawHTML.innerHTML = data;

		var counter = 0,
			counterAns = 0;
		$(rawHTML).find("#side1wrap ul:nth-child(4) li").each(function(index, value) {
			var pattern = /([^\[][^\]]*)/,
				matches = pattern.exec($(value).text()),
				dateSplit = matches[0].split("."),
				day = dateSplit[0],
				month = dateSplit[1]-1,
				lastSeq = dateSplit[2].split(" "),
				year = lastSeq[0],
				time = lastSeq[1].split(":"),
				hours = time[0],
				minutes = time[1],
				timestamp = new Date(year, month, day, hours, minutes).getTime();

			// if (1415008800000 < timestamp)
			if (lastVisit < timestamp)
			{
				counter++;
			}
			else return;
		});


		$(rawHTML).find("#side1wrap ul").last().children().each(function(index, value) {
			var pattern = /([^\[][^\]]*)/,
				matches = pattern.exec($(value).text()),
				dateSplit = matches[0].split("."),
				day = dateSplit[0],
				month = dateSplit[1]-1,
				lastSeq = dateSplit[2].split(" "),
				year = lastSeq[0],
				time = lastSeq[1].split(":"),
				hours = time[0],
				minutes = time[1],
				timestamp = new Date(year, month, day, hours, minutes).getTime();

			// if (1415008800000 < timestamp)
			if (lastVisit < timestamp)
			{
				counterAns++;
			}
			else return;
		});

		// console.log(new Date(lastVisit),counter);
		chrome.storage.sync.set({
			navstevaProfilu: +Date.now(),
			novychZprav: counter,
			novychOdpovedi: counterAns
		},function(){
			addNewPostCounter(counter,counterAns);
		});
	});
}

function highlightNewPosts (counter,counterAns) {
	$("#side1wrap ul:nth-child(4) li").each(function(index,value) {
		if (index < counter)
		{
			$("#side1wrap ul:nth-child(4) li").eq(index).prepend("<span class =\"plus-new-post\">NOVÉ</span>");
		}
	});

	$("#side1wrap ul").last().children().each(function(index,value) {
		if (index < counterAns)
		{
			$("#side1wrap ul").last().children().eq(index).prepend("<span class =\"plus-new-post\">NOVÉ</span>");
		}
	});
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
	$("#tablelogon a[href$='Logoff=true']").closest("table").after("<a href =\"http://www.titulky.com/index.php?Preklad=0\" class =\"plus-new\">Nový</a>");

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

	// sekce pozadavky --------------------------------------------------
	if (location.href.indexOf("Stat=6") !== -1)
	{
		// $(".detailh:first").text("Poslední").attr("width",70);
		$(".detailh").eq(0).after('<td class="detailh ucase" width="40">ČSFD</td>');
		$(".detailh").eq(6).after('<td class="detailh ucase" width="40">Subs</td>');
		var records = $('.soupis tr td:nth-child(1)').slice(1),
			titles = $('.soupis tr td:nth-child(2)').slice(1);
		records.each(function(index,value)
		{
			var title = $(titles[index]).text().split(" ("),
				spaceTitle = title[0].replace(new RegExp(" ", 'g'), "+"),
				imdb = $(records[index]).text().trim();
			$(value).nextAll("td:last").after("<td><a title =\"Vyhledat titulky na subtitleseeker.com\" target =\"_blank\" href =\"http://www.subtitleseeker.com/"+imdb+"/"+spaceTitle+"/Subtitles/\">Subs</a></td>");
			$(value).after("<td><a class =\"plus-csfd\" title =\"Vyhledat film na ČSFD\" target =\"_blank\" href =\"http://www.csfd.cz/hledat/?q="+title[0]+"\">ČSFD</a></td>");
		});

		var imdbs = [];
		// imdbs.push($(".soupis a[target='imdb']").first().text());

		$(".soupis a[target='imdb']").each(function(index, value)
		{
			imdbs.push($(value).text());
		});

	// pozadavky - dopln hodnoceni k filmum
		// console.log(imdbs);
		
		// hide column with Ratings
		$(".soupis tr td:nth-child(5)").hide();
		$(".soupis .detailh a").eq(0).attr("href","/?orderby=3&Stat=6").attr("title","Seřadit filmy podle hodnocení na IMDB");

		var pusher = new Pusher("e3a617372cf7087256f0");
		var stamp = pusher.sessionID;
		var today = Date.now();
		var genres = [];
		var rawGenres = "";

		$(document).ajaxStart(function()
		{
			var channel = pusher.subscribe('titulky-api');
			channel.bind(stamp, function(response)
			{
				var ratingBg = "plus-rating-blue";
				if (response.data.csfd_r == 0)
				{
					ratingBg = "";
					response.data.csfd_r = "x";
				}
				else if (response.data.csfd_r >= 70) ratingBg = "plus-rating-red";
				else if (response.data.csfd_r <= 30) ratingBg = "plus-rating-black";

				// console.log(response.index,response.data);
				// console.log(response.data.released,Date.now());
				if (response.data.released*1000 > today)
				{
					var dateClean = new Date(response.data.released*1000),
						dateYear = dateClean.getFullYear(),
						dateMonth = dateClean.getMonth()+1,
						dateDay = dateClean.getDate();

					// dopln premieru pokud film jeste nevysel
					$(".soupis tr td:nth-child(3)").slice(1).eq(response.index).append("<span title =\"Premiéra filmu. Film ještě nevyšel\" class =\"plus-opening\"> ("+ dateDay+"."+dateMonth+"."+dateYear+")</span>");

				}

				// kde chybi, dopln rok
				var origYear = $(".soupis tr td:nth-child(4)").slice(1).eq(response.index).text();
				if (response.data.year && !origYear)
				{
					$(".soupis tr td:nth-child(4)").slice(1).eq(response.index).text(response.data.year);
				}

				// filtrovani dle zanru
				if (response.data.genre != "false")
				{
					var localGenres = response.data.genre.split(", ");
					for (var i = 0, genresLength = localGenres.length; i < genresLength; i++) {

						$(".soupis tr").slice(1).eq(response.index).addClass("plus-"+localGenres[i]);

						if (genres.indexOf(localGenres[i]) === -1)
						{
							genres.push(localGenres[i]);
							rawGenres += "<option>"+localGenres[i]+"</option>";
						}
					}
				}

				$(".plus-csfd")
					.eq(response.index)
					.attr("href",response.data.csfd_url)
					.text(response.data.csfd_r)
					.parent()
					.addClass(ratingBg+" plus-cell-rating");

				var origRating = $(".soupis tr td:nth-child(5)").slice(1).eq(response.index).text().split("/")[0].replace(",",".");
				// var origRating = $(".plus-csfd").parent().next().next().eq(response.index).text().split("/")[0].replace(",",".");
				trueRating = (origRating.length > 1) ? origRating : response.data.imdb_r;

				ratingBg = "plus-rating-blue";
				if (trueRating == 0) {ratingBg = ""; trueRating = "x";}
				else if (trueRating >= 7.0) ratingBg = "plus-rating-red";
				else if (trueRating <= 3.0) ratingBg = "plus-rating-black";

				$(".plus-csfd")
					.eq(response.index)
					.parent()
					.prev()
					.children()
					.text(trueRating)
					.addClass("plus-imdb")
					.parent()
					.addClass(ratingBg+" plus-cell-rating");
			});
		});

		$.getJSON("http://richja.cz/titulky/",{multi: true, imdb: imdbs.join(),stamp:stamp},function(data)
		{
			// console.log(data);
			pusher.disconnect();

			$("h2").before("Filtrování dle žánru <select data-placeholder=\"Vyber žánr(y)...\" style=\"width:562px;\" multiple class =\"plus-filter\">"+rawGenres+"</select><br>");
			$(".plus-filter").chosen({no_results_text: "Hledaný žánr nenalezen."}).change(function()
			{
				
				var selected = $(".plus-filter").chosen().val(),
					classes = [];

				if (!selected)
				{
					$(".soupis tr").slice(1).show();
					return;
				}

				$(selected).each(function(index,value)
				{
					classes.push(".plus-"+value);
				});
				$(".soupis tr").slice(1).show().not(classes.join()).hide();
				/*var closeImage = "chrome-extension://"+chrome.runtime.id+"/chosen-sprite.png";
				$(".search-choice-close").css("background","url("+closeImage+") !important");*/
			});

		});
	}

	// sekce vlastní pozadavky ------------------------------------------
	if (location.href.indexOf("PozadavekTitulku=") !== -1)
	{
		// get list of wanted movies
		var movies = $('.soupis tr td:nth-child(3)').slice(1);
		if (movies.length)
		{
			var list = [],
				pattern = /\s\((Video)?\s?\d{4}\)/i;
			$(movies).each(function(index,value){
				list.push($(value).text().split(pattern)[0].toLowerCase());
			});

			$.get("http://www.titulky.com/index.php?Stat=5",function(data)
			{
				var rawHTML = document.createElement('div'),
					links = [],
					titles = [],
					startDates = [],
					endDates = [];
				rawHTML.innerHTML = data;

				// $(rawHTML).find(".soupis b > a").each(function(index, value) {
				// console.log($(rawHTML).find(".soupis a > img").attr("alt"));
				// $(rawHTML).find(".soupis a > img").each(function(index, value)
				$(rawHTML).find(".soupis").eq(1).find(".row1,.row2").each(function(index, value)
				{
					var hrefNode = $($(value).find("b > a")),
						startDate = $($($(value).find("td"))[2]).text(),
						endDate = $($($(value).find("td"))[3]).text();
					if (titles.indexOf($(hrefNode).text()) === -1)
					{
						if ($(hrefNode).text().indexOf(", The") !==-1) {
							var editedTitle = "The "+$(hrefNode).text().replace(", The", "");
							titles.push(editedTitle.split(pattern)[0].toLowerCase());
						}
						else
						{
							titles.push($(hrefNode).text().split(pattern)[0].toLowerCase());
						}
						links.push($(hrefNode).attr("href"));
						startDates.push(startDate);
						endDates.push(endDate);
					}
				});

				$(list).each(function (index,value)
				{
					if (titles.indexOf(value.trim().split("      překládá se")[0]) !== -1)
					{
						var titleIndex = titles.indexOf(value.trim().split("      překládá se")[0]),
							itemLink = links[titleIndex],
							itemStartDate = startDates[titleIndex];
							itemEndDate = endDates[titleIndex];

						// $('.soupis tr td:nth-child(3)').slice(1).eq(index).append(" <a href =\""+itemLink+"\">překládá se</a> <i class =\"plus-right\">("+itemStartDate+" - "+itemEndDate+")</i>");
						$('.soupis tr td:nth-child(3)').slice(1).eq(index).append("<i class =\"plus-right\">("+itemStartDate+" - "+itemEndDate+")</i>");
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

	// odkaz na vyhledani titulku celeho serialu
		if (isTvSeries(title))
		{
			$(".plus-version").after("<a title =\"Vyhledat všechny titulky k této řadě seriálu\" class =\"plus-version\" href=\"http://www.titulky.com/index.php?Fulltext="+clearTitleEpisodeOnly(title)+"\">K celé řadě</a>");
		} 		

		// searchMovieCsfd(spaceTitle,year,"makeMagicCsfd");
		searchMovieImdb(imdb,title);
	}

	// ropracovane detail
	if (location.href.indexOf("Stat=5&item=") !== -1)
	{
		var link = $($(".soupis .row2").children()[6]).children().attr("href");
		if (link !== "javascript://")
		{
			$(".soupis").eq(1).before("<a class =\"tlacitko plus-state-update\" href ="+link+">Aktualizovat stav překladu</a>");
		}
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

// sekce nahrani novych titulku - prvni krok
	if (location.href.indexOf("premium.titulky.com/index.php?Nahrat=1") !== -1)
	{
		// u velikosti titulku umaze 
		$("input[name^='VelikostFilmu']").change(function(){
			$(this).val($(this).val().replace(/[^\d]/g,""));
		});
	}

// FORUM
	var lengthValue = 5;
	// prida hash ke vzkazum na foru
	/*$("#stat_bok_v span a").each(function(index,value)
	{
		$("#stat_bok_v span a").eq(index).attr("href",$(value).attr("href")+"#"+$(value).text().trim().slice(0,lengthValue)) ;
	});*/

	// dle shody hashe a obsahu prispevku sroluje na dany prispevek
	if (location.href.indexOf("film=1&Prispevek") !== -1 && location.hash.length > 0)
	{
		searchForumForHash();
		$("#stat_bok_v span a").click(function(){
			if ($(this).attr("href").indexOf(location.search) > 0)
			{
				searchForumForHash();
			}
		});
	}

	chrome.storage.sync.get({
		vyhledavani: false,
		domu: true,
		premium: false,
		hlavicka: false,
		udalost: true,
		rozpracovane: '',
		poznamky: '',
		release: true,
		navstevaProfilu: false,
		// cacheIntervalProfil: 1*60*60*1000,
		novychZprav: 0,
		novychOdpovedi: 0
	}, function(items) {
		// console.log(items);

		if (isActiveTranslator())
		{
			var time = 1*15*60*1000; // 15 minut
			// console.log(time,new Date (items.navstevaProfilu),new Date (items.navstevaProfilu+time),new Date());
			// if (items.navstevaProfilu === false || items.navstevaProfilu <= +Date.now())
			if (items.navstevaProfilu === false || items.navstevaProfilu+time < +Date.now())
			{
				updateCommentFeed(items.navstevaProfilu);
			}
			else addNewPostCounter(items.novychZprav,items.novychOdpovedi);
		}

	// sekce profil uzivatele
		if (location.href.indexOf("UserDetail=") !== -1)
		{
			// jedna se o vlastni profil uzivatele
			var userId = getUserId();
			if (location.href.indexOf(userId) > 0 || location.href.indexOf("UserDetail=me"))
			{
				highlightNewPosts(items.novychZprav,items.novychOdpovedi);

				chrome.storage.sync.set({
					navstevaProfilu: +Date.now(),
					novychZprav: 0,
					novychOdpovedi: 0
				}, function(){
					// console.log(items.navstevaProfilu);
				});
			}
		}

	var date = new Date(),
		year = date.getFullYear();

	if (items.udalost && year == "2014")
	{
		// hlavni stranka (index)
		if ($(".iboxcover").length) //orloj (by fredikoun) :)
		{
			console.log("Vánoce!!!");
			$("#slider li").eq(1).find("img").attr("src","chrome-extension://"+chrome.runtime.id+"/christmas.jpg");
		}

		if ($("#head_a1").length) //orloj (by fredikoun) :)
		{
			$(this).hide();
			$("#head_a1").append("<img class =\"plus-snowman\" src =\"chrome-extension://"+chrome.runtime.id+"/snowman.png\">");
		}
	}

	// vysledky hledani (fulltext i prime)
		if (location.href.indexOf("Fulltext") !== -1 || location.href.indexOf("Searching") !== -1)
		{
			$(".soupis").before("<label><input type=\"checkbox\" id=\"ukazovatko\" name =\"ukazovatko\"><span class =\"plus-switcher-label\">Zobrazit/skrýt verze</span></label>");

			$(".soupis tr td:nth-child(2)").slice(1).each(function(index,value)
			{
				var release = $(value,value).find(".fixedTip").attr("title");
				if (typeof release === "undefined") release = "";

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
			$("#menu li:first").before("<li><a href =\"http://www.titulky.com\">Domů</a></li>");
			// $("#menu li a:first").text("Domů");
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
			$("input[name='SQLsNazev']").after("<input type=\"button\" class=\"button plus-autocomplete\" value=\"Automaticky vyplnit\" title =\"Automaticky doplní údaje názvu filmu (pro přesnější výsledky předvyplňte rok)\">");

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