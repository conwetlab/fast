package eu.morfeoproject.fast.catalogue.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Wed Dec 16 16:01:54 GMT 2009
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/ctag.rdf
 * namespace: http://commontag.org/ns#
 */
public interface CTAG {
	public static final URI NS_CTAG = new URIImpl("http://commontag.org/ns#",false);

    /**
     * Label: Tagged Content@en 
     * Comment: Content which has one or more Common Tag.@en 
     */
    public static final URI TaggedContent = new URIImpl("http://commontag.org/ns#TaggedContent", false);

    /**
     * Label: Auto Tag@en 
     * Comment: A Tag asserted by an automated tool on a content resource.@en 
     */
    public static final URI AutoTag = new URIImpl("http://commontag.org/ns#AutoTag", false);

    /**
     * Label: Reader Tag@en 
     * Comment: A Tag asserted by the reader (consumer) of a content resource.@en 
     */
    public static final URI ReaderTag = new URIImpl("http://commontag.org/ns#ReaderTag", false);

    /**
     * Label: Author Tag@en 
     * Comment: A Tag asserted by the author of a content resource.@en 
     */
    public static final URI AuthorTag = new URIImpl("http://commontag.org/ns#AuthorTag", false);

    /**
     * Label: Tag@en 
     * Comment: A Common Tag associating a URI and a keyword to annotate a resource.@en 
     */
    public static final URI Tag = new URIImpl("http://commontag.org/ns#Tag", false);

    /**
     * Label: is about@en 
     * Comment: A resource (URI) representing the concepts described by the content.@en 
     * Comment: http://commontag.org/ns#TaggedContent 
     */
    public static final URI isAbout = new URIImpl("http://commontag.org/ns#isAbout", false);

    /**
     * Label: tag label@en 
     * Comment: A local, human-readable name for a Tag.@en 
     * Comment: http://commontag.org/ns#Tag 
     */
    public static final URI label = new URIImpl("http://commontag.org/ns#label", false);

    /**
     * Label: means@en 
     * Comment: A a resource (URI) representing the conceptual meaning of a Tag.@en 
     * Comment: http://commontag.org/ns#Tag 
     */
    public static final URI means = new URIImpl("http://commontag.org/ns#means", false);

    /**
     * Label: tagging date@en 
     * Comment: The date the Tag was assigned.@en 
     * Comment: http://commontag.org/ns#Tag 
     */
    public static final URI taggingDate = new URIImpl("http://commontag.org/ns#taggingDate", false);

    /**
     * Label: tagged@en 
     * Comment: Links a resource to a Common Tag.@en 
     * Comment: http://commontag.org/ns#TaggedContent 
     * Range: http://commontag.org/ns#Tag 
     */
    public static final URI tagged = new URIImpl("http://commontag.org/ns#tagged", false);

}
