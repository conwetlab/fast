package eu.morfeoproject.fast.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Tue Feb 10 19:02:12 GMT 2009
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/fco.rdf
 * namespace: http://www.morfeoproject.eu/fast/fco#
 */
public interface FCO {
	public static final URI NS_FCO = new URIImpl("http://www.morfeoproject.eu/fast/fco#",false);

    /**
     */
    public static final URI Screen = new URIImpl("http://www.morfeoproject.eu/fast/fco#Screen", false);

    /**
     */
    public static final URI Condition = new URIImpl("http://www.morfeoproject.eu/fast/fco#Condition", false);

    /**
     */
    public static final URI ScreenFlow = new URIImpl("http://www.morfeoproject.eu/fast/fco#ScreenFlow", false);

    /**
     */
    public static final URI Tag = new URIImpl("http://www.morfeoproject.eu/fast/fco#Tag", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI icon = new URIImpl("http://www.morfeoproject.eu/fast/fco#icon", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI screenshot = new URIImpl("http://www.morfeoproject.eu/fast/fco#screenshot", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI homepage = new URIImpl("http://www.morfeoproject.eu/fast/fco#homepage", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI version = new URIImpl("http://www.morfeoproject.eu/fast/fco#version", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Condition 
     * Range: http://www.morfeoproject.eu/fast/fco#Screen 
     */
    public static final URI isPostcondition = new URIImpl("http://www.morfeoproject.eu/fast/fco#isPostcondition", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.morfeoproject.eu/fast/fco#Condition 
     */
    public static final URI hasPostcondition = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasPostcondition", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Condition 
     * Range: http://www.morfeoproject.eu/fast/fco#Screen 
     */
    public static final URI isPrecondition = new URIImpl("http://www.morfeoproject.eu/fast/fco#isPrecondition", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.morfeoproject.eu/fast/fco#Condition 
     */
    public static final URI hasPrecondition = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasPrecondition", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Condition 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI hasPattern = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasPattern", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#Condition 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI hasPatternString = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasPatternString", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#ScreenFlow 
     * Range: http://www.morfeoproject.eu/fast/fco#Screen 
     */
    public static final URI hasScreen = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasScreen", false);

    /**
     * Comment: http://www.morfeoproject.eu/fast/fco#ScreenFlow http://www.morfeoproject.eu/fast/fco#Screen 
     * Range: http://www.morfeoproject.eu/fast/fco#Tag 
     */
    public static final URI hasTag = new URIImpl("http://www.morfeoproject.eu/fast/fco#hasTag", false);

}
