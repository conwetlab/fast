package eu.morfeoproject.fast.services.rdfrepository;

import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;

/**
 * <p>Access to the Nepomuk RDF Repository, using the <a href="http://rdf2go.ontoware.org">RDF2Go</a> 
 * abstraction framework, allowing access to the RDF database with complex objects.
 *  
 * This is a more convenient access layer than {@link RDFRepository}.
 * 
 * @author sauermann
 */
public interface RDF2GoRepository extends RDFRepositoryCommon {
    
    /**
     * get the repository with the given ID.
     * @param repositoryId
     * @return a ModelSet containing all the named graphs of this repository
     * @throws RepositoryNotFoundException if the passed repository does not exist
     */
    public ModelSet getRepository(String repositoryId) throws RepositoryNotFoundException;
    
    /**
     * get the main repository.
     * @return the main repository.
     */
    public ModelSet getMainRepository();
    
    
    /**
     * add a crawled resource to the repository. Used by the DataWrapper
     * components. The data will be added to the main repository,
     * fulltext-indexing is optimized for this method.
     * @param resourceUri
     *            The URI of the resource that was crawled
     * @param datasourceUri 
     *            The URI of the datasource where this resource came from.
     * @param Model
     *            Description of the resource as model
     * @throws RepositoryStorageException
     *             if the data cannot be added due to an error while
     *             storing.
     */
    
    
    public void addCrawledResource(String resourceUri, String datasourceUri, Model model) 
            throws RepositoryStorageException; 
    
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
     * Remove all the resources crawled from this particular datasource
     * @param datasourceUri
     *              Resources crawled from this datasource should be removed   
     * @return 1 if something was deleted, 0 if the datasource was unknown
     * @throws RepositoryStorageException 
     *              if the triples cannot be removed
     */
    public int removeAllResourcesOfDataSource(String datasourceUri) 
        throws RepositoryStorageException;

}
