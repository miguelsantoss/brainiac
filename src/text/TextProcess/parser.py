import os
from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer

class Parser:
    stemmer = None
    lemmatizer = None
    stopwords = []

    def __init__(self):
        self.stemmer = PorterStemmer()
        self.lemmatizer = WordNetLemmatizer()

        print(self.stemmer)
        print(self.lemmatizer)
