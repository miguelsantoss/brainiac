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

from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer

# from scikit - tfidf and lsa
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

def stem_tokens(tokens, stemmer):
  stemmed = []
  for item in tokens:
    stemmed.append(stemmer.stem(item))
  return stemmed

def lemmatize(tokens, lemmatizer):
  lemmas = []
  for item in tokens:
    lemmas.append(lemmatizer.lemmatize(item))
  return lemmas
    

def tokenize(text):
  tokens = nltk.word_tokenize(text)
  lemmas = lemmatize(tokens, lemmatizer)
  return lemmas 

def documentAnalysis(path):
  token_dict = {}
  for subdir, dirs, files in os.walk(path):
    for file in files:
      file_path = subdir + os.path.sep + file
      if(file_path[-3:] == 'txt'):
        doc_id = file[:-4]
        file_names.append(doc_id)

        #  Open file and read content into docText, removing newlines
        #  and lowercasing characters
        with open(file_path, 'r') as docFile:
          docText = docFile.read().replace('\n', '').lower()
        
        #  Remove pontuation from the text
        docText = docText.translate(str.maketrans('', '', string.punctuation))
        token_dict[doc_id] = docText
  return token_dict

file_names = []

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

#  vect = TfidfVectorizer(tokenizer=tokenize, stop_words='english')
#tfidf = TfidfVectorizer(tokenizer=tokenize)
#  tfidf = vect.fit_transform(token_dict.values())

#  print(tfidf)
#  print(vect.get_feature_names())

#svd = TruncatedSVD(n_components = 100)
#svdMatrix = svd.fit_transform(tfs)

#  similarity = (tfidf * tfidf.T).A
#  sim = similarity.tolist()

#  sim_json = {}
#  doc_array = []
#
#  for index, file in enumerate(file_names):
#    doc_obj = {}
#    file_name = file[:-4]
#    file_name = file_name[4:]
#    doc_obj['name'] = file_name
#    doc_obj['similarity'] = sim[index]
#    doc_array.append(doc_obj)
#
#  sim_json['array'] = doc_array
#
#  np.savetxt('cosine_similarity.txt', similarity)
#  json.dump(sim_json, codecs.open('cosine.json', 'w', encoding='utf-8'), separators=(',',':'), sort_keys=True, indent=4)

def main():
  path = 'pdf'
  token_dict = documentAnalysis(path)
  print(token_dict)

if __name__ == '__main__': main()
