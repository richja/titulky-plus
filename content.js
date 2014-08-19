$(document).ready(function() {
	$("a[href$='Logoff=true']").closest("table").after("<a href =\"http://www.titulky.com/index.php?Preklad=0\" class =\"plus-new\">Nový překlad</a>");
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
});