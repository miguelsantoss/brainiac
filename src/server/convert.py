import os
import re
from textract import process

#  Convert file given in filePath variable
#  If a file with with 'txt' extension already exists with the same name,
#  the function ignores and returns
def convert_file(file_path, save_path):
    if (file_path[-3:] == 'pdf' and not(os.path.isfile(save_path))):
        document_byte_array = process(file_path);
        document_text = document_byte_array.decode('utf-8')
        document_text = clean_document_text(document_text)
        with open(save_path, 'w') as txt_file:
            txt_file.write(document_text)
        return document_text
    return None

#  Clean text from the document
def clean_document_text(text):
    lines = text.split('\n')
    document_text = []
    for line in lines:
        line = re.sub('^[0-9]+\. ', '', line)
        line = re.sub('[-a-zA-Z]+[0-9]+', '', line)
        line = re.sub('^\. ', '', line)
        line = re.sub('([.,\/#!$%\^&\*;:{}=\-_`~()])', ' ', line)
        line = re.sub('\([0-9.-:,]+\)', '', line)
        line = re.sub('\(Fig\. [0-9]+\)', '', line)
        line = re.sub('Fig\. [0-9]+', '', line)
        line = re.sub('\(Figure [0-9]+\)', '', line)
        line = re.sub('Figure [0-9]+', '', line)
        line = re.sub('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', line)
        line = re.sub('[^a-zA-Z0-9\.:,!?; ]', '', line)
        line = re.sub('[0-9]', '', line)
        line = re.sub('\\b[a-z]{1,2}\\b', '', line)
        line = re.sub('\ +', ' ', line)
        linesWithoutChars = re.match('^[^a-zA-Z]*$', line)
        if (linesWithoutChars == None):
            document_text.append(line)
    document_text = '\n'.join(document_text)
    return document_text

#  Start at the root path and search all files to convert
def convert(path, save):
    for subdir, dirs, files in os.walk(path):
        for file in files:
            file_path = subdir + os.path.sep + file
            print('Converting ', file_path, '...')
            save_path = save + os.path.sep + file[:-3] + 'txt'
            try:
                document_text = convert_file(file_path, save_path)
            except:
                print('Failed file ', file_path)
                continue

def main():
    path = 'corpus/pdf'
    save_path = 'corpus/txt'
    print('Converting all files in ', path)
    convert(path, save_path)

if __name__ == '__main__': main()
