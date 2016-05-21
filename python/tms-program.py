import serial
import csv
import random
import time, datetime
import os, subprocess, syslog
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

# Global variables (plot figure, list of inputs)
plt.figure(figsize=(20,10))
plt.axis('off')
plt.plot()
plt.show(block=False)
objList = []

def error(message):
	print message
	exit()

#Good reference for matplotlib
#http://matplotlib.org/api/pyplot_summary.html
def show_image(obj, screen, typeOut):
    print typeOut, screen, obj
    plt.clf()
    plt.axis('off')
    if typeOut == 'image':
	img = mpimg.imread(obj)
	if screen == 'single':
	    plt.imshow(img)
	elif screen == 'double':
	    plt.gcf().add_subplot(121)
	    plt.axis('off')
	    plt.imshow(img)
	    plt.gcf().add_subplot(122)
	    plt.axis('off')
	    plt.imshow(img)
	else: error('Error with screen type, must be single or double')
	plt.draw()
    elif typeOut == 'text':
	if screen == 'single':
	    ax = plt.gcf().add_subplot(111)
	    ax.text(4, 6, obj, fontsize=100)
	    plt.axis([0,10,0,10])
	elif screen == 'double':
	    ax1 = plt.gcf().add_subplot(121)
	    plt.axis('off')
	    ax1.text(3, 5, obj, fontsize=100)
	    plt.axis([0,10,0,10])
	    ax2 = plt.gcf().add_subplot(122)
	    plt.axis('off')
	    ax2.text(4, 5, obj, fontsize=100)
	    plt.axis([0,10,0,10])
	else: error('Error with screen type, must be single or double')
	plt.draw()
    else: error('Error with type, must be image or text')

#Fire TMS via Arduino as located by port Arduino is on
#To be used with tms.ino
def fire_tms(port):
	print "FIRING TMS : ", port
	#arduino = serial.Serial(port, 230400)
	#arduino.write('1')
	#arduino.close()

#Determine if TMS should be triggered, given input array or randomization
def determine_fire(fireiter, i):
   if fireiter == 'random':
   	r = random.random()
   	if r > 0.5: return True
   	else: return False
   elif type(fireiter) is list:
	if i in fireiter: return True 
	else: return False
   else: error("Error in configuration \"fire iteration\", input must integer array or \"random\"")

#Yield the next random object from global list objList
def get_next():
    r = random.randrange(0,len(objList)) 
    out = objList[r]
    yield out

#The bulk of the processing...
def process_type(config, i):
   # Get random Image or Word to show from directory given
   out = get_next().next()
   typeOut = config['type']
   screen = config['screen']
   fire = determine_fire(config['fire iteration'], i)

   #Process Image/Word with firing TMS
   if config['TMS before or after'] == "before":
	if fire is True: fire_tms(config['TMS port'])
	time.sleep(float(config['time to fire'])/1000)
	show_image(out, screen, typeOut)
   elif config['TMS before or after'] == "after":
	show_image(out, screen, typeOut)
	time.sleep(float(config['time to fire'])/1000)
	if fire is True: fire_tms(config['TMS port'])
   else: error("Error in configuration \"TMS before or after\", input must be \"before/after\"")

   #Process how to end event
   if config['event end'] == "keypress":
	raw_input("waiting for keypress to end...")
   elif config['event end'] == "time":
	time.sleep(float(config['event end time'])/1000)
   else: error("Error in configuration \"event end\", input must be \"keypress/time\"")

#TODO
   #Process refresh
   if config['refresh'] == "yes":
	pass
   elif config['refresh'] == "no":
	pass 
   else: error("Error in configuration \"refresh\", input must be \"yes/no\"")

   return fire, out

#Process the user information
def process_user(config):
   firelist = []
   outlist = []
   for i in range(1, int(config['iterations per user'])+1):
	print i
   	if (config['type'] == 'image') or (config['type'] == 'text'):
   	 fired, out = process_type(config, i)
   	elif (config['type'] == 'mouse'):
   	 error("mouse not yet implemented")
	else: error("Error in configuration \"type\", input must be \"image/text/mouse\"")

#TODO when to fire ISI?
	#Show ISI image after each iteration
	show_image(config['ISI image'], config['screen'], 'image')
	time.sleep(float(config['ISI duration'])/1000)	

   	if fired is True: firelist.append(i)
	outlist.append(out)	

#TODO show blank at the end? or just close? 
   #show blank image at the end
   #show_image(blank, config['screen'], 'image')

   config['fire iteration'] = firelist
   config['order list'] = outlist
   return config

#Process the input images/text to create global objList of image/text objects to yield
def processYieldField(typeIn, directory):
    global objList
    if os.path.isfile(directory) and typeIn == 'text':
	words = list()
	with open(directory, 'r') as f:
	 for line in f:
	   cand = line.rsplit()[0]
	   if type(cand) != str : error("Error in text list file")
   	   words.append(cand)
    	objList = words
    elif os.path.isdir(directory) and typeIn == 'image':
	fileNames = list()
	path, dirs, files = os.walk(directory).next()
	for f in files:
		fileNames.append(path+"/"+f)
	objList = fileNames
    else: error("Error in configuration \"type\" or \"directory\"")

def process_config(filename):
   config = {}
   with open(filename, 'r') as f:
   	reader = csv.reader(f)
   	for row in reader:
   		k, x, v = row
   		config[k] = v
   processYieldField(config['type'], config['directory'])
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
   return filename

def log_user_data(info, filename):
   with open(filename, 'a') as f:
	for k,v in sorted(info.items()):
	   f.write(str(k) + ',' + str(v) + '\n')
   f.close()

def start():
   config = process_config("config.csv")
   f = input_user_data(config['name'], config['sex'])
   info = process_user(config)
   log_user_data(info, f)

start()
