import argparse
import os
import xml.etree.ElementTree
from bs4 import BeautifulSoup

parser = argparse.ArgumentParser(description='Reference processing')
parser.add_argument('--path', dest='path', default='corpus/pdf')
args = parser.parse_args()

class Document:
    def __init__(self, title):
        self.title = title
        self.references = []
    
    def add_reference(self, ref_title):
        self.references.append(ref_title)
    
    def get_title(self):
        return self.title

    def get_references(self):
        return self.references
    

def get_document_list(path):
    file_names = []
    xml_files = []
    for subdir, dirs, files in os.walk(path):
        for file in files:
            file_path = subdir + os.path.sep + file
            file_names.append(file_path)
            xml_files.append(subdir + os.path.sep + 'refs' + os.path.sep + file[:-4] + '.tei.xml')
        break
    return file_names, xml_files

def main(args):
    file_list, xml_list = get_document_list(args.path)
    documents = []

    for xml_file in xml_list:
        with open(xml_file, 'r') as docFile:
            xml = BeautifulSoup(docFile.read(), 'xml')

        for tag in xml.find('title'):
            title = tag

        doc = Document(title)

        for reference in xml.findAll('biblStruct'):
            title_item = reference.find('title')
            if title_item != None:
                for title in title_item:
                    if title != '':
                        doc.add_reference(title)

        documents.append(doc)

    document_list = []
    for document in documents:
        new_doc = Document(document.get_title())
        for reference in document.get_references():
            for ref_document in documents:
                if (ref_document.get_title().lower() == reference.lower()
                        and ref_document.get_title().lower() != new_doc.get_title().lower()):
                    new_doc.add_reference(ref_document)
        document_list.append(new_doc)



    # print(ee.findAll('biblStruct'))
    # e = xml.etree.ElementTree.parse(xml_list[0]).getroot()
    # print(e.getchildren()[1].getchildren()[1].getchildren()[1].getchildren()[0].getchildren())

if __name__ == '__main__': main(args)
