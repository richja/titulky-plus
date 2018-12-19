$(document).ready(function() {

	//**************** AKTIVNÍ INPUT PRO VYHLEDÁVÁNÍ HNED PO NAČTENÍ ************************
	if (location.href === "https://www.titulky.com/") $("#searchTitulky").focus();

	//**************** VÝSLEDKY VYHLEDÁVÁNÍ *************************************************
	if (location.href.indexOf("Fulltext") !== -1) {

		//highlight exact results
		var search = $("#searchTitulky").val().toLowerCase();
		if (search.length)
		{
			$.get("https://www.omdbapi.com/?s=" + search + "&apikey=2c7f8b02", function(data)
			{
				console.log(data);
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

	//**************** PŘESNÉ VYHLEDÁVÁNÍ - POUZE PRO PŘIHLÁŠENÉ  ***************************
	if ($("a[href$='Logoff=true']").length) {
		$("#search_submit").after("<a title =\"Vyhledat přesnou shodu (pouze pro premium uživatele)\" href =\"\" class=\"tlacitko plus-search\">Vyhledat přesně</a>");
		$(".plus-search").click(function(event){
			window.location.href ="https://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ARelease=&ARok=&ANazev="+$("#searchTitulky").val();
			return false;
		});
		$("#tablesearch").css("margin-bottom","20px");
	}

	//**************** SEKCE POŽADAVKY ******************************************************
	if (location.href.indexOf("Stat=6") !== -1 || location.href.indexOf("pozadavek-na-titulky-patri-sem") !== -1) {
		
		imagePreview();
	 // $(".detailh:first").text("Poslední").attr("width",70);
		$(".detailh").eq(0).after('<td class="detailh ucase" width="40">ČSFD</td>');
		$(".detailh").eq(6).after('<td class="detailh ucase" width="40">Subs</td>');
		
		var records = $('.soupis tr td:nth-child(1)').slice(1),
			titles = $('.soupis tr td:nth-child(2)').slice(1),
			imdbRatings = $('.soupis tr td:nth-child(4)').slice(1)
			
		records.each(function(index,value)
		{
			var title = $(titles[index]).text().replace("překládá se","").trim().split(" ("),
				spaceTitle = title[0].replace(new RegExp(" ", 'g'), "+"),
				imdb = $(records[index]).text().trim(),
				rating = $(imdbRatings[index]).text().trim()

			// add new column with a link to subscene.com
			$(value).nextAll("td:last").after("<td><a title =\"Vyhledat titulky na Subscene.com\" target =\"_blank\" href =\"https://subscene.com/subtitles/title?q="+spaceTitle+"\">Subs</a></td>");

			//add new column with a link to CSFD.cz search
			$(value).after("<td><a class =\"plus-csfd\" title =\"Vyhledat film na ČSFD\" target =\"_blank\" href =\"https://www.csfd.cz/hledat/?q="+title[0]+"\">ČSFD</a></td>");

			//edit rating column with a link to IMDB
			$(imdbRatings[index]).html("<a href =\"http://imdb.com/title/tt" + imdb + "\" target=\"_blank\" title=\"Otevřít film na IMDB\">" + rating +  "</a>");
			
			//insert poster on hover
			$(titles[index]).find( ".link_under" ).attr('rel',"https://www.titulky.com/img/poster/req_"+imdb+".jpg");

		});

		// hide Detail column
		$(".soupis tr td:nth-child(1)").hide();
		$(".soupis .detailh a").eq(0).attr("href","/?orderby=3&Stat=6").attr("title","Seřadit filmy podle hodnocení na IMDB");
		
	// pozadavky - dopln hodnoceni k filmum
		
/* 		var imdbs = [];
		// imdbs.push($(".soupis a[target='imdb']").first().text());

		$(".soupis a[target='imdb']").each(function(index, value)
		{
			imdbs.push($(value).text());
		});
		// console.log(imdbs);
 */
/* 		var pusher = new Pusher("e3a617372cf7087256f0");
		var stamp = pusher.sessionID;
		var today = Date.now();
		var genres = [];
		var rawGenres = "";

		$(document).ajaxStart(function()
		{
			return;

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
*/
		
	}
	
	//**************** DETAIL TITULKU *******************************************************
	if ($("h1").length && $("a[target='imdb']").length) {
	
		var titleArray = $("h1").text().split(" ("),
			title = titleArray[0],
			spaceTitle = title.replace(new RegExp(" ", 'g'), "+").replace("&",""),
			year = titleArray[1].substring(0,4),
			imdb = $("a[target='imdb']").attr("href").split("title/")[1].slice(0,-1);

	// pouze prihlaseni
		if ($("a[href$='Logoff=true']").length)
		{
			// odkaz pro prime vyhledani dalsich verzi, pouze prihlase premium, zadny fulltext
				$("a[href^='/?Fulltext']").after("<a title =\"Další verze titulků konkrétního filmu (pouze pro premium uživatele)\" class =\"plus-version\" href=\"https://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ANazev="+title+"&ARelease=&ARok="+year+"\">Další přesné verze</a>");
		}

	// searchMovieCsfd(spaceTitle,year,"displayCsfdRating");
		searchMovieImdb(imdb,title);

	// add csfd search link
		$("a[target='imdb']").after("<a href=\" https://www.csfd.cz/hledat/?q="+title+" \" target=\"csfd\"><img src=\""+getBrowserLink("images/csfd.png")+"\" alt=\"CSFD.cz\"></a>");
	}

	//**************** SEKCE VLASTNÍ POŽADAVKY **********************************************
	if (location.href.indexOf("PozadavekTitulku=") !== -1) {
	

		//----- Vytahneme seznam filmu v pozadavcich ---------
		var pozadavkaIMDBnumbers = [];
		
		$('.soupis tr td:nth-child(2)').each(function(index, value) {
			var imdbNum = $($(value).find('a')).text().trim();
				if (imdbNum !== ''){
					pozadavkaIMDBnumbers.push(imdbNum);
				}
		});

 		if (pozadavkaIMDBnumbers.length) {
			
			//----- Z Rozpracovaných vyparsujeme IMDB cisla + datumy ---------

			$.get("https://www.titulky.com/index.php?Stat=5",function(data) {

				var 	links = [],
					imdbNumbers = [],
					startDates = [],
					endDates = [];

				$(data).find(".soupis").eq(1).find(".row1,.row2").each(function(index, value) {
					var hrefNode = $($($(value).find("a"))[1]),
						imdbN = hrefNode.attr('href').split("tt").pop().replace("/","").trim(),
						startDate = $($($(value).find("td"))[2]).text(),
						endDate = $($($(value).find("td"))[3]).text().trim();
						
						if (endDate == ''){	endDate = '???' }
						
						links.push(hrefNode);
						imdbNumbers.push(imdbN);
						startDates.push(startDate);
						endDates.push(endDate);
				});

				$(pozadavkaIMDBnumbers).each(function (index,value) {

					var foudIndex = jQuery.inArray(value, imdbNumbers);
						itemStartDate = startDates[foudIndex];
						itemEndDate = endDates[foudIndex];

					if (foudIndex !== -1){
						$('.soupis tr td:nth-child(3)').slice(1).eq(index).append("<i class =\"plus-right\">"+itemStartDate+" - "+itemEndDate+"</i>");
					}

				}); 

			});
	
		}			
	
	}		

	//**************** ROZPRACOVANÉ DETAIL **************************************************
	if (location.href.indexOf("Stat=5&item=") !== -1) {
		var link = $($(".soupis .row2").children()[6]).children().attr("href");
		if (link !== "javascript://")
		{
			$(".soupis").eq(1).before("<a class =\"tlacitko plus-state-update\" href ="+link+">Aktualizovat stav překladu</a>");
		}
	}

	//**************** SEKCE NOVÝ PŘEKLAD ČI ÚPRAVA ROZPRACOVANÉHO **************************
	if (location.href.indexOf("Preklad=") !== -1) {
	
		$("input[name='SQLsAlternativniNazev']").css("width","200px");
		$("#nazev1").css("width","300px");

	//------ sekce novy preklad (pouze) --------
		if (location.href.indexOf("Preklad=0") !== -1)
		{	
			// vytahne v nastaveni ulozenou sablonu pro rozpracovane a vlozi ji do textarea.
			chrome.storage.local.get({
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

		//------- uprava rozpracovaneho prekladu --------
		else
		{
			// uloz ID prekladu
			var prekladID = location.href.split("Preklad=")[1];
			chrome.storage.local.set({
				preklad: prekladID,
				novychZminek: 0
			}, function(items){
			});

			// pri dokoncen/zruseni prekladu smaz ID
			$("form .tlacitko").first().click(function() {
				chrome.storage.local.set({
				preklad: 0,
				novychZminek: 0
				}, function(items){
					// console.log(items);
				});
			});
		}
	}
	
	//**************** SEKCE NAHRÁNÍ NOVÝCH TITULKŮ - PRVNÍ KROK ****************************
	if (location.href.indexOf("premium.titulky.com/index.php?Upload=1") !== -1) {
		// u velikosti titulku umaze mezery a pismena
		$("input[name^='VelikostFilmu']").change(function(){
			$(this).val($(this).val().replace(/[^\d]/g,""));
		});
	}

	
	//**************** PRÁCE S LOCAL STORAGE ************************************************
	var config = {
		vyhledavani: false,
		domu: true,
		premium: false,
		hlavicka: false,
		odkazy: true,
		udalost: true,
		rozpracovane: '',
		poznamky: '',
		release: true,
		navstevaProfilu: false,
		novychZprav: 0,
		novychOdpovedi: 0,
		novychZminek: 0,
		preklad: 0
	};

	chrome.storage.local.get(config, items => {

		//------------ UPDATE KOMENTÁŘŮ PRO ROZPRACOVANÝ PŘEKLAD // Jinak TLAČÍTKO NOVÝ PŘEKLAD --------------------------

		if (isActiveTranslator()) {
			var time = 1*15*60*1000; // 15 minut => cache
			// console.log(time,new Date (items.navstevaProfilu),new Date (items.navstevaProfilu+time),new Date());
			// if (items.navstevaProfilu === false || items.navstevaProfilu <= +Date.now())
			if (items.navstevaProfilu === false || items.navstevaProfilu+time < +Date.now())
			{
				updateCommentFeed(items.navstevaProfilu);
			}
			else addNewPostCounter(items.novychZprav,items.novychOdpovedi,items.novychZminek,items.preklad);
		}
		else {
			$("#tablelogon a[href$='Logoff=true']").closest("table").after("<a href =\"https://www.titulky.com/index.php?Preklad=0\" class =\"plus-new\">Nový</a>");
		}

		//------------ SEKCE PROFIL UŽIVATELE ----------------------------------------------------------------------------
		
		if (location.href.indexOf("UserDetail=") !== -1) {
			// jedna se o vlastni profil uzivatele
			var userId = getUserId();
			if (location.href.indexOf(userId) > 0 || location.href.indexOf("UserDetail=me"))
			{
				highlightNewPosts(items.novychZprav,items.novychOdpovedi);

				chrome.storage.local.set({
					navstevaProfilu: +Date.now(),
					novychZprav: 0,
					novychOdpovedi: 0
				}, function(){
					// console.log(items.navstevaProfilu);
				});
			}
		}
		
		if (items.preklad && items.novychZminek && location.href.indexOf("Stat=5&item="+items.preklad) !== -1) {
			chrome.storage.local.set({
					novychZminek: 0
				}, function(){
					// console.log(items.navstevaProfilu);
				});
		}

		//------------ ZOBRAZIT VERZE VE VYSLEDCÍCH HLEDÁNí (Fulltext i prime) --------------------------------------------
		if (location.href.indexOf("Fulltext") !== -1 || location.href.indexOf("Searching") !== -1) {
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

				chrome.storage.local.set({
					release: switcher,
				});
				$(".plus-release").toggle();
			});
		}

		//------------ PŘIDEJ HLAVIČKU WEBU // PODLE NASTAVENI V OPTIONS --------------------------------------------------
		if (items.hlavicka && !$("#head_a").length) {
			$("#head_b")
				.css("bottom","-3px")
				.before("<div id =\"head_a\"><div id =\"head_a1\"><a href =\"https://www.titulky.com\"><img id=\"headlogotitulky\" src=\"https://www.titulky.com/css/logo.png\" alt=\"České a slovenské titulky\"></a></div></div>");
			$("#head_a,#head_b").wrapAll("<div id ='head'>");
		}
		
		//------------ UDĚLÁ ODKAZY KLIKACÍ // PODLE NASTAVENI V OPTIONS --------------------------------------------------
		if (items.odkazy) {
			linkEl = [
				// rozpracovane detail popis
				$(".soupis .Radek_1 td").first().children(),
				// poznamka u titulku
				$(".orezdetail").first(),
				// info o uzivateli
				$("#tabuser tbody tr:nth-child(2) td:nth-child(2)"),
				// komentare k titulkum
				$(".detail tbody").eq(4),
				// prispevky v diskuzi
				$(".detail tbody").eq(1)
			];

			var autolinker = new Autolinker(
				{
					newWindow: false,
					truncate: 80
				}
			);

			for (var i = linkEl.length -1 ; i >= 0; i--) {
				// console.log($(linkEl[i]).length);
				if ($(linkEl[i]).length)
				{
					var linked = autolinker.link($(linkEl[i]).html());
					$(linkEl[i]).html(linked);
				}				
			}
		}	
		
		//------------ PŘÍMÉ VYHLEDÁVÁNÍ // PODLE NASTAVENI V OPTIONS -----------------------------------------------------	
		if (items.vyhledavani) {
			// vyhledavej vzdy naprimo, bez fulltextu
			$("form[name='searchformsub']").submit(function(event){
				window.location.href = "https://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ARelease=&ARok=&ANazev="+$("#searchTitulky").val();
				return false;
			});
		}

		//------------ TLAČÍTKO DOMŮ V MENU // PODLE NASTAVENI V OPTIONS --------------------------------------------------
		if (items.domu) {
			// tlacitko domu na kazde strance
			$("#menu li:first").before("<li><a href =\"https://www.titulky.com\">Domů</a></li>");
			// $("#menu li a:first").text("Domů");
		}
		
		//------------ TLAČÍTKO PREMIUM V MENU // PODLE NASTAVENI V OPTIONS -----------------------------------------------
		if (items.premium) {
			$("#menu a[href$='precti-si-zakladni-napovedu-2']").parent().before("<li><a href =\"https://premium.titulky.com\">Premium</a></li>");
		}

		//------------ SKRÝT NEUŽITEČNÉ ODKAZY V MENU // PODLE NASTAVENI V OPTIONS ----------------------------------------
		// $("#menu li").slice(-6,-3).hide()

		//------------ EDITACE TITULKU NA PREMIUM -------------------------------------------------------------------------
		if (location.href.indexOf("https://premium.titulky.com/index.php?Set=") !== -1) {
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

		//	$(".plus-note-csfd").click(function(){
		//		searchMovieCsfd($("input[name='SQLsNazev']").val(),$("input[name='SQLnRokUvedeni']").val(),"addCsfdLink");
		//	});
		}
		
		
		
	});


});


this.imagePreview = function(){	
	/* CONFIG */
		
		xOffset = 15;
		yOffset = 15;
		
		// these 2 variable determine popup's distance from the cursor
		// you might want to adjust to get the right result
		var Mx = $(window).width();
		var My = $(window).height();
		
	/* END CONFIG */
	var callback = function(event) {
		var $img = $("#link_under");
		
		// top-right corner coords' offset
		var trc_x = xOffset + $img.width();
		var trc_y = yOffset + $img.height();
				
		trc_x = Math.min(trc_x + event.clientX, Mx);
		trc_y = Math.min(trc_y + event.clientY, (My-15));

		$img
			.css("top", (trc_y - $img.height()) + "px")
			.css("left", (trc_x - $img.width()) + "px");
	};
	
	$("a.link_under").hover(function(e){
		var Mx = $(window).width();
		var My = $(window).height();
	
			this.t = this.title;
			this.title = "";	
			var c = (this.t != "") ? "<br/>" + this.t : "";
			$("body").append("<p id='link_under'><img src='"+ this.rel +"' alt='Image preview' />"+ c +"</p>");
			callback(e);
			$("#link_under").fadeIn("fast");
		},
		function(){
			this.title = this.t;	
			$("#link_under").remove();
		}
	)
	.mousemove(callback);
};

function searchMovieImdb (imdb,title) {
	$.get( "https://www.omdbapi.com/?i="+imdb+"&apikey=2c7f8b02" , function( data ) {
	  
		if (data.imdbRating) {
			displayImdbRating(data.imdbRating);
			//searchMovieCsfd(title,data.Year.slice(0,4),"displayCsfdRating");
			// searchMovieCsfd(spaceTitle(data.Title),data.Year.slice(0,4),"displayCsfdRating");
		}
	});
}

function displayImdbRating (rating) {

	var ratingBg = "plus-rating-blue";
	if (rating >= 7.0) ratingBg = "plus-rating-red";
	if (rating <= 3.0) ratingBg = "plus-rating-black";
	var url = $("a[target='imdb']").attr("href");
	$("#contcont").prepend("<div title =\"hodnocení na IMDB\" class =\"plus-rating plus-rating-imdb "+ratingBg+"\"><a href=\""+url+"\" target=\"_blank\">"+rating+"</a></div>");
}

//-------------------------

function getUserId () {
	var pattern = /(\d{1,10})/,
		matches = pattern.exec($("#tablelogon a[title='Info']").attr("onclick"));
	return matches[0];
}

function isActiveTranslator () {
	return $("#tablelogon img").eq(1).attr("src") && $("#tablelogon img").eq(1).attr("src") !== "./img/stars/0.gif";
}

function getBrowserLink (imgUrl) {
	if (navigator.userAgent.indexOf("Chrome") !== -1){
		//console.log("chrome");
		var imgLink = chrome.runtime.getURL(imgUrl)
	} else {
		//console.log("mozilla");
		var imgLink = browser.extension.getURL(imgUrl);
	}
	return imgLink;
}

//-------------------------

function updateCommentFeed (lastVisit) {
	
	// komentare a reakce
	$.get("https://www.titulky.com/index.php?UserDetail=me",function(data) {

		var counter = 0,
			counterAns = 0,
			counterMentions = 0;
		$("#side1wrap ul").eq(3).find("li").each(function(index, value) {
		// $(data).find("#side1wrap ul:nth-child(4) li").each(function(index, value) {
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


		$(data).find("#side1wrap ul").last().children().each(function(index, value) {
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

		chrome.storage.local.get({
		preklad: 0
		}, items => {
		
			if (items.preklad)	{

				// komentare v rozpracovanych
				$.get("https://www.titulky.com/?Stat=5&item="+items.preklad,function(data) {

					$(data).find(".soupis .detail").first().find("tr").each(function(index, value) {
						if(index%2)
						{
							var dateRaw = $(value).children().first().text().trim().split(" ");
							if (dateRaw.length == 3)
							{

								var dateSplit = dateRaw[0].split("."),
									day = dateSplit[0],
									month = dateSplit[1]-1,
									year = dateSplit[2],
									time = dateRaw[1].split(":"),
									hours = time[0],
									minutes = time[1];

								timestamp = new Date(year, month, day, hours, minutes).getTime();
								// console.log(lastVisit,timestamp, year, month, day, hours, minutes);
								// if (1415008800000 < timestamp)
								if (lastVisit < timestamp)
								{
									counterMentions++;
								}
								else return;
							}

						}
					});

					chrome.storage.local.set({
						navstevaProfilu: +Date.now(),
						novychZprav: counter,
						novychOdpovedi: counterAns,
						novychZminek: counterMentions,
					},function(){
						addNewPostCounter(counter,counterAns,counterMentions,items.preklad);
					});

				});
			}
			else
			{
				chrome.storage.local.set({
					navstevaProfilu: +Date.now(),
					novychZprav: counter,
					novychOdpovedi: counterAns,
					novychZminek: 0
				},function(){
					addNewPostCounter(counter,counterAns,counterMentions,items.preklad);
				});				
			}
		});
	});
}

function addNewPostCounter (counter,answers,mentions,preklad) {
		$("#tablelogon").after("<a href =\"https://www.titulky.com/index.php?UserDetail=me\" title =\"Nepřečtených komentářů pod vašimi titulky / Reakce na vaše komentáře\" class =\"plus-unread-count  plus-unread-count-msgs\">"+counter+" / "+answers+"</a>");

		// Odkaz na vytvoreni noveho prekladu nebo na upravu stavajiciho
		if (preklad)
		{
			var workLink = "<a href =\"https://www.titulky.com/?Stat=5&item=" + preklad + "\" class =\"plus-new\" title =\"Komentářů pod rozpracovanými titulky\">Rozpracované / <span class =\"plus-unread-count-mentions\">" + mentions + "</span></a>";
		}
		else
		{
			var workLink = "<a href =\"https://www.titulky.com/index.php?Preklad=0\" class =\"plus-new\">Nový</a>";
		}
		$("#tablelogon a[href$='Logoff=true']").closest("table").after(workLink);


		if (counter > 0 || answers > 0)
		{
			$(".plus-unread-count").addClass("plus-unread-count-red");
		}

		if (mentions > 0)
		{
			$(".plus-unread-count-mentions").addClass("plus-unread-count-red");
		}
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

function autocompleteByTitle (title) {
	$(".plus-poster,.plus-poster + img").remove();
	title = clearTitle(title);
	var query = "https://www.omdbapi.com/?t="+title;

	if ($("input[name='SQLnRokUvedeni']").val().length > 0)
	{
		query = "https://www.omdbapi.com/?t=" + title + "&y=" + $("input[name='SQLnRokUvedeni']").val() + "&apikey=2c7f8b02";
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

		// searchMovieCsfd(spaceTitle(result.Title),result.Year.slice(0,4),"findAlternativeTitle");

	});
}

function clearTitle (title) {
	return title.split(/s\d{2}e\d{2}.*/i)[0];
}

