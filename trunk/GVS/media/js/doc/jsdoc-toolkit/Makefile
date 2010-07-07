all: doc

doc:
	java -jar jsrun.jar app/run.js -r -t=templates/jsdoc/ -c=conf/sample.conf ../../gvs/ -d=../api/

help:
	java -jar jsrun.jar app/run.js --help

fastAPI:
	java -jar jsrun.jar app/run.js -r -t=templates/jsdoc/ -c=conf/fastAPI.conf ../../../gadget/js/fastAPI/fastAPI.js -d=../../../gadget/doc/fastAPI

