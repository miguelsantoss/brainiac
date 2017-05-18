#ifndef _TFIDF_H_
#define _TFIDF_H_

#include <vector>
#include <string>
#include <map>

class tfidf {
  private:
    std::vector<std::string> files_;
    std::vector<std::map<std::string, int32_t>> wordListByFile_;
    std::vector<std::map<std::string, double>> TFMatrix_;
    std::vector<int32_t> numWords_;
    std::map<std::string, int32_t> filesWithWord_;
    std::map<std::string, int32_t> wordList_;
    std::vector<std::map<std::string, double>> wordMatrix_;
    std::vector<std::string> wordVector_;
    std::vector<std::string> stopWords_;

    std::string readFileText(std::string const & filename);
    std::vector<std::string> tokenize(std::string& str, bool removeStopWords);
    void filesToVectors();
    void loadStopWords();

  public:
    uint16_t numDocs_;

    tfidf(std::vector<std::string> const & filename);
};

#endif // _TFIDF_H_
