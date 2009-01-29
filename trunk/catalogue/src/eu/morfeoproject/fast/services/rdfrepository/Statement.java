package eu.morfeoproject.fast.services.rdfrepository;

/**
 * RDF Statements, with context.
 * 
 *  The context is added because find()... queries can return context-aware
 *  statements, then the context is needed.
 * @author sauermann
 */
public class Statement {
    
    /**
     * helper: create a new statement with a literal object
     * @param subjectUri uri of subject 
     * @param predicateUri uri of predicate 
     * @param literal literal value
     * @param contextUri uri of context 
     * @return the statement
     */
    public static Statement createStatementLiteral(
        String subjectUri,String predicateUri, String literal, String contextUri)
    {
        return new Statement(
            Node.createURI(subjectUri),
            Node.createURI(predicateUri),
            Node.createLiteral(literal),
            Node.createURI(contextUri)
        );
    }
    
    /**
     * helper: create a new statement with a literal object and datatype
     * @param subjectUri uri of subject 
     * @param predicateUri uri of predicate 
     * @param literal literal value
     * @param datatypeUri datatype uri
     * @param contextUri uri of context 
     * @return the statement
     */
    public static Statement createStatementLiteralWithDataType(
        String subjectUri,String predicateUri, String literal, String datatypeUri, String contextUri)
    {
        return new Statement(
            Node.createURI(subjectUri),
            Node.createURI(predicateUri),
            Node.createLiteralWithDataType(literal, datatypeUri),
            Node.createURI(contextUri)
        );
    }
    
    /**
     * helper: create a new statement with a literal object and language
     * @param subjectUri uri of subject 
     * @param predicateUri uri of predicate 
     * @param literal literal value
     * @param languageTag language (en, de, ..)
     * @param contextUri uri of context 
     * @return the statement
     */
    public static Statement createStatementLiteralWithLanguage(
        String subjectUri,String predicateUri, String literal, String languageTag, String contextUri)
    {
        return new Statement(
            Node.createURI(subjectUri),
            Node.createURI(predicateUri),
            Node.createLiteralWithLanguage(literal, languageTag),
            Node.createURI(contextUri)
        );
    }
    
    /**
     * helper: create a new statement with an object-URI
     * @param subjectUri uri of subject 
     * @param predicateUri uri of predicate 
     * @param objectUri uri of object 
     * @param contextUri uri of context 
     * @return the statement
     */
    public static Statement createStatementResource(
        String subjectUri,String predicateUri, String objectUri, String contextUri)
    {
        return new Statement(
            Node.createURI(subjectUri),
            Node.createURI(predicateUri),
            Node.createURI(objectUri),
            Node.createURI(contextUri)
        );
    }
    
    
    /**
     * helper: create a new statement with an object-node
     * @param subjectUri uri of subject 
     * @param predicateUri uri of predicate 
     * @param object object
     * @param contextUri uri of context 
     * @return the statement
     */
    public static Statement createStatementNode(
        String subjectUri,String predicateUri, Node object, String contextUri)
    {
        return new Statement(
            Node.createURI(subjectUri),
            Node.createURI(predicateUri),
            object,
            Node.createURI(contextUri)
        );
    }

    /**
     * must be an URI or a Node of type {@link Node#NULLNODE}.
     * Nepomuk discourages blank nodes as Context,
     * see NRL.
     */
    Node contextUri;

    Node object;

    Node predicate;
    
    Node subject;
    
    /**
     * Create a new statement. Use the setters.
     *
     */
    public Statement() {
        // bean
    }
    
    /**
     * Create a new statement for serialization
     * @param subject subject
     * @param predicate predicate
     * @param object object
     * @param contextUri context
     */
    public Statement(Node subject, Node predicate, Node object, Node contextUri) {
        super();
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.contextUri = contextUri;
    }

    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Statement))
            return false;
        Statement s = (Statement)obj;
        return s.getSubject().equals(subject)
            && s.getPredicate().equals(predicate)
            && s.getObject().equals(object)
            && s.getContextUri().equals(contextUri);
    }

    /**
     * 
     * @return context
     */
    public Node getContextUri() {
        return contextUri;
    }

    /**
     * 
     * @return object
     */
    public Node getObject() {
        return object;
    }

    /**
     * 
     * @return predicate
     */
    public Node getPredicate() {
        return predicate;
    }

    /**
     * 
     * @return subject
     */
    public Node getSubject() {
        return subject;
    }

    /**
     * 
     * @param contextUri set context
     */
    public void setContextUri(Node contextUri) {
        this.contextUri = contextUri;
    }

    /**
     * 
     * @param object set object
     */
    public void setObject(Node object) {
        this.object = object;
    }
    
    /**
     * 
     * @param predicate set predicate
     */
    public void setPredicate(Node predicate) {
        this.predicate = predicate;
    }

    /**
     * 
     * @param subject set subject
     */
    public void setSubject(Node subject) {
        this.subject = subject;
    }
    
    @Override
    public String toString() { 
    	return String.format("(%s %s %s)",subject,predicate,object);
    }
    

}
