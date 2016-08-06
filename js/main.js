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
var i = 0; // iteration number
var j = 0; // image number
var k = 0; // responses 
var responses = new Array(num_iter * num_pics);

$('.button').click(function() {
	$(window).data('response_recorded',false);
	$(window).data('waiting',false); 
    $('.button').fadeOut('fast');
	show_first_image();
});

// TODO input from user (see index.html)
const user = 'test';
const port = 'COM1';
const wordList = {};
wordList['one'] = 'easy';
wordList['two'] = 'hard';
wordList['three'] = 'med';
wordList['four'] = 'easy';
wordList['five'] = 'med';

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
            exit(1);
    }
}

// TODO see fire-tms.js 
// create serial connection and write a number to it
function fire_tms(port) {

}

function show_first_image() {
    var word = get_random_word();
	$('.word').html(word); 
	$('.picture').attr('src', get_image(j, wordList[word]));
	j++;
	setTimeout(function() { //let user absorb word			
        fire_tms(port);
		show_next_image(wordList[word]);
	}, time_between_frames);
}

function show_next_image(difficulty) {
    //done showing taylor, show the blank screen
	if(j == images.length+1) { 
		show_last_image();
		return;
	}
	if(i == num_iter) { 
        log_data();
		return; //end the program
	}

	$('.word').html(default_word);
	$('.picture').attr('src',get_image(j, difficulty));
	$(window).data('waiting',true); //get input
	$(window).data('response_recorded',false);
	setTimeout(function() { //get response (if any)
		if($(window).data('response_recorded')) responses[k] = $(window).data('response');
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
		i++;
		show_first_image();
		return;
	}, time_between_frames);
}

// TODO log to file: logFile = log/name+time.log
// iteration objects:
// {word, difficulty, response, responseFrame, responseTime}
// (responseFrame is the element j)
function log_data() {
	$('.picture').attr('src', 'images/end.jpg');
	$('.word').html('FIN');
    for(i = 0; i < responses.length;i ++) {
		if(responses[i] != null)
			html = "<li>" + responses[i] + "</li>";
		else html = "<li>No Response</li>";
		$('.responses').append(html); //print it for yourself
	}
}

// TODO record response time (the time to response to the yes or no)
$(window).on('keypress',function(e) { //catches response
	key = e.key;
	//only get response if we are waiting for one and 
    //have not already recorded one
	if($(window).data('waiting') && !$(window).data('response_recorded')) {
		switch(e.key) {
			case 'y':
				$(window).data('response_recorded',true);
				$(window).data('response','y');
				break;
			case 'n':
				$(window).data('response_recorded',true);
				$(window).data('response','n');
				break;
			default:
				break;
		}
	}
});
