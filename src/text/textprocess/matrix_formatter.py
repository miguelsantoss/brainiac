class MatrixFormatter:
    def __init__(self, matrix):
        self.matrix = matrix

    def pretty_print(self):
        out = ''
        rows, cols = self.matrix.shape

        for row in range(0, rows):
            out += '['
            for col in range(0, cols):

                out += '%0.2f '%self.matrix[row][col]
            out += ']'

        return out
