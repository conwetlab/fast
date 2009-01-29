package eu.morfeoproject.fast.catalogue;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.exception.ModelException;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.impl.DiffImpl;
import org.ontoware.rdf2go.model.impl.PseudoClosableIterator;
import org.ontoware.rdf2go.model.impl.QuadPatternImpl;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.NodeOrVariable;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.ResourceOrVariable;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.util.ConversionException;
import org.ontoware.rdf2go.util.Converter;
import org.ontoware.rdf2go.util.ConvertingIterator;
import org.ontoware.rdf2go.util.Iterators;

/**
 * A RDF ModelSet that holds changes to the model in memory and stores them
 * in one go when calling "commit". Additionally, the modelset can be used
 * to optimize database access, using in-memory buffers.
 * 
 * You must do changes in the workmodelSet, they will
 * be applied to the original source when invoking {@link #commit()}.
 * To avoid unwanted conflicts, you should not change data inside the source model.
 * 
 * To free resources of the DiffModelSet, you must call commit() or
 * rollback(). You can continue using a DiffModelSet
 * after calling commit() or rollback().
 * 
 * The DiffModelSet only supports the find() method and
 * not the SPARQL queries, so results may be broken when using the query
 * methods. <b>There is no warning about this, to let implementors
 * use the query methods anyway</b>.
 * 
 * <h3>Buffering</h3>
 * To speed up find() calls, triples can be buffered in a ClientSession.
 * Call bufferResource() to do that. Buffers are thrown away on commit
 * or rollback calls.
 * @author sauermann
 */
public class DiffModelSet {
    
    class ClosableCIterator extends ConvertingIterator<Model, Model> implements
    	ClosableIterator<Model>{
        
        ClosableIterator<? extends Model> wrapped;
        
        /**
         * @param wrapped
         * @param converter
         */
        public ClosableCIterator(ClosableIterator<Model> wrapped, Converter<Model, Model> converter) {
            super(wrapped, converter);
            this.wrapped = wrapped;
        }

        public void close() {
            wrapped.close();
        }
        
    }
    /**
     * executes all calls through the modelset.
     * @author sauermann
     */
    class ModelDiff extends ModelWrapper {

        public ModelDiff(Model source) {
            super(source);
        }

        @Override
        public void addStatement(Resource subject, URI predicate, Node object) {
            workmodelset.addStatement(getContextURI(), subject, predicate, object);
        }

        @Override
        public ClosableIterator<Statement> findStatements(ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) {
            return workmodelset.findStatements(getContextURI(), subject, predicate, object);
        }

        @Override
		public ClosableIterator<Statement> iterator() {
			return (ClosableIterator<Statement>)findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
		}

		@Override
        public void removeStatement(Resource subject, URI predicate, Node object) {
            workmodelset.removeStatement(getContextURI(), subject, predicate, object);
        }

    }
    class ModelSetDiff extends ModelSetWrapper {
    	
        /**
         * what does force do? removed by leo until explained
         */
//		boolean force = true;
//    	private void force() {
//    		this.force = true;
//    	}
//    	private void protect() {
//    		this.force = false;
//    	}
    	
        public ModelSetDiff(ModelSet source)
        {
            super(source);
        }

        @Override
        public void addStatement(Statement statement) throws ModelRuntimeException {
            // assertions first: is this operation allowed?
//TODO            if (statement.getContext().equals(PIMO.GroundingClosure))
//TODO               throw new ModelRuntimeException("Adding a statement to the context pimo:GroundingClosure is not allowed. Statement not added: "+statement);
            
            observeChange(statement);
            
            // if this was removed before, it is no longer
            if ((removed != null) && (removed.contains(statement)))
                removed.removeStatement(statement);
            getAdded().addStatement(statement);
            
            
            if (bufferedResources.contains(statement.getSubject()))
                buffer.addStatement(statement);

        }
        
        @Override
    	public boolean containsStatements(UriOrVariable contextURI,
    			ResourceOrVariable subject, UriOrVariable predicate,
    			NodeOrVariable object) throws ModelRuntimeException {

    		ClosableIterator<? extends Statement> it = findStatements(contextURI,
    				subject, predicate, object);
    		boolean result = it.hasNext();
    		it.close();
    		return result;
    	}

        @Override
        public ClosableIterator<Statement> findStatements(UriOrVariable contextURI, ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) throws ModelRuntimeException {
            ArrayList<Statement> result = new ArrayList<Statement>();
            // buffered or not?
            ClosableIterator<? extends Statement> i = null;
            if (bufferedResources.contains(subject))
            {
                // the subject resource is buffered
                if (!manipulatedBuffer)
                    // when the buffer was manipulated, the whole buffer will be included
                    // in a spo query below, so then this is not needed here
                    i = buffer.findStatements(contextURI, subject, predicate, object);
            } else
            	i = super.findStatements(contextURI, subject, predicate, object);
            if (i!=null)
                try {
                    while (i.hasNext())
                    {
                        Statement s = i.next();
                        // only add if not removed
                        if ((removed == null) || (!removed.contains(s)))
                            result.add(s);
                    } 
                }finally {
                    i.close();
                }
            // add the statements that may be in added
            if (added != null)
                for (i = added.findStatements(contextURI, subject, predicate, object); i.hasNext();)
                {
                    Statement s = i.next();
                    result.add(s);
                }
            // now the entailment if the buffer was used for closures
            if (manipulatedBuffer)
            {
            	ClosableIterator<? extends Statement> j = buffer.findStatements(contextURI, subject, predicate, object);
                while (j.hasNext())
                {
                    Statement s = j.next();
                    // only add if not removed
                    if ((removed == null) || (!removed.contains(s)))
                        result.add(s);
                }
            }
            // remove the statements which are not in users language
            // if this feature is active
            if (filteredLanguageCode != null) {
            	ArrayList<Statement> resultFiltered = new ArrayList<Statement>(result.size());
            	for (Statement s : result) {
            		Node node = s.getObject();
            		if (node instanceof LanguageTagLiteral) {
            			// we have a literal with language tag
            			// if it is not the user language, we delete it from the list
            			LanguageTagLiteral literal = node.asLanguageTagLiteral();
            			if (literal.getLanguageTag().equals(filteredLanguageCode)) {
            				resultFiltered.add(s);
            			}
            		} else {
            			// add always
            			resultFiltered.add(s);
            		}
            	}
                if (resultFiltered.size()!=result.size())
                    log.finer("find: filtered "+(result.size()-resultFiltered.size())+" statements based " +
                            "on their languagetag not being "+filteredLanguageCode);
            	return new PseudoClosableIterator<Statement>(resultFiltered.iterator());
            }
            return new PseudoClosableIterator<Statement>(result.iterator());
        }
        
        @Override
        public Model getModel(URI contextURI) {
            return new ModelDiff(source.getModel(contextURI));
        }

        @Override
        public ClosableIterator<Model> getModels() {
            return new ClosableCIterator(source.getModels(), fromSourceToWorkModel);
        }

		@Override
		public ClosableIterator<Statement> iterator() {
			// Ha, here is obvious chance for performance optimizaiton:
			// add all statements to hashset, then add/remove using the diff...
			return (ClosableIterator<Statement>) findStatements(Variable.ANY, Variable.ANY, Variable.ANY, Variable.ANY);
		}

        @Override
        public void removeStatement(Statement statement) throws ModelRuntimeException {
        	if (statement == null)
        		throw new AssertionError("Statement has to be non-null");
            
            // assert the right to manipulate this context
//TODO            if (statement.getContext().equals(PIMO.GroundingClosure))
//TODO                throw new ModelRuntimeException("Cannot remove a PIMO:GroundingClosure");
            
            observeChange(statement);
            
            getRemoved().addStatement(statement);
            
            // if this was added before, it is no longer
            if ((added!= null) && (added.contains(statement)))
                added.removeStatement(statement);
            
            // TODO: adding/deleting may affect the buffer!
            // we delete the statement from the buffer.
            if (bufferedResources.contains(statement.getSubject()))
                buffer.removeStatement(statement);
        }

		@Override
		public void removeStatements(UriOrVariable context, ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) throws ModelRuntimeException {
        	// find them, remove them
        	ArrayList<Statement> toRemove = new ArrayList<Statement>();
        	ClosableIterator<? extends Statement> i = findStatements(context, subject, predicate, object);
        	Iterators.addAll(i, toRemove);
        	for (Statement s : toRemove)
        	{
        		removeStatement(s);
        	}
		}        
        
    }
    
    static final QuadPatternImpl ALL = new QuadPatternImpl(Variable.ANY,
        Variable.ANY, Variable.ANY, Variable.ANY);
    
    static final List<Statement> EMPTYLIST = Collections.emptyList();

    static final Iterator<Statement> EMPTYITERATOR = EMPTYLIST.iterator();
    
    private static Logger staticlogger = Logger.getLogger(DiffModelSet.class.getName());
    
    /**
     * triples that were added in this transaction.
     * Added is a ModelSet because then implementing find() 
     * on the workmodelset was easier, but it can be replaced with
     * a HashSet for speedup.
     * Added and removed are created lazily and disposed after commit/rollback, 
     * they are NULL when they contain
     * nothing.
     */
    protected ModelSet added;
    
    /**
     * A buffer containing find(s, ? ?) results for all resources
     * that are listed in bufferedResources.
     * Also, the buffer contains the closure triples in the special
     * context PIMO.GroundingClosure.
     */
    protected ModelSet buffer;
    
    /**
     * which resources are being buffered?
     * of these resources, the SPO triples are buffered for subject S
     * from this set.
     */
    protected Set<Resource> bufferedResources = new HashSet<Resource>();
    
    /**
     * when this != null, the findStatements will only return statements
     * in the language of the user.
     */
    protected String filteredLanguageCode = null;
    
    /**
     * converts from source model to diff models
     */
    private Converter<Model, Model> fromSourceToWorkModel = new Converter<Model, Model>()
    {
        public Model convert(Model source) throws ConversionException {
            return new ModelDiff(source);
        }
    };
    
    /**
     * by default, uses the static logger. you can pass in an alternative logger
     * so that messages can be distinguished.
     */
    protected Logger log = staticlogger;
    
    /**
     * a manipulated Buffer indicates that on find(), also the
     * buffer should be queried with full (spo) queries on every
     * find call.
     * This is to support closures and inference on the client,
     * which writes closure triples to the buffer.
     * It lowers performance, though.
     */
    protected boolean manipulatedBuffer = false;
    
    /**
     * triples that were removed in this transaction
     * Added and removed are created lazily and disposed after commit/rollback, 
     * they are NULL when they contain
     * nothing.
     */
    protected ModelSet removed;
    
    /**
     * the source of data to be changed. All queried of the workmodelset
     * will be forwarded to the source.
     */
    final protected ModelSet source;
    
    /**
     * The ModelSet to work with. It has a dynamic implementation of
     * Model and ModelSet.
     * Once set, it is not set to null on commit or close,
     * as it contains no data anyway.
     */
    protected ModelSetDiff workmodelset;
    
    /**
     * Create a TransactionModelSet that will do changes on the source
     * model. 
     * @param source the source
     */
    public DiffModelSet(ModelSet source) {
        if (source == null)
            throw new NullPointerException("source is null");
        this.source = source;
        // init the buffer
        buffer = RDF2Go.getModelFactory().createModelSet();
        buffer.open();
    }
    
    
    /**
     * the passed model will be used as original model,
     * a new model is created for the workmodelset, copying all triples
     * from the originalmodel.
     * The original state, that was passed in, is preserved.
     * You should not change the original model after calling the constructor.
     * @param originalModel the original model, which is copied into the workmodelset
     * for changes to be done there.
     * @param logger the logger to use for this instance
     * @throws ModelException if the working model cannot be initialized
     */
    public DiffModelSet(ModelSet originalModel, Logger logger) throws ModelException
    {
        this(originalModel);
        setLogger(logger);
    }

    /**
     * Methods to manipu
     * @param iterator
     */
    protected void addAllInBuffer(Iterator<Statement> iterator) {
        while (iterator.hasNext())
            addStatementInBuffer(iterator.next());
    }
    
    protected void addStatementInBuffer(Statement statement) {
        buffer.addStatement(statement);
        // the buffer is independent from actual data manipulation.
        // changing the buffer must not change the actual data manipulated
        // by the user, hence this is commented out by leo on 14.11.2007
//      if ((removed != null) && (removed.contains(statement)))
//            removed.removeStatement(statement);
        manipulatedBuffer = true;
    }
    
    /**
     * flush the buffered resources
     *
     */
    public void bufferFlush() {
    	if (buffer != null)
    		buffer.removeAll();
    	bufferedResources.clear();
        manipulatedBuffer = false;
    }
    
    /**
     * Buffer the result of find(r, ?, ?) from the source.
     * Further calls involving r as a subject are then 
     * run on the in-memory buffer.
     * Note that this
     * will also mean that throughout this Session, changes made by other
     * sessions to this resource are not visible anymore. This method is
     * blocking, it returns after all information has been buffered, you may
     * still use the session in parallel.
     * Buffers are flushed when calling commit or bufferFlush().
     * Calling bufferResource twice for the same resource will Buffer
     * that resource again, to be sure to have the
     * most current data.
     * @param r the resource to buffer.
     */
    public void bufferResource(Resource r) {
    	if (buffer == null)
    		buffer = RDF2Go.getModelFactory().createModelSet();
    	log.fine("buffering resource "+r);
    	// checks
    	if (r == null)
    		throw new RuntimeException("passed a null resource to buffer");
    	if (r == Variable.ANY)
    		throw new RuntimeException("passed the 'Variable.ANY' resource to the buffer");
    	if (bufferedResources.contains(r))
    	{
    		buffer.removeStatements(Variable.ANY, r, Variable.ANY, Variable.ANY);
    	}
    	// add
    	ClosableIterator<? extends Statement> i = source.findStatements(Variable.ANY, r,  Variable.ANY, Variable.ANY);
    	buffer.addAll(i);
    	// set the resource as buffered
    	bufferedResources.add(r);
    }


    /**
     * close all models that were opened.
     * After this call, this object can be used by calling the usual
     * methods, it will re-open the needed resources
     *
     */
    protected void close() {
        // the workmodelset doesn't need to be closed,
        // it has no footprint anyway as it is virtual
//    	if (workmodelset != null)
//    	{
//    		workmodelset.close();
//    		workmodelset = null;
//    	}
        if (added != null)
        {
            added.close();
            added = null;
        }
        if (removed != null)
        {
            removed.close();
            removed = null;
        }
        if (buffer != null)
        {
            // TODO - add a getBuffer() method!!! to re-initialize
//            buffer.close();
//            buffer = null;
        }
    }

    /**
     * Save the changes of the workmodelSet to the source modelset.
     * After this operation, the transcationmodel will be 
     * reset an empty state and can be used for further modifications
     * using the WorkModelSet.
     * @throws ModelException if the store cannot store the changes
     */
    public void commit() throws ModelException  {
    	bufferFlush();
        if (workmodelset == null)
        {
            log.fine("no changes to store, no workmodelset was started.");
            return;
        }
        synchronized (workmodelset) {
            if ((added == null) && (removed == null))
            {
                log.fine("added and removed are empty, nothing to do");
                return;
            }
            long as = getAdded().size();
            long rs = getRemoved().size();
            if (as+rs == 0)
            {
                log.fine("no changes to store");
                return;
            }
	        DiffImpl diff = new DiffImpl(getAddedStatements(), getRemovedStatements());
	        source.update(diff);
	        log.fine("stored data changes ("+as+" add, "+rs+" delete) into store");
            // clear the added and removed
            close();
        }
        

    }
    
    protected ModelSet getAdded() {
        if (added == null)
        {
            added = RDF2Go.getModelFactory().createModelSet();
            added.open();
        }
        return added;
    }
    
    /**
     * statements that were deleted during this session.
     * Do not change the result.
     * @return an iterator containing the deleted statements.
     */
    public ClosableIterator<? extends Statement> getAddedStatements() {
            return getAdded().findStatements(ALL);
    }
    
    /**
     * copy all added statements into a new ModelSet.
     * Convenience function when using clientsession to create data, but not commit it
     * @return a copy of the added statements in a new modelset.
     * Callers <code>must</code> close this modelset
     */
    public ModelSet getAddedStatementsCopy() {
    	ModelSet result = RDF2Go.getModelFactory().createModelSet();
    	result.open();
    	if (added != null)
    		result.addModelSet(added);
    	return result;
    }
    
    protected ModelSet getRemoved() {
        if (removed == null)
        {
            removed = RDF2Go.getModelFactory().createModelSet();
            removed.open();
        }
        return removed;
    }
    
    /**
     * statements that were deleted during this session.
     * Do not change the result modelset.
     * @return an iterator containing the deleted statements.
     */
    public ClosableIterator<? extends Statement> getRemovedStatements() {
            return getRemoved().findStatements(ALL);
    }
    
    /**
     * copy all removed statements into a new ModelSet.
     * Convenience function when using clientsession to create data, but not commit it
     * @return a copy of the removed statements in a new modelset.
     * Callers <code>must</code> close this modelset
     */
    public ModelSet getRemovedStatementsCopy() {
    	ModelSet result = RDF2Go.getModelFactory().createModelSet();
    	result.open();
    	if (removed != null)
    		result.addModelSet(removed);
    	return result;
    }


    /**
     * The modelset that holds the data to be edited by this TransactionModel.
     * @return the source model
     */
    public ModelSet getSource() {
        return source;
    }
    
    /**
     * the working model, which should be used to edit the resource.
     * @return the working model
     */
    public ModelSet getWorkModelSet() {
        if (workmodelset == null)
        {
            workmodelset = new ModelSetDiff(source);
            workmodelset.open();
        }
        return workmodelset;
    }
    
    /**
     * computes if the working model has no changes compared to the original model.
     * @return true, if changes were done.
     */
    public boolean hasChanges() {
    	return ((((added != null ) && !added.isEmpty() )|| ((removed != null) && !removed.isEmpty())));
    }
    
    /**
     * Return true, if this object is not disposed yet and needs a call 
     * to dispose to free resources. This is protected because you should
     * plan exactly when to call dispose when using this object. Your architecture
     * may be broken if you need isNotDisposed from outside. 
     *
     */
    protected boolean isNotDisposed() {
        return (added != null) || (removed !=null);
    }
    
//    private static <E, C extends Collection<E>> C removeAll(Iterator<? extends E> iter, C collection) {
//        try {
//            while (iter.hasNext()) {
//                collection.remove(iter.next());
//            }
//        }
//        finally {
//            Iterators.closeCloseable(iter);
//        }
//
//        return collection;
//    }
   
    /**
     * Observe which resources have changed.
     * This is called on every add/remove operation
     */
    protected void observeChange(Statement s) {
        // can be overridden
    }
    
    /**
     * Rollback all changes, switches back to original version.
     * Call this to free system resources taken by the transaction.
     * This will also flush the buffers of cached resources.
     * @throws ModelException if the model cannot be initialised
     */
    public void rollback() throws ModelException {
    	bufferFlush();
        close();
    }

    /**
     * Tell this instance of TransactionModelSet to use the passed logger instead of your default logger.
     * Use this method to collect your log messages based on where the magic happens
     * @param logger the new logger to use for this instance
     */
    public void setLogger(Logger logger)
    {
        log = logger;
    }



}
