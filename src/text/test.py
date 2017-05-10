from textprocess.vector_space import VectorSpace

#  docs = ['this is a a sample', 'this is another another example example example']

# docs = [
#     'The Neatest Little Guide to Stock Market Investing',
#     'Investing For Dummies, 4th Edition',
#     'The Little Book of Common Sense Investing: The Only Way to Guarantee Your Fair Share of Stock Market Returns',
#     'The Little Book of Value Investing',
#     'Value Investing: From Graham to Buffett and Beyond',
#     'Rich Dad’s Guide to Investing: What the Rich Invest in, That the Poor and the Middle Class Do Not!',
#     'Investing in Real Estate, 5th Edition',
#     'Stock Investing For Dummies',
#     'Rich Dad’s Advisors: The ABC’s of Real Estate Investing: The Secrets of Finding Hidden Profits Most Investors Miss'
# ]

docs = ['The game of life is a game of everlasting learning',
        'The unexamined life is not worth living',
        'Never stop learning']
vec = VectorSpace(documents=docs, remove_stop_words=False)
#  print(vec.search('example'))
sim1 = vec.document_similarity()
sim2 = vec.document_sim()

def pretty_print(matrix):
    for row in matrix:
        print(row)

print("sim1")
pretty_print(sim1)
print("sim2")
pretty_print(sim2)

