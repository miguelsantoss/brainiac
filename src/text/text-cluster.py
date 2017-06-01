import nltk
import string
import os
import numpy as np
import codecs, json

from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import wordpunct_tokenize as nltkTokenize
from nltk.corpus import stopwords

# from scikit - tfidf and lsa
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline
from sklearn.cluster import KMeans, MiniBatchKMeans
# from sklearn.decomposition import NMF, LatentDirichletAllocation

from sklearn import metrics
from scipy import linalg
from scipy import dot
from scipy import sparse
import matplotlib.pyplot as plt

from time import time

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

def stemTokens(tokens, stemmer):
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
                tokens = tokenize(docText)
                token_dict[doc_id] = docText
    return token_dict, file_names

def main():
    path = 'example/txt3'
    #  path = 'example/txt2'
    # real data
    #  path = 'corpus/txt'
    token_dictionary, file_names = documentAnalysis(path)
    print(token_dictionary)

    # TF-IDF
    tfidf_vectorizer = TfidfVectorizer(tokenizer=tokenize, analyzer='word')
    tfidf_matrix = tfidf_vectorizer.fit_transform(token_dictionary.values())

    # TF-IDF Similarity
    tfidf_similarity_matrix = (tfidf_matrix * tfidf_matrix.T).A

    # Bag of Words raw Counts - used for LDA
    tf_vectorizer = CountVectorizer(tokenizer=tokenize, analyzer='word')
    tf_matrix = tf_vectorizer.fit_transform(token_dictionary.values())
    print()
    print(tf_matrix)
    print()
    print(tf_vectorizer.vocabulary_)

    print("similarity")
    print(tfidf_similarity_matrix)
    # tfidf_similarity_matrix: numpy.ndarray
    # tfidf_similarity_list:   list
    tfidf_similarity_list = tfidf_similarity_matrix.tolist()

    # LSA
    # n_components = 4
    # svd = TruncatedSVD(n_components = n_components)
    # svdMatrix = svd.fit_transform(tf_matrix)
    # normalizer = Normalizer(copy=False)
    # lsa = make_pipeline(svd, normalizer)
    # X = lsa.fit_transform(tf_matrix)

    labels = ['','','','']
    true_k = 4
    km_minib = MiniBatchKMeans(n_clusters=true_k, init='k-means++', n_init=1, init_size=1000, batch_size=1000, verbose=True)
    km_means = KMeans(n_clusters=true_k, init='k-means++', max_iter=100, n_init=1, verbose=True)
    
    print("Clustering sparse data with %s" % km_minib)
    t0 = time()
    km_minib.fit(tfidf_matrix)
    print("Clustering sparse data with %s" % km_means)
    km_means.fit(tfidf_matrix)
    print("done in %0.3fs" % (time() - t0))
    print()
    
    print("minibatch")
    print("Homogeneity: %0.3f" % metrics.homogeneity_score(labels, km_minib.labels_))
    print("Completeness: %0.3f" % metrics.completeness_score(labels, km_minib.labels_))
    print("V-measure: %0.3f" % metrics.v_measure_score(labels, km_minib.labels_))
    print("Adjusted Rand-Index: %.3f"
          % metrics.adjusted_rand_score(labels, km_minib.labels_))
    print("Silhouette Coefficient: %0.3f"
          % metrics.silhouette_score(tfidf_matrix, km_minib.labels_, sample_size=1000))
    
    print()

    print("kmeans")
    print("Homogeneity: %0.3f" % metrics.homogeneity_score(labels, km_means.labels_))
    print("Completeness: %0.3f" % metrics.completeness_score(labels, km_means.labels_))
    print("V-measure: %0.3f" % metrics.v_measure_score(labels, km_means.labels_))
    print("Adjusted Rand-Index: %.3f"
          % metrics.adjusted_rand_score(labels, km_means.labels_))
    print("Silhouette Coefficient: %0.3f"
          % metrics.silhouette_score(tfidf_matrix, km_means.labels_, sample_size=1000))

    print()
    
    #sim_json = {}
    #doc_array = []
    #links = []
    #  
    #with open('document.json', 'r') as docJson:
    #    documentData = json.load(docJson)['nodes']
    #
    #for index, file in enumerate(file_names):
    #    for indexj, entry in enumerate(documentData):
    #        if entry['id'] == file:
    #            doc_obj = {}
    #            doc_obj = {key:value for key, value in entry.items()}
    #            doc_array.append(doc_obj)
    #    for indexj, entry in enumerate(sim_lsa[index]):
    #        if indexj > index and entry > 0.6:
    #            link = {}
    #            link['source'] = index
    #            link['target'] = indexj
    #            link['value'] = entry
    #            links.append(link)
    #      
    #sim_json['nodes'] = doc_array
    #sim_json['links'] = links
    ##  np.savetxt('cosine_similarity.txt', similarity)
    #json.dump(sim_json, codecs.open('cosine.json', 'w', encoding='utf-8'), separators=(',',':'), sort_keys=True, indent=4)


if __name__ == '__main__': main()
