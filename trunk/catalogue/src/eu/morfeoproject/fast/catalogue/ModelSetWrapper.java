package eu.morfeoproject.fast.catalogue;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.util.Map;

import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.exception.MalformedQueryException;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.exception.QueryLanguageNotSupportedException;
import org.ontoware.rdf2go.exception.SyntaxNotSupportedException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;
import org.ontoware.rdf2go.model.QuadPattern;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.impl.AbstractModelSetImpl;
import org.ontoware.rdf2go.model.node.NodeOrVariable;
import org.ontoware.rdf2go.model.node.ResourceOrVariable;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;

/**
 * Wraps all calls to an embedded modelset, the source.
 * Make subclasses of this class to implement stacked models.
 * @author sauermann
 */
public class ModelSetWrapper extends AbstractModelSetImpl {
    
    final ModelSet source;

    /**
     * Create a new ModelSetWrapper that wraps the passed model
     * @param source the source to be wrapped
     */
    public ModelSetWrapper(final ModelSet source) {
        super();
        if (source == null)
            throw new AssertionError("source has to be non-null");
        this.source = source;
    }
    
    public void addStatement(Statement statement) throws ModelRuntimeException {
        source.addStatement(statement);
    }

    public void close() {
        source.close();
    }

    public void commit() throws ModelRuntimeException {
		source.commit();
	}

    @Override
    public boolean contains(Statement s) throws ModelRuntimeException {
        ClosableIterator<? extends Statement> i = findStatements(s.getContext(), s.getSubject(), s.getPredicate(), s.getObject());
        try {
            return (i.hasNext());
        } finally {
            // this WILL be called, also if you don't believe it. 
            // If you are debugging, this is not the cause of your troubles. Go away
            i.close();
        }
    }

    public boolean containsModel(URI contextURI) {
		return source.containsModel(contextURI);
	}

    public QuadPattern createQuadPattern(UriOrVariable context, ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) {
        return source.createQuadPattern(context, subject, predicate, object);
    }

    public ClosableIterator<Statement> findStatements(UriOrVariable contextURI, ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) throws ModelRuntimeException {
        return source.findStatements(contextURI, subject, predicate, object);
    }

    public Model getDefaultModel() {
        return source.getDefaultModel();
    }

    public Model getModel(URI contextURI) {
        return source.getModel(contextURI);
    }

    public ClosableIterator<Model> getModels() {
        return source.getModels();
    }

    public ClosableIterator<URI> getModelURIs() {
        return source.getModelURIs();
    }

    public String getNamespace(String prefix) {
		return source.getNamespace(prefix);
	}

    public Map<String, String> getNamespaces() {
		return source.getNamespaces();
	}

    /**
     * get the source modelset that is wrapped by this modelset.
     * @return the source
     */
    public ModelSet getSource() {
        return source;
    }

    public Object getUnderlyingModelImplementation() {
        return source.getUnderlyingModelSetImplementation();
    }

    public Object getUnderlyingModelSetImplementation() {
        return source.getUnderlyingModelSetImplementation();
    }
    
    public boolean isOpen() {
        return source.isOpen();
    }

	/**
     * @see org.ontoware.rdf2go.model.ModelSet#open()
     */
    public void open() {
        source.open();
    }

	public ClosableIterable<Statement> queryConstruct(String query, String querylanguage) throws QueryLanguageNotSupportedException, MalformedQueryException, ModelRuntimeException {
        return source.queryConstruct(query, querylanguage);
    }

	public QueryResultTable querySelect(String query, String querylanguage) throws QueryLanguageNotSupportedException, MalformedQueryException, ModelRuntimeException {
        return source.querySelect(query, querylanguage);
    }

    public void readFrom(InputStream in) throws IOException, ModelRuntimeException {
        source.readFrom(in);
    }

    @Override
	public void readFrom(InputStream in, Syntax syntax) throws IOException,
			ModelRuntimeException, SyntaxNotSupportedException {
    	source.readFrom(in, syntax);
	}

    public void readFrom(InputStream reader, Syntax syntax, String baseURI)
			throws IOException, ModelRuntimeException,
			SyntaxNotSupportedException {
		source.readFrom(reader, syntax, baseURI);
	}

    public void readFrom(Reader in) throws IOException, ModelRuntimeException {
        source.readFrom(in);
    }

    @Override
	public void readFrom(Reader in, Syntax syntax) throws IOException,
			ModelRuntimeException, SyntaxNotSupportedException {
		source.readFrom(in, syntax);
	}

    public void readFrom(Reader in, Syntax syntax, String baseURI)
			throws IOException, ModelRuntimeException,
			SyntaxNotSupportedException {
		source.readFrom(in, syntax, baseURI);
	}

    public boolean removeModel(URI contextURI) {
        // overriden, because the abstract implementation is shit, it doesnt open/close
        boolean containsModel = containsModel(contextURI);
        if (containsModel) {
            Model m = this.getModel(contextURI);
            m.open();
            m.removeAll();
            m.close();
        }
        return containsModel;
    }

    public void removeNamespace(String prefix) {
		source.removeNamespace(prefix);
	}

    public void removeStatement(Statement statement) throws ModelRuntimeException {
        source.removeStatement(statement);
    }

    public void setAutocommit(boolean autocommit) {
		source.setAutocommit(autocommit);
	}

    public void setNamespace(String prefix, String namespaceURI)
			throws IllegalArgumentException {
		source.setNamespace(prefix, namespaceURI);
	}

	public long size() throws ModelRuntimeException {
        return source.size();
    }

	public boolean sparqlAsk(String query) throws ModelRuntimeException, MalformedQueryException {
        return source.sparqlAsk(query);
    }

	public ClosableIterable<Statement> sparqlConstruct(String query) throws ModelRuntimeException, MalformedQueryException {
        return source.sparqlConstruct(query);
    }

	public ClosableIterable<Statement> sparqlDescribe(String query) throws ModelRuntimeException {
        return source.sparqlDescribe(query);
    }

	public QueryResultTable sparqlSelect(String queryString) throws MalformedQueryException, ModelRuntimeException {
        return source.sparqlSelect(queryString);
    }

	public void writeTo(OutputStream out) throws IOException, ModelRuntimeException {
        source.writeTo(out);
    }

	@Override
	public void writeTo(OutputStream out, Syntax syntax) throws IOException,
			ModelRuntimeException, SyntaxNotSupportedException {
		source.writeTo(out, syntax);
	}

	public void writeTo(Writer out) throws IOException, ModelRuntimeException {
        source.writeTo(out);
    }

	@Override
	public void writeTo(Writer writer, Syntax syntax) throws IOException,
			ModelRuntimeException, SyntaxNotSupportedException {
		source.writeTo(writer, syntax);
	}
    
    

}
