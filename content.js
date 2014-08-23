function searchMovieCsfd (title,year) {
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
				makeMagicCsfd(data["rating"],data["csfd_url"]);
			});
		}
	});
}

function searchMovieImdb (imdb) {
	$.get("http://www.omdbapi.com/?i="+imdb,function(data) {
		data = JSON.parse(data);
		if (data.imdbRating) {
			makeMagicImdb(data.imdbRating);
		}
	});
}

function makeMagicCsfd (rating,url) {
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

$(document).ready(function() {

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
			$(value).after("<td><a title =\"vyhledat titulky na subtitleseeker.com\" target =\"_blank\" href =\"http://www.subtitleseeker.com/"+imdb+"/"+spaceTitle+"/Subtitles/\">Subs</a></td>");
			$(value).after("<td><a title =\"vyhledat film na ČSFD\" target =\"_blank\" href =\"http://www.csfd.cz/hledat/?q="+title[0]+"\">CSFD</a></td>");
		});
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
	//odkaz pro prime vyhledani dalsich verzi, pouze prihlase premium, zadny fulltext
			$("a[href^='index.php?Fulltext']").after("<a title =\"Další verze titulků konkrétního filmu (pouze pro premium uživatele)\" class =\"plus-version\" href=\"http://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ANazev="+title+"&ARelease=&ARok="+year+"\">Další přesné verze</a>");
		}

		searchMovieCsfd(spaceTitle,year);
		searchMovieImdb(imdb);
	}

	// vysledky vyhledavani
	if (location.href.indexOf("Fulltext") !== -1)
	{
		var search = $("#searchTitulky").val().toLowerCase();
		if (search.length)
		{
			$.get("http://www.omdbapi.com/?s="+search,function(data) {
				data = JSON.parse(data);
				if (typeof data.Search !== "undefined")
				{
					var year = data["Search"][0]["Year"];
				}
				$(".soupis td:nth-child(1)").slice(1).filter(function() {
					return $(this).text().trim().toLowerCase().replace(new RegExp(/ s\d{2}e\d{2}.*/), "") == search;
				}).closest("tr").addClass("plus-topped")/*.insertBefore($(".soupis tr:nth-child(2)"))*/;
				$(".plus-topped:first").attr("id","titulek").attr("name","titulek");
				window.location.hash="titulek";
			});
		}
	}

	// vyhledavej vzdy naprimo, bez fulltextu
	/*$("form[name='searchformsub']").submit(function(event){
		window.location.href = "http://www.titulky.com/index.php?Searching=AdvancedResult&AFulltext=&ARelease=&ARok=&ANazev="+$("#searchTitulky").val();
		return false;
	});*/
});