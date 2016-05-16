import serial
import csv
import random
import time, datetime
import os, subprocess, syslog
import webbrowser
#import Image

def error(message):
	print message
	exit()

def fire_tms(port):
	port = "/dev/ttyACM0"
	print "FIRING TMS : ", port
	#arduino = serial.Serial(port, 230400)
	#arduino.write('1')
	#arduino.close()

def determine_fire(fireiter, i):
   if fireiter is 'random':
   	r = random.random()
   	if r > 0.5: return True
   	else: return False
   elif type(fireiter) is list:
	if i in fireiter: return True 
	else: return False
   else: error("Error in configuration \"fire iteration\", input must integer array or \"random\"")

def get_word(fileName):
    words = list()
    with open(fileName, 'r') as f:
     for line in f:
	words.append(line.rsplit())

    r = random.randrange(1,len(d)+1) 
    word = words[r]
    return word

def get_image(directory):
	path, dirs, files = os.walk(directory).next()
	r = random.randrange(1,len(files)+1) 
	image_file = path+files[r-1]
	return  image_file

def process_type(config, i):
   # Get random Image or Word to show from directory given
   directory = config['directory']
   typeOut = config['type']
   if os.path.isdir(directory) && (typeOut == 'picture'):
	out = get_image(directory)
   elif os.path.isfile(directory) && (typeOut == 'word'):
	out = get_word(directory)	
   else: error("Error in configuration \"directory\", input must be valid directory or file")

   screen = config['screen']
   fire = determine_fire(config['fire iteration'], i)
   if config['TMS before or after'] == "before":
	if fire is True: fire_tms(config['TMS port'])
	time.sleep(float(config['time to fire'])/1000)
	show_image(out, screen, typeOut)
   elif config['TMS before or after'] == "after":
	show_image(out, screen, typeOut)
	time.sleep(float(config['time to fire'])/1000)
	if fire is True: fire_tms(config['TMS port'])
   else: error("Error in configuration \"TMS before or after\", input must be \"before/after\"")

   if config['event end'] == "keypress":
	raw_input("waiting for keypress to end...")
   elif config['event end'] == "time":
	time.sleep(float(config['event end time'])/1000)
   else: error("Error in configuration \"event end\", input must be \"keypress/time\"")

#TODO refresh
   if config['refresh'] == "yes":
	print "close image"
   elif config['refresh'] == "no":
	print "not sure here" 
   else: error("Error in configuration \"refresh\", input must be \"yes/no\"")

   return fire, image_file

def show_image(image, screen, typeOut):
#TODO close browser tab
	if os.path.exists(image): image = image
	else: error("Error in configuration some image, input must be valid image file\"")

	f = open('test.html', 'w')
	if(screen == 'single'): message = '<html><head><h2></h2><style>.single-box { display: inline-block;width: 90%;height: 90%; margin: 5px;}</style></head><body><div class="single-box"><img style="height:inherit" src="'+image+'"  /></div></body></html> '
	elif(screen == 'double'): message ='<html><head><h2></h2><style>.double-box {    display: inline-block;width: 45%;height: 65%;margin: 5px;}</style></head><body><div style="text-align:center;"><div class="double-box"><img style="height:inherit;width:fill;" src="'+image+'"  /></div><div class="double-box"><img style="height:inherit;width:fill;" src="'+image+'"  /></div></div></body></html>'

	else: error("Error in configuration \"screen\", input must be single or double")
	f.write(message)
	path = os.getcwd()+"/test.html"
	webbrowser.open(path, new=0)
	return path

def process_user(config):
   firelist = []
   outlist = []
   for i in range(1, int(config['iterations per user'])+1):
	print i
   	if (config['type'] == 'picture') || (config['type'] == 'word'):
   	 fired, out = process_type(config, i)
   	elif (config['type'] == 'mouse'):
   	 error("mouse not yet implemented")
	else: error("Error in configuration \"type\", input must be \"picture/word/mouse\"")

	show_image(config['ISI image'], config['screen'], 'picture')
	time.sleep(float(config['ISI duration'])/1000)	

   	if fired is True: firelist.append(i)
	outlist.append(out)	

   #show_image('blank')

   config['fire iteration'] = firelist
   config['order list'] = outlist
   return config

def process_config(filename):
   config = {}
   with open(filename, 'r') as f:
   	reader = csv.reader(f)
   	for row in reader:
   		k, x, v = row
   		config[k] = v

   # Some error checking and cleaning of the config file
   config.pop('Name')
   if config['fire iteration'] != "random":
	s = config.pop('fire iteration')
	fireiter = [int(i) for i in s[1:-1].split(',')] 
	config['fire iteration'] = fireiter

   return config	

def input_user_data(name, sex):
   d = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') 
   filename = name + "-" + d + ".log"
   with open(filename, 'w') as f:
      f.write("Time," + d + '\n')
      f.write("Name," + name + '\n')
      f.write("Gender," + sex + '\n')
      f.close()
   return filename

def log_user_data(info, filename):
   with open(filename, 'a') as f:
	for k,v in sorted(info.items()):
	   f.write(str(k) + ',' + str(v) + '\n')
   f.close()

def main():
   config = process_config("config.csv")
   f = input_user_data(config['name'], config['sex'])
   info = process_user(config)
   log_user_data(info, f)

main()
