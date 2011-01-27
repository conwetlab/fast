package eu.morfeoproject.fast.catalogue.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Fri Jan 21 12:41:36 GMT 2011
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/fgo2010-11-30.rdf
 * namespace: http://purl.oclc.org/fast/ontology/gadget#
 */
public interface FGO {
	public static final URI NS_FGO = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#",false);

    /**
     * Label: BuildingBlock@en 
     * Comment: Anything that is part of a gadget. Tentatively anything that can be 'touched' and moved around in the FAST IDE, from the most complex units such as screen flows, down to atomic form elements like a button or a label in a form.@en 
     */
    public static final URI BuildingBlock = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#BuildingBlock", false);

    /**
     * Label: Operator@en 
     * Comment: Operators are intended to transform and/or modify data within a screen, usually for preparing data coming from service resources for the use in the screen's interface. Operators cover different kinds of data manipulations, from simple aggregation to mediating data with incompatible schemas.@en 
     */
    public static final URI Operator = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Operator", false);

    /**
     */
    public static final URI Person = new URIImpl("http://xmlns.com/foaf/0.1/Person", false);

    /**
     */
    public static final URI Tag = new URIImpl("http://commontag.org/ns#Tag", false);

    /**
     * Label: Action@en 
     * Comment: An action represents a specific routine which will be performed when a certain
condition is fulfilled within a certain screen component. Examples are methods of a Web service (e.g., getItem) or functionality to update or change the contents of a form.@en 
     */
    public static final URI Action = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Action", false);

    /**
     * Label: Resource@en 
     * Comment: A service resource in FAST is a wrapper around a Web service (the backend service), which makes the service available to the platform, e.g., by mapping its definition to FAST facts and actions.@en 
     */
    public static final URI Resource = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Resource", false);

    /**
     * Label: Form Element@en 
     * Comment: Form elements are UI elements in a particular screen, such as buttons, lists or labels.@en 
     */
    public static final URI FormElement = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#FormElement", false);

    /**
     * Label: Library@en 
     * Comment: Libraries are references to external code libraries required for the execution of a particular building block at runtime.@en 
     */
    public static final URI Library = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Library", false);

    /**
     * Label: Screen Flow@en 
     * Comment: A set of screens from which a gadget for a given target platform can be generated.@en 
     */
    public static final URI ScreenFlow = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenFlow", false);

    /**
     * Label: Trigger@en 
     * Comment: Triggers are the flip-side of actions. Certain events in a building block can cause a trigger to be fired. Other building blocks within the same screen, which are listening to it, will react with an action.@en 
     */
    public static final URI Trigger = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Trigger", false);

    /**
     * Label: Screen@en 
     * Comment: An individual screen; the basic unit of user interaction in FAST. A screen is the interface through which a user gets access to data and functionality of a backend service.@en 
     */
    public static final URI Screen = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Screen", false);

    /**
     * Label: pipe or connector@en 
     * Comment: Pipes are used to explicitly define the flow of data within a screen, e.g., from service resource to operator to a specific form element.@en 
     */
    public static final URI Pipe = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Pipe", false);

    /**
     */
    public static final URI OnlineAccount = new URIImpl("http://xmlns.com/foaf/0.1/OnlineAccount", false);

    /**
     * Label: With Post-condition@en 
     * Comment: Those kinds of building blocks which can have post-conditions.@en 
     */
    public static final URI WithPostConditions = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithPostConditions", false);

    /**
     */
    public static final URI User = new URIImpl("http://rdfs.org/sioc/ns#User", false);

    /**
     */
    public static final URI RightsStatement = new URIImpl("http://purl.org/dc/terms/RightsStatement", false);

    /**
     * Label: With Pre-condition@en 
     * Comment: Those kinds of building blocks which can have pre-conditions.@en 
     */
    public static final URI WithPreConditions = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithPreConditions", false);

    /**
     * Label: Screen Component@en 
     * Comment: Screens are made up of screen components, which fundamentally include service resources, operators and forms.@en 
     */
    public static final URI ScreenComponent = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenComponent", false);

    /**
     * Label: With Code@en 
     * Comment: Any kind of building block that can be defined as a whole through code.@en 
     */
    public static final URI WithCode = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithCode", false);

    /**
     * Label: With Definition@en 
     * Comment: Any kind of building block that can be defined declaratively in the GVS.@en 
     */
    public static final URI WithDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithDefinition", false);

    /**
     */
    public static final URI Organization = new URIImpl("http://xmlns.com/foaf/0.1/Organization", false);

    /**
     * Label: Backend Service@en 
     * Comment: A Web service which provides data and/or functionality to a screen. The actual backend service is external to FAST, and only available through a wrapper (the service Resource).@en 
     */
    public static final URI BackendService = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#BackendService", false);

    /**
     * Label: Condition@en 
     * Comment: The pre- or post-condition of a building block. If the building block is a screen flow, each target platform will use these conditions in its own way, or may also ignore them. E.g., in EzWeb pre- and post-conditions correspond to the concepts of slot and event.
A condition is made up of individual facts, where each fact is represented internally as an RDF triple, usually involving a variable of blank node.@en 
     */
    public static final URI Condition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Condition", false);

    /**
     * Label: Form@en 
     * Comment: A form is the visual aspect of a screen: its user interface. Each form is made up of individual form elements.@en 
     */
    public static final URI Form = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Form", false);

    /**
     */
    public static final URI Image = new URIImpl("http://xmlns.com/foaf/0.1/Image", false);

    /**
     */
    public static final URI accountName = new URIImpl("http://xmlns.com/foaf/0.1/accountName", false);

    /**
     */
    public static final URI name = new URIImpl("http://xmlns.com/foaf/0.1/name", false);

    /**
     * Label: has pattern string@en 
     * Comment: This property links to the textual representation of a fact (i.e., an RDF triple), e.g., in N3.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Condition 
     * Range: http://www.w3.org/2001/XMLSchema#String 
     */
    public static final URI hasPatternString = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPatternString", false);

    /**
     * Label: has trigger string@en 
     * Comment: This property links a buildiong block to a trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ScreenComponent 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Trigger 
     */
    public static final URI hasTrigger = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasTrigger", false);

    /**
     * Label: is positive@en 
     * Comment: Facts can be set to a specific scope: design time, execution time, or both of them. This property defines how they have to be taken into account by the inference engine or reasoner.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Condition 
     * Range: http://www.w3.org/2001/XMLSchema#boolean 
     */
    public static final URI isPositive = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#isPositive", false);

    /**
     * Label: has language string@en 
     * Comment: This property defines the programming language a particular programming library uses.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Library 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasLanguage = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasLanguage", false);

    /**
     */
    public static final URI title = new URIImpl("http://purl.org/dc/terms/title", false);

    /**
     */
    public static final URI mbox_sha1sum = new URIImpl("http://xmlns.com/foaf/0.1/mbox_sha1sum", false);

    /**
     */
    public static final URI revision = new URIImpl("http://usefulinc.com/ns/doap#revision", false);

    /**
     */
    public static final URI modified = new URIImpl("http://purl.org/dc/terms/modified", false);

    /**
     */
    public static final URI description = new URIImpl("http://purl.org/dc/terms/description", false);

    /**
     */
    public static final URI created = new URIImpl("http://purl.org/dc/terms/created", false);

    /**
     * Label: contains@en 
     * Comment: Many kinds of components in FAST can contain other components: screenflows contain screens, screens contain forms, operators and resources, forms contain form elements, etc.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     */
    public static final URI contains = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#contains", false);

    /**
     * Label: has post-condition@en 
     * Comment: This property links certain type of building blocks to their post-condition, i.e., the facts that are produced once the building block has been executed.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithPostConditions 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI hasPostCondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPostCondition", false);

    /**
     * Label: has operator@en 
     * Comment: If a screen is defined declaratively, this property links it to an operator it might contain.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Screen 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Operator 
     */
    public static final URI hasOperator = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasOperator", false);

    /**
     */
    public static final URI creator = new URIImpl("http://purl.org/dc/terms/creator", false);

    /**
     * Label: has form@en 
     * Comment: If a screen is defined declaratively, this property links it to its form (i.e., its visual user interface).@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Screen 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Form 
     */
    public static final URI hasForm = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasForm", false);

    /**
     */
    public static final URI tagged = new URIImpl("http://commontag.org/ns#tagged", false);

    /**
     * Label: from@en 
     * Comment: This property defines the starting point of a pipe within a screen. 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI from = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#from", false);

    /**
     * Label: has parameter template@en 
     * Comment: Building blocks which can receive parameters must specificy a template for it.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     */
    public static final URI hasParameterTemplate = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasParameterTemplate", false);

    /**
     * Label: has code@en 
     * Comment: This property links to the executable code of a particular building block (currently screens or screen components).@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithCode 
     * Range: http://xmlns.com/foaf/0.1/Document 
     */
    public static final URI hasCode = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasCode", false);

    /**
     * Label: has template@en 
     * Comment: Links the copy of a building block as used in a particular screen flow to its template, as used in the palette or catalogue of available building blocks.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     */
    public static final URI hasPrototype = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasTemplate", false);

    /**
     */
    public static final URI depiction = new URIImpl("http://xmlns.com/foaf/0.1/depiction", false);

    /**
     */
    public static final URI interest = new URIImpl("http://xmlns.com/foaf/0.1/interest", false);

    /**
     * Label: to@en 
     * Comment: This property defines the end point of a pipe within a screen. 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI to = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#to", false);

    /**
     * Label: has library@en 
     * Comment: This property indicates which programming libraries are used by the code of a screen component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithCode 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Library 
     */
    public static final URI hasLibrary = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasLibrary", false);

    /**
     * Label: has form element@en 
     * Comment: If a form is defined declaratively, its elements are linked to it with this property.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Form 
     * Range: http://purl.oclc.org/fast/ontology/gadget#FormElement 
     */
    public static final URI hasFormElement = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasFormElement", false);

    /**
     * Label: has pre-condition@en 
     * Comment: This property links certain type of building blocks to their pre-condition, i.e., the facts that need to be fulfilled in order for the building block to be reachable.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithPreConditions 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI hasPreCondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPreCondition", false);

    /**
     */
    public static final URI rights = new URIImpl("http://purl.org/dc/terms/rights", false);

    /**
     * Label: has pattern@en 
     * Comment: This property links the abstract representation of a fact (i.e., an RDF triple) in FAST to a graph resource containing the actual triple.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Condition 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI hasPattern = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPattern", false);

    /**
     */
    public static final URI means = new URIImpl("http://commontag.org/ns#means", false);

    /**
     */
    public static final URI mbox = new URIImpl("http://xmlns.com/foaf/0.1/mbox", false);

    /**
     */
    public static final URI holdsAccount = new URIImpl("http://xmlns.com/foaf/0.1/holdsAccount", false);

    /**
     */
    public static final URI rightsHolder = new URIImpl("http://purl.org/dc/terms/rightsHolder", false);

    /**
     * Label: integratesTerm@en 
     * Comment: A way to explicitly say that an ontology uses terms from another namespace.@en 
     */
    public static final URI integratesTerm = new URIImpl("http://data.semanticweb.org/ns/misc#integratesTerm", false);

    /**
     */
    public static final URI subject = new URIImpl("http://purl.org/dc/terms/subject", false);

    /**
     * Label: has copy@en 
     * Comment: Links the template of a building block as used in the palette or catalogue of available building blocks to its copy, as used in a particular screen flow.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     */
    public static final URI hasClone = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasCopy", false);

    /**
     * Label: has action@en 
     * Comment: This property indicates which actions are associated and can be perfomed within a screen component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ScreenComponent 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Action 
     */
    public static final URI hasAction = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasAction", false);

    /**
     * Label: uses@en 
     * Comment: This property indicates concepts used within a building block, without being a pre- or post-condition.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI uses = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#uses", false);

    /**
     */
    public static final URI member = new URIImpl("http://xmlns.com/foaf/0.1/member", false);

    /**
     * Label: has resource@en 
     * Comment: If a screen is defined declaratively, this property links it to its service resource (i.e., its backend).@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Screen 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Resource 
     */
    public static final URI hasResource = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasResource", false);

    /**
     * Label: has icon@en 
     * Comment: A small graphical representation of any FAST component or sub-component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://xmlns.com/foaf/0.1/Image 
     */
    public static final URI hasIcon = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIcon", false);

    /**
     * Label: has screenshot@en 
     * Comment: An image which shows a particular screen or screenflow in action, to aid users in deciding which screen or screenflow to choose out of many.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#BuildingBlock 
     * Range: http://xmlns.com/foaf/0.1/Image 
     */
    public static final URI hasScreenshot = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasScreenshot", false);

}
