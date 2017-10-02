import nltk
import string
import os
import numpy as np
import codecs, json
import random, math
import argparse
import sys
import operator

from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import wordpunct_tokenize as nltkTokenize
from nltk.corpus import stopwords, wordnet

# from scikit - tfidf and lsa
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import TruncatedSVD, PCA, NMF, LatentDirichletAllocation
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
# from sklearn.decomposition import NMF, LatentDirichletAllocation

from scipy import linalg
from scipy import dot
from scipy import sparse
import matplotlib.pyplot as plt

import spacy

parser = argparse.ArgumentParser(description='Text processing')
parser.add_argument('--path', dest='path', default='corpus/txt')
parser.add_argument('--node-info', dest='info', default='document.json')
parser.add_argument('--save', dest='save', default='vizdata.json')
parser.add_argument('--word-list', dest='wordList', default='utils/wordsEn.txt')
parser.add_argument('--plot', dest='plot', action='store_true')
parser.add_argument('--plot-annotations', dest='annotate_plot', action='store_true')
parser.add_argument('--word', dest='word', default=False)
parser.add_argument('--distances-file', dest='wordDistances', default='wordDistances.json')
args = parser.parse_args()

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
stops = set(stopwords.words('english'))
nlp = spacy.load('en')

print('Loading english word list...')
with open(args.wordList) as word_file:
    english_words = set(word.strip().lower() for word in word_file)
print('Loaded.')

def print_top_words(model, feature_names, n_top_words):
    for topic_idx, topic in enumerate(model.components_):
        print('Topic #%d:' % topic_idx)
        print(' '.join([feature_names[i]
                        for i in topic.argsort()[:-n_top_words - 1:-1]]))
    print()

def get_top_words(model, feature_names, n_top_words=10):
    top_words = []
    for topic_idx, topic in enumerate(model.components_):
        topic = [feature_names[i] for i in topic.argsort()[:-n_top_words - 1:-1]]
        #  print('Topic #%d:' % topic_idx)
        #  print(' '.join([feature_names[i]
                        #  for i in topic.argsort()[:-n_top_words - 1:-1]]))
        top_words.append(topic)
    return top_words

def is_english_word(word):
    return word in english_words

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
    tokens = [word for word in tokens if is_english_word(word)]
    tokens = [word for word in tokens if word not in stops]
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
                print('Loading file: ', file_path)
                with open(file_path, 'r') as docFile:
                  docText = docFile.read().replace('\n', ' ').lower()
                
                #  Remove pontuation from the text
                docText = docText.translate(str.maketrans('', '', string.punctuation))
                tokens = tokenize(docText)

                # Use calculated tokens instead of docText
                token_dict[doc_id] = " ".join(tokens)
    return token_dict, file_names

def main(args):
    print('Loading Documents...')
    token_dictionary, file_names = documentAnalysis(args.path)
    print('All files loaded.')

    num_clusters = 10
    num_seeds = 10
    n_topics = 10
    n_top_words = 20
    labels_color_map = {
        0: '#20b2aa', 1: '#ff7373', 2: '#ffe4e1', 3: '#005073', 4: '#4d0404',
        5: '#ccc0ba', 6: '#4700f9', 7: '#f6f900', 8: '#00f91d', 9: '#da8c49'
    }

    spacy_dict = {}
    for key, value in token_dictionary.items():
        spacy_dict[key] = nlp(value)
    
    matrix_n = len(spacy_dict)
    spacy_similarity_matrix = []

    for i in range(0, matrix_n):
        row = []
        for j in range(0, matrix_n):
            row.append(spacy_dict[file_names[i]].similarity(spacy_dict[file_names[j]]))
        spacy_similarity_matrix.append(row)

    # TF-IDF
    print('Extracting TF-IDF features...')
    tfidf_vectorizer = TfidfVectorizer(tokenizer=tokenize, analyzer='word')
    tfidf_matrix = tfidf_vectorizer.fit_transform(token_dictionary.values())

    if(args.word):
        print('Calculating word distance to documents...')
        # Transform to bag of words and get distance to documents
        word_distances = cosine_similarity(tfidf_vectorizer.transform([args.word]), tfidf_matrix).tolist()[0]

        index = 0
        distances = {}
        for file in file_names:
            distances[file] = word_distances[index]
            index += 1
        print('Done.')
        print('Saving in temporary file...')
        obj = {}
        obj[args.word] = {}
        obj[args.word]['labels'] = distances
        obj[args.word]['array'] = word_distances
        print(obj)
        json.dump(obj, codecs.open(args.wordDistances, 'w', encoding='utf-8'), separators=(',',':'), sort_keys=True, indent=4)
        print('Saved.')
        return

    # TF-IDF Similarity
    print('Extracting TF-IDF similarity matrix...')
    tfidf_similarity_matrix = (tfidf_matrix * tfidf_matrix.T).A

    # Bag of Words raw Counts - used for LDA
    print('Extracting TF counts for LDA...')
    tf_vectorizer = CountVectorizer(tokenizer=tokenize, analyzer='word')
    tf_matrix = tf_vectorizer.fit_transform(token_dictionary.values())

    tfidf_similarity_list = tfidf_similarity_matrix.tolist()

    clustering_model = KMeans(
        n_clusters=num_clusters,
        precompute_distances='auto',
        n_jobs=-1
    )

    print('Fitting KMeans model with TF-IDF matrix, ', 'n_clusters: %d' % num_clusters)
    labels = clustering_model.fit_predict(tfidf_matrix)

    # Fit the NMF model
    print('Fitting the NMF model with tf-idf features, ', 'n_topics: %d' % n_topics)
    nmf = NMF(n_components=n_topics, random_state=1, alpha=.1, l1_ratio=.5).fit(tfidf_matrix)
    
    print('\nTopics in NMF model:')
    tfidf_feature_names = tfidf_vectorizer.get_feature_names()
    print_top_words(nmf, tfidf_feature_names, n_top_words)

    print('Fitting LDA models with tf features, ', 'n_topics: %d' % n_topics)
    lda = LatentDirichletAllocation(n_topics=n_topics, max_iter=5,
                                learning_method='online',
                                learning_offset=50.,
                                random_state=0)

    lda_res = lda.fit_transform(tf_matrix)

    print('\nTopics in LDA model:')
    tf_feature_names = tf_vectorizer.get_feature_names()
    print_top_words(lda, tf_feature_names, n_top_words)

    # LSA
    n_components_lsa = 50
    print('Performing dimensionality reduction using LSA, ', 'n_components: %d' % n_components_lsa)
    svd = TruncatedSVD(n_components=n_components_lsa, random_state=0)
    lsa_reduced = svd.fit_transform(tfidf_matrix)
    #  normalizer = Normalizer(copy=False)
    #  lsa = make_pipeline(svd, normalizer)
    #  X = lsa.fit_transform(tf_matrix)

    # TSNE
    n_components_tsne = 2
    print('Performing dimensionality reduction using TSNE, ', 'n_components: %d' % n_components_tsne)
    tsne_reduced = TSNE(n_components=n_components_tsne, perplexity=40, verbose=2).fit_transform(lsa_reduced)

    # PCA on the TF-IDF matrix and on the LSA reduced TF-IDF matrix
    reduced_data = PCA(n_components=2).fit_transform(tfidf_matrix.toarray())
    reduced_data2 = PCA(n_components=2).fit_transform(lsa_reduced)

    # Clustering of the LSA reduced TF-IDF matrix
    print('Fitting KMeans model with LSA reduced TF-IDF matrix, ', 'n_clusters: %d' % num_clusters)
    clustering_model_lsa_reduced = KMeans(
        n_clusters=num_clusters,
        precompute_distances='auto',
        n_jobs=-1
    )
    labels_lsa = clustering_model_lsa_reduced.fit_predict(lsa_reduced)

    # Clustering of the TSNE and LSA reduced TF-IDF matrix
    print('Fitting KMeans model with TSNE reduced TF-IDF matrix, ', 'n_clusters: %d' % num_clusters)
    clustering_model_tsne_reduced = KMeans(
        n_clusters=num_clusters,
        precompute_distances='auto',
        n_jobs=-1
    )
    labels_tsne = clustering_model_tsne_reduced.fit_predict(tsne_reduced)

    # Clustering of the PCA reduced TF-IDF matrix
    print('Fitting KMeans model with PCA reduced TF-IDF matrix, ', 'n_clusters: %d' % num_clusters)
    clustering_model_pca_reduced = KMeans(
        n_clusters=num_clusters,
        precompute_distances='auto',
        n_jobs=-1
    )
    X = reduced_data
    labels_pca = clustering_model_pca_reduced.fit_predict(X)

    # Plotting the PCA reduced TF-IDF model
    if (args.plot):
        fig, ax = plt.subplots()
        fig.suptitle('PCA clusters', fontsize=20)
        for index, instance in enumerate(X):
            # print instance, index, labels[index]
            pca_comp_1, pca_comp_2 = X[index]
            color = labels_color_map[labels_pca[index]]
            ax.scatter(pca_comp_1, pca_comp_2, c=color)

        docs = []

        for doc, content in token_dictionary.items():
            docs.append(doc)

        # Annotate each document with it's id - filename
        if (args.annotate_plot):
            for i, doc in enumerate(docs):
                ax.annotate(doc, (X[i][0], X[i][1]))

        # Plot TSNE and LSA reduced TF-IDF Model
        fig, ax = plt.subplots()
        fig.suptitle('TSNE/LSA clusters', fontsize=20)
        for index, instance in enumerate(tsne_reduced):
            tsne_comp_1, tsne_comp_2 = tsne_reduced[index]
            color = labels_color_map[labels[index]]
            ax.scatter(tsne_comp_1, tsne_comp_2, c=color)

        # Annotate each document with it's id - filename
        if (args.annotate_plot):
            for i, doc in enumerate(docs):
                ax.annotate(doc, (tsne_reduced[i][0], tsne_reduced[i][1]))

        plt.show(block=False)

    # Get top words per topic from the NMF and LDA models
    top_words_lda = get_top_words(lda, tf_feature_names, n_top_words)
    top_words_nmf = get_top_words(nmf, tfidf_feature_names, n_top_words)

    topics_lda = []
    topics_nmf = []

    # Save top words per LDA topic
    for index, topic in enumerate(top_words_lda):
        topic_obj = {}
        topic_obj['index'] = index
        topic_obj['top_words'] = topic
        topics_lda.append(topic_obj)

    # Save top words per NMF topic
    for index, topic in enumerate(top_words_nmf):
        topic_obj = {}
        topic_obj['index'] = index
        topic_obj['top_words'] = topic
        topics_nmf.append(topic_obj)

    # Get top words per cluster
    # LSA cluster
    original_space_centroids = svd.inverse_transform(clustering_model_lsa_reduced.cluster_centers_)
    order_centroids_lsa_reduced = original_space_centroids.argsort()[:, ::-1]

    # TF-IDF Cluster
    order_centroids_tfidf = clustering_model.cluster_centers_.argsort()[:, ::-1]

    # List to save cluster's top words
    tfidf_cluster_top_words = []
    lsa_cluster_top_words = []
    for i in range(num_clusters):
        # Get top words from each cluster
        tfidf_cluster_words = [tfidf_feature_names[ind] for ind in order_centroids_tfidf[i, :10]]
        lsa_cluster_words   = [tfidf_feature_names[ind] for ind in order_centroids_lsa_reduced[i, :10]]

        # Append to the list of clusters
        tfidf_cluster_top_words.append(tfidf_cluster_words)
        lsa_cluster_top_words.append(lsa_cluster_words)

    sim_json = {}
    doc_array = []
    links = []

    with open(args.info, 'r') as docJson:
        documentData = json.load(docJson)['nodes']
    
    for index, file in enumerate(file_names):
        for indexj, entry in enumerate(documentData):
            if entry['id'] == file:
                doc_obj = {}
                doc_obj = {key:value for key, value in entry.items()}
                doc_obj['cluster'] = int(labels_pca[index])
                doc_obj['similarity_values'] = tfidf_similarity_list[index]

                ring0 = []
                ring1 = []
                ring2 = []
                ring3 = []
                ring4 = []

                # for indexk, entry in enumerate(tfidf_similarity_list[index]):
                #     if (entry >= 0 and )

                doc_array.append(doc_obj)
        for indexj, entry in enumerate(tfidf_similarity_list[index]):
            if indexj > index and entry > 0.5:
                link = {}
                link['source'] = index
                link['target'] = indexj
                link['value'] = entry
                links.append(link)
        
            
    

    sim_json['nodes'] = doc_array
    sim_json['links'] = links
    sim_json['topics_lda'] = topics_lda
    sim_json['topics_nmf'] = topics_nmf
    sim_json['cluster_words_tfidf'] = tfidf_cluster_top_words
    sim_json['cluster_words_lsa'] = lsa_cluster_top_words

    # Flatten list of lists
    default_words_tfidf = [item for sublist in tfidf_cluster_top_words for item in sublist]
    default_words_lsa = [item for sublist in lsa_cluster_top_words for item in sublist]
    default_words = default_words_tfidf + default_words_lsa

    # Remove duplicates
    default_words = list(set(default_words))

    # Transform to bag of words and get distance to documents
    word_distances = {}
    for word in default_words:
        word_distances[word] = cosine_similarity(tfidf_vectorizer.transform([word]), tfidf_matrix).tolist()[0]
    
    distances = {}
    for word in default_words:
        index = 0
        w_aux = {}
        for file in file_names:
            w_aux[file] = word_distances[word][index]
            index += 1
        distances[word] = w_aux
    
    # Get top words
    word_distance_sum = {}
    for key, val in word_distances.items():
        word_distance_sum[key] = sum(val)

    word_distance_sort = sorted(word_distance_sum.items(), key=operator.itemgetter(1), reverse=True)
    words = word_distance_sort[:15]

    sim_json['wordDistances'] = {key:value for key, value in word_distances.items()}
    sim_json['wordDistancesWLabels'] = distances
    sim_json['wordMagnets'] = [word[0] for word in words]
    
    json.dump(sim_json, codecs.open(args.save, 'w', encoding='utf-8'), separators=(',',':'), sort_keys=True)
    if (args.plot):
        plt.show()

if __name__ == '__main__': main(args)
