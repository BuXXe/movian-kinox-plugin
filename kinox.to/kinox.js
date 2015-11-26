/**
 * Movian plugin to watch kinox.to streams 
 *
 * Copyright (C) 2015 BuXXe
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

(function(plugin) {

  var PLUGIN_PREFIX = "kinox.to:";
  var availableResolvers = ['7','8','15','24','30','33','34','40','52','56'];
  
  // integrated resolver info:
  // Streamcloud.eu
  // Filenuke.com
  // NowVideo.sx
  // Shared.sx
  // VideoWeed.es
  // Movshare.net
  // Cloudtime.to
  // Novamov.com
  // Flashx.tv
  // Promptfile.com
  
  
  
  // get a list streamlinks and return ruples of streamlink and finallink
  function resolvePromptfilecom(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
		  	var postdata;
	    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink[index],{noFollow:true,compression:true});
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	var chash;
	    	
	    	try
	    	{
	    		chash = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	}
	    	catch(e)
	    	{
	    		// seems like the file is not available
	    		continue;
	    	}
	
	    	postdata = {chash:chash};
		     
		    // POSTING DATA
		    var postresponse = showtime.httpReq(StreamSiteVideoLink[index], {noFollow:true,compression:true,postdata: postdata, method: "POST" });
		    var finallink = /url: '(.*)',/gi.exec(postresponse.toString());
		    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink[1]];
	  	}
	  	return ListOfLinks;
  }
  
  // get a list streamlinks and return ruples of streamlink and finallink
  function resolveFlashxtv(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
		  	var postdata=[];
		  	
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	var res = [];
	    	
	    	try
	    	{
		    	res[1] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
		    	res[2] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
		    	res[3] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[2].attributes.getNamedItem("value").value;
		    	res[4] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[3].attributes.getNamedItem("value").value;
		    	res[5] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[4].attributes.getNamedItem("value").value;
		    	res[6] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[5].attributes.getNamedItem("value").value;
		    	res[7] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[6].attributes.getNamedItem("value").value;
	    	}
	    	catch(e)
	    	{
	    		// seems like the file is not available
	    		postdata[postdata.length] = null;
	    		continue;
	    	}
	
	    	postdata[postdata.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
	  	}
		    
	    // POST DATA COLLECTED
	    // WAIT 7 SECONDS
	    for (var i = 0; i < 8; i++) {
	    	showtime.notify("Waiting " + (7-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
	    	if(postdata[index]!=null)
	    	{
		    	// POSTING DATA
			    var postresponse = showtime.httpReq(StreamSiteVideoLink[index], { postdata: postdata[index], method: "POST" });
			     
			    dom = html.parse(postresponse.toString());
			    
			    // put vid link together
			    // get cdn server number and luq4 hash
			    var cdn = dom.root.getElementById('vplayer').getElementByTagName("img")[0].attributes.getNamedItem("src").value;
			    cdn = /.*thumb\.(.*)\.fx.*/gi.exec(cdn)[1]    	    	   
			    
			    // TODO: perhaps allow other quality settings -> here we always take normal
			    var luqhash = /normal\|luq4(.*?)\|/gi.exec(postresponse.toString())[1];
			    var finallink = "http://play."+cdn+".fx.fastcontentdelivery.com/luq4"+luqhash+"/normal.mp4";
		    	
			    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink];
	    	}
	  	}
	  	return ListOfLinks;
  }

  // get a list streamlinks and return ruples of streamlink and finallink
  function resolveNovamovcom(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
		    var correctedlink = StreamSiteVideoLink[index].replace("/Out/?s=","");
		  	var postdata;
	    	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	var stepkey;
	    	
	    	try
	    	{
	    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	}
	    	catch(e)
	    	{
	    		// seems like the file is not available
	    		continue;
	    	}
	
	    	postdata = {stepkey:stepkey};
		     
		    // POSTING DATA
		    var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });
	    	
		    try
	    	{
		    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
		    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
		    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
	    	}catch(e)
	    	{
	    		continue;
	    	}
	    	
		    var postresponse = showtime.httpReq("http://www.novamov.com/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"bs.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		    ListOfLinks[ListOfLinks.length] = [correctedlink,finallink[1]];
	  	}
	  	return ListOfLinks;
  }
  
  // get a list streamlinks and return ruples of streamlink and finallink  
  function resolveCloudtimeto(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
		  	// This gets the mobile version of the video file (mp4)
		  	// due to bad performance this is not used
		  	/*var videohash= StreamSiteVideoLink.split("/");
		  	videohash = videohash[videohash.length-1];
	  		getEmissionsResponse = showtime.httpGet("http://www.cloudtime.to/mobile/video.php?id="+videohash);
	  	    var finallink = /<source src="(.*)" type="video\/mp4">/gi.exec(getEmissionsResponse.toString());
	    	return [StreamSiteVideoLink,finallink[1]];*/
	    	
	    	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
	    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink[index],{noFollow:true,compression:true});
	  		  	
	    	try
	    	{
		    	var cid = /flashvars.cid="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
		    	var key = /flashvars.filekey="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
		    	var file = /flashvars.file="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
	    	}catch(e)
	    	{
	    		continue;
	    	}
	    	
		    var postresponse = showtime.httpReq("http://www.cloudtime.to/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"bs.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		        	
		    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink[1]];
	  	}
	  	return ListOfLinks;
  }
  
  
  // get a list streamlinks and return ruples of streamlink and finallink
  function resolveMovsharenet(StreamSiteVideoLink)
  {
	  var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{ 
	  		var correctedlink=StreamSiteVideoLink[index].replace("/Out/?s=","");
		  	var postdata;
		
			// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
			var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
			
			var dom = html.parse(getEmissionsResponse.toString());
			var stepkey;
			
			try
			{
				stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
			}
			catch(e)
			{
				// seems like the file is not available
				continue;
			}
		
			postdata = {stepkey:stepkey};
			// POSTING DATA
			var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });
			    
			try
			{
			    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
			    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
			    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
			}catch(e)
			{
				continue;
			}
			
		    var postresponse = showtime.httpReq("http://www.movshare.net/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"bs.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		    ListOfLinks[ListOfLinks.length] = [correctedlink,finallink[1]];
	  	}
	  	return ListOfLinks;
  }
  
  
  // get a list streamlinks and return tuples of streamlink and finallink
  function resolveVideoweedes(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{
	  		var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink[index],{noFollow:true,compression:true});
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	var stepkey;
	    	
	    	try
	    	{
	    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	}
	    	catch(e)
	    	{
	    		// seems like the file is not available
	    		continue;
	    	}

	    	postdata = {stepkey:stepkey};
		     
		    // POSTING DATA
		    var postresponse = showtime.httpReq(StreamSiteVideoLink[index], {noFollow:true,compression:true,postdata: postdata, method: "POST" });
	  		  	
	    	try
	    	{
		    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
		    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
		    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
	    	}catch(e)
	    	{
	    		continue;
	    	}
	    	
		    postresponse = showtime.httpReq("http://www.videoweed.es/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"kinox.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		  	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink[1]];
	  	}  	
	  	return ListOfLinks;
  }
  
  // get a list streamlinks and return tuples of streamlink and finallink
  function resolveSharedsx(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	var postdata=[];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{	
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	
	    	try {
		    	var hash = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
			    var expires = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
			    var timestamp = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[2].attributes.getNamedItem("value").value;
	    	}catch(e)
		    {
		    	// one link down
	    		postdata[index]=null;
		    }
	    	postdata[index]= {hash:hash,expires:expires, timestamp:timestamp};
		}
	  	
		// POST DATA COLLECTED
		// WAIT 12 SECONDS
		for (var i = 0; i < 13; i++) {
		  	showtime.notify("Waiting " + (12-i).toString() +" Seconds",1);
		    showtime.sleep(1);
		}
		
		for (var index = 0; index < StreamSiteVideoLink.length; index++)
		{
			if(postdata[index]!=null)
			{
			    // POSTING DATA
			    var postresponse = showtime.httpReq(StreamSiteVideoLink[index], { postdata: postdata[index], method: "POST" });
			    dom = html.parse(postresponse.toString());
			    
			    var finallink = dom.root.getElementByClassName('stream-content')[0].attributes.getNamedItem("data-url").value
			    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink];
			}
		}
		return ListOfLinks;
  }
  
  // get a list streamlinks and return tuples of streamlink and finallink
  function resolveNowvideosx(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	  	{
	  		var postdata;

		  	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
	    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink[index],{noFollow:true,compression:true});
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
	    	var stepkey;
	    	
	    	try
	    	{
	    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	}
	    	catch(e)
	    	{
	    		// seems like the file is not available
	    		continue;
	    	}

	    	postdata = {stepkey:stepkey};
		     
		    // POSTING DATA
		    var postresponse = showtime.httpReq(StreamSiteVideoLink[index], {noFollow:true,compression:true,postdata: postdata, method: "POST" });
		    
		    try
	    	{
		    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
		    	var key = /var fkzd="(.*)";/gi.exec(postresponse.toString())[1];
		    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
	    	}catch(e)
	    	{
	    		// problem with link 
	    		continue;
	    	}
	    	
		    var postresponse = showtime.httpReq("http://www.nowvideo.sx/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"kinox.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink];    	
	  	}
	  	return ListOfLinks;
  }

  // get a list streamlinks and return tuples of streamlink and finallink
  function resolveFilenukecom(StreamSiteVideoLink)
  {
	  	var ListOfLinks = [];
	  	for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	try{
		  		var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink[index],{noFollow:true,compression:true});
		    	var dom = html.parse(getEmissionsResponse.toString());
		    	var link= dom.root.getElementById('go-next').attributes.getNamedItem("href").value;
		    	var postresponse = showtime.httpReq("http://filenuke.com"+link, {noFollow:true,compression:true});
			    var finallink = /var lnk234 = '(.*)';/gi.exec(postresponse.toString())[1];
			    ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],finallink];
	    	}catch(e)
	    	{
	    		// one link perhaps dead?
	    	}
	    }
	    return ListOfLinks;
  }
  
  // get a list streamlinks and return tuples of streamlink and finallink
  function resolveStreamcloudeu(StreamSiteVideoLink)
  {
	  	var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" id="btn_download" class="button gray" value="(.*?)">');
	    	var res = pattern.exec(getEmissionsResponse.toString());
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else
		    	postdatas[postdatas.length] = null;
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED WAIT 11 SECONDS
	    for (var i = 0; i < 12; i++) {
	    	showtime.notify("Waiting " + (11-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], { postdata:  postdatas[index], method: "POST" });
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    return ListOfLinks;
  }
  
  
  function HosterResolution(hosternumber, StreamSiteVideoLink)
  {
	    // List of tuples of streamlink and direct video link
  		var FinalLinks=[];
	    
	    // Streamcloud.eu
	    if(hosternumber == 30)
	    {
	    	FinalLinks = resolveStreamcloudeu(StreamSiteVideoLink);
	    }
	    // Filenuke.com
	    else if (hosternumber == 34)
    	{
	    	FinalLinks = resolveFilenukecom(StreamSiteVideoLink);
    	}
	    // NowVideo.sx
	    else if(hosternumber == 40)
    	{
	    	FinalLinks = resolveNowvideosx(StreamSiteVideoLink);
    	}
	    // Shared.sx
	    else if (hosternumber == 52)
	    {
	    	FinalLinks = resolveSharedsx(StreamSiteVideoLink);
	    }
	    // VideoWeed.es
	    else if (hosternumber == 24)
	    {
	    	FinalLinks = resolveVideoweedes(StreamSiteVideoLink);
	    }
	    // Movshare.net
	    else if (hosternumber == 7)
	    {
	    	FinalLinks = resolveMovsharenet(StreamSiteVideoLink);
	    }
	    // Cloudtime.to
	    else if (hosternumber == 8)
	    {
	    	FinalLinks = resolveCloudtimeto(StreamSiteVideoLink);
	    }
	    // Novamov.com
	    else if (hosternumber == 15)
	    {
	    	FinalLinks = resolveNovamovcom(StreamSiteVideoLink);
	    }
	    // Flashx.tv
	    else if (hosternumber == 33)
	    {
	    	FinalLinks = resolveFlashxtv(StreamSiteVideoLink);
	    }
	    // Promptfile.com
	    else if (hosternumber == 56)
	    {
	    	FinalLinks = resolvePromptfilecom(StreamSiteVideoLink);
	    }
	    
	    
	    return FinalLinks;
	    
  }
  
  function checkResolver(hosterid)
  {
	  var hosternumber = hosterid.split("_")[1];
	  
	  if(availableResolvers.indexOf(hosternumber) > -1)
	  	  return " <font color=\"009933\">[Working]</font>";
	  else
		  return " <font color=\"CC0000\">[Not Working]</font>";
  }
  
  //TODO: Use HTML Parser / better performance?
  // extract direct link from response
  function getStreamSiteLink(response)
  {
	  	var text = response.toString().replace(/\\/g,'');
	  	var firstcut = text.match(/<a href="(.*)" target=/)[1]; 
	  	return firstcut.split('" target=')[0];
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
    		var resolverstatus = checkResolver(id);
    		var maxMirror =  entries[k].getElementByClassName("Data")[0].textContent.split(":")[1].split("/")[1];
    		
    		if(resolverstatus.indexOf("Not Working")>1)
	    	{
	    		page.appendPassiveItem('video', '', { title: new showtime.RichText(hostname + resolverstatus)  });
	    	}
	    	else
	    	{
	    		page.appendItem(PLUGIN_PREFIX + ":PlayEpisode:"+ URLname + ":" + id + ":"+maxMirror+":"+season+":"+episode  , 'directory', {
	    			  title: new showtime.RichText(hostname + resolverstatus)
	    			});
	    	}
    		
	  	}
  }
  
  // Here we have one specific Hoster selected and need to handle their links
  plugin.addURI(PLUGIN_PREFIX + ":PlayEpisode:(.*):(.*):(.*):(.*):(.*)", function(page, URLname, hosterid,  maxmirror, season, episode){
	  	page.type = 'directory';

	    var hosteridnumber = hosterid.split("_")[1];
	    var StreamSiteVideoLink = [];

	    for (var index = 1; index <= maxmirror; index++) 
		{
	    	var args;
	    	if(season == "X")
	    		args = {Hoster:hosteridnumber , Mirror: index};
	    	else
	    		args = {Hoster:hosteridnumber , Mirror: index, Season:season, Episode:episode};

	    	var getMirrorLink = showtime.httpGet("http://kinox.to/aGET/Mirror/"+URLname, args );
	    	StreamSiteVideoLink[StreamSiteVideoLink.length] = getStreamSiteLink(getMirrorLink);
		}
	  
	    // Here we handle the Hoster specific resolution
	    var links = HosterResolution(hosteridnumber, StreamSiteVideoLink);
	    
	    // If we have no links  
	    if(links.length == 0)
	    	page.appendPassiveItem("label", null, { title: "No Valid Links Available"});
	    else
	    {
		    for(var index = 0; index < links.length; index++)
		    {
		    	page.appendItem(links[index][1], 'video', { title: links[index][0]});
		    }
	    }
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
