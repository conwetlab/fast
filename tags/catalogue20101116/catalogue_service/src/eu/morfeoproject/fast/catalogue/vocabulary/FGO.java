package eu.morfeoproject.fast.catalogue.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Thu Apr 08 13:10:08 BST 2010
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/fgo.rdf
 * namespace: http://purl.oclc.org/fast/ontology/gadget#
 */
public interface FGO {
	public static final URI NS_FGO = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#",false);

    /**
     * Label: Operator@en 
     * Comment: Any kind of component that is used to connect backend services to 
    form elements. Examples are simple pipes, aggregators or various kinds of 
    filters.@en 
     */
    public static final URI Operator = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Operator", false);

    /**
     */
    public static final URI Person = new URIImpl("http://xmlns.com/foaf/0.1/Person", false);

    /**
     */
    public static final URI BackendServiceDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#BackendServiceDefinition", false);

    /**
     * Label: Connector@en 
     * Comment: An explicit connection between two screens.@en 
     */
    public static final URI Connector = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Connector", false);

    /**
     * Label: Fact@en 
     * Comment: A fact is the atomic formal representation of a part of a condition.
	Therefore, several facts compose a condition.@en 
     */
    public static final URI Fact = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Fact", false);

    /**
     */
    public static final URI OperatorDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#OperatorDefinition", false);

    /**
     * Label: Flow Control Element@en 
     * Comment: Any kind of component which can restrict the default flow of screens 
    in a gadget.@en 
     */
    public static final URI FlowControlElement = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#FlowControlElement", false);

    /**
     */
    public static final URI FormDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#FormDefinition", false);

    /**
     * Label: Action@en 
     * Comment: An action represents a specific routine which will be performed when a certain
	condition is fulfilled within a certain screen component (i.e., the action 'showTable' will
	be performed when data from a service is received).@en 
     */
    public static final URI Action = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Action", false);

    /**
     * Label: Resource@en 
     * Comment: Anything that is part of a gadget (or the gadget itself). Tentatively 
    anything that can be 'touched' and moved around in the FAST IDE.@en 
     */
    public static final URI Resource = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Resource", false);

    /**
     * Label: Postcondition@en 
     * Comment: A postcondition is a result condition within a screenflow. It can be seen
    as an output of the screenflow.@en 
     */
    public static final URI Postcondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Postcondition", false);

    /**
     * Label: Action@en 
     * Comment: An action represents a specific routine which will be performed when a certain
	condition is fulfilled within a certain screen component (i.e., the action 'showTable' will
	be performed when data from a service is received).@en 
     */
    public static final URI Library = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Library", false);

    /**
     * Label: Screen Flow@en 
     * Comment: The complete gadget, a set of screens.@en 
     */
    public static final URI ScreenFlow = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenFlow", false);

    /**
     * Label: Screen Flow End@en 
     * Comment: A screen that ends the workflow of the gadget.@en 
     */
    public static final URI ScreenFlowEnd = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenFlowEnd", false);

    /**
     * Label: trigger@en 
     * Comment: Define a...@en 
     */
    public static final URI Trigger = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Trigger", false);

    /**
     * Label: Screen@en 
     * Comment: An individual screen.@en 
     */
    public static final URI Screen = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Screen", false);

    /**
     * Label: pipe or connector@en 
     * Comment: Define a pipe or connector between two resources. The connection is made
	specifying the conditions which will be connected.@en 
     */
    public static final URI Pipe = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Pipe", false);

    /**
     */
    public static final URI OnlineAccount = new URIImpl("http://xmlns.com/foaf/0.1/OnlineAccount", false);

    /**
     * Label: Resource reference@en 
     * Comment: It's a reference to a certain resource. Needs a 'id' for internal
	identification for the resource which is referencing it, and the 'uri' of the
	resource.@en 
     */
    public static final URI ResourceReference = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ResourceReference", false);

    /**
     * Label: Screen Flow Start@en 
     * Comment: The entry point to a wigdet; the first screen.@en 
     */
    public static final URI ScreenFlowStart = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenFlowStart", false);

    /**
     * Label: With-precondition@en 
     * Comment: Those kinds of resource which can have pre-conditions 
    (i.e., screens and screen flows).@en 
     */
    public static final URI WithPostConditions = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithPostConditions", false);

    /**
     */
    public static final URI User = new URIImpl("http://rdfs.org/sioc/ns#User", false);

    /**
     */
    public static final URI RightsStatement = new URIImpl("http://purl.org/dc/terms/RightsStatement", false);

    /**
     * Label: Precondition@en 
     * Comment: A precondition is a satisfied condition within a screenflow. It can be seen
    as an input of the screenflow.@en 
     */
    public static final URI Precondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Precondition", false);

    /**
     * Label: With-condition@en 
     * Comment: Those kinds of resource which can have both pre- or post-conditions.@en 
     */
    public static final URI WithConditions = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithConditions", false);

    /**
     * Label: With-precondition@en 
     * Comment: Those kinds of resource which can have pre-conditions 
    (i.e., screens and screen flows).@en 
     */
    public static final URI WithPreConditions = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#WithPreConditions", false);

    /**
     * Label: Screen definition@en 
     * Comment: Behaviour definition of a screen. This will contain which form, operators and 
	backend services the screen is composed, and how they are connected.@en 
     */
    public static final URI ScreenDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenDefinition", false);

    /**
     * Label: Screen Component@en 
     * Comment: A screen component is any resource which is part of a particular screen.@en 
     */
    public static final URI ScreenComponent = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#ScreenComponent", false);

    /**
     * Label: Resource definition@en 
     * Comment: Structural and behaviour definition of a resource.@en 
     */
    public static final URI Definition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Definition", false);

    /**
     */
    public static final URI Organization = new URIImpl("http://xmlns.com/foaf/0.1/Organization", false);

    /**
     * Label: Backend Service@en 
     * Comment: A Web service which provides data and/or functionality to a screen. 
    A backend service will often be external to FAST, and will probably have to be 
    wrapped by the screen.@en 
     */
    public static final URI BackendService = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#BackendService", false);

    /**
     * Label: Condition@en 
     * Comment: The pre- or post-condition of either a screen or a screenflow. In 
    the latter case, each target platform will use these conditions in its own way, 
    or may also ignore them. E.g., in EzWeb pre- and post-conditions correspond to 
    the concepts of slot and event.
	A condition can be seen as a RDF bag of facts, where every fact has to be true
	for the condition be true as well.@en 
     */
    public static final URI Condition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#Condition", false);

    /**
     * Label: Form Element@en 
     * Comment: Form elements are UI elements in a particular screen.@en 
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
     * Label: has id condition to@en 
     * Comment: condition id of the 'to' point of the pipe.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasIdConditionTo = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIdConditionTo", false);

    /**
     * Label: has pattern string@en 
     * Comment: This property is the textual representation of a condition.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Fact 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasPatternString = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPatternString", false);

    /**
     * Label: has trigger string@en 
     * Comment: This property represents the events fired within a building block. e.g. a 
	button to clear the shopping cart will fired a "clear cart" trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ScreenComponent 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasTrigger = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasTrigger", false);

    /**
     * Label: has version@en 
     * Comment: The version of a particular screen or screenflow, such as 1.0, 0.2beta, etc.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasVersion = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasVersion", false);

    /**
     * Label: has parameterTemplate@en 
     * Comment: A template string for custom parameters for any building block.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasParameterTemplate = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasParameterTemplate", false);

    /**
     * Label: is positive@en 
     * Comment: Facts can be set to a specific scope: design time, execution time,
	or both of them. This will define when they have to be taken into account by the
	inference engine or reasoner.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Fact 
     * Range: http://www.w3.org/2001/XMLSchema#boolean 
     */
    public static final URI isPositive = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#isPositive", false);

    /**
     * Label: has id building block to@en 
     * Comment: building block id of the 'to' point of the pipe or trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Trigger http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasIdBBTo = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIdBBTo", false);

    /**
     * Label: has id@en 
     * Comment: The internal ID of the resource within the container resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ResourceReference http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasId = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasId", false);

    /**
     * Label: has language string@en 
     * Comment: This property is the language the library is written in.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Library 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasLanguage = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasLanguage", false);

    /**
     * Label: has id condition from@en 
     * Comment: condition id of the 'from' point of the pipe.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasIdConditionFrom = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIdConditionFrom", false);

    /**
     * Label: has tag@en 
     * Comment: A tag is used to annotate keywords of a particular resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasTag = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasTag", false);

    /**
     */
    public static final URI title = new URIImpl("http://purl.org/dc/terms/title", false);

    /**
     * Label: has type@en 
     * Comment: The type of the resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasType = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasType", false);

    /**
     */
    public static final URI mbox_sha1sum = new URIImpl("http://xmlns.com/foaf/0.1/mbox_sha1sum", false);

    /**
     */
    public static final URI modified = new URIImpl("http://purl.org/dc/terms/modified", false);

    /**
     */
    public static final URI description = new URIImpl("http://purl.org/dc/terms/description", false);

    /**
     */
    public static final URI revision = new URIImpl("http://usefulinc.com/ns/doap#revision", false);

    /**
     * Label: has id action to@en 
     * Comment: action id of the 'to' point of the pipe or trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Trigger http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasIdActionTo = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIdActionTo", false);

    /**
     */
    public static final URI created = new URIImpl("http://purl.org/dc/terms/created", false);

    /**
     * Label: has name from@en 
     * Comment: name of the trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Trigger 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasNameFrom = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasNameFrom", false);

    /**
     * Label: has id building block from@en 
     * Comment: building block id of the 'from' point of the pipe or trigger.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Trigger http://purl.oclc.org/fast/ontology/gadget#Pipe 
     * Range: http://www.w3.org/2001/XMLSchema#string 
     */
    public static final URI hasIdBBFrom = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIdBBFrom", false);

    /**
     * Label: contains@en 
     * Comment: Many kinds of components in FAST can contain other components: 
    screenflows contain screens, screens contain forms or form elements, etc.
    It points to a resource reference to give a unique 'id' to each component
    within the resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource http://purl.oclc.org/fast/ontology/gadget#Definition 
     * Range: http://purl.oclc.org/fast/ontology/gadget#ResourceReference 
     */
    public static final URI contains = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#contains", false);

    /**
     * Label: has post-condition@en 
     * Comment: This property links certain type of resources to its post-condition, 
    i.e., the facts that are produced once the screen or screenflow has been 
    executed.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithPostConditions 
     * Range: http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI hasPostCondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPostCondition", false);

    /**
     * Label: has source@en 
     * Comment: URL of the source code of a particular library.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Library 
     * Range: http://xmlns.com/foaf/0.1/Document 
     */
    public static final URI hasSource = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasSource", false);

    /**
     * Label: has definition@en 
     * Comment: The structure and behaviour of a resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Definition 
     */
    public static final URI hasDefinition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasDefinition", false);

    /**
     */
    public static final URI creator = new URIImpl("http://purl.org/dc/terms/creator", false);

    /**
     * Label: has code@en 
     * Comment: URL of the executable code of a particular screen.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Screen 
     * Range: http://xmlns.com/foaf/0.1/Document 
     */
    public static final URI hasCode = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasCode", false);

    /**
     */
    public static final URI interest = new URIImpl("http://xmlns.com/foaf/0.1/interest", false);

    /**
     */
    public static final URI depiction = new URIImpl("http://xmlns.com/foaf/0.1/depiction", false);

    /**
     * Label: has library@en 
     * Comment: This property indicates which libraries are used by a screen component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ScreenComponent 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Library 
     */
    public static final URI hasLibrary = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasLibrary", false);

    /**
     * Label: integratesTerm@en 
     * Comment: A way to explicitly say that an ontology uses terms from another namespace. 
    Maybe a bit redundant, but why not.@en 
     */
    public static final URI integratesTerm = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#integratesTerm", false);

    /**
     * Label: has uri@en 
     * Comment: URI of a particular resource pointing from a reference within
	another resource.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ResourceReference 
     * Range: http://xmlns.com/foaf/0.1/Document 
     */
    public static final URI hasUri = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasUri", false);

    /**
     * Label: has pre-condition@en 
     * Comment: This property links certain type of resources to its pre-condition, i.e., 
    the facts that need to be fulfilled in order for this screen or screenflow to be 
    reachable.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#WithPreConditions 
     * Range: http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI hasPreCondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPreCondition", false);

    /**
     */
    public static final URI rights = new URIImpl("http://purl.org/dc/terms/rights", false);

    /**
     * Label: has pattern@en 
     * Comment: This property links a screen or screenflow to its pre-condition, 
    i.e., the facts that need to be fulfilled in order for this screen or screenflow 
    to be reachable.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Fact 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI hasPattern = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasPattern", false);

    /**
     */
    public static final URI mbox = new URIImpl("http://xmlns.com/foaf/0.1/mbox", false);

    /**
     */
    public static final URI holdsAccount = new URIImpl("http://xmlns.com/foaf/0.1/holdsAccount", false);

    /**
     * Label: has condition@en 
     * Comment: This property links a precondition or postcondition to a certain condition.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Precondition http://purl.oclc.org/fast/ontology/gadget#Postcondition 
     * Range: http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag http://purl.oclc.org/fast/ontology/gadget#Condition 
     */
    public static final URI hasCondition = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasCondition", false);

    /**
     */
    public static final URI rightsHolder = new URIImpl("http://purl.org/dc/terms/rightsHolder", false);

    /**
     */
    public static final URI subject = new URIImpl("http://purl.org/dc/terms/subject", false);

    /**
     * Label: has use string@en 
     * Comment: This property indicates concepts used within a building block, without being a 
	pre/postcondition.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Action 
     * Range: http://purl.oclc.org/fast/ontology/gadget#ResourceReference 
     */
    public static final URI hasUse = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasUse", false);

    /**
     * Label: has action@en 
     * Comment: This property indicates which actions are asociated and can be perfomed within 
	a screen component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#ScreenComponent 
     * Range: http://purl.oclc.org/fast/ontology/gadget#Action 
     */
    public static final URI hasAction = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasAction", false);

    /**
     */
    public static final URI member = new URIImpl("http://xmlns.com/foaf/0.1/member", false);

    /**
     * Label: has icon@en 
     * Comment: A small graphical representation of any FAST component or sub-component.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://xmlns.com/foaf/0.1/Image 
     */
    public static final URI hasIcon = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasIcon", false);

    /**
     * Label: has screenshot@en 
     * Comment: An image which shows a particular screen or screenflow in action, to 
    aid users in deciding which screen or screenflow to choose out of many.@en 
     * Comment: http://purl.oclc.org/fast/ontology/gadget#Resource 
     * Range: http://xmlns.com/foaf/0.1/Image 
     */
    public static final URI hasScreenshot = new URIImpl("http://purl.oclc.org/fast/ontology/gadget#hasScreenshot", false);

}
