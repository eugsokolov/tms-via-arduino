images = ['images/lionandcub.jpg','images/taylor1.jpg','images/taylor2.jpg','images/taylor3.jpg','images/whitescreen.png'];
default_word = 'yes/no';
num_iter = 20;
num_pics = 3; //3 taylors
time_between_frames = 1000; //1 second between each picture
i = 0; //word number
j = 0; //image number
k = 0; //responses 
responses = new Array(num_iter * num_pics);

$('.button').click(function() {
	$(window).data('response_recorded',false);
	$(window).data('waiting',false); 
	show_first_image();
});

function show_first_image() {
	$('.picture').attr('src',images[j]);
	$('.word').html('word'+i); // you will change this to incorporate your own word
	j++;
	setTimeout(function() { //let user absorb word			
		show_next_image();
	}, time_between_frames);
}

function show_next_image() {
	$('.image').attr('src',images[j]);
	
	if(j == images.length - 1) { //done showing taylor, show the blank screen
		show_last_image();
		return;
	}
	if(i == num_iter) { 
		for(i = 0; i < responses.length;i ++) {
			if(responses[i] != null)
				html = "<li>" + responses[i] + "</li>";
			else html = "<li>No Response</li>";
			$('.responses').append(html); //print it for yourself
		}
		return; //end the program
	}
		
	$('.word').html(default_word);
	$('.picture').attr('src',images[j]);
	$(window).data('waiting',true); //get input
	$(window).data('response_recorded',false);
	setTimeout(function() { //get response (if any)
		if($(window).data('response_recorded')) responses[k] = $(window).data('response');
		else responses[k] = null;
		k++;
		j++;
		show_next_image()
	},time_between_frames);
}

function show_last_image() {
	$('.picture').attr('src',images[j]);
	$('.word').html('On to the Next');
	setTimeout(function() {
		j = 0;
		i++;
		show_first_image();
		return;
	}, time_between_frames);
}

$(window).on('keypress',function(e) { //catches response
	key = e.key;
	//only get response if we are waiting for one and have not already recorded one
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