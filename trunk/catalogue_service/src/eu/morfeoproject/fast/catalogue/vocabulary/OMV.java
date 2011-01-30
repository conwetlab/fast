package eu.morfeoproject.fast.catalogue.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Fri Jan 28 19:08:58 GMT 2011
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/OMV_v2.4.1.owl
 * namespace: http://omv.ontoware.org/2005/05/ontology#
 */
public interface OMV {
	public static final URI NS_OMV = new URIImpl("http://omv.ontoware.org/2005/05/ontology#",false);

    /**
     * Label: OntologyEngineeringTool^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: A tool used to create the ontology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyEngineeringTool = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyEngineeringTool", false);

    /**
     * Label: LicenseModel^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: A license model describing the usage conditions for an ontology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI LicenseModel = new URIImpl("http://omv.ontoware.org/2005/05/ontology#LicenseModel", false);

    /**
     * Label: OntologySyntax^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Information about the syntax used in an Ontology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologySyntax = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologySyntax", false);

    /**
     * Label: Organisation^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: An organisation of some kind. Represents social institutions such as universities, companies, societies etc.^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI Organisation = new URIImpl("http://omv.ontoware.org/2005/05/ontology#Organisation", false);

    /**
     * Label: OntologyType^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: This class subsumes types of ontologies according to well-known classifications in the
Ontology Engineering literature.^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyType = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyType", false);

    /**
     * Label: Location^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The geographical location of a party. To keep things simple we use only DatatypeProperties instead of introducing classes for country, street, etc.^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI Location = new URIImpl("http://omv.ontoware.org/2005/05/ontology#Location", false);

    /**
     * Label: Party^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: A party is a person or an organisation^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI Party = new URIImpl("http://omv.ontoware.org/2005/05/ontology#Party", false);

    /**
     * Label: FormalityLevel^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The level of formality of an ontology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI FormalityLevel = new URIImpl("http://omv.ontoware.org/2005/05/ontology#FormalityLevel", false);

    /**
     * Label: Person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: A named individual. Represents an individual responsible for the creation, or contribution to an ontology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI Person = new URIImpl("http://omv.ontoware.org/2005/05/ontology#Person", false);

    /**
     * Label: KnowledgeRepresentationParadigm^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Information about a knowledge representation paradigm a particular language adheres to^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI KnowledgeRepresentationParadigm = new URIImpl("http://omv.ontoware.org/2005/05/ontology#KnowledgeRepresentationParadigm", false);

    /**
     * Label: OntologyTask^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Information about the task the ontology was intended to be used for^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyTask = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyTask", false);

    /**
     * Label: OntologyDomain^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: While the domain can refer to any topic ontology it is advised to use one of the established general purpose topic hierarchy like DMOZ or domain specific topic hierarchy like ACM for the computer science domain.^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyDomain = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyDomain", false);

    /**
     * Label: Ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Aspects of specific realizations are covered modular (and extendable) by the class Ontology.^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI Ontology = new URIImpl("http://omv.ontoware.org/2005/05/ontology#Ontology", false);

    /**
     * Label: OntologyEngineeringMethodology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Information about the ontology engineering methodology^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyEngineeringMethodology = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyEngineeringMethodology", false);

    /**
     * Label: OntologyLanguage^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Information about the language in which the ontology is implemented^^http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI OntologyLanguage = new URIImpl("http://omv.ontoware.org/2005/05/ontology#OntologyLanguage", false);

    /**
     * Label: numProperties^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Number of properties in the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#integer 
     */
    public static final URI numberOfProperties = new URIImpl("http://omv.ontoware.org/2005/05/ontology#numberOfProperties", false);

    /**
     * Label: acronym^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: A short name by which a kR paradigm is known^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f3e 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI acronym = new URIImpl("http://omv.ontoware.org/2005/05/ontology#acronym", false);

    /**
     * Label: eMail^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The email address of a person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI eMail = new URIImpl("http://omv.ontoware.org/2005/05/ontology#eMail", false);

    /**
     * Label: modificationDate^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Date of the last modification made to the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI modificationDate = new URIImpl("http://omv.ontoware.org/2005/05/ontology#modificationDate", false);

    /**
     * Label: numAxioms^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Number of axioms in the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#integer 
     */
    public static final URI numberOfAxioms = new URIImpl("http://omv.ontoware.org/2005/05/ontology#numberOfAxioms", false);

    /**
     * Label: numClasses^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Number of classes in the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#integer 
     */
    public static final URI numberOfClasses = new URIImpl("http://omv.ontoware.org/2005/05/ontology#numberOfClasses", false);

    /**
     * Label: status^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: It specifies the tracking information for the contents of the ontology. Pre-defined values^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI status = new URIImpl("http://omv.ontoware.org/2005/05/ontology#status", false);

    /**
     * Label: numIndividuals^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Number of individuals in the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#integer 
     */
    public static final URI numberOfIndividuals = new URIImpl("http://omv.ontoware.org/2005/05/ontology#numberOfIndividuals", false);

    /**
     * Label: keyClasses^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Indicates what the central/best represented classes of the ontology are.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI keyClasses = new URIImpl("http://omv.ontoware.org/2005/05/ontology#keyClasses", false);

    /**
     * Label: lastName^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The surname of a person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI lastName = new URIImpl("http://omv.ontoware.org/2005/05/ontology#lastName", false);

    /**
     * Label: notes^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Additional information can be expressed here. Kind of like the stuff you don't want to put inside documentation^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI notes = new URIImpl("http://omv.ontoware.org/2005/05/ontology#notes", false);

    /**
     * Label: knownUsage^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI knownUsage = new URIImpl("http://omv.ontoware.org/2005/05/ontology#knownUsage", false);

    /**
     * Label: keywords^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: List of keywords related to an ontology. Typically this set includes words that describe the content of the ontology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI keywords = new URIImpl("http://omv.ontoware.org/2005/05/ontology#keywords", false);

    /**
     * Label: reference^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: List of bibliographic references describing the ontology and its applications^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI reference = new URIImpl("http://omv.ontoware.org/2005/05/ontology#reference", false);

    /**
     * Label: version^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Specifies the version information of the ontology. Version information could be useful for tracking, comparing and merging ontologies. The number could be incremented by 1, or a smaller or larger value, depending on the personal preference of the author.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI version = new URIImpl("http://omv.ontoware.org/2005/05/ontology#version", false);

    /**
     * Label: naturalLanguage^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The language of the content of the ontology,
i.e. English, German, etc.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI naturalLanguage = new URIImpl("http://omv.ontoware.org/2005/05/ontology#naturalLanguage", false);

    /**
     * Label: description^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Free text description of the formality level^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f19 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI description = new URIImpl("http://omv.ontoware.org/2005/05/ontology#description", false);

    /**
     * Label: city^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Name of the city (and zip code).^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Location 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI city = new URIImpl("http://omv.ontoware.org/2005/05/ontology#city", false);

    /**
     * Label: resourceLocator^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The location where the ontology can be found.
It should be accessible via a URL^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI resourceLocator = new URIImpl("http://omv.ontoware.org/2005/05/ontology#resourceLocator", false);

    /**
     * Label: street^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Name of the street and number (address).^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Location 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI street = new URIImpl("http://omv.ontoware.org/2005/05/ontology#street", false);

    /**
     * Label: documentation^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: URL for further documentation^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f30 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI documentation = new URIImpl("http://omv.ontoware.org/2005/05/ontology#documentation", false);

    /**
     * Label: state^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The state of a country.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Location 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI state = new URIImpl("http://omv.ontoware.org/2005/05/ontology#state", false);

    /**
     * Label: faxNumber^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The fax number of a person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI faxNumber = new URIImpl("http://omv.ontoware.org/2005/05/ontology#faxNumber", false);

    /**
     * Label: creationDate^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Date when the ontology was initially created^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI creationDate = new URIImpl("http://omv.ontoware.org/2005/05/ontology#creationDate", false);

    /**
     * Label: firstName^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The first name of a person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI firstName = new URIImpl("http://omv.ontoware.org/2005/05/ontology#firstName", false);

    /**
     * Label: URI^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The URI of the ontology which is described by this metadata^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f33 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI URI = new URIImpl("http://omv.ontoware.org/2005/05/ontology#URI", false);

    /**
     * Label: phoneNumber^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The phone number of a person^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI phoneNumber = new URIImpl("http://omv.ontoware.org/2005/05/ontology#phoneNumber", false);

    /**
     * Label: country^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The name of the country^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Location 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI country = new URIImpl("http://omv.ontoware.org/2005/05/ontology#country", false);

    /**
     * Label: name^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: The name by which this element is formally known.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f26 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI name = new URIImpl("http://omv.ontoware.org/2005/05/ontology#name", false);

    /**
     * Label: isLocatedAt^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#Location 
     */
    public static final URI isLocatedAt = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isLocatedAt", false);

    /**
     * Label: hasSyntax^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#OntologyLanguage 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologySyntax 
     */
    public static final URI hasSyntax = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasSyntax", false);

    /**
     * Label: isIncompatibleWith^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI isIncompatibleWith = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isIncompatibleWith", false);

    /**
     * Label: hasOntologyLanguage^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyLanguage 
     */
    public static final URI hasOntologyLanguage = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasOntologyLanguage", false);

    /**
     * Label: isContactPerson^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Person 
     * Range: http://omv.ontoware.org/2005/05/ontology#Organisation 
     */
    public static final URI isContactPerson = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isContactPerson", false);

    /**
     * Label: hasPriorVersion^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI hasPriorVersion = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasPriorVersion", false);

    /**
     * Label: hasAffiliatedParty^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI hasAffiliatedParty = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasAffiliatedParty", false);

    /**
     * Label: contributesToOntology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI contributesToOntology = new URIImpl("http://omv.ontoware.org/2005/05/ontology#contributesToOntology", false);

    /**
     * Label: hasOntologySyntax^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologySyntax 
     */
    public static final URI hasOntologySyntax = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasOntologySyntax", false);

    /**
     * Label: supportsRepresentationParadigm^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#OntologyLanguage 
     * Range: http://omv.ontoware.org/2005/05/ontology#KnowledgeRepresentationParadigm 
     */
    public static final URI supportsRepresentationParadigm = new URIImpl("http://omv.ontoware.org/2005/05/ontology#supportsRepresentationParadigm", false);

    /**
     * Label: defines^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyType 
     */
    public static final URI defines = new URIImpl("http://omv.ontoware.org/2005/05/ontology#defines", false);

    /**
     * Label: hasCreator^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI hasCreator = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasCreator", false);

    /**
     * Label: hasDomain^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyDomain 
     */
    public static final URI hasDomain = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasDomain", false);

    /**
     * Label: isSubDomainOf^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#OntologyDomain 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyDomain 
     */
    public static final URI isSubDomainOf = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isSubDomainOf", false);

    /**
     * Label: endorses^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI endorses = new URIImpl("http://omv.ontoware.org/2005/05/ontology#endorses", false);

    /**
     * Label: usedOntologyEngineeringTool^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyEngineeringTool 
     */
    public static final URI usedOntologyEngineeringTool = new URIImpl("http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool", false);

    /**
     * Label: hasContactPerson^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Organisation 
     * Range: http://omv.ontoware.org/2005/05/ontology#Person 
     */
    public static final URI hasContactPerson = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasContactPerson", false);

    /**
     * Label: hasContributor^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI hasContributor = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasContributor", false);

    /**
     * Label: conformsToKnowledgeRepresentationParadigm^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#KnowledgeRepresentationParadigm 
     */
    public static final URI conformsToKnowledgeRepresentationParadigm = new URIImpl("http://omv.ontoware.org/2005/05/ontology#conformsToKnowledgeRepresentationParadigm", false);

    /**
     * Label: definedBy^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#OntologyType 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI definedBy = new URIImpl("http://omv.ontoware.org/2005/05/ontology#definedBy", false);

    /**
     * Label: specifiedBy^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f49 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI specifiedBy = new URIImpl("http://omv.ontoware.org/2005/05/ontology#specifiedBy", false);

    /**
     * Label: isOfType^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyType 
     */
    public static final URI isOfType = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isOfType", false);

    /**
     * Label: hasFormalityLevel^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#FormalityLevel 
     */
    public static final URI hasFormalityLevel = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasFormalityLevel", false);

    /**
     * Label: isBackwardCompatibleWith^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI isBackwardCompatibleWith = new URIImpl("http://omv.ontoware.org/2005/05/ontology#isBackwardCompatibleWith", false);

    /**
     * Label: develops^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: -295801a0:12dce074205:-7f43 
     */
    public static final URI develops = new URIImpl("http://omv.ontoware.org/2005/05/ontology#develops", false);

    /**
     * Label: hasLicense^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#LicenseModel 
     */
    public static final URI hasLicense = new URIImpl("http://omv.ontoware.org/2005/05/ontology#hasLicense", false);

    /**
     * Label: createsOntology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI createsOntology = new URIImpl("http://omv.ontoware.org/2005/05/ontology#createsOntology", false);

    /**
     * Label: specifies^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Party 
     * Range: -295801a0:12dce074205:-7f46 
     */
    public static final URI specifies = new URIImpl("http://omv.ontoware.org/2005/05/ontology#specifies", false);

    /**
     * Label: developedBy^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: -295801a0:12dce074205:-7f4e 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI developedBy = new URIImpl("http://omv.ontoware.org/2005/05/ontology#developedBy", false);

    /**
     * Label: endorsedBy^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: Indicates the parties (i.e. organisations, people) that have expressed support or approval to the this ontology.^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Party 
     */
    public static final URI endorsedBy = new URIImpl("http://omv.ontoware.org/2005/05/ontology#endorsedBy", false);

    /**
     * Label: designedForOntologyTask^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyTask 
     */
    public static final URI designedForOntologyTask = new URIImpl("http://omv.ontoware.org/2005/05/ontology#designedForOntologyTask", false);

    /**
     * Label: useImports^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#Ontology 
     */
    public static final URI useImports = new URIImpl("http://omv.ontoware.org/2005/05/ontology#useImports", false);

    /**
     * Label: usedOntologyEngineeringMethodology^^http://www.w3.org/2001/XMLSchema#string 
     * Comment: http://omv.ontoware.org/2005/05/ontology#Ontology 
     * Range: http://omv.ontoware.org/2005/05/ontology#OntologyEngineeringMethodology 
     */
    public static final URI usedOntologyEngineeringMethodology = new URIImpl("http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringMethodology", false);

}
