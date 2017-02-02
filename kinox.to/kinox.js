/**
 * Movian plugin to watch kinox.to streams 
 *
 * Copyright (C) 2015-2017 BuXXe
 *
 *     This file is part of kinox.to Movian plugin.
 *
 *  kinox.to Movian plugin is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  kinox.to Movian plugin is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with kinox.to Movian plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Download from : https://github.com/BuXXe/movian-kinox-plugin
 *
 */
   var html = require('showtime/html');
   var resolvers = require('./libs/hoster-resolution-library/hrl');

(function(plugin) {

  var PLUGIN_PREFIX = "kinox.to:";
  var HosternameDict = { 
	7:"Wholecloud",
	8:"Cloudtime",
	15:"AuroraVid",
	24:"Videoweed",
	30:"Streamcloud",
	31:"Xvidstage",
	33:"Flashx",
	40:"Nowvideo",
	51:"Vidto",
	58:"TheVideo",
	62:"Letwatch",
	67:"Openload",
	68:"Vidzi"
  };

  // TODO: Use HTML Parser / better performance?
  // extract direct link from response
  function getStreamSiteLink(response)
  {
	  	var text = response.toString().replace(/\\/g,'');
	  	var firstcut = text.match(/<a href="(.*)" target=/)[1]; 
	  	return firstcut.split('" target=')[0].replace("/Out/?s=","");
  }
    
  // function which gives available hosts for given response (season and episode are X if link is a movie)
  function getHostsForMovies(page, response, URLname, season,episode)
  {
		var dom = html.parse(response.toString());
	  	var entries = dom.root.getElementById('HosterList').getElementByTagName("li");
	  	
	  	for (var k=0;k<entries.length;k++)
	  	{
    		var hostname = entries[k].getElementByClassName("Named")[0].textContent;
    		var id = entries[k].attributes.getNamedItem("id").value
    		
    		// get id and translate to hoster name
    		var resolverstatus = resolvers.check(HosternameDict[parseInt(id.split("_")[1])]);
	    	var statusmessage = resolverstatus ? " <font color=\"009933\">[Working]</font>":" <font color=\"CC0000\">[Not Working]</font>";
    		
    		var maxMirror =  entries[k].getElementByClassName("Data")[0].textContent.split(":")[1].split("/")[1].replace("Vom","");
    		
    		if(resolverstatus)
	    	{
    			page.appendItem(PLUGIN_PREFIX + ":PlayEpisode:"+ URLname + ":" + id + ":"+maxMirror+":"+season+":"+episode  , 'directory', {
	    			  title: new showtime.RichText(hostname + statusmessage)
	    			});
	    	}
	    	else
	    	{
	    		page.appendPassiveItem('video', '', { title: new showtime.RichText(hostname + statusmessage)  });
	    	}
	  	}
  }
  
  // resolves the hoster link and gives the final link to the stream file
  plugin.addURI(PLUGIN_PREFIX + ":StreamPlayer:(.*):(.*)", function(page,episodeLink, hostername){
	  	page.type = 'directory';
		page.metadata.title = hostername;
		
		var vidlink = resolvers.resolve(decodeURIComponent(episodeLink), hostername);
		if(vidlink == null)
    		page.appendPassiveItem('video', '', { title: "File is not available"  });
		else
			page.appendItem(vidlink[1], 'video', { title: vidlink[0] });
  });
  
  function encode_utf8(s) {
	  return encodeURI(s);
	}

  function decode_utf8(s) {
	  return decodeURI(s);
	}
  
  // Here we have one specific Hoster selected and need to handle their links
  plugin.addURI(PLUGIN_PREFIX + ":PlayEpisode:(.*):(.*):(.*):(.*):(.*)", function(page, URLname, hosterid,  maxmirror, season, episode){
	  	page.type = 'directory';
	    var hosteridnumber = hosterid.split("_")[1];
	    var nofiles=true;
	    
	    for (var index = 1; index <= maxmirror; index++) 
		{
	    	nofiles = false;
	    	var args;
	    	if(season == "X")
	    		args = {Hoster:hosteridnumber , Mirror: index};
	    	else
	    		args = {Hoster:hosteridnumber , Mirror: index, Season:season, Episode:episode};

	    	var getMirrorLink = showtime.httpGet("http://kinox.to/aGET/Mirror/"+URLname, args );
    	
	    	// page with the streamlink and hostername
	    	page.appendItem(PLUGIN_PREFIX + ":StreamPlayer:" + encodeURIComponent(getStreamSiteLink(getMirrorLink)) + ":" + HosternameDict[parseInt(hosteridnumber)], 'directory', {
	  			  title: HosternameDict[parseInt(hosteridnumber)] + index.toString()
	  			});
		}
	  
	    if(nofiles)
	    	page.appendPassiveItem("label", null, { title: "No Valid Links Available"});
  });
  
  // gives list of available hosts for given episode
  plugin.addURI(PLUGIN_PREFIX + ":EpisodesHandler:(.*):(.*):(.*):(.*)", function(page,seriesname, seriesID, season, episode){
	  page.type = 'directory';
	  var args = {Addr:seriesname , SeriesID:seriesID ,Season:season, Episode:episode};
	  var getMirrorLink = showtime.httpGet("http://kinox.to/aGET/MirrorByEpisode/", args );
	  
	  getHostsForMovies(page,getMirrorLink,seriesname,season,episode);
  });
  
  // Lists the available episodes for a given season
  plugin.addURI(PLUGIN_PREFIX + ":SeasonHandler:(.*):(.*):(.*):(.*)", function(page,seriesname,seriesID, season, episodelist){
	  page.type = 'directory';
	  var episodesArray = episodelist.split(',');

	  for (var i=0;i<episodesArray.length;i++)
	  {
  			page.appendItem(PLUGIN_PREFIX + ":EpisodesHandler:" + seriesname + ":" + seriesID + ":" + season + ":" + episodesArray[i], 'directory', {
  			  title: "Episode " + episodesArray[i]
  			});
	  }
  });
  
  // Handles the particular content site (series movie or docu)
  plugin.addURI(PLUGIN_PREFIX + ':StreamSelection:(.*)', function(page, movie) {
	  	page.loading = false;
	  	page.type = 'directory';
	  	var moviepageresponse = showtime.httpGet('http://kinox.to'+movie);
	    var URLname = movie.split(".html")[0].split("/Stream/")[1]
	  	var dom = html.parse(moviepageresponse.toString());
	    var SeasonSelection =  dom.root.getElementById('SeasonSelection')

	    // differentiate between series and movies: if we have a series, the season selection exists
	    if(SeasonSelection)
	    {
	    	var seriesID =  SeasonSelection.attributes.getNamedItem("rel").value.split("SeriesID=")[1];
	    	var entries = SeasonSelection.getElementByTagName("option");
	    	for (var k = 0; k< entries.length; k++)
	    	{	
	    		var seasonNumber = entries[k].attributes.getNamedItem("value").value;
	    		var episodesList = entries[k].attributes.getNamedItem("rel").value;
	    		
	    		page.appendItem(PLUGIN_PREFIX + ":SeasonHandler:"+ URLname +":"+ seriesID + ":" + seasonNumber + ":" + episodesList, 'directory', {
	    			  title: "Season " + seasonNumber
	    			});
	    	}
	    }
	    else 
	    {
	    	getHostsForMovies(page, moviepageresponse, URLname,"X","X");
	    }
		page.loading = false;
	});
  
  // Shows a list of Recent Cinema Movies 
  plugin.addURI(PLUGIN_PREFIX + ':CineFilms', function(page) {
	  	page.type = "directory";
	    page.metadata.title = "kinox.to Recent Cinema Movies";
	    
	  	var CineFilmsResponse = showtime.httpGet("http://kinox.to/Cine-Films.html");
	  	var dom = html.parse(CineFilmsResponse.toString());
	  	var children =  dom.root.getElementById('Vadda').children;
	  	
	    for(var k=0; k< children.length; k++)
	    {
	    	var streamLink  = children[k].getElementByClassName("Headlne")[0].getElementByTagName("a")[0].attributes.getNamedItem("href").value;
	    	var title = children[k].getElementByClassName("Headlne")[0].getElementByTagName("a")[0].attributes.getNamedItem("title").value;
	    	var description = children[k].getElementByClassName("Descriptor")[0].textContent;
	    	var thumbnail = children[k].getElementByClassName("Thumb")[0].getElementByTagName("img")[0].attributes.getNamedItem("src").value;
	    	
	    	page.appendItem(PLUGIN_PREFIX + ':StreamSelection:'+ streamLink, 'video', {
				  title: title,
				  icon: "http://kinox.to"+ thumbnail,
				  description: description
				});
	    }
  });

  // handles the search 
  plugin.addURI(PLUGIN_PREFIX+":Search",function(page) {
	  page.type="directory";
	  page.metadata.title = "kinox.to Search";

	  var res = showtime.textDialog("What do you want to search for?", true,true);
	  
	  // check for user abort
	  if(res.rejected)
		  page.redirect(PLUGIN_PREFIX+"start");
	  else
	  {
		  var SearchQueryResponse = showtime.httpGet("http://kinox.to/Search.html",{ q: res.input});
		  var dom = html.parse(SearchQueryResponse.toString());
		  var children = dom.root.getElementById("RsltTableStatic").getElementByTagName("tbody")[0].children;
		  
		  for(var k=0; k< children.length; k++)
		  {
			  var streamLink = children[k].getElementByClassName("Title")[0].getElementByTagName("a")[0].attributes.getNamedItem("href").value;

			  // some entries in the search need to be filtered out:
			  if(streamLink.indexOf("Search.html") > -1 || streamLink =="")
				  continue;
			  
			  var type = children[k].getElementByClassName("Icon")[1].getElementByTagName("img")[0].attributes.getNamedItem("title").value;
			  var title = children[k].getElementByClassName("Title")[0].getElementByTagName("a")[0].textContent;
			  var language = children[k].getElementByClassName("Icon")[0].getElementByTagName("img")[0].attributes.getNamedItem("src").value;
			  
			  page.appendItem(PLUGIN_PREFIX + ':StreamSelection:'+ streamLink, 'video', {
				  title: type + " - " + title,
				  icon: "http://kinox.to"+language
				});
		  }
	  }
  });
  
  // Register a service (will appear on home page)
  var service = plugin.createService("kinox.to", PLUGIN_PREFIX+"start", "video", true, plugin.path + "kinox.png");
  
  // Register Start Page
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    page.type = "directory";
    page.metadata.title = "kinox.to Main Menu";
    page.appendItem(PLUGIN_PREFIX + ':CineFilms', 'directory',{ title: "Recent Cinema Movies",});
    page.appendItem(PLUGIN_PREFIX + ':Search','item',{ title: "Search...",});
	page.loading = false;
  });

})(this);
