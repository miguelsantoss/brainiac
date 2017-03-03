APPNAME=tfidf
CC=gcc
CXX=g++
RM=rm -f
CPPFLAGS=-g -Wall -static-libstdc++ 
LDFLAGS=-g -Wall -static-libstdc++ -lpthread -lpodofo -lfreetype -lfontconfig -ljpeg -lz
LDLIBS=

SRCS=main.cpp
OBJS=$(subst .cpp,.o,$(SRCS))

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
