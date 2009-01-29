package eu.morfeoproject.fast.catalogue;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.util.Map;

import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.exception.LockException;
import org.ontoware.rdf2go.exception.MalformedQueryException;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.impl.AbstractModel;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.NodeOrVariable;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.ResourceOrVariable;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;

/**
 * Forwards all calls to a wrapped model. 
 * 
 * 
 * @author sauermann
 */
public class ModelWrapper extends AbstractModel implements Model {
       
    private final Model source;
   
    public ModelWrapper(Model source) {
        this.source = source;
        /**
         * set underlying model impl, fixes {@link AbstractModel#assertModel()}
         */ 
        model = source.getUnderlyingModelImplementation();
    }

    @Override
    public void addStatement(Resource subject, URI predicate, Node object) {
        source.addStatement(subject, predicate, object);
    }

    @Override
	public void close() {
		source.close();
	}

    public BlankNode createBlankNode() {
        return source.createBlankNode();
    }
   

	public BlankNode createBlankNode(String internalID) {
		return source.createBlankNode(internalID);
	}

    public void dump() {
        source.dump();
    }

    public ClosableIterator<Statement> findStatements(
        final ResourceOrVariable subject, final UriOrVariable predicate, final NodeOrVariable object) {
        
        return source.findStatements(subject, predicate, object);
        
    }

    public URI getContextURI() {
        return source.getContextURI();
    }

    public String getNamespace(String prefix) {
		return source.getNamespace(prefix);
	}

    public Map<String, String> getNamespaces() {
		return source.getNamespaces();
	}

    public boolean isIsomorphicWith(Model other) {
		return source.equals(other);
	}

    public boolean isLocked() {
        return source.isLocked();
    }

    @Override
    public boolean isOpen() {
        return source.isOpen();
    }

    public boolean isValidURI(String uriString) {
		return source.isValidURI(uriString);
	}

    public ClosableIterator<Statement> iterator() {
        return source.iterator();
    }

    public void lock() throws LockException {
        source.lock();
    }

    @Override
	public void open() {
		source.open();
		super.open();
	}

    public void readFrom(InputStream in) throws IOException {
        source.readFrom(in);
    }

    @Override
	public void readFrom(InputStream in, Syntax syntax) throws IOException,
			ModelRuntimeException {
    	source.readFrom(in, syntax);
	}

    public void readFrom(Reader in) throws IOException {
        source.readFrom(in);
    }

    public void readFrom(Reader reader, Syntax syntax) throws IOException {
        source.readFrom(reader, syntax);
    }

    public void removeNamespace(String prefix) {
		source.removeNamespace(prefix);
	}

    @Override
    public void removeStatement(Resource subject, URI predicate, Node object) {
        source.removeStatement(subject, predicate, object);
    }

	public void setNamespace(String prefix, String namespaceURI)
			throws IllegalArgumentException {
		source.setNamespace(prefix, namespaceURI);
	}

	@Override
	public long size() throws ModelRuntimeException {
		return source.size();
	}
	
	public boolean sparqlAsk(String query) throws MalformedQueryException {
        return source.sparqlAsk(query);
    }

	public ClosableIterable<Statement> sparqlConstruct(String query) throws MalformedQueryException {
        return source.sparqlConstruct(query);
    }

	public ClosableIterable<Statement> sparqlDescribe(String query) {
        return source.sparqlDescribe(query);
    }
	
	public QueryResultTable sparqlSelect(String queryString) throws MalformedQueryException {
        return source.sparqlSelect(queryString);
    }

	public void unlock() {
        source.unlock();
    }

	public void writeTo(OutputStream out) throws IOException {
        source.writeTo(out);
    }

	@Override
	public void writeTo(OutputStream out, Syntax syntax) throws IOException,
			ModelRuntimeException {
		source.writeTo(out, syntax);
	}

	public void writeTo(Writer out) throws IOException {
        source.writeTo(out);
    }

	public void writeTo(Writer out, Syntax syntax) throws IOException {
        source.writeTo(out, syntax);
    }
	
}
