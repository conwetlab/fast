package eu.morfeoproject.fast.services.rdfrepository;

import static eu.morfeoproject.fast.services.rdfrepository.RDFRepositoryConst.BLANK;
import static eu.morfeoproject.fast.services.rdfrepository.RDFRepositoryConst.LITERAL;
import static eu.morfeoproject.fast.services.rdfrepository.RDFRepositoryConst.NULLNODE;
import static eu.morfeoproject.fast.services.rdfrepository.RDFRepositoryConst.URI;

/**
 * Node for SOAP serialization/RDF API.
 * 
 * This is intentionally separated from the Nodes defined by RDF2Go,
 * to allow serialization between languages that do not support object
 * orientation (such as C).
 * @author sauermann
 */
public class Node implements Comparable {
    
    
    /**
     * create a blank node
     * @param bnodeId bnode-id
     * @return the node
     */
    public static Node createBlank(String bnodeId) {
        return new Node(bnodeId, BLANK);
    }
    
    
    /**
     * create a plain literal
     * @param literalValue value
     * @return the node
     */
    public static Node createLiteral(String literalValue) {
        return new Node(literalValue, LITERAL);
    }
    
    /**
     * create a node with datatype
     * @param literalValue value
     * @param datatypeUri datatype-uri
     * @return the node
     */
    public static Node createLiteralWithDataType(String literalValue, String datatypeUri)
    {
        return new Node(literalValue, LITERAL, null, datatypeUri);
    }
    
    /**
     * create a node with language tag
     * @param literalValue value
     * @param languageTag language tag
     * @return the node
     */
    public static Node createLiteralWithLanguage(String literalValue, String languageTag)
    {
        return new Node(literalValue, LITERAL, languageTag, null);
    }
    
    /**
     * create an URI node
     * @param uri uri
     * @return the node
     */
    public static Node createURI(String uri) {
        return new Node(uri, URI);
    }

    /**
     * Datatype URI.
     * Normally one of http://www.w3.org/TR/xmlschema-2/
     */
    String datatypeUri;

    /**
     * the two-letter language tag of this Literal.
     * Optional.
     */
    String languageTag;

    /**
     * one of:
     * 
     */
    int type;

    /**
     * The lexical form of this Node
     */
    String value;

    /**
     * create an empty node
     *
     */
    public Node() {
        // bean constructor
    }

    /**
     * @param value
     * @param type
     */
    public Node(String value, int type) {
        super();
        this.value = value;
        this.type = type;
    }

    /**
     * @param value
     * @param type
     * @param languageTag
     * @param datatypeUri
     */
    public Node(String value, int type, String languageTag, String datatypeUri) {
        super();
        this.value = value;
        this.type = type;
        this.languageTag = languageTag;
        this.datatypeUri = datatypeUri;
    }

    /**
     * 
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Node))
            return false;
        Node n = (Node)obj;
        boolean equal = n.getType() == type;
        if (!equal)
            return false;
        if (value != null)
            equal = value.equals(n.value);
        else
            equal = (n.getValue() == null);
        if (!equal)
            return false;
        // literal checks
        if (type == LITERAL)
        {
            if (datatypeUri != null)
                equal = datatypeUri.equals(n.datatypeUri);
            else
                equal = n.datatypeUri == null;
            if (!equal)
                return false;
            
            if (languageTag != null)
                equal = languageTag.equals(n.languageTag);
            else
                equal = n.languageTag == null;
            if (!equal)
                return false;
        }
        return true;
    }

    /**
     * get datatype, only valid for type=LITERAL
     * @return datatype or null
     */
    public String getDatatypeUri() {
        return datatypeUri;
    }
    
    /**
     * get the language tag, only valid for type=LITERAL
     * @return language or null
     */
    public String getLanguageTag() {
        return languageTag;
    }

    /**
     * get the type. One of {@link #BLANK}, {@link #LITERAL},
     * {@link #URI}, {@link #NULLNODE}.
     * @return the type
     */
    public int getType() {
        return type;
    }
    
    /**
     * @return the valud
     */
    public String getValue() {
        return value;
    }
    
    /**
     * 
     * @param datatypeUri set the datatype
     */
    public void setDatatypeUri(String datatypeUri) {
        this.datatypeUri = datatypeUri;
    }
    
    /**
     *
     * @param languageTag set the language
     */
    public void setLanguageTag(String languageTag) {
        this.languageTag = languageTag;
    }
    
    /**
     * 
     * @param type the new type
     */
    public void setType(int type) {
        this.type = type;
    }


    /**
     * 
     * @param value the new value
     */
    public void setValue(String value) {
        this.value = value;
    }
    
    @Override
    public String toString() {
    	switch(type) {
    	case LITERAL: 
    		if (languageTag!=null)
    			return "\""+value+"\"@"+languageTag;
    		if (datatypeUri!=null)
    			return "\""+value+"\"^^"+datatypeUri;
    		return "\""+value+"\"";
    	case BLANK: 
    		return value;
    	case URI: 
    		return "<"+value+">";
    	
    	}
    	return "null";
    }

    /**
     * The hash code is used by HashMap and HashSet, without a proper hashCode method the latter is
     * not capable of detecting two objects that have the same content (and are therfore the same)
     * This hashCode method supports this.   
     */
    @Override
    public int hashCode() {
    	return this.toString().hashCode();
    }
    
    /**
     * this gives the following order to Nodes
     * 1. by type (in ordinal order)
     * 2. by value string (in alphabetical order)
     * 3. by data type string (in alphabetical order)
     * 4. by language tag sting (in alphabetical order)
     */
    public int compareTo(Object o) {
    	if(o instanceof Node) {
    		Node n = (Node)o;
    		int e = 0;
    		
    		// first compare the type
    		e = this.type - n.type;
    		if(e != 0)
    			return e;
    		
    		// now compare the value, first check if my value is null
    		if(this.value == null) {
    			if(n.value == null) {
    				return 0;
    			} else {
    				return -1;
    			}
    		}
    		e = this.value.compareTo(n.value);
    		if(e != 0)
    			return e;
    		
    		// if this is a literal, further check the datatype and the language,
    		// otherwise return the current result
    		if(this.type != RDFRepositoryConst.LITERAL)
    			return e;
    		
    		// now compare the datatype, first check if my datatype is null
    		if(this.datatypeUri == null) {
    			if(n.datatypeUri == null) {
    				return 0;
    			} else {
    				return -1;
    			}
    		}
       		e = this.datatypeUri.compareTo(n.datatypeUri);
    		if(e != 0)
    			return e;
    		
    		// now compare the language, first check if my language is null
    		if(this.languageTag == null) {
    			if(n.languageTag == null) {
    				return 0;
    			} else {
    				return -1;
    			}
    		}
       		e = this.languageTag.compareTo(n.languageTag);
   			return e;
    	}
    	
    	return -1;
    }
}
