APPNAME=tfidf
CC=gcc
CXX=g++
RM=rm -f
CPPFLAGS=-g -Wall -pthread -std=c++0x
LDFLAGS=-g -Wall -pthread -std=c++0x
LDLIBS=

SRCS=main.cc tfidf.cc
OBJS=$(subst .cc,.o,$(SRCS))

all: main

main: $(OBJS)
	    $(CXX) $(LDFLAGS) -o $(APPNAME)  $(OBJS) $(LDLIBS) 

depend: .depend

.depend: $(SRCS)
	    $(RM) ./.depend
			    $(CXX) $(CPPFLAGS) -MM $^>>./.depend;

clean:
	    $(RM) $(OBJS) $(APPNAME)

distclean: clean
	    $(RM) *~ .depend

include .depend
