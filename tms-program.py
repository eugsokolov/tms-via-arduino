import serial
import csv
import time
import datetime, os, syslog
#import Image
import subprocess
import random

def fire_tms(port):
#Make inter OS operable
   port = "/dev/ttyACM0"
   print "FIRING TMS"
   arduino = serial.Serial(port, 230400)
   arduino.write('1')
   arduino.close()

def process_word(config, i):
#probably use generators
   return 0

def process_picture(config, i):
   fire = determine_fire(config['fire iteration'], i)
   path, dirs, files = os.walk(config['directory']).next()
   r = random.randrange(1,len(files)) 
   image_file = files[r] 
   #image = Image.open(image_file)
   #image.show()
   #time.sleep(float(duration)/1000)
 
#   p = subprocess.Popen(["display", image_file])
   if fire is True:
	time.sleep(float(config['time to fire'])/1000)
	fire_tms(config['TMS port'])
	remaining = float(int(config['total time']) - int(config['time to fire']))/1000
	time.sleep(remaining)
   else:
	time.sleep(float(config['total time'])/1000)
#   p.terminate()
#   p.kill()
   return fire, image_file

def determine_fire(fireiter, i):
   if fireiter is 'random':
   	r = random.random()
   	if r > 0.5: return True
   	else: return False
   else:
	s = [int(j) for j in fireiter[1:-1].split(',')] 
	if i in s: return True 
	else: return False

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
	else:
	 print "Error in configuration type, input must be \"picture/word/mouse\""
	 exit()
#   	show_picture(config['ISI'], config['ISI duration'])
   	if fired is True: firelist.append(i)
	outlist.append(out)	

   config['fire iteration'] = firelist
   config['out list'] = outlist
   return config

def process_config(filename):
   config = {}
   with open(filename, 'r') as f:
   	reader = csv.reader(f)
   	for row in reader:
   		k, x, v = row
   		config[k] = v
   config.pop('Name')
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
