#include "tfidf.h"

#include <string>
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <algorithm>
#include <map>
#include <math.h>
#include <boost/tokenizer.hpp>


namespace stringOps {
	// 
	// 	These two functions are used to split a string into a vector of strings 
	// 	according to some given delimiter
	// 
	template<typename Out>
	void split(const std::string &s, char delim, Out result) {
	    std::stringstream ss;
	    ss.str(s);
	    std::string item;
	    while (std::getline(ss, item, delim)) {
        if(!item.empty()) {
	        *(result++) = item;
        }
	    }
	}
	
	
	std::vector<std::string> split(std::string const & s, char delim) {
	    std::vector<std::string> elems;
	    split(s, delim, std::back_inserter(elems));
	    return elems;
	}
	
	template <typename T>
	void unique_elements(std::vector<T>& vec) {   
	  std::map<T, int> m;
	  for(auto p : vec) ++m[p];
	  vec.erase(transform_if(m.begin(), m.end(), vec.begin(),
	                         [](std::pair<T,int> const& p) {return p.first;},
	                         [](std::pair<T,int> const& p) {return p.second==1;}),
	            vec.end());
	}
}

tfidf::tfidf(std::vector<std::string> const & filenames) {
  numDocs_ = filenames.size();
  files_.reserve(numDocs_);

  for(uint16_t i = 0; i < numDocs_; i++) {
    files_.push_back(readFileText(filenames[i]));
  }

  loadStopWords();
  filesToVectors();
}

std::string tfidf::readFileText(std::string const & filename) {
	std::ifstream stream(filename.c_str());
  std::string file;

	stream.seekg(0, std::ios::end);
	file.reserve(stream.tellg());
	stream.seekg(0, std::ios::beg);

  std::string temp;
  while(std::getline(stream, temp)) {
    file += temp;
  }
  return file;
}

void tfidf::loadStopWords() {
  std::string stopWordsFile = "stop_words.txt";
  std::string stop_words = readFileText(stopWordsFile);
	stopWords_ = stringOps::split(stop_words, '\n');
}

void tfidf::filesToVectors() {
  //fileVectors_.reserve(numDocs_);
  //for(uint16_t i = 0; i < numDocs_; i++) {
  //  fileVectors_.push_back(stringOps::split( files_[i], ' '));
  //}
  bool removeStopWords = false;
  
  std::vector<std::vector<std::string>> fileVectors;
  fileVectors.reserve(numDocs_);
  for(uint16_t i = 0; i < numDocs_; i++) {
    fileVectors.push_back(tokenize(files_[i], removeStopWords));
  }

  std::map<std::string, int32_t> temp;
  std::map<std::string, double> aux;
  for(uint16_t i = 0; i < fileVectors.size(); i++) {
    int32_t nWords = 0;
    wordListByFile_.push_back(temp);
    wordMatrix_.push_back(aux);
    TFMatrix_.push_back(aux);
    for(auto const & str : fileVectors[i]) {
      wordListByFile_[i][str]++;
      wordList_[str]++;
      nWords++;
      TFMatrix_[i][str]++;
    }
  
    for(auto const & key : wordListByFile_[i]) {
      filesWithWord_[key.first]++;
      TFMatrix_[i][key.first] = TFMatrix_[i][key.first] / nWords;
    }
    numWords_.push_back(nWords);
  }
  for(uint16_t i = 0; i < fileVectors.size(); i++) {
    std::cout << "file " << i << std::endl;
    for(auto const & j : fileVectors[i]) {
      std::cout << j << std::endl;
    }
    for(auto const & key : wordListByFile_[i]) {
      double idf = log10(numDocs_ / filesWithWord_[key.first]);
      wordMatrix_[i][key.first] = TFMatrix_[i][key.first] * idf;
    }
  }
  for(auto const & i : wordMatrix_) {
    for(auto const & b : i) {
      std::cout << "word: " << b.first << " " << b.second << std::endl;
    }
  }
}

std::vector<std::string> tfidf::tokenize(std::string& str, bool removeStopWords) {
  std::vector<std::string> vec;
  boost::tokenizer<> tok(str);
  for(boost::tokenizer<>::iterator it = tok.begin(); it != tok.end(); ++it) {
    if(removeStopWords && !(std::binary_search(stopWords_.begin(), stopWords_.end(), *it))) {
      vec.push_back(*it);
    }
    else if(!removeStopWords) {
      vec.push_back(*it);
    }
  }
  return vec;
}
