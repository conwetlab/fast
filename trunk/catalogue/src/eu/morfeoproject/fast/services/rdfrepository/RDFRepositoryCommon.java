package eu.morfeoproject.fast.services.rdfrepository;

import java.util.List;

/**
 * Methods shared between RDFRepository and RDF2GoRepository.
 * @author sauermann
 */
public interface RDFRepositoryCommon {
    
    /**
     * RepositoryId for the Config repository identifier.
     */
    public static final String CONFIG_REPOSITORY_ID = "config";
    
    /**
     * The uri of the default graph, as defined in NRL. If you add RDF triples
     * without specifying a graph-id, this will be used. This is defined by NRL.
     */
    public static final String DEFAULTGRAPH_URI = "DefaultGraph";//NRL.NS_NRL.toString() + "DefaultGraph";

    /**
     * RepositoryId for the Main repository identifier.
     */
    public static final String MAIN_REPOSITORY_ID = "main";
    
    /**
     * RepositoryId for the changes repository, containing changereports
     * modelled using the
     * <a href="http://www.semanticdesktop.org/ontologies/2007/10/22/changereport">
     * changereport ontology</a>.
     */
    public static final String CHANGES_REPOSITORY_ID = "changes";

    /**
     * RepositoryId for the usercontext repository, containing historical 
     * user observation data using the 
     * <a href="http://ontologies.opendfki.de/repos/ontologies/userobs/nop#">NOP format</a>
     * and (possible)
     * a representation of the current user context using 
     * <a href="http://ontologies.opendfki.de/repos/ontologies/wcon/workcontext#">UserWorkContext Ontology</a>
     * .
     */
    public static final String USERCONTEXT_REPOSITORY_ID = "usercontext";

    /**
     * RepositoryId for the localdataalignment repository, containing previously rejected 
     * hypothesis of the format defined in 
     * {@link ServerConfig} vocabulary.
     */
    public static final String LOCALDATAALIGNMENT_REPOSITORY_ID = "localdataalignment";
    
    /**
     * Mime type for N3 documents
     */
    public static final String MIME_TYPE_N3 = "text/rdf+n3";

    /**
     * Mime type for RDF/XML documents
     */
    public static final String MIME_TYPE_RDF_XML = "application/rdf+xml";

    /**
     * Mime type for Trix documents
     */
    public static final String MIME_TYPE_TRIX = "application/trix";

    /**
     * Mime type for X-Turtle documents
     */
    public static final String MIME_TYPE_TURTLE = "application/x-turtle";

    /**
     * Nepomuk-Java specific: use this global OSGI parameter to configure the
     * repositories using a config file. At the moment, the file format of this
     * file is implementation dependent.
     */
    public static final String PARAM_REPOSITORYCONFIGFILE = "org.semanticdesktop.services.rdfrepository.config";


    /**
     * Query language RDQL. <a href="http://www.w3.org/Submission/RDQL/">RDF
     * Data Query Language Documentation</a>
     */
    public static final String QUERY_RDQL = "rdql";

    /**
     * Query language SERQL. <a
     * href="http://www.openrdf.org/doc/sesame/users/ch06.html">Sesame SERQL
     * Documentation</a>
     */
    public static final String QUERY_SERQL = "serql";

    /**
     * Query language SPARQL. <a
     * href="http://www.w3.org/TR/rdf-sparql-query/">SPARQL documentation</a>
     */
    public static final String QUERY_SPARQL = "sparql";

    /**
     * create a new repository.
     * Repository Id are case-insensitive. They must not contain spaces,
     * or non ascii characters. Only allowed characters are [a-z] and "."
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>
     * @throws RepositoryStorageException
     *             if the repository was there already or if the creation of the
     *             repository failed.
     */
    public void createRepository(String repositoryId)
            throws RepositoryStorageException;

    /**
     * a test method. Because this was the first interface of Nepomuk, the test
     * method is needed for historical reasons. You can use this method to test
     * if nepomuk is running. <i>Note: if anybody thinks this method could be
     * removed, remember that moment when you weren't sure if anything at all
     * worked, and you were glad for the echo.</i>
     * 
     * @param input
     *            a string
     * @return the same string. If not the same string is returned, something
     *         with the backbone, the rdfrepository, the firewall, encoding,
     *         SOAP, or somewhere else is broken.
     */
    String echo(String input);

    /**
     * list the registered repository IDs
     * 
     * @return a list of strings identifying repositories
     */
    public List<String> listRepositoryIds();

    /**
     * Remove the repository identified by the ID. Note that you cannot remove
     * the preconfigured repositories.
     * 
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>
     * @throws RepositoryNotFoundException
     *             if the repository is not in the list of defined repositories
     * @throws RepositoryStorageException
     *             if the repository is builtin and cannot be deleted or if the
     *             repository is not deletable at the moment (perhaps because of
     *             open I/O)
     */
    public void removeRepository(String repositoryId)
            throws RepositoryNotFoundException, RepositoryStorageException;
    
    /**
     * Implementations of the query service may support multiple query
     * languages. Each implementation should at least support SPARQL. Examples
     * of query language identifiers are <a href="#querylang">listed above</a>.
     * 
     * @return A list of supported query lanaguages.
     */
    public List<String> supportedQueryLanguages();

    /**
     * Implementations of the repository service may support multiple RDF
     * serializations. Each implementation should at least support
     * application/rdf+xml.
     * 
     * @return A list of supported serialization MIME-types.
     */
    public List<String> supportedSerializations();

    /**
     * Implementations of the query service may supprot multiple query
     * languages. Each implementation should at least support SPARQL. The
     * default implementation uses supportedQueryLanguages to test for lang.
     * 
     * @param querylanguage
     *            the query language in question. Case insensitive. Examples:
     *            "sparql", "serql", "rdql"
     * @return 1 if query language lang is supported, 0 if not.
     */
    public int supportsQueryLanguage(String querylanguage);

    /**
     * Implementations of the repository service may supprot multiple RDF
     * serializations. Each implementation should at least support
     * application/rdf+xml. The default implementation uses
     * supportedSerialization to test for serializationMimeType.
     * 
     * @param serializationMimeType
     *            the serilaization in question
     * @return 1 if serialization is supported, 0 if not.
     */
    public int supportsSerialization(String serializationMimeType);

}
