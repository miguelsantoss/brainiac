from gensim import corpora, models, similarities
from time import time
from math import log

docs = ['this is a a sample', 'this is another another example example example']
docs = [doc.split(' ') for doc in docs]

def wlocal(freq):
    return freq

def wglobal(doc_freq, D):
    return 1.0 + log((1.0 + D) / (1.0 + doc_freq))

dictionary = corpora.Dictionary(docs)
corpus = [dictionary.doc2bow(doc) for doc in docs]
print(corpus)

tfidf = models.TfidfModel(corpus, wlocal=wlocal, wglobal=wglobal)
corpus_tfidf = tfidf[corpus]

index = similarities.MatrixSimilarity(tfidf[corpus])
sims = index[corpus_tfidf]

print("corpus_tfidf")
for doc in corpus_tfidf:
    print(doc)

#  d = {dictionary.get(id): value for doc in corpus_tfidf for id, value in doc}
#  print(d)
#
#  print(sims)
#  print(list(enumerate(sims)))
#  sims = sorted(enumerate(sims), key=lambda item: item[1])
#  print(sims)# print sorted (document number, similarity score) 2-tuples
