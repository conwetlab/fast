
This is the README for the FAST Catalogue prototype! 

For more information on the project in general see: 

http://fast.morfeo-project.eu/



Installation of the Catalogue server
####################################

Place the WAR catalogue file (Catalogue-X.Y-dev.war) into the webapps Tomcat 
directory. Then the service will be up and running, and it can be access at
http://localhost:8080/Catalogue-X.Y-dev/ (depending on the Tomcat configuration).

Please, be sure you start the Tomcat service allowing encoded URLs. To do that,
add the following property using the JAVA_OPTS parameter:
-Dorg.apache.tomcat.util.buf.UDecoder.ALLOW_ENCODED_SLASH=true

The Catalogue can interact with local repositories (given a certain directory) or
with remote repositories, in this case the SPARQL endpoint is also deployed. This is
configured in the file repository.properties. Remote repositories are provided by 
the Sesame server. Instructions to install it can be found at: 
http://www.openrdf.org/doc/sesame2/2.3-pr1/users/ch06.html, and some other
configuration issues at http://www.openrdf.org/doc/sesame2/2.3-pr1/users/ch05.html.



SPARQL endpoint
###############

The SPARQL endpoint is automatically deployed when the Catalogue is configured to
work with remote repositories. The URL will be the same as the Sesame server.
Here you can find some tips to interact with it:
http://www.snee.com/bobdc.blog/2009/02/getting-started-with-sesame.html