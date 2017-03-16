#  
#  Convert pdf files in the path variable to plain text files, in the same path
#  

import os
from tika import parser
from textract import process

path = './test'

for subdir, dirs, files in os.walk(path):
    for file in files:
        file_path = subdir + os.path.sep + file
        save_path = file_path[:-3] + "txt"
        #text = parser.from_file(file_path);
        text = process(file_path);
        file = open(save_path, 'w')
        file.write(text.decode('utf-8'))
        file.close()
