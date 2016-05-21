var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var sleep = require('sleep');
var firetms = require('./firetms');
var http = require('http');
var io = require('socket.io');
var config = 'config.html';
var display = 'display.html';

/* Server setup
*/

var server = http.createServer(function (req, res) {
    var url = req.url;
    console.log( url );

    if( url == '/' ) {
        if (req.method.toLowerCase() == 'get') {
            displayForm(res);
        } else if (req.method.toLowerCase() == 'post') {
            processForm(req, res);
        }
    } else if ( url && ( url.match( /.*\.png$/ ) || url.match( /.*\.jpg$/ ) ) ) {
        displayImage( url.substring( 1, url.length ), res ); // Remove leading "/"
    } else {
        res.writeHead(404, {
            'content-type': 'text/html',
        });
        res.write('404: Page not found');
        res.end();
    }
});


function displayForm(res) {
    fs.readFile(config, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function displayImage(img,res) {
    fs.readFile(img, function (err, data) {
        if( err ) {
            res.writeHead(404, {
                'content-type': 'text/html',
            });
            res.write('404: Page not found');
            res.end();
        } else {
            var type = img.substring( img.length-3, img.length );
            res.writeHead(200, {'Content-Type': 'image/' + type });
            res.write(data);
            res.end();
        }
    });
}


function displayTest(res, freq) {
    fs.readFile(display, 'utf8', function (err, data) {
        data = data.replace( '{{config}}', 'var config = { frequency: '+freq+' };' + startTest.toString() ); // Put function into html file
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length,
            'Access-Control-Allow-Origin': '*'
        });
        res.write(data);
        res.end();
    });
}

// Just demoing, this is where you put the stuff you want to run
function startTest() {
    var flag = true;
    var counter = 0;
    var interval = setInterval( function() {
        if( counter++ > config.frequency ) // Config defined in the replace statement
            clearInterval( interval );
        var image = flag ? 'images/lionandcub.jpg' : 'images/whitescreen.png';
        flag = flag ? false : true;
        document.getElementById( 'image' ).src = image;
    }, 1000 );
}

/* Data Processing 
*/

function processForm(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
	console.log(fields); // Print form data
	displayTest(res, fields.iterations);
	var results = processUser(res, fields);
	logUser(fields, results, fields.userName);

    });
}

function logUser(fields, results, name){

	var date = new Date()
	var outputFilename = name +'-'+ date;
	var myData = date + "\n" + name + "\n\n" + JSON.stringify(results, null, 4);  
	fs.writeFile(outputFilename, myData, function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("file saved " + outputFilename);
	    }
	}); 
}

function processUser(res, fields){

  results = {};
  switch(fields.type){
	case "picture":
	results = processPicture(res, fields);
	break;
	case "word":
	results = processWord(res, fields);
	break;
	case"mouse":
	results = processMouse(res, fields);
	default:
	console.log("error in type")
	results = {"ERROR": "type"}
  }
  return results;
}

function processWord(res, fields){
//TODO fix

  results = [];
  results.push(fields);
  for(var i = 0; i < fields.iterations; i++){

	fs.readFile('./'+fields.directory, function(err, data){
		if(err) throw err

		console.log(data)
		r = Math.floor(Math.random() * data.length + 1);
		word = 'test';
		results.push(word);

	}); 

	fire = determineFire(fields.fireIteration, i, fields.fireArray);
	results.push(fire);

	emitSocket(word, 'word');
  }
  return results;
  
}
function processMouse(res, fields){
//TODO create html for mouse
}

function processPicture(res, fields){

  results = [];
  results.push(fields);
  for(var i = 0; i < fields.iterations; i++){

	imageFile = getImage(fields.directory);
	results.push(imageFile);

	fire = determineFire(fields.fireIteration, i, fields.fireArray);
	results.push(fire);

	switch(fields.when){
	case "before":
	//	if(fire == true) firetms.open(fields.TMSport);
	//	setTimeout(console.log("sleep"), fields.timeToFire);
		sleep.sleep(fields.timeToFire/1000);
		emitSocket(imageFile, 'picture');
	break;
	case "after":
		emitSocket(imageFile, 'picture');
		sleep.sleep(fields.timeToFire/1000);
	//	setTimeout(console.log("sleep"), fields.timeToFire);
	//	if(fire == true) firetms.open(fields.TMSport);
	
	break;
	default:
		console.log("error in when")
		results = {"ERROR": "when"}
	}


//TODO fix eventEnd as necessary	
	switch(fields.eventEnd){
	case "keypress":
			
	break;
	case "time":
		sleep.sleep(fields.eventEndTime/1000);
	break;
	default:
		console.log("error in eventEnd")
		results = {"ERROR": "eventEnd"}
	}


//TODO fix refresh as necessary	
	switch(fields.refresh){
	case "yes":

	break;
	case "no":

	break;
	default:
		console.log("error in refresh")
		results = {"ERROR": "refresh"}
	
	}
  }

//TODO add ISI image where necessary

  return results;
}

function emitSocket(thing, type){
	
	if(type == 'word'){

	}
	else if(type == 'picture'){
/*
io.on('connection', function(socket){
  socket.on('update', function(thing){
    io.emit('update', thing);
  });
});
*/	}


}

function makeWordHTML(word, type){

	var out = "<html><head><style>.double-box{display: inline-block;width: 45%;height: 65%;margin: 5px;}.single-box{display: inline-block;width: 90%;height: 90%;margin: 5px;}</style></head><body>";

	if(type == 'single') out += "<div class=\"single-box\"> <p>"+word+"\"/></div></body></html>";
	else if(type == 'double') out +="<div style=\"text-align:center;\"><div class=\"double-box\"><p>"+word+"\" /></div><div class=\"double-box\"><p>"+word+"\" /></div></div></body></html>";
	else out += "<p> ERROR in single or double image HTML type </p></body></html>"
	return out;
}

function makeImageHTML(imageFile, type){

	var out = "<html><head><style>.double-box{display: inline-block;width: 45%;height: 65%;margin: 5px;}.single-box{display: inline-block;width: 90%;height: 90%;margin: 5px;}</style></head><body>";

	if(type == 'single') out += "<div class=\"single-box\"><img style=\"height:inherit\" src=\""+imageFile+"\"/></div></body></html>";
	else if(type == 'double') out +="<div style=\"text-align:center;\"><div class=\"double-box\"><img style=\"height:inherit;width:fill;\" src=\""+imageFile+"\" /></div><div class=\"double-box\"><img style=\"height:inherit;width:fill;\" src=\""+imageFile+"\" /></div></div></body></html>";
	else out += "<p> ERROR in single or double image HTML type </p></body></html>"
	return out;
}

function getImage(directory){

	files = fs.readdirSync(directory);
	r = Math.floor(Math.random() * files.length + 1);
	var imageFile = directory +"/" + files[r-1];
	console.log(imageFile);
	return imageFile
}

function determineFire(fireiter, i, fireArray){

   if (fireiter == 'random'){
        r = Math.random();
        if (r > 0.5) return true;
        else return false;
   }
   else if (fireiter = 'array'){
	for(var j = 1; j < fireArray.length; j++)
        	if(i == j) return true;
        return false;
   }
   else{
	console.log("Error in configuration \"fire iteration\", input must integer array or \"random\"");
   }
	return true;
}

server.listen(8080, function() {
console.log("server listening on localhost 8080");
});
