from scipy import linalg,dot
from textprocess.transform.transform import Transform

class LSA(Transform):
    def transform(self, dimensions=1):
        rows, cols = self.matrix.shape

        if dimensions <= rows:
            u, sigma, vt = linalg.svd(self.matrix)

            for index in range(rows - dimensions, rows):
                sigma[index] = 0

            transformed_matrix = dot(dot(u, linalg.diagsvd(sigma, len(self.matrix), len(vt))), vt)

            return transformed_matrix

        else:
            print('dimension reductions cannot be greater than ', rows) 
