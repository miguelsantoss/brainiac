import os
import re
from textract import process

#  Convert file given in filePath variable
#  If a file with with 'txt' extension already exists with the same name,
#  the function ignores and returns
def convertFile(filePath):
  savePath = filePath[:-3] + 'txt'
  if (filePath[-3:] == 'pdf' and not(os.path.isfile(savePath))):
    documentByteArray = process(filePath);
    documentText = documentByteArray.decode('utf-8')
    documentText = cleanDocumentText(documentText)
    with open(savePath, 'w') as txtFile:
      txtFile.write(documentText)
    return documentText
  return None

#  Clean text from the document
def cleanDocumentText(text):
  lines = text.split('\n')
  documentText = []
  for line in lines:
    line = re.sub('^[0-9]+\. ', '', line)
    line = re.sub('[-a-zA-Z]+[0-9]+', '', line)
    line = re.sub('^\. ', '', line)
    line = re.sub('([.,\/#!$%\^&\*;:{}=\-_`~()])', ' ', line)
    line = re.sub('\ +', ' ', line)
    line = re.sub('\([0-9.-:,]+\)', '', line)
    line = re.sub('\(Fig\. [0-9]+\)', '', line)
    line = re.sub('Fig\. [0-9]+', '', line)
    line = re.sub('\(Figure [0-9]+\)', '', line)
    line = re.sub('Figure [0-9]+', '', line)
    line = re.sub('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', line)
    line = re.sub('[^a-zA-Z0-9\.:,!?; ]', '', line)
    linesWithoutChars = re.match('^[^a-zA-Z]*$', line)
    if (linesWithoutChars == None):
      documentText.append(line)
  documentText = '\n'.join(documentText)
  return documentText

#  Start at the root path and search all files to convert
def convert(path):
  for subdir, dirs, files in os.walk(path):
    for file in files:
      filePath = subdir + os.path.sep + file
      documentText = convertFile(filePath)

def main():
    path = 'pdf'
    convert(path)

if __name__ == '__main__': main()
