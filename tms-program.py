import serial
import csv
import random
import time, datetime
import os, subprocess, syslog
#import Image

def fire_tms(port):
	port = "/dev/ttyACM0"
	print "FIRING TMS : ", port
	#arduino = serial.Serial(port, 230400)
	#arduino.write('1')
	#arduino.close()

def error(message):
	print message
	exit()

def process_word(config, i):
###DO probably use generators
	return 0

def process_picture(config, i):
   # Get random Image to show from image directory
   if os.path.isdir(config['directory']):
	path, dirs, files = os.walk(config['directory']).next()
	r = random.randrange(1,len(files)+1) 
	image_file = files[r-1] 
   else: error("Error in configuration \"directory\", input must be valid directory or file")

### DO get image to show
#image = Image.open(image_file)
#image.show()
#time.sleep(float(duration)/1000)

   fire = determine_fire(config['fire iteration'], i)
   if config['TMS before or after'] == "before":
	if fire is True: fire_tms(config['TMS port'])
	time.sleep(float(config['time to fire'])/1000)
#	p = subprocess.Popen(["display", image_file])
   elif config['TMS before or after'] == "after":
#	p = subprocess.Popen(["display", image_file])
	time.sleep(float(config['time to fire'])/1000)
	if fire is True: fire_tms(config['TMS port'])
   else: error("Error in configuration \"TMS before or after\", input must be \"before/after\"")

   if config['event end'] == "keypress":
	raw_input("waiting for keypress to end...")
   elif config['event end'] == "time":
	time.sleep(float(config['event end time'])/1000)
   else: error("Error in configuration \"event end\", input must be \"keypress/time\"")

   if config['refresh'] == "yes":
	print "close image"
#	p.terminate()
#	p.kill()
   elif config['refresh'] == "no":
	print "not sure here" 
   else: error("Error in configuration \"refresh\", input must be \"yes/no\"")

   return fire, image_file

def determine_fire(fireiter, i):
   if fireiter is 'random':
   	r = random.random()
   	if r > 0.5: return True
   	else: return False
   elif type(fireiter) is list:
	if i in fireiter: return True 
	else: return False
   else: error("Error in configuration \"fire iteration\", input must integer array or \"random\"")

def process_user(config):
   firelist = []
   outlist = []
   for i in range(1, int(config['iterations per user'])+1):
	print i
   	if config['type'] == 'picture':
   	 fired, out = process_picture(config, i)
   	elif config['type'] == 'word':
   	 fired, out = process_word(config, i)
   	#elif config['type'] is 'mouse':
   	# fired, out = process_mouse(config, i)
	else: error("Error in configuration \"type\", input must be \"picture/word/mouse\"")

	if os.path.isexists(config['ISI image']): image_file = config['ISI image']
	else: error("Error in configuration \"ISI image\", input must be valid image file\"")
### DO display ISI image
#	pISI = subprocess.Popen(["display", image_file])
#	time.sleep(float(config['ISI duration'])/1000)
#	pISI.terminate()
#	pISI.kill()

   	if fired is True: firelist.append(i)
	outlist.append(out)	

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

def input_user_data():
   d = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') 
   name = raw_input("Please input test subject's name: ")
   sex = raw_input("Please input test subject's gender: ")

   filename = name + "-" + d + ".log"
   with open(filename, 'w') as f:
      f.write("Time," + d + '\n')
      f.write("Name," + name + '\n')
      f.write("Gender," + sex + '\n')
      f.close()
   return filename

def log_user_data(info, filename):
   info.pop('number of users')
   with open(filename, 'a') as f:
	for k,v in sorted(info.items()):
	   f.write(str(k) + ',' + str(v) + '\n')
   f.close()

def main():
   filename = "config.csv"
   config = process_config(filename)
   for i in range(1,int(config['number of users'])+1):
	f = input_user_data()
   	info = process_user(config)
	log_user_data(info, f)

main()
