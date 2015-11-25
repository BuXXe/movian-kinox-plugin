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
  var availableResolvers = ['30','34','45','56','65'];
  
  //TODO: do a check if any of the files in online and do the post request only if there are online ones
  //TODO: exchange httpget to httpreq
  // INFO: Helpful Post Data reader: http://www.posttestserver.com/
  
  // HOSTER RESOLVER
  function resolveVodLockercom(StreamSiteVideoLink)
  {	  
	  var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	showtime.trace(getEmissionsResponse.toString());
    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var hiddenfields =  dom.root.getElementByTagName('Form')[1].getElementByTagName("input");
		  	
	    	res = [];
	    	
	    	for(var k = 0; k < hiddenfields.length; k++)
	    	{
	    		res[res.length] = hiddenfields[k].attributes.getNamedItem("value").value;
	    		showtime.trace(res[k]);
	    	}
	    	
	    	showtime.trace(res.length);
	    	
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:"", id: res[3],fname:res[4],referer: "",hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 2 SECONDS
	    for (var i = 0; i < 3; i++) {
	    	showtime.notify("Waiting " + (3-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	showtime.trace(StreamSiteVideoLink[index]);
		    	showtime.trace(postdatas[index].toString());
	    		
	    		var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		    	showtime.trace(postresponse.toString());
		        showtime.trace(res2);
		    	showtime.trace(res2.length);
		    	
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  function resolvePromptfilecom(StreamSiteVideoLink)
  {
		postdatas = [];
	  // Posts chash
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var form =  dom.root.getElementByTagName('form')[0];
		  	var chash = form.getElementByTagName('input')[0].attributes.getNamedItem("value").value;
	    	postdatas[postdatas.length] = chash;
	    }
	    
	    var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	// Example: http://primeshare.tv/download/B78A79EA24
	    		postdata:  {chash: postdatas[index]},
		    	method: "POST"
		    });

	    	if(postresponse != null)
	    	{	
		    	var videopattern = new RegExp("url: '(.*?)',");
			  	var vidLink = videopattern.exec(postresponse.toString())[1];
			  	    	
		    	showtime.trace(vidLink);
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],vidLink];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  // NOT WORKING RIGHT NOW
  function resolveMoosharebiz(StreamSiteVideoLink)
  {
	  // Wait 5 Seconds
	  // seems to be closely related to streamcloud.eu
	  // same post data right?
	  
	  var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	showtime.trace(getEmissionsResponse.toString());
	    	
	    	//var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" value="(.*?)" id="btn_download">');
	    	//var res = pattern.exec(getEmissionsResponse.toString());
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var hiddenfields =  dom.root.getElementByTagName('Form')[1].getElementByTagName("input");
		  	
	    	res = [];
	    	
	    	for(var k = 0; k < hiddenfields.length; k++)
	    	{
	    		res[res.length] = hiddenfields[k].attributes.getNamedItem("value").value;
	    		showtime.trace(res[k]);
	    	}
	    	
	    	showtime.trace(res.length);
	    	
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 5 SECONDS
	    for (var i = 0; i < 5; i++) {
	    	showtime.notify("Waiting " + (5-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    
	   
	    
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	var postresponse2 = showtime.httpReq("http://posttestserver.com/post.php", 
				    	{
					    	postdata:  postresponse.toString(),
					    	method: "POST"
					    });
		    	
		    	
		    	
		    	showtime.trace(postresponse2.toString());
		    	
		    	showtime.trace(postresponse.toString());
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		        showtime.trace(res2);
		    	showtime.trace(res2.length);
		    	
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  // NOT WORKING
  // two problems seem to occur: some weird problem to get the response correctly and you cannnot use the direct link to the video file
  function resolveNowvideosx(StreamSiteVideoLink)
  {
	  var getdatas = [];
	  
	  for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	// TODO: Check for 404
	    	// http://www.nowvideo.sx/api/player.api.php?user=undefined&cid3=kinox%2Etv&pass=undefined&cid=1&cid2=undefined&key=131%2E234%2E64%2E55%2D0a60aa35dd7363b48587e1fd591d4201&file=c06733f4f10e9&numOfErrors=0
	    	var fkzdpattern = new RegExp('fkzd="(.*?)";');
	    	var fkzd = fkzdpattern.exec(getEmissionsResponse.toString());
	    	var filepattern = new RegExp('flashvars.file="(.*?)";');
	    	var fileentry = filepattern.exec(getEmissionsResponse.toString());
	    	var cid3pattern = new RegExp('flashvars.cid3="(.*?)";');
	    	var cid3entry = cid3pattern.exec(getEmissionsResponse.toString());
	    	var cidpattern = new RegExp('flashvars.cid="(.*?)";');
	    	var cidentry = cidpattern.exec(getEmissionsResponse.toString());
	    		
	    	getdatas[getdatas.length] = {user: "undefined" , cid3: cid3entry , pass:  "undefined", cid : cidentry, cid2: "undefined", key:fkzd,file:fileentry,numOfErrors:"0"};
		    	
	    }
	    
	  	var ListOfLinks = [];
	    
	    // GET DATA Request
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	if(getdatas[index] != null)
	    	{
	    		var getresponse = showtime.httpReq("http://www.nowvideo.sx/api/player.api.php", 
	    		
		    	{
		    		args:   getdatas[index]
		    		
			    });
	
		    	if(getresponse != null)
		    	{	
		    		showtime.trace(getresponse.toString());
//		    		var dom = html.parse(postreponse.toString());
//				  	var videoentry =  dom.root.getElementByClassName('stream-content')[0].getNamedItem("data-url").value;
//				  	
//				  	showtime.trace(videoentry);
//			    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],videoentry];
		    	}
	    	}
	    }
	    
	  return ListOfLinks;
	  
  }
  
  // NOT WORKING
  function resolveSharedsx(StreamSiteVideoLink)
  {
	  // 12 Seconds Waiting time
	  // seems to be the only <form> in the page
	  // take the form and get info
	  //	<form method="POST">
	  //		<input type="hidden" name="hash" value="poDUFv4ipFbYoKe-2uOdlg" />
	  //		<input type="hidden" name="expires" value="1429199570" />
	  //		<input type="hidden" name="timestamp" value="1429185170" />
	  //		<button id="access" class="btn btn-large btn-info btn-continue" type="submit" disabled>Continue to file</button>
	  //	</form>
	  
	  // TODO: Problem with the POST Request! The website checks for HTML5 support and deletes the video link if no support is given.
	  // Therefor: the Link cannot be extracted right now. 
	  // There is a project which uses shared.sx and does the same. it has something to do with the requests from the ps3 / movian....
	  // http://xstream-addon.square7.ch/showthread.php?tid=84
	  
	  var postdatas = [];
	  
	  for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var form =  dom.root.getElementByTagName('form')[0];
		  	var entries = form.getElementByTagName('input');
		  	
		  	
	  		// hash expires timestamp
		  	// File Not Found (404) Error 
		    if(entries != null)
		    {
		    	var ha = entries[0].attributes.getNamedItem("value").value;
		    	var ex = entries[1].attributes.getNamedItem("value").value;
		    	var ts = entries[2].attributes.getNamedItem("value").value;
		    	
		    	showtime.trace(ha);
		    	showtime.trace(ex);
		    	showtime.trace(ts);
		    	
		    	postdatas[postdatas.length] = {hash: ha , expires: ex, timestamp:  ts};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
		    
	    	
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 12 SECONDS
	    for (var i = 0; i < 13; i++) {
	    	showtime.notify("Waiting " + (13-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }	
	  
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	if(postdatas[index] != null)
	    	{
	    		var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    		
		    	{
		    		postdata:   {hash: postdatas[0] , expires: postdatas[1], timestamp:  postdatas[2]},
			    	method: "POST"
			    });
	
		    	if(postresponse != null)
		    	{	
		    		var dom = html.parse(postresponse.toString());
				  	var videoentry =  dom.root.getElementByClassName('stream-content')[0];
				  	
				  	videoentry = videoentry.attributes.getNamedItem("data-url").value;
				  	
				  	showtime.trace(videoentry);
			    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],videoentry];
		    	}
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  
  function resolveFilenukecom(StreamSiteVideoLink)
  {
	  	// it seems that the only thing that is posted is:
	  	// method_free: "Free"
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	postdata:  {method_free: "Free"},
		    	method: "POST"
		    });
	    	
	    	if(postresponse != null)
	    	{
		    	var videopattern = new RegExp("var lnk234 = '(.*?)';");
		    	var res2 = videopattern.exec(postresponse.toString());
		    	
		    	showtime.trace(res2[1]);
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    return ListOfLinks;
  }
  
  function resolvePrimesharetv(StreamSiteVideoLink)
  {
	  	// 8 Seconds Wait Time
	  	// Post: hash: {part of the URL} (Example hash : 40027F9C38)
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 8 SECONDS
	    for (var i = 0; i < 9; i++) {
	    	showtime.notify("Waiting " + (9-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }	
	  
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	// Example: http://primeshare.tv/download/B78A79EA24
	    		postdata:  {hash: StreamSiteVideoLink[index].split("/download/")[1]},
		    	method: "POST"
		    });

	    	if(postresponse != null)
	    	{	
		    	// TODO: The PS3 seems to have problems with this file format
		    	// The links do not give away the fileformat and therefor the PS3 has to probe it
		    	// this results in some waiting time before the video playback starts
		    	// Perhaps the filetype / videotype can be passed through to the playback system?
		    	showtime.trace(postresponse.toString());
		    	
		    	var lang = postresponse.toString().length
			  	var pages = lang % 200;
			  	
			  	//showtime.trace("hier bin ich");
			  	for(var h = 0; h<pages;h++)
			  	{
			  		//showtime.trace("hier bin ich");
			  		showtime.trace(postresponse.toString().substring(0+h*200, 200+h*200));
			  	}
			  	
	    		var videopattern = new RegExp("'http://j.primeshare.tv(.*?)'");
			  	var linewithvars = videopattern.exec(postresponse.toString());
			  	showtime.trace(linewithvars);
			  	showtime.trace(linewithvars.length);
			  	showtime.trace(linewithvars[0]);
			  	showtime.trace(linewithvars[1]);
			  	
			  	
			  	
			  	
			  	var vidLink = "http://e.primeshare.tv" + linewithvars[1] ;
		    	showtime.trace(vidLink);
		    	
		    	showtime.trace(vidLink);
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],vidLink];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  
  
  function resolveStreamcloudeu(StreamSiteVideoLink)
  {
	  	var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);

	    	var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" id="btn_download" class="button gray" value="(.*?)">');
		    
	    	/*showtime.httpReq("http://requestb.in/120dj9i1", 
			    	{
				    	postdata:  getEmissionsResponse.toString(),
				    	method: "POST"
				    });
	    	*/
	    	var res = pattern.exec(getEmissionsResponse.toString());
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 11 SECONDS
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
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  // HOSTER RESOLVER END
  
  
  
  
  
  //TODO: Use HTML Parser
  // extract direct link from response
  function getStreamSiteLink(response)
  {
	  	var text = response.toString().replace(/\\/g,'');
	  	showtime.trace(text.match(/<a href="(.*)" target=/)[1]);
	  	
	  	var firstcut = text.match(/<a href="(.*)" target=/)[1]; 
		showtime.trace(firstcut.split('" target=')[0]);	  	
	  	
	  	return firstcut.split('" target=')[0];
  }
  
  function checkResolver(hosterid)
  {
	  var hosternumber = hosterid.split("_")[1];
	  
	  if(availableResolvers.indexOf(hosternumber) > -1)
	  {
		  return " <font color=\"009933\">[Working]</font>";
	  }
	  else{
		  return " <font color=\"CC0000\">[Not Working]</font>";
	  }
	  
  }
  
  function HosterResolutionAndDisplay(page, hosternumber, StreamSiteVideoLink)
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
	    	// NOT WORKING RIGHT NOW
	    	// Request does not give correct link back and even if, the link cannot be used directly somehow
	    	// FinalLinks = resolveNowvideosx(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
    	}
	    // Primeshare.tv
	    else if (hosternumber == 45)
	    {
	    	FinalLinks = resolvePrimesharetv(StreamSiteVideoLink);
    	}
	    // MooShare.biz
	    else if (hosternumber == 49)
	    {
	    	// NOT WORKING RIGHT NOW
	    	// Request does not give correct site back
	    	// FinalLinks = resolveMoosharebiz(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
    	}
	    // Shared.sx
	    else if (hosternumber == 52)
	    {
	    	// NOT WORKING DUE TO HTML5 AND POST REQUEST PROBLEM
	    	// FinalLinks = resolveSharedsx(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
	    }
	    // Promptfile.com
	    else if( hosternumber == 56)
	    {
	    	FinalLinks = resolvePromptfilecom(StreamSiteVideoLink);
	    }
	    // VodLocker.com
	    else if(hosternumber == 65)
    	{
	    	FinalLinks = resolveVodLockercom(StreamSiteVideoLink);
    	}
	    // Default part to catch unimplemented hosters
	    else
	    {
	    	page.appendPassiveItem("label", null, { title: "Hoster not yet implemented"});
	    }
	    

	    if(FinalLinks.length == 0)
	    {
	    	
	    	page.appendPassiveItem("label", null, { title: "No Valid Links Available"});
	    }
	    else
	    {
		    // A Hoster Resolution provides the final links to the files + the original hoster links as a list of lists
		    // this list is then used to fill the page
		    for(var index = 0; index < FinalLinks.length; index++)
		    {
		    	page.appendItem(FinalLinks[index][1], 'video', {
				  title: FinalLinks[index][0]
				});
		    }
	    }
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
 
    		page.appendItem(PLUGIN_PREFIX + ":PlayEpisode:"+ URLname + ":" + id + ":"+maxMirror+":"+season+":"+episode  , 'directory', {
    			  title: new showtime.RichText(hostname + resolverstatus)
    			});
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
	    HosterResolutionAndDisplay(page,hosteridnumber, StreamSiteVideoLink)
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
