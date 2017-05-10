import os
from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.corpus import stopwords

class Parser:
    stemmer = None
    lemmatizer = None
    stop_words = None

    def __init__(self):
        self.stemmer = PorterStemmer()
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def _remove_stop_words(self, words):
        return [word for word in words if word not in self.stop_words]

    def _tokenize(self, string):
        words = string.split(' ')
        return [self.lemmatizer.lemmatize(word) for word in words]

    def _clean(self, string):
        string = string.replace('.', '')
        string = string.replace('\s+', '')
        string = string.lower()
        return string

    def process_document(self, document, remove_stop_words=True):
        if remove_stop_words:
            return self._remove_stop_words(self._tokenize(self._clean(document)))
        return self._tokenize(self._clean(document))

    def get_vocabulary_list(self, documents, remove_stop_words=True):
        vocabulary_list = ' '.join(documents)
        return self.process_document(vocabulary_list, remove_stop_words)
