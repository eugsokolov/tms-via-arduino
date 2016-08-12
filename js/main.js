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
const num_iter = 4; // number of total iterations
const num_pics = 3; // 3 taylors
const time_between_frames = 1000; // milisec between each image
var ii = 0; // iteration number
var j = 0; // image number
var k = 0; // responses 
var responses = new Array(num_iter * num_pics);

var user = 'default';
var port = 'COM1';
var wordList = {};
var text_output = "";

/*
if(!window.chrome) {
    alert('MUST USE GOOGLE CHROME');
}
*/

$('form').submit(function(e) {
	e.preventDefault(); //dont try and submit the form

	user = $('#name').val();
	port = $('#port').val();

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

// TODO see fire-tms.js 
function fire_tms(port) {
// https://code.google.com/archive/p/seriality/
// https://developer.chrome.com/apps/serial
// http://stackoverflow.com/questions/24986049/chrome-extension-reading-from-serial-port
// https://github.com/GoogleChrome/chrome-app-samples/blob/e347c538e8612aa3b0f90bde0fc721c4f0569125/samples/serial/ledtoggle/main.js
//
    const serial = chrome.serial;
    serial.connect(port);
    console.log('Writing to port' + port);
    serial.send('1', '1', function() {} ); 
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
        fire_tms(port);
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
	if(ii == num_iter) { 
        log_data();
		return; //end the program
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
