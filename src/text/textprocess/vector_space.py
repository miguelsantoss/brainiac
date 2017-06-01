from numpy import dot
from numpy import array
from numpy.linalg import norm
from scipy import sparse
import sys
from math import *

from textprocess.parser import Parser
from textprocess.transform.tfidf import TFIDF
from textprocess.transform.lsa import LSA
from textprocess.matrix_formatter import MatrixFormatter

import functools

class VectorSpace:
    parser = None
    documents = []
    document_tokens = []
    remove_stop_words = False

    def __init__(self, documents = [], transforms = [TFIDF, LSA], remove_stop_words=True):
        self.remove_stop_words = remove_stop_words
        self.documents = documents
        self.parser = Parser()
        self.document_tokens = [self.parser.process_document(doc, self.remove_stop_words) for doc in documents]
        self._build(documents, transforms)

    def _build(self, documents, transforms):
        self.vector_index_to_keyword_mapping = self._get_vector_keyword_index(documents)
        matrix = [self._make_vector(document) for document in documents]
        matrix = functools.reduce(lambda matrix, transform: transform(matrix).transform(), transforms, matrix)
        test = sparse.csr_matrix(matrix)
        print(matrix)
        self.collection_of_documents_term_vectors = matrix
    
    def _get_vector_keyword_index(self, documents):
        vocabulary_list = list(set(self.parser.get_vocabulary_list(documents, self.remove_stop_words)))
        vector_index = {}
        offset = 0
        for word in vocabulary_list:
            vector_index[word] = offset
            offset += 1
        return vector_index

    def _make_vector(self, document):
        vector = [0] * len(self.vector_index_to_keyword_mapping)
        word_list = self.parser.get_vocabulary_list(document.split(' '), self.remove_stop_words)
        
        for word in word_list:
            vector[self.vector_index_to_keyword_mapping[word]] += 1
        
        return vector

    def _cosine(self, vector1, vector2):
        return float(dot(vector1, vector2) / (norm(vector1) * norm(vector2)))

    def _build_query_vector(self, search_query):
        return self._make_vector(search_query)

    def search(self, search_query, sort=True):
        query_vector = self._build_query_vector(search_query)
        ratings = [self._cosine(query_vector, document_vector) for document_vector in self.collection_of_documents_term_vectors]
        if sort:
            ratings.sort(reverse=True)
        return ratings

    def document_similarity(self):
        return [self.search(doc, sort=False) for doc in self.documents]
    
    def document_similarity2(self):
        similarity = sparse.csr_matrix(self.collection_of_documents_term_vectors)
        similarity = (similarity * similarity.T).A
        return similarity.tolist()
