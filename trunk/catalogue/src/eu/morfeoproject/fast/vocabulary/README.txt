######################
VocabularyWriter Usage
######################

VocabularyWriter -i <inputrdfsfile> -o <outputdir> 
--package <packagename> -a <namespace> -n <nameofjavafile>
-namespacestrict <false|true>
 
-namespacestrict If true, only elements from within the namespace (-a)
are generated. Default false.
 
Example values
--------------
--package eu.morfeoproject.fast.vocabulary
-o src/eu/morfeoproject/fast/vocabulary/
-i examples/screen.rdf
-a http://www.deri.org/fast/screen#
-n FCO