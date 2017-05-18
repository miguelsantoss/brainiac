#include <iostream>
#include <vector>
#include <string>

#include "tfidf.h"

int main(int argc, char *argv[]) {
  if(argc <= 1) {
    std::cout << "Not enough arguments." << std::endl;
    return 0;
  }
  std::vector<std::string> files;
  for(int i = 1; i < argc; i++) {
    files.push_back(argv[i]);
  }

  tfidf doc(files);

  return 0;
}
