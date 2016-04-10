import serial
import csv
import datetime, os, syslog
import Image
import random

def fire_tms():
   #Make inter OS operable
   arduino = serial.Serial(port, 9600)
   arduino.write('fire')

def show_picture(image_file, duration):
   image = Image.open('image_file')
   image.show()
   delay(duration)
   #CLOSE IMAGE

def show_word(wordlist, duration):
   #use generators for wordlist
   return 0

def process_fire(config, i):
   if config['fire iteration'] is 'random':
   	r = random.random()
   	if r > 0.5:
   	 fire = True
   	else:
   	 fire = False
   else:
	seq = config['fire iteration']
	print seq
	fire = False
   return fire

def process_user(config):

   firelist = []
   for i in config['iterations per user']:		
   	if config['picture or word'] is 'word':
   	 show_word(config['directory'], config['duration'])
   	if config['picture or word'] is 'picture':
   	 show_picture(config['directory'], config['duration'])
   	#if config['picture or word'] is 'mouse':
   	# show_mouse(config['mouse'])

   	fire = process_fire(config, i)
   	if fire is True:
   		fire_tms()	
		firelist.append(i)

   	show_picture(config['ISI'], config['ISI duration'])



   if config['fire iteration'] is 'random':
      config['fire iteration'] = firelist
   return config

def process_config(filename):
   config = {}
   with open(filename, 'r') as f:
   	reader = csv.reader(f)
   	for row in reader:
   		k, x, v = row
   		config[k] = v
   return config	

def input_user_data():
   d = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') 
   name = raw_input("Please input test subject's name: ")
   sex = raw_input("Please input test subject's gender: ")

   filename = name + "-" + d + ".log"
   with open(filename, 'w') as f:
      f.write("Time: " + d)
      f.write("Name: " + name)
      f.write("Gender: " + sex)
   return filename

def log_user_data(info, filename):
   with open(filename, 'w') as f:
      f.write(info)

def main():
   filename = "config.csv"
   config = process_config(filename)
   for i in config['number of users']:
	f = input_user_data()
   	info = process_user(config)
	log_user_data(info, f)

main()
