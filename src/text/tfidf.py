#  
#  Use the nltk package to tokenize and lemmatize the text files
#  in the folder provided by the path variable
#
#  Use the scikit package to perform TFidf on the result, and
#  get the cosine similarity table for the document list
#
#  Export the cosine similarity to a json object file to be read
#  by the d3 visualization
#  

import nltk
import string
import os
import numpy as np
import codecs, json
import enchant

from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer

# from scikit - tfidf and lsa
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
dict_en = enchant.Dict("en_US")

def stemTokens(tokens, stemmer):
  stemmed = []
  for item in tokens:
    stemmed.append(stemmer.stem(item))
  return stemmed

def lemmatize(tokens, lemmatizer):
  lemmas = []
  for item in tokens:
    lemma = lemmatizer.lemmatize(item)
    if dict_en.check(lemma):
      lemmas.append(lemma)
  return lemmas
    

def tokenize(text):
  tokens = nltk.word_tokenize(text)
  #  stems = stemTokens(tokens, stemmer)
  stems = lemmatize(tokens, lemmatizer)
  return stems 

def documentAnalysis(path):
  token_dict = {}
  file_names = []
  for subdir, dirs, files in os.walk(path):
    for file in files:
      file_path = subdir + os.path.sep + file
      if(file_path[-3:] == 'txt'):
        doc_id = file[:-4]
        file_names.append(doc_id)

        #  Open file and read content into docText, removing newlines
        #  and lowercasing characters
        with open(file_path, 'r') as docFile:
          docText = docFile.read().replace('\n', ' ').lower()
        
        #  Remove pontuation from the text
        docText = docText.translate(str.maketrans('', '', string.punctuation))
        token_dict[doc_id] = docText
  return token_dict, file_names

def main():
  path = 'pdf'
  token_dict, file_names = documentAnalysis(path)
  vect = TfidfVectorizer(tokenizer=tokenize,
          analyzer='word',
          stop_words='english')
  tfidf = vect.fit_transform(token_dict.values())
  similarity = (tfidf * tfidf.T).A
  sim = similarity.tolist()

  sim_json = {}
  doc_array = []
  links = []
    
  with open('document.json', 'r') as docJson:
    documentData = json.load(docJson)['nodes']

  for index, file in enumerate(file_names):
    for indexj, entry in enumerate(documentData):
      if entry['id'] == file:
        doc_obj = {}
        doc_obj = {key:value for key, value in entry.items()}
        doc_array.append(doc_obj)
    for indexj, entry in enumerate(sim[index]):
      if indexj > index and entry > 0.5:
        link = {}
        link['source'] = index
        link['target'] = indexj
        link['value'] = entry
        links.append(link)
        
  sim_json['nodes'] = doc_array
  sim_json['links'] = links
  np.savetxt('cosine_similarity.txt', similarity)
  json.dump(sim_json, codecs.open('cosine.json', 'w', encoding='utf-8'), separators=(',',':'), sort_keys=True, indent=4)

if __name__ == '__main__': main()
