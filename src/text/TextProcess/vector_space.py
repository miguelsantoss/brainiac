from parser import Parser
import sys

try:
    from numpy import dot
    from numpy.linalg import norm
except:
    print("numpy is required to run")
    sys.exit()

class VectorSpace:

    self.Parser = None

    def __init__(self, documents = [], transforms = [TFIDF, LSA]):
        self.collection
