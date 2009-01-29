/**
 * 
 */
package eu.morfeoproject.fast.services.rdfrepository;

import java.util.List;

import org.ontoware.rdf2go.exception.MalformedQueryException;
import org.ontoware.rdf2go.exception.QueryLanguageNotSupportedException;
import org.ontoware.rdf2go.exception.SyntaxNotSupportedException;

/**
 * <h1>The Nepomuk RDF Repository Service</h1>
 * This is the interface to the Nepomuk desktop RDF repository. In this
 * repository, users can store their private RDF data. The repository supports
 * multiple repository-ids inside, each repository is a named-graph aware
 * quadstore. The most important repository-ids are "main" for the main data
 * repository and "config" for Nepomuk configuration data.
 * 
 * <h2><a name="querytimeout">Non-blocking queries and timeouts</a></h2>
 * <p>
 * The result of a query can be large. If you are accessing the RDF repository
 * using a SOAP connection or another remote protocol, you can retrieve the
 * results in sets, to start using the first results while waiting for more to
 * come. The methods <code>query****</code> support this mode. You pass in a
 * query and a timeout and the server will keep the query-results in a buffer,
 * for you to retrieve.<br>
 * The <b>timeout</b> is passed in milliseconds, the server will keep the query
 * open for this amount of milliseconds. If you call a <code>fetch***</code>
 * method, the server will start this timeout again. Passing <code>0</code> as
 * a timeout instructs the server to keep the query "as long as possible", which
 * can be an hour or 10 minutes, that is up to the implementation. The constant
 * {@link #DEFAULT_TIMEOUT} can be used as a default timeout for most cases.
 * <br/> All queries can be closed prematurely using {@link #closeQuery(int)}.
 * </p>
 * 
 * <h2><a name="querylang">Query Languages</a></h2>
 * <p>
 * The store can support one or more query languages. The following strings are
 * used to identify them:
 * <ul>
 * <li>sparql - as defined by <a
 * href="http://www.w3.org/TR/rdf-sparql-query/">W3C SPARQL</a></li>
 * <li>serql - <a
 * href="http://www.openrdf.org/doc/sesame/users/ch06.html">Sesame RDF Query
 * Language</a></li>
 * <li>rdql - <a href="http://www.w3.org/Submission/RDQL/">RDF Data Query
 * Language</a></li>
 * </ul>
 * </p>
 * 
 * <h2><a name="repositoryId">Repository-Ids</a></h2>
 * <p>
 * The RDF service hosts multiple RDF databases, called "repositories". In each
 * repository, there are separate features available (how to store the data,
 * inference, text search support). We support two pre-configured repositories
 * out of the box:
 * <ul>
 * <li>main - the ontology store containing NRL, DEO, DAO, PIMO, etc. most
 * annotations go here. crawled resources gathered by the DataWrapper are stored
 * here</li>
 * <li>config - configuration data needed by services</li>
 * </ul>
 * More repositories can be added and removed.
 * </p>
 * 
 * <h2><a name="rdfmime">RDF Mime/Type</a></h2>
 * <p>
 * The format of the serialisation, possible values are
 * <ul>
 * <li>application/rdf+xml - rdf/xml</li>
 * <li>application/x-turtle - Turtle</li>
 * <li>text/rdf+n3 - N3</li>
 * <li>application/trix - TRIX</li>
 * </ul>
 * </p>
 * 
 * <h2><a name="valueser">Value Serialization</a></h2>
 * <p>
 * RDF Values are serialized according to a special magic that we defined. This
 * is needed for passing back select results. Our serialization works like this:
 * <ul>
 * <li>an uri, string contains the uri. "http://www.example.com"</li>
 * <li>a bnode, string contains the bnode-id in brackets. "(node123123)"</li>
 * <li>a literal, string contains the literal in hyphens: ""a literal""</li>
 * </ul>
 * If you wonder why we didn't use structured types: the reason is because the
 * serialization is already taking much space using SOAP, so keeping RDF values
 * in strings is a fallback.
 * </p>
 * 
 * <h2><a name="tripleser">Triples as lists</a></h2>
 * <p>
 * Triples are serialized as lists of maps. Each map represents one triple, the
 * content of the map is similar to the add/remove/queryFind interfaces:<br/>
 * <b>Map of a triple</b>:
 * <ul>
 * <li>s = subject, serialized using value serialization.</li>
 * <li>p = predicate, the URI.</li>
 * <li>o = object is a resource, serialized using value serialization. (only o
 * or l can be set)</li>
 * <li>l = object is a literal, this is the literal value. (only o or l can be
 * set)</li>
 * <li>d = datatype of the literal, optional</li>
 * <li>lang = language of the literal, optional</li>
 * <li>c = context of the triple, optional</li>
 * </ul>
 * 
 * </p>
 * This api was created in a community process within Nepomuk's Task Force
 * for RDF Apis.
 * 
 * @author grimnes
 * @author sauermann
 * @author trueg
 */
public interface RDFRepository extends RDFRepositoryCommon {

	public static final String WSDL_TYPE="http://www.semanticdesktop.org/wsdl/2007/09/14/rdfrepository.wsdl";
	
    /**
     * Default size for query results. This is a value that should give a good
     * tradeoff between communication overhead and result size.
     */
    public static final int DEFAULT_SIZE = 300;

    /**
     * Default timeout for queries. 1 Minute. In some cases, this long period
     * may be needed to evaluate very complex queries, so we recommend it as a
     * default timeout.
     */
    public static final int DEFAULT_TIMEOUT = 60 * 1000;
    
    /**
     * add a crawled resource to the repository. Used by the DataWrapper
     * components. The data will be added to the main repository,
     * fulltext-indexing is optimized for this method.
     * @param resourceUri
     *            The URI of the resource that was crawled
     * @param datasourceUri 
     *            The URI of the datasource where this resource came from.
     * @param statements 
     *            Description of the resource as statements
     * @throws RepositoryStorageException
     *             if the data cannot be added due to an error while
     *             storing.
     */
    public void addCrawledResource(String resourceUri,
        String datasourceUri, List<Statement> statements) 
        throws RepositoryStorageException; 
    
    /**
     * add a crawled resource to the repository. Used by the DataWrapper
     * components. The data will be added to the main repository,
     * fulltext-indexing is optimized for this method.
     * @param resourceUri
     *            The URI of the resource that was crawled
     * @param datasourceUri 
     *            The URI of the datasource where this resource came from.
     * @param graph 
     *            The description of the resource to add, serialised as string
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            of the string.
     * @throws RepositoryStorageException
     *             if the data cannot be added due to an error while
     *             storing.
     * @throws SyntaxNotSupportedException
     *             if the formatMimetype is not supported
     */
    public void addCrawledResourceGraph(String resourceUri,
        String datasourceUri,
        String graph, String formatMimetype) throws RepositoryStorageException, SyntaxNotSupportedException; 
    
    /**
     * Add an RDF graph to a repository.
     * 
     * @param graph -
     *            The RDF graph to add, serialised as string
     * @param formatMimetype
     *            the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            of the string.
     * @param repositoryId -
     *            The <a href="#repositoryId">repositoryId</a> to add to
     * @param contextUri -
     *            The context to add to. If the mimetype is a context-aware
     *            serialization, this can be null. If you set the contextUri,
     *            and use a context-aware serialization, the context of the
     *            serialized triples will be lost.
     * @throws SyntaxNotSupportedException
     *             if the formatMimetype is not supported
     * @throws RepositoryStorageException
     *             if the data cannot be added due to an error while
     *             storing.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories  
     * @throws Exception if the graph serialisation is broken or if
     *             the contexturi is not a URI
     */
    public void addGraph(String repositoryId, String graph,
            String formatMimetype, String contextUri) 
        throws RepositoryStorageException, RepositoryNotFoundException, 
        SyntaxNotSupportedException,
        Exception;
    
    /**
     * Add a statement to a repository.
     * 
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>.
     * @param statement
     *            The statement to add. Context of the statement must be a
     *            URI-Node or an empty Node. If empty, then the NRL-default
     *            graph URI will be used.
     * @throws RepositoryStorageException
     *             if the statement cannot be added due to an error while
     *             storing.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public void addStatement(String repositoryId, Statement statement)
            throws RepositoryStorageException, RepositoryNotFoundException;
    
    /**
     * Add a list of statements to a repository.
     * 
     * @param statements
     *            a list of statements
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>
     * @throws RepositoryStorageException
     *             if the data cannot be stored
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public void addStatements(String repositoryId, List<Statement> statements)
            throws RepositoryStorageException, RepositoryNotFoundException;


    /**
     * Run a <a href="http://www.w3.org/TR/rdf-sparql-query/#ask">sparql ASK
     * query</a>. Result is either 1 (=true) or 0 (=false)
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            sparql ASK query
     * @return the query result 1 (=true) or 0 (=false)
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public int askSparql(String repositoryId, String query) 
        throws MalformedQueryException, RepositoryNotFoundException;

    /**
     * close this query.
     * 
     * If further results are not needed a client may use this method to close
     * the query and let the repository free resources related to this query id.
     * 
     * @param queryId
     *            identifying the query, a result of the <code>query***</code>
     *            methods.
     * @throws UnknownQueryIdException 
     *              if this query was closed before.
     */
    public void closeQuery(int queryId) throws UnknownQueryIdException;

    /**
     * Execute a construct query on a specific repository.
     * 
     * Caution: If you expect the result to contain many triples, use
     * queryConstruct instead.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search.
     * @param query
     *            A construct query string.
     * @param querylanguage
     *            The language query is written in.
     * 
     * @return a list of statements matching the query.
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public List<Statement> construct(String repositoryId, String query,
            String querylanguage)
            throws MalformedQueryException, RepositoryNotFoundException,
            QueryLanguageNotSupportedException;
    
    /**
     * Execute a construct query on a specific repository.
     * Return the result as a serialized RDF string.
     * 
     * Caution: If you expect the result to contain many triples, use
     * queryConstruct instead.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search.
     * @param query
     *            A construct query string.
     * @param querylanguage
     *            The language query is written in.
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            for the returned string.
     * @return a list of statements matching the query, serialized in the string 
     *  according to the mimetype
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public String constructSerialized(String repositoryId, String query,
            String querylanguage, String formatMimetype)
            throws MalformedQueryException, RepositoryNotFoundException,
            QueryLanguageNotSupportedException;

    /**
     * Execute a construct SPARQL query on a specific repository.
     * 
     * Caution: If you expect the result to contain many triples, use
     * queryConstructSparql instead.
     * 
     * @param repositoryId
     *            The name of the %RDF repository to search.
     * @param query
     *            A SPARQL construct query string.
     * 
     * @return a list of statements matching the query.
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public List<Statement> constructSparql(String repositoryId, String query)
            throws RepositoryNotFoundException,MalformedQueryException;

    /**
     * Check if the RDF store contains statement. If the statement contains null
     * nodes, the rest will be matched and the null nodes are wildcards.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search
     * @param statement
     *            The statement to match.
     * @return 1 if the repository referenced by repositoryId contains
     *         statement, 0 if statement could not be found
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public int contains(String repositoryId, Statement statement)
        throws RepositoryNotFoundException;

    /**
     * Run a <a href="http://www.w3.org/TR/rdf-sparql-query/#describe">sparql
     * describe query</a>. Result is a graph, as defined in the spec.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            sparql DESCRIBE query
     * @return the query result
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public List<Statement> describeSparql(String repositoryId, String query)
        throws MalformedQueryException, RepositoryNotFoundException;
    
    /**
     * Run a <a href="http://www.w3.org/TR/rdf-sparql-query/#describe">sparql
     * describe query</a>. Result is a graph, as defined in the spec.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            sparql DESCRIBE query
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            for the returned string.
     * @return a list of statements matching the query, serialized in the string 
     *  according to the mimetype
     * @throws MalformedQueryException
     *            if the query string could not be parsed
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public String describeSparqlSerialized(String repositoryId, String query,
        String formatMimetype)
        throws MalformedQueryException, RepositoryNotFoundException;

    /**
     * Return a list of statements that are the result of a CONSTRUCT query
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the size of the returned List. a value between 100 and 1000 is
     *            recommended, if you are unsure, use the {@link #DEFAULTSIZE}
     * @return a list of result statements. If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public List<Statement> fetchConstructResults(int queryId, int size)
            throws RepositoryStorageException, UnknownQueryIdException;
    
    /**
     * Return a list of statements that are the result of a CONSTRUCT query
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the size of the returned List. a value between 100 and 1000 is
     *            recommended, if you are unsure, use the {@link #DEFAULTSIZE}
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            for the returned string.
     * @return a list of result statements, serialized as string. 
     *         If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public String fetchConstructResultsSerialized(int queryId, int size, 
        String formatMimetype)
        throws RepositoryStorageException, UnknownQueryIdException;

    /**
     * Return a list of statements that are the result a DESCRIBE query,
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the maximum size of the returned List. a value between 100 and
     *            1000 is recommended, if you are unsure, use the
     *            {@link #DEFAULTSIZE}
     * @return a list of result statements. If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public List<Statement> fetchDescribeResults(int queryId, int size)
        throws RepositoryStorageException, UnknownQueryIdException;
    
    /**
     * Return a list of statements that are the result a DESCRIBE query,
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the maximum size of the returned List. a value between 100 and
     *            1000 is recommended, if you are unsure, use the
     *            {@link #DEFAULTSIZE}
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            for the returned string.
     * @return a list of result statements, serialized as string. 
     *         If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public String fetchDescribeResultsSerialized(int queryId, int size,
        String formatMimetype)
    throws RepositoryStorageException, UnknownQueryIdException;


    /**
     * Return a list of statements that are the result of a ListStatements query
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the size of the returned List. a value between 100 and 1000 is
     *            recommended, if you are unsure, use the {@link #DEFAULTSIZE}
     * @return a list of result statements. If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * 
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public List<Statement> fetchListStatementResults(int queryId, int size)
            throws RepositoryStorageException, UnknownQueryIdException;
    
    /**
     * Return a list of statements that are the result of a ListStatements query
     * identified by the passed queryId. The size indicates how many statements
     * should be returned. When the size of the returned List is smaller than
     * the size parameter, the result has reached the end. Pass 0 to return all
     * remaining statements, this can block I/O. Call {@link #closeQuery(int)}
     * after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the size of the returned List. a value between 100 and 1000 is
     *            recommended, if you are unsure, use the {@link #DEFAULTSIZE}
     * @param formatMimetype the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            for the returned string.
     * @return a list of result statements, serialized as string. If the size of the returned List is
     *         smaller than the max, all statements have been listed and the
     *         query id will be invalidated.
     * 
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public String fetchListStatementResultsSerialized(int queryId, int size,
        String formatMimetype)
    throws RepositoryStorageException, UnknownQueryIdException;

    /**
     * Return a query-result-table containing result bindings of the SELECT
     * query identified by the passed queryId. The size indicates how many
     * bindings (rows) should be returned. When the size of the returned
     * {@link QueryResultTable} is smaller than the size parameter, the result
     * has reached the end. Pass 0 to return all remaining bindings, this can
     * block I/O. Call {@link #closeQuery(int)} after the last query result.
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the maximum size of the returned table. a value between 100
     *            and 1000 is recommended, if you are unsure, use the
     *            {@link #DEFAULTSIZE}
     * @return a list of result bindings packed into a QueryResultTable. If the
     *         size of the returned List is smaller than the max size, all
     *         bindings have been listed and the query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public QueryResultTable fetchSelectResults(int queryId, int size)
        throws RepositoryStorageException, UnknownQueryIdException;
    
    /**
     * Return a query-result-table containing result bindings of the SELECT
     * query identified by the passed queryId. The size indicates how many
     * bindings (rows) should be returned. When the size of the returned
     * {@link QueryResultTable} is smaller than the size parameter, the result
     * has reached the end. Pass 0 to return all remaining bindings, this can
     * block I/O. Call {@link #closeQuery(int)} after the last query result.
     * 
     * The result format is the XML format as defined by W3C's SPARQL
     * standard. see http://www.w3.org/TR/rdf-sparql-XMLres/
     * 
     * @param queryId
     *            the queryId to fetch.
     * @param size
     *            the maximum size of the returned table. a value between 100
     *            and 1000 is recommended, if you are unsure, use the
     *            {@link #DEFAULTSIZE}
     * @return a list of result bindings, serialized as <a href="http://www.w3.org/TR/rdf-sparql-XMLres/">SPARQL XML result</a>. If the
     *         size of the returned List is smaller than the max size, all
     *         bindings have been listed and the query id will be invalidated.
     * @throws RepositoryStorageException
     *             If the query cannot be continued. This can happen when
     *             someone else tries to write to the repository and there is a
     *             problem with read/write locking.
     * @throws UnknownQueryIdException
     *             if the queryId is unknown or the query has timed out.
     */
    public String fetchSelectResultsSerialized(int queryId, int size)
    throws RepositoryStorageException, UnknownQueryIdException;

    /**
     * Get the size in triples of the passed repository. Results are fuzzy, the
     * result x: x &gt;= count(explicittriples). x &lt;= count(explicittriples +
     * inferredtriples).
     * 
     * @param repositoryId
     *            the repository id to get the size of
     * @return the size
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public int getRepositorySize(String repositoryId)
            throws RepositoryNotFoundException;

    /**
     * Retrieve a list of statements. The passed statement serves as a query for
     * statements that should be returned. If you expect the result to contain
     * many triples, use {@link #queryListStatement(String, Statement, int)}
     * instead.
     * 
     * @param repositoryId
     *            id of the repository
     * @param statement
     *            Defines the query by setting one or more of the Nodes to type
     *            Null. The result will then contain all the statements that
     *            match the defined Nodes.
     * @return a list of statements that match the passed query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public List<Statement> listStatements(String repositoryId,
            Statement statement) throws RepositoryNotFoundException;


    /**
     * Executes the given query in the given repository and returns a queryId
     * object providing access to all found entities. Use
     * {@link #fetchConstructResults(int, int)} to retrieve the results. Call
     * {@link #closeQuery(int)} when all results are fetched or you abort
     * fetching them.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            The construct query string.
     * @param querylanguage
     *            the <a href="#querylang">query language</a>
     * @param timeoutMSec
     *            timeout in milliseconds. see <a
     *            href="#querytimeout">non-blocking queries and timeouts</a>.
     * @return a queryId identifying the query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws MalformedQueryException
     *             if the query string could not be parsed
     */
    public int queryConstruct(String repositoryId, String query,
            String querylanguage, int timeoutMSec)
            throws RepositoryNotFoundException,
            QueryLanguageNotSupportedException, MalformedQueryException;

    /**
     * Executes the given query in the given repository and returns a queryId
     * object providing access to all found entities. Use
     * {@link #fetchConstructResults(int, int)} to retrieve the results. Call
     * {@link #closeQuery(int)} when all results are fetched or you abort
     * fetching them.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            The SPARQL construct query string.
     * @param timeoutMSec
     *            timeout in milliseconds. see <a
     *            href="#querytimeout">non-blocking queries and timeouts</a>.
     * @return a queryId identifying the query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws MalformedQueryException
     *             if the query string could not be parsed
     */
    public int queryConstructSparql(String repositoryId, String query,
            int timeoutMSec) throws RepositoryNotFoundException,
            MalformedQueryException;

    /**
     * Run a <a href="http://www.w3.org/TR/rdf-sparql-query/#describe">sparql
     * describe query</a>. Result is a queryId, use fetchDescribeResults() to
     * get the results
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            sparql DESCRIBE query
     * @param timeoutMSec
     *            timeout in milli-seconds. The query will be automatically
     *            closed on the server after this timeout. Use 0 to indicate
     *            that the server should keep this query open as long as
     *            possible, note that the server can then decide to close the
     *            query anytime when too many queries are open.
     * @return a queryId. use fetchDescribeResults() to get the results
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws MalformedQueryException
     *             if the query string could not be parsed 
     */
    public int queryDescribeSparql(String repositoryId, String query,
            int timeoutMSec) throws RepositoryNotFoundException,
            MalformedQueryException;

    /**
     * Retrieve a list of statements. The passed statement serves as a query for
     * statements that should be returned. The results of this command can then
     * be retrieved using the {@link #fetchListStatementResults(int, int)}
     * command, using the returned queryId. Call {@link #closeQuery(int)} when
     * all results are fetched or you abort fetching them.
     * 
     * @param repositoryId
     *            id of the repository
     * @param statement
     *            Defines the query by setting one or more of the Nodes to type
     *            NodeUnknown. The result will then contain all the statements
     *            that match the defined Nodes.
     * @param timeoutMSec
     *            timeout in milliseconds. see <a
     *            href="#querytimeout">non-blocking queries and timeouts</a>.
     * @return a queryId identifying the query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     */
    public int queryListStatement(String repositoryId, Statement statement,
            int timeoutMSec) throws RepositoryNotFoundException;

    /**
     * Executes the given query in the given repository and returns a queryId
     * object providing access to all found entities. Use
     * {@link #fetchSelectResults(int, int)} to retrieve the results. Call
     * {@link #closeQuery(int)} when all results are fetched or you abort
     * fetching them.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            The select query string.
     * @param querylanguage
     *            the <a href="#querylang">query language</a>
     * @param timeoutMSec
     *            timeout in milliseconds. see <a
     *            href="#querytimeout">non-blocking queries and timeouts</a>.
     * @return a queryId identifying the query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws MalformedQueryException
     *             if the query string could not be parsed
     */
    public int querySelect(String repositoryId, String query,
            String querylanguage, int timeoutMSec)
            throws RepositoryNotFoundException,
            QueryLanguageNotSupportedException, MalformedQueryException;

    /**
     * Executes the given query in the given repository and returns a queryId
     * object providing access to all found entities. Use
     * {@link #fetchSelectResults(int, int)} to retrieve the results. Call
     * {@link #closeQuery(int)} when all results are fetched or you abort
     * fetching them.
     * 
     * @param repositoryId
     *            id of the repository
     * @param query
     *            The SPARQL select query string.
     * @param timeoutMSec
     *            timeout in milliseconds. see <a
     *            href="#querytimeout">non-blocking queries and timeouts</a>.
     * @return a queryId identifying the query.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws MalformedQueryException
     *             if the query string could not be parsed
     */
    public int querySelectSparql(String repositoryId, String query,
            int timeoutMSec) throws RepositoryNotFoundException,
            MalformedQueryException;

    /**
     * Remove all the resources crawled from this particular datasource
     * @param datasourceUri
     *              Resources crawled from this datasource should be removed   
     * @return 1 if something was deleted, 0 if the datasource was unknown
     * @throws RepositoryStorageException 
     *              if the triples cannot be removed
     */
    public int removeAllResourcesOfDataSource(String datasourceUri) 
        throws RepositoryStorageException;

    /**
     * Remove all statements matching statement. Null nodes will be used as
     * wildcards.
     * 
     * @param repositoryId
     *            id of the repository
     * @param statement
     *            the statement to use as filter
     * @return the number of removed statements.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws RepositoryStorageException
     *             if the data cannot be removed
     */
    public int removeAllStatements(String repositoryId, Statement statement)
            throws RepositoryNotFoundException, RepositoryStorageException;

    /**
     * Remove the context from the repository. It does not throw an exception if
     * the context does not exist.
     * 
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>
     * @param contextUri
     *            the context to remove.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws RepositoryStorageException
     *             if the data cannot be removed
     */
    public void removeContext(String repositoryId, String contextUri)
            throws RepositoryNotFoundException, RepositoryStorageException;

    /**
     * Remove the crawled resource, identified by the passed URI, from the store. 
     * @param resourceUri 
     *              the URI of the resource that should be removed
     * @return 1 if the resource was removed, 0 if no data was found
     * @throws RepositoryStorageException 
     *              if the triples cannot be removed
     */
    public int removeCrawledResource(String resourceUri) throws RepositoryStorageException;

    /**
     * Remove the crawled resources, identified by the passed URIs, from the store. 
     * @param resourceUris
     *              A list of resources that should be removed
     * @return number of removed resources.
     * @throws RepositoryStorageException 
     *              if the triples cannot be removed
     */
    public int removeCrawledResources(List<String> resourceUris) throws RepositoryStorageException;

    /**
     * Remove an RDF graph from a repository.
     * 
     * @param graph -
     *            The RDF graph to remove, serialised as string
     * @param formatMimetype
     *            the <a href="#rdfmime">rdf mimetype</a> serialization format
     *            of the string.
     * @param repositoryId -
     *            The <a href="#repositoryId">repositoryId</a> to add to
     * @param contextUri -
     *            The context to add to. If the mimetype is a context-aware
     *            serialization, this can be null. If you set the contextUri,
     *            and use a context-aware serialization, the context of the
     *            serialized triples will be lost.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws SyntaxNotSupportedException
     *             if the formatMimetype is not supported             
     * @throws Exception
     *             if the graph serialisation is broken or if
     *             the contexturi is not a URI
     */
    public void removeGraph(String repositoryId, String graph,
            String formatMimetype, String contextUri) throws 
            RepositoryNotFoundException, SyntaxNotSupportedException,
            Exception;

    /**
     * Remove a statement from a particular repository using a direct matching,
     * i.e. null nodes will not be used as wildcards.
     * 
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>.
     * @param statement
     *            The statement to remove. Context of the statement must be a
     *            URI-Node or an empty Node. If empty, then the NRL-default
     *            graph URI will be used.
     * @return the number of removed statements.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws RepositoryStorageException
     *             if the data cannot be removed
     */
    public int removeStatement(String repositoryId, Statement statement)
            throws RepositoryNotFoundException, RepositoryStorageException;

    /**
     * Remove a list of statements from a particular repository using a direct
     * matching, i.e. null nodes will not be used as wildcards.
     * 
     * @param statements
     *            a list of statements
     * @param repositoryId
     *            the <a href="#repositoryId">repositoryId</a>
     * @return the number of removed statements.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws RepositoryStorageException
     *             if the data cannot be removed
     */
    public int removeStatements(String repositoryId, List<Statement> statements)
            throws RepositoryNotFoundException, RepositoryStorageException;

    /**
     * Execute a select query on a specific repository.
     * 
     * Caution: If you expect the result to contain many triples, use
     * querySelect instead.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search.
     * @param query
     *            A select query string.
     * @param querylanguage
     *            The language query is written in.
     * 
     * @return a list of result bindings packed into a QueryResultTable.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws MalformedQueryException
     *             if the query string could not be parsed 
     */
    public QueryResultTable select(String repositoryId, String query,
            String querylanguage) throws RepositoryNotFoundException,
            QueryLanguageNotSupportedException, MalformedQueryException;
    
    /**
     * Execute a select query on a specific repository.
     * The result format is the XML format as defined by W3C's SPARQL
     * standard. see http://www.w3.org/TR/rdf-sparql-XMLres/
     * 
     * Caution: If you expect the result to contain many triples, use
     * querySelect instead.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search.
     * @param query
     *            A select query string.
     * @param querylanguage
     *            The language query is written in.
     * 
     * @return a list of result bindings, serialized as <a href="http://www.w3.org/TR/rdf-sparql-XMLres/">SPARQL XML result</a>. 
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws QueryLanguageNotSupportedException
     *             if the query language is not supported
     * @throws MalformedQueryException
     *             if the query string could not be parsed 
     */
    public String selectSerialized(String repositoryId, String query,
        String querylanguage) throws RepositoryNotFoundException,
        QueryLanguageNotSupportedException, MalformedQueryException;

    /**
     * Execute a select SPARQL query on a specific repository.
     * 
     * Caution: If you expect the result to contain many triples, use
     * querySelectSparql instead.
     * 
     * @param repositoryId
     *            The name of the RDF repository to search.
     * @param query
     *            A SPARQL select query string.
     * 
     * @return a list of result bindings packed into a QueryResultTable.
     * @throws RepositoryNotFoundException
     *             if the repositoryId is not in the list of defined
     *             repositories
     * @throws MalformedQueryException
     *             if the query string could not be parsed
     */
    public QueryResultTable selectSparql(String repositoryId, String query);

}
