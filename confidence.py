import serial
import csv
import random
import time, datetime
import os
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

# Parameters to change
wordFile = "words.csv"
xaxis = 16
yaxis = 13
fullscreen = True

# Global variables: plot figure, list of inputs
objList = []
objDict = {}
plt.figure(figsize=(xaxis,yaxis))
plt.ion()
plt.axis('off')
plt.plot()
#if fullscreen is True: plt.get_current_fig_manager().window.state('zoomed')
plt.show(block=False)

def error(message):
     print(message)
     exit()

#Good reference for matplotlib
#http://matplotlib.org/api/pyplot_summary.html
def show_image(word, bar):
    plt.clf()
    ax1 = plt.gcf().add_subplot(211)
    plt.axis('off')
    ax1.text(4, 5, word, fontsize=100)
    plt.axis([0,10,0,10])
    plt.gcf().add_subplot(212)
    plt.axis('off')
    img = mpimg.imread(bar)
    plt.imshow(img)
    plt.draw()
    plt.pause(0.0001)

def show_fixation_image(image):
    plt.clf()
    plt.axis('off')
    img = mpimg.imread(image)
    plt.imshow(img)
    plt.draw()
    plt.pause(0.001)

#Fire TMS via Arduino as located by port Arduino is on
#To be used with tms.ino
def fire_tms(port):
    print("FIRING TMS : " + str(port))
    #arduino = serial.Serial(port, 230400)
    #arduino.write(b'1')
    #arduino.close()

def get_user_input():
    response = 'yes'
    responseTime = '1'

    return response,responseTime

def process_image(word):
    #show initial image and bar
    show_image(word, 'images/lionandcub.jpg')
    fire_tms('COM1')
    key = ''
    #TODO get user response and time
    #while key != ord('y') or key != ord('n'):

    #show initial bar chart
    show_image('yes/no', 'images/taylor1.jpg')
    #show stabalizing bar chart
    show_image('yes/no', 'images/taylor2.jpg')
    #showstable bar chart
    show_image('yes/no', 'images/taylor3.jpg')
    show_fixation_image('images/whitescreen.png')
    time.sleep(0.5)
    return {
            'word': word,
            'difficulty': objDict[word]['level'],
            'truthness': objDict[word]['truth'],
            'response': resp,
            'responseTime': respTime
            }

#Return a random word from global list objList
def get_random_word():
    r = random.randrange(0,len(objList))
    out = objList[r]
    return out

#Process the user information
def process_block(block_size):
    log = list()
    for i in range(int(block_size)):
        word = get_random_word()
        data = process_image(word)
        log.append(data)
    return log

def process_input_words(filename):
    words = dict()
    with open(filename, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            word, level, truth = row
            words[word] = {
                    'level': level,
                    'truth': truth
                    }
    words.pop('word')
    global objDict
    objDict = words
    global objList
    objList = list(words)

def log_user_data(info):
    logFolder = os.getcwd()
    name = 'test'
    d = datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    filename = logFolder + '/' + name + "-" + d + ".log"
    with open(filename, 'a') as f:
        for k in info:
            f.write(str(k))
    f.close()

def start():
    process_input_words(wordFile)
    block_size = len(objList)/4  #to compensate for 4 TMS shocked areas
    info = process_block(block_size)
    log_user_data(info)
    plt.close()

start()
