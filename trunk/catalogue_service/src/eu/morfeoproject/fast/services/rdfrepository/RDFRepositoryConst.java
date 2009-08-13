/**
 * 
 */
package eu.morfeoproject.fast.services.rdfrepository;

/**
 * Constants for the RDFRepository interface.
 * @author sauermann
 *
 */
public interface RDFRepositoryConst {
    /**
     * A Blank RDF blank node
     */
    public static final int BLANK = 3;
    /**
     * A RDF Literal
     */
    public static final int LITERAL = 2;
    /**
     * nodes of this type are NULL/EMPTY.
     * They can be used as a wildcard ("*") for searches.
     */
    public static final int NULLNODE = 0;
    
    /**
     * an RDF URI Reference
     */
    public static final int URI = 1;
    
    /**
     * singleton nullnode for reuse
     */
    public static final Node NULL = new Node(null, NULLNODE);

}
