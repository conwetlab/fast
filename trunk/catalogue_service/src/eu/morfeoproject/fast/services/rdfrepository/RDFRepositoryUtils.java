/**
 * 
 */
package eu.morfeoproject.fast.services.rdfrepository;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.impl.StatementImpl;
import org.ontoware.rdf2go.model.node.NodeOrVariable;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.ResourceOrVariable;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.AbstractBlankNodeImpl;
import org.ontoware.rdf2go.model.node.impl.DatatypeLiteralImpl;
import org.ontoware.rdf2go.model.node.impl.LanguageTagLiteralImpl;
import org.ontoware.rdf2go.model.node.impl.PlainLiteralImpl;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.util.ConversionException;
import org.ontoware.rdf2go.util.Converter;

/**
 * Methods to convert between RDF2Go and NEPOMUK-RdfRepository beans
 * @author sauermann
 *
 */
public class RDFRepositoryUtils {
	
	/**
	 * @author sauermann
	 *
	 */
	public static class DummyBlankNode extends AbstractBlankNodeImpl {
		
		final Object internal;

		/**
		 * @param underlyingBlankNode
		 */
		public DummyBlankNode(Object internal) {
			super(internal);
			this.internal = internal;
		}

		/* (non-Javadoc)
		 * @see org.ontoware.rdf2go.model.node.impl.AbstractBlankNodeImpl#getInternalID()
		 */
		@Override
		public String getInternalID() {
			return internal.toString();
		}

	}

    public final static Converter<Statement, org.ontoware.rdf2go.model.Statement> toRdf2GoStatementConverter = 
        new Converter<Statement, org.ontoware.rdf2go.model.Statement>() {
            public org.ontoware.rdf2go.model.Statement convert(Statement source) throws ConversionException {
                return toRdf2GoStatement(source);
            }
    };
    
    public static org.ontoware.rdf2go.model.node.Node toRdf2GoNode(Node node) {
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        if (node.getType() == RDFRepositoryConst.BLANK)
        {
            return new DummyBlankNode(node.getValue());
        }
        if (node.getType() == RDFRepositoryConst.LITERAL)
        {
            if (node.getDatatypeUri() != null && !node.getDatatypeUri().equals(""))
                return new DatatypeLiteralImpl(node.getValue(), new URIImpl(node.getDatatypeUri(), true));
            else if (node.getLanguageTag() != null && !node.getLanguageTag().equals(""))
                return new LanguageTagLiteralImpl(node.getValue(), node.getLanguageTag());
            else
                return new PlainLiteralImpl(node.getValue());
        }
        throw new IllegalArgumentException("cannot transform node to Node: "+node);
    }
    
    public static NodeOrVariable toRdf2GoNodeOrVariable(Node node)
    {
        if ((node == null) || (node.getType() == RDFRepositoryConst.NULLNODE))
            return Variable.ANY;
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        if (node.getType() == RDFRepositoryConst.BLANK)
        {
        	return new DummyBlankNode(node.getValue());
        }
        if (node.getType() == RDFRepositoryConst.LITERAL)
        {
            if (node.getDatatypeUri() != null && !node.getDatatypeUri().equals(""))
                return new DatatypeLiteralImpl(node.getValue(), new URIImpl(node.getDatatypeUri(), false));
            else if (node.getLanguageTag() != null && !node.getLanguageTag().equals(""))
                return new LanguageTagLiteralImpl(node.getValue(), node.getLanguageTag());
            else
                return new PlainLiteralImpl(node.getValue());
        }
        throw new IllegalArgumentException("cannot transform node to NodeOrVariable: "+node);
    };
    public static Resource toRdf2GoResource(Node node) {
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        if (node.getType() == RDFRepositoryConst.BLANK)
        {
        	return new DummyBlankNode(node.getValue());
        }
        throw new IllegalArgumentException("cannot transform node to Node: "+node);
    }
       
    public static ResourceOrVariable toRdf2GoResourceOrVariable(Node node)
    {
        if ((node == null) || (node.getType() == RDFRepositoryConst.NULLNODE))
            return Variable.ANY;
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        if (node.getType() == RDFRepositoryConst.BLANK)
        {
        	return new DummyBlankNode(node.getValue());
        }
        throw new IllegalArgumentException("cannot transform node to ResourceOrVariable: "+node);
    }
    
    public static org.ontoware.rdf2go.model.Statement toRdf2GoStatement(Statement statement) {
        StatementImpl r = new StatementImpl(
            toRdf2GoUri(statement.getContextUri()),
            toRdf2GoResource(statement.getSubject()),
            toRdf2GoUri(statement.getPredicate()),
            toRdf2GoNode(statement.getObject())
        );
        return r;
    }

    public static URI toRdf2GoUri(Node node) {
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        throw new IllegalArgumentException("cannot transform node to URI: "+node);
    }
    
    public static UriOrVariable toRdf2GoUriOrVariable(Node node)
    {
        if ((node == null) || (node.getType() == RDFRepositoryConst.NULLNODE))
            return Variable.ANY;
        if (node.getType() == RDFRepositoryConst.URI)
            return new URIImpl(node.getValue(), false);
        throw new IllegalArgumentException("cannot transform node to UriOrVariable: "+node);
    }
    
    /**
     * convert an rdf2go node to a Repository-node
     * @param node input
     * @return output
     */
    public static Node toRepo(org.ontoware.rdf2go.model.node.Node node) {
        if (node == null)
        {
            return RDFRepositoryConst.NULL;
        } else if (node instanceof org.ontoware.rdf2go.model.node.URI) {
            return Node.createURI(node.toString());      
        } else if (node instanceof org.ontoware.rdf2go.model.node.BlankNode) {
            org.ontoware.rdf2go.model.node.BlankNode bnode = (org.ontoware.rdf2go.model.node.BlankNode) node;
            return Node.createBlank(bnode.toString());
        } else if (node instanceof org.ontoware.rdf2go.model.node.DatatypeLiteral) {
            org.ontoware.rdf2go.model.node.DatatypeLiteral dlit = (org.ontoware.rdf2go.model.node.DatatypeLiteral) node;
            return Node.createLiteralWithDataType(dlit.getValue(), dlit.getDatatype().toString());
        } else if (node instanceof org.ontoware.rdf2go.model.node.LanguageTagLiteral) {
            org.ontoware.rdf2go.model.node.LanguageTagLiteral lit = (org.ontoware.rdf2go.model.node.LanguageTagLiteral) node;
            return Node.createLiteralWithLanguage(lit.getValue(), lit.getLanguageTag());
        } else if (node instanceof org.ontoware.rdf2go.model.node.Literal) {
            org.ontoware.rdf2go.model.node.Literal lit = (org.ontoware.rdf2go.model.node.Literal) node;
            return Node.createLiteral(lit.getValue());
        } else
            throw new IllegalArgumentException("passed node '"+node+"' cannot be converted");
    }
    
    public static Statement toRepo(org.ontoware.rdf2go.model.Statement s) {
        return new Statement(toRepo(s.getSubject()),
            toRepo(s.getPredicate()),
            toRepo(s.getObject()),
            toRepo(s.getContext()));
        
    }

    public static List<Statement> toStatementList(ClosableIterable<? extends org.ontoware.rdf2go.model.Statement> it) {
        return toStatementList(it.iterator());
    }
    
    public static List<Statement> toStatementList(ClosableIterator<? extends org.ontoware.rdf2go.model.Statement> i) {
        ArrayList<Statement> result = new ArrayList<Statement>();
        while (i.hasNext())
        {
            org.ontoware.rdf2go.model.Statement s = i.next();
            Statement ss = toRepo(s);
            result.add(ss);
        }
        return result;  
    }
}
