const easy = [
        'images/lionandcub.jpg',
        'images/taylor1.jpg',
        'images/taylor2.jpg',
        'images/taylor3.jpg'
        ];
const medium = [
        'images/lionandcub.jpg',
        'images/taylor1.jpg',
        'images/taylor2.jpg',
        'images/taylor3.jpg'
        ];
const hard = [
        'images/lionandcub.jpg',
        'images/taylor1.jpg',
        'images/taylor2.jpg',
        'images/taylor3.jpg'
        ];
const images = [easy, medium, hard];
const isiImage = 'images/whitescreen.png'
const default_word = 'yes or no';
const num_pics = 3; // 3 taylors
const time_between_frames = 1000; // milisec between each image

//////////////////////////////////////////////////////////////
// Do not change beyond this line

const serial = chrome.serial;
DEVICE_PATH = '';

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};

var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    console.log("Connection failed.");
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  chrome.serial.onReceive.addListener(this.boundOnReceive);
  chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.onConnect.dispatch();
};

SerialConnection.prototype.connect = function(path) {
  serial.connect(path, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.send(this.connectionId, str2ab(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.disconnect(this.connectionId, function() {});
};

var connection = new SerialConnection();

// Set variables to default
var ii = 0; // iteration number
var j = 0; // image number
var k = 0; // responses 
var user = 'default';
var num_iter = 0;
var wordList = {};
var text_output = "";
var responses = new Array(num_iter * num_pics);

$('form').submit(function(e) {
	e.preventDefault(); //dont try and submit the form

	user = $('#name').val();
	num_iter = $('#iterations').val();
    	responses = new Array(num_iter * num_pics);

	DEVICE_PATH = $('#port').val();
	connection.connect(DEVICE_PATH);

	$(window).data(
		{'response_recorded': false,
		'waiting': false
	});

    $('form').fadeOut('fast');
	show_first_image();

});

function get_random_word() {
    var keys = Object.keys(wordList);
    return keys[Math.floor(keys.length * Math.random())];
}

function get_image(type, difficulty) {
    switch(difficulty){
        case 'easy':
            return images[0][type];
            break;
        case 'med':
            return images[1][type];
            break;
        case 'hard':
            return images[2][type];
            break;
        default:
            alert(type + difficulty);
    }
}

function fire_tms() {
	connection.send('1');
}

function show_first_image() {
    var word = get_random_word();
	$('.word').html(word); 
	$('.picture').attr('src', get_image(j, wordList[word]));
	$(window).data({
		'current_word': word,
		'current_difficulty': wordList[word]
	});
	j++;
	setTimeout(function() { //let user absorb word			
        fire_tms();
		show_next_image(wordList[word]);
		return;
	}, time_between_frames);
}

function show_next_image(difficulty) {
    //done showing taylor, show the blank screen
	if(j == images.length+1) { 
		show_last_image();
		return;
	}

	$('.word').html(default_word);
	$('.picture').attr('src',get_image(j, difficulty));
	d = new Date();
	n = d.getTime();
	$(window).data({
		'waiting': true,
		'response_recorded': false,
		'current_response_frame': j,
		'waiting_response_start_time': n
	}); //get input

	setTimeout(function() { //get response (if any)
		if($(window).data('response_recorded')) {
		 	responses[k] = $(window).data('response');
		 	add_to_log_data();
		}
		else responses[k] = null;
		k++;
		j++;
		show_next_image(difficulty)
	},time_between_frames);
}

function show_last_image() {
	$('.picture').attr('src', isiImage);
	$('.word').html('');
	setTimeout(function() {
		j = 0;
		ii++;
		if(ii == num_iter) { 
			log_data();
				return; //end the program
			}
		show_first_image();
		return;
	}, time_between_frames);
}

function add_to_log_data() {
	word = $(window).data('current_word');
	difficulty = $(window).data('current_difficulty');
	response = $(window).data('response');
	responseFrame = $(window).data('current_response_frame');
	responseTime = $(window).data('waiting_response_end_time') - $(window).data('waiting_response_start_time');

	text_output += word + "," + difficulty + "," + response + ","
		+ responseFrame + "," + responseTime + "\n";
}

function log_data() {
	$('.picture').attr('src', 'images/end.jpg');
	$('.word').html('FIN');

	d = new Date();
	time = d.toDateString();

	file_name = "log/" + user + time + ".log"; //saves to Downloads folder

    var blob = new Blob([text_output], {type: "text/plain;charset=utf-8"});
  	saveAs(blob, file_name);
}

$(window).on('keypress',function(e) { //catches response
	key = e.key;
	//only get response if we are waiting for one and 
    	//have not already recorded one
	if($(window).data('waiting') && !$(window).data('response_recorded')) {
		d = new Date();
		n = d.getTime();
		switch(e.key) {
			case 'y':
				$(window).data({
					'response_recorded': true,
					'response': 'y',
					'waiting_response_end_time': n
				});
				break;
			case 'n':
				$(window).data({
					'response_recorded': true,
					'response': 'n',
					'waiting_response_end_time': n
				});
				break;
			default:
				break;
		}
	}
});

function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    for (i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
            var tarr = [];
            for (j=0; j<data.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
    }
  	return lines;
}

$('#file_input').on('change',function(ev) {
    var f = ev.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.readAsText(f);
      r.onloadend = function(e) { 
	    var contents = e.target.result;
      	lines = processData(contents);

      	for(i = 1; i < lines.length; i++) {
      		tmp = lines[i][0];
      		tmp = tmp.split(',');
      		wordList[tmp[0]] = tmp[1]; //populate word list
      	}
      }
    } else { 
      alert("Failed to load file");
    }
});
