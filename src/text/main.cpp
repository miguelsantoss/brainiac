#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <streambuf>

int main(int argc, char *argv[]) {
  if(argc <= 1) {
    std::cout << "Not enough arguments." << std::endl;
    return 0;
  }
  std::vector<std::string> files;
  for(int i = 1; i < argc; i++) {
    files.push_back(argv[i]);
  }
	
	std::ifstream t(files[0].c_str());
	std::string str;

	t.seekg(0, std::ios::end);
	str.reserve(t.tellg());
	t.seekg(0, std::ios::beg);

  str.assign((std::istreambuf_iterator<char>(t)), std::istreambuf_iterator<char>());
  std::cout << str << std::endl;

}
