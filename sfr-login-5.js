var request = require('request');
var fs = require("fs");
var $ = require('cheerio')

var protectedurl = "http://tv.sfr.fr/television-sur-ordinateur-par-internet/";
var loginurl = "https://www.sfr.fr/cas/login?domain=mire-sfr&service=http%3A%2F%2Ftv.sfr.fr%2Ftelevision-sur-ordinateur-par-internet%2F";
var ticketconversionurl = "http://tv.sfr.fr/television-sur-ordinateur-par-internet/?ticket=";
var username = "";
var password = "";
var options = {
    url: protectedurl,
    method:"GET",
    form: {}
}

//activate global cookies

var FileCookieStore = require('tough-cookie-filestore');
var j = request.jar(new FileCookieStore('cookies.json'));
request = request.defaults({jar: j})

request(options, function (error, response, body) {
	console.log("response code is " + response.statusCode)
	console.log("Cookies :" + response.headers['Set-Cookie'])
    console.log("Headers : " + JSON.stringify(response.headers))
    console.log("Error : " + error)
    console.log("New location where to fetch the final cookie : " + response.headers['Location'])
    console.log(body)

    var parsedhtml1 = $.load(body)
	var formactionurl1 = parsedhtml1('#loginForm').attr('action')
    var weareontheloginpage = (formactionurl1 != undefined)

    if(weareontheloginpage) {

    	console.log("We got the status code " + response.statusCode)


		var parsedhtml = $.load(body)
		var formactionurl = parsedhtml('#loginForm').attr('action')
		var ltinputvalue = parsedhtml('#loginForm input[name="lt"]').val()
		var executioninputvalue = parsedhtml('#loginForm input[name="execution"]').val()
		var eventIdinputvalue = parsedhtml('#loginForm input[name="_eventId"]').val()
		console.log("Form action url = " + formactionurl)
		console.log("lt input value = " + ltinputvalue)
		console.log("execution input value = " + executioninputvalue)
		console.log("eventIdinputvalue input value = " + eventIdinputvalue)

		if(formactionurl != undefined && ltinputvalue != undefined && executioninputvalue != undefined && eventIdinputvalue != undefined)
		{
			console.log("We have the variables from the login form. We can login")

			request({
			    url: "https://www.sfr.fr" + formactionurl,
			    method:"POST",
			    rejectUnauthorized: false,
			    form: 
			    { 
			    	username: "anonymous", 
			    	password: "anonymous",
			    	lt: ltinputvalue,
			    	execution: executioninputvalue, 
			    	_eventId: eventIdinputvalue,
			    	"remember-me": "on"
			    }
			}, function(error3, response3, body3){
    			console.log("After third request ... ")
    			console.log(body3)
    			console.log("After third request ... status code " + response3.statusCode)
    			console.log("After third request ... headers " + JSON.stringify(response3.headers))
    			console.log("After third request ... error " + error3)

    			console.log("Did we get the ticket to exchange in the location field ?")
    			var location3 = response3.headers['location']
    			var ticketavailable = (location3 != undefined && location3.indexOf("ticket="))

    			if(ticketavailable)
    			{
    				console.log("We got a ticket. let's exchange it")
    				request({
    					url: location3,
    					method: "GET"
    				}, function(error4, response4, body4){
    					console.log("After forth request ....")
    					console.log("After forth request .... status code " + response4.statusCode)
    					console.log("After forth request .... headers " + JSON.stringify(response4.headers))
    					console.log("After forth request .... error " + error4)
    					console.log("Writing cookies down")
    					var cookies = j.getCookies(location3);
    					console.log("Cookies: " + cookies)

    					var cookiesprotectedurl = j.getCookies(protectedurl);
    					console.log("Protected url Cookies: " + cookiesprotectedurl)
    				})
    			}
    		})
		}
    	
    }
    else
    {
    	console.log("We are not on the login page. Are we redirected to another location ?")

    	var location = response.headers['location']
    	console.log("Location :" + location)

    	if(location)
    	{
    		console.log("Location is defined to " + location)
    		console.log("Redoing another login using the new location")

    		
    		request({
					    url: location,
					    method:"GET",
					    //rejectUnauthorized: false,
					    //form: 
					    //{ 
					    	//username: "anonymous", 
					    	//password: "anonymous",
					    	//lt: "LT-2329529-LADdCcZncGHNriCHVqbbVP324q1N2r-authentification12",
					    	//execution: "e1s1", 
					    	//_eventId: "submit",
					    	//"remember-me": "on"
					    //}
					}, function(error2, response2, body){
		    			console.log("After second request ... ")
		    			console.log("After second request ... status code " + response2.statusCode)
		    			console.log("After second request ... headers " + JSON.stringify(response2.headers))
		    			console.log("After second request ... error " + error2)

		    			console.log("Extracting information from the result page ....")
		    			//console.log(body)
		    		});
    	}

    }


	if (!error && response.statusCode == 200) {
	    console.log("We got a 200 OK response code") 
	    //console.log(body) // Show the HTML for the Google homepage.
	    console.log("Cookies :" + response.headers['cookies'])
	    console.log("Headers : " + response.headers)
	}
})


function detectLoginForm(body){
	console.log("Checking whether we are on a login form ...");
	return true;
}

//request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))
