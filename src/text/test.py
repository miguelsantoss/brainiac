from textprocess.vector_space import VectorSpace

docs = ['this is a a sample', 'this is another another example example example']

#  docs = ['The game of life is a game of everlasting learning',
#          'The unexamined life is not worth living',
#          'Never stop learning']
vec = VectorSpace(documents=docs, remove_stop_words=False)
#  print(vec.search('example'))
sim1 = vec.document_similarity()
sim2 = vec.document_similarity2()
#  sim2 = vec.document_sim()

def pretty_print(matrix):
    for row in matrix:
        print(row)

print("sim1")
pretty_print(sim1)
#  print("sim2")
#  pretty_print(sim2)
