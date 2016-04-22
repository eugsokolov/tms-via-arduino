var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var firetms = require('./firetms');

var config = 'config.html'
var display = 'display.html'

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processForm(req, res);
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

function writeResponse(res, file){
        res.writeHead(200, {
            'content-type': 'text/html'
        });
	var reply = fs.createReadStream(file);
	reply.pipe(res);
	reply.on("end", function(){
		// Done
	});
}

/* Data Processing 
*/

function processForm(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
	// Print form data
	console.log(fields);
	var i = 0;
	for(i = 0; i < fields.users; i++){
		results = processUser(res, fields);
		logUser(fields, results);
	}
    });
}

function logUser(fields, results){

	var d = new Date();
	outputFilename = fields.user + d;
	myData = results;  
	//add fields
	fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outputFilename);
	    }
	}); 
}

function processUser(res, fields){

  var results = {};
  switch(fields.type){
	case "picture":
	results = processPicture(res, fields);
	break;
	case "word":
	results = processWord(res, fields);
	break;
	default:
	console.log("error in type")
	results = {"ERROR": "type"}
  }
  return results;
}

function processWord(res, fields){

}

function processPicture(res, fields){

  var i = 0;
  var results = [];
  for(i = 0; i < fields.iterations; i++){

	// Get random Image from directory
	imageFile = fields.directory;
	fire = determineFire(fields.fireIteration, i);
	display = "display.html"

	switch(fields.when){
	case "before":
	//	firetms.open(fields.TMSport);
		setTimeout(console.log("sleep"), fields.timeToFire);
		writeResponse(res, display);
	break;
	case "after":
		writeResponse(res, display);
		setTimeout(console.log("sleep"), fields.timeToFire);
	//	fireTMS(fields.TMSport);
	
	break;
	default:
		console.log("error in when")
		results = {"ERROR": "when"}
	}


	switch(fields.eventEnd){
	case "keypress":
			
	break;
	case "time":
		setTimeout(console.log("sleep"), fields.eventEndTime);
		writeResponse(res, display);
	break;
	default:
		console.log("error in eventEnd")
		results = {"ERROR": "eventEnd"}
	}

	
	switch(fields.refresh){
	case "yes":

	break;
	case "no":

	break;
	default:
		console.log("error in refresh")
		results = {"ERROR": "refresh"}
	
	}

	newData = 0;	
	//results.push(newData);
  }
  return results;
}


function determineFire(fireiter, i){

/*
   if (fireiter == 'random'){
        r = Math.random();
        if (r > 0.5) return true;
        else return false;
   }
   else if (type(fireiter) is list){
        if (i in fireiter: return true;
        else: return false;
   }
   else{
	console.log("Error in configuration \"fire iteration\", input must integer array or \"random\"");
   }
*/
	return true;
}

server.listen(8080);
console.log("server listening on localhost 8080");
