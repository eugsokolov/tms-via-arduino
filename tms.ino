/* based from
 *  http://www.akeric.com/blog/?p=1140
 */

/*
# To find pinout of BNC cable: 
#http://www.electronics2000.co.uk/pin-out/rfconns.php
*/

int timeDelay = 10; // time to power on TMS port
int ledPin = A0;   // select the pin for the LED
int val = 0;       // variable to store the data from the serial port

// the setup function runs once when you press reset or power the board
void setup() {
  pinMode(ledPin,OUTPUT);    // declare the LED's pin as output
  Serial.begin(230400);        // connect to the serial port
}

// the loop function runs over and over again forever
void loop () {
  val = Serial.read();          // read the serial port
  if(val > '0' && val <'9'){
    digitalWrite(ledPin, HIGH);   // turn the LED on (HIGH is the voltage level)
    delay(timeDelay);		  // delay
    digitalWrite(ledPin, LOW);    // turn the LED off by making the voltage LOW

  }
}

