Building Block Development Tutorial
===================================

This section contains the process to develop building blocks. We will describe
a step-by-step process, covering from the design to the deployment of the
building block into the GVS. 

There are different kind of building blocks available in the GVS (forms,
operators, resources or services...) which different requirements. This
tutorial will include the required steps to create building block of any type,
but instead of describing all the information for all of them, we have designed
the tutorial as a whole, describing a few features in each section, so for
understanding the development process completely, it is necessary to go through
all the tutorial.

All the present examples are available in the project SVN repository. You can
browse it and go to the [tutorial folder](https://svn.forge.morfeo-project.org/svn/fast-fp7project/trunk/GVS_data/tutorial).
The different steps of the development are covered in different file versions
of the building block being developed.

[TOC]

Pre-requisites
--------------

To follow this tutorial appropriately, it is necessary to have some background
in the following technologies:

* JavaScript
* HTML
* CSS
* JSON
* REST-like services
* XML


Introducing Building-blocks
---------------------------

In the context of FAST, a building-block is a fully functional piece of code
that can be used to create higher-level elements. The building-blocks are
developed using any web technology available, but using the JavaScript FAST
API, which will be described later on. In this tutorial we are going to focus
on developing building-blocks using JavaScript + CSS + HTML, but other
possibilities could be also available (at least for the user interface).

### Building block types ###

Forms 
:   A Form is the part of graphic design that deals in the arrangement
    and style treatment of elements (content) of the screens of FAST gadget.
    Moreover, a form establishes the visual communication and interaction mechanism
    with users (front-end). In FAST, the form will be a layout of a domain specific
    context with a set of interface actions.
Resources (a.k.a. Backend services or services) 
:   A resource is a simple component that owns a URI (Uniform Resource
    Identifier) and responds to requests made through basic HTTP verbs (i.e. GET,
    POST, PUT, and DELETE).  Bearing this in mind, the component model defines a
    resource as the key component required to wrap or adapt services for subsequent
    composition.  Resources can be seen as an abstraction of an invokable method
    (i.e. one specific method for a Web service, a POST method for a RESTFul
    service or any other kind back-end resource matching this concept).
Operators 
:   An Operator is intended to transform and/or modify data in
    piping steps. From an open point of view, it seems better not to fix the
    operators, letting a common interface apply it, for example, through as a kind
    of service. This way, it could be possible to extend a number of operator's
    implementations without modifications. Therefore, as result of the potential
    capacity of data transformation , the operator will play an important role in
    the process of alignment between ontologies because it can be used as an
    explicit mediator.
Screens 
:   From the screenflow builder point of view a screen is the key
    piece to build screenflows. FAST users will develop these basic pieces to allow
    the later screenflow composition. From the end-user perspective, a screen must
    be a fully functional piece giving access to backend services through a single
    user interface.

### The PRE-POST mechanism ###

As building blocks are intended to be composed with other building blocks, they
must share a common interface. This interface is based on the PRE-POST
mechanism. Every building-block has a set of pre-conditions which act as its
inputs and produces a set of post-conditions which act as outputs, all of them
formed by concepts from an ontology. Every concept or __fact__ will be filled
with data when the origin building block produces it, and this data can be
consumed by other building-blocks. The communication among building-blocks is
based on the transmission of these facts through a knowledge base.

Another remarkable issue is that building-block pre-conditions are organized in
__actions__. An action is a high-level operation carried out by the building
block. Each action will define its own pre-conditions, so when __all__ the
pre-conditions of a given action are satisfied, the action can run. For
instance, a form could define an action called "init" with no pre-conditions
which will initialize the user interface and another action called "show-user"
which will show user details, reading this data from a user fact, which will
act as the precondition for the show-user action.

The main thing a developer must consider regarding the pre- post- mechanism is
that the concepts she is dealing with are stored in the FAST Catalogue and have
their data structure well defined. Therefore, the building block's code must be
consistent with the data structure to make it reusable.

### Building-block basic pieces ###

Every building block is mainly composed by two different pieces of information:
the source code and the meta-data. Each of them will be developed as separate
files, but their information is closely related, as we will see in following
sections.

#### Building-block meta-data ####

It is a [JSON](http://json.org)-like structure containing the non-functional
properties of the building block plus some needed information about the
building-block boundaries (pre and post conditions, external required
libraries, etc.). You can find an example of the meta-data below, which will be
further explained later on:

    :::json
    {
        "type":"form",
        "name":"Building Block Name",
        "code":"http://demo.fast.morfeo-project.org/gvsdata/buildingblock.html",
        "creationDate":"2010-06-30T17:00:00+0100",
        "creator":"admin",
        "description":{
            "en-gb":"This Building block does something and other thing"
        },
        "tags":[
            {
                "label":{
                    "en-gb":"thing"
                },
                "means":"http://dbpedia.org/page/thing"
            }
        ],
        "user":"admin",
        "homepage":"http://demo.fast.morfeo-project.org/gvsdata/amazonList",
        "icon":"http://demo.fast.morfeo-project.org/gvsdata/images/catalogue/buildingblock.png",
        "label":{
            "en-gb":"Building Block Name"
        },
        "rights":"http://creativecommons.org/",
        "screenshot":"http://demo.fast.morfeo-project.org/gvsdata/images/screenshots/buildingblock.png",
        "version":"1.0",
        "libraries":[
            "http://somedomain.com/somelibrary.js"
        ],
        "actions":[
            {
                "name":"init",
                "preconditions":[],
                "uses":[]
            },
            {
                "name":"doSomething",
                "preconditions":[
                    {
                        "id":"element",
                        "label":{
                            "en-gb":"An element"
                        },
                        "pattern":"?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://ontology.com#Element",
                        "positive":"true"
                    }
                ],
                "uses":[]
            }
        ],
        "postconditions":[
            {
                "id":"item",
                "label":{
                    "en-gb":"An item"
                },
                "pattern":"?Item http://ontology.com#Item",
                "positive":"true"
            }
        ],
        "triggers":[
            "somethingDone"
        ],
        "parameterized": true,
        "parameterTemplate": "{\n  \"param1\":\"value\" // Example data \n:q}"
    }
<div class="caption">__Listing 1.__ Building block JSON metadata</div>

In the next sub-sections we will cut the meta-data up into more understandable
pieces for making easy for any building-block developer to create the
building-block surroundings and focus her effort in the building-block actual
source code.

#### Building block code ####

The appearance of the code of a building block depends on the building block
type as they fulfil different type of functionality. However all of them are
mostly written using JavaScript (the forms, as they show the user interface as
well, must include also HTML and CSS). 

The main requirement of the code of a building block is that it must implement
a function for every action the developer has defined in the meta-data file,
following a very specific syntax that is explained in following subsections.
This function will receive all the pre-condition facts of the action as
parameters, so it is easy for the function's code to interact with the data
inside every fact. In the case of forms, the action functions will interact
with the user interface as we will see later on. The next chunk of code shows
an example of an operator (which will be discuss when talking about operators)

    :::javascript
    mix: function (list1, list2) {
        var mixedList = [];

        if (this.params && this.params.keyField) {
            var keyField = this.params.keyField;
            var mixedListHash = new Hash();

            for (var i = 0; i < list1.data.length; i++) {
                var item = list1.data[i];
                mixedListHash.set(item[keyField], item);
            }
            for (var i = 0; i < list2.data.length; i++) {
                var item = list2.data[i];
                mixedListHash.set(item[keyField], item);
            }

            mixedListHash.each(function (element) {
                mixedList.push(element.value);
            });

        } else {
            mixedList = list1.data.concat(list2.data);
        }
        var facts = [{id: 'mixedList', data: mixedList}];
        this.manageData([], facts, []);
    }
<div class="caption">__Listing 2.__ Building block code</div>

The Hello World Form
--------------------

In this section we will cover the creation of a Form following all the needed
steps. After reading this section, the developer should be able to create a
form for FAST. We are going to focus in a very simple example easy to follow
that will cover all the relevant features needed for form developing.

Our form will show a very simple user interface with the text `"Hello World!"`
and the user name coming from a pre-condition fact. We will create then an
input field and a button to demonstrate how to generate postconditions.

### Building the user interface ###

The first thing to do is to create the user interface for the form. To do so,
you must create an HTML file like in any other web applications. There are no
restrictions apart from the ones imposed by the language itself (and some minor
remarks that we will point out when necessary). Of course, it is also possible
to add CSS rules (in the same HTML or as an external file) to define the layout
and the Look \& Feel of the form. We will discuss about CSS later on. 

In these first steps, we are going to focus only in the user interface, so no
JavaScript logic will be added to the form.

Below you can find the first iteration of our form code.

    :::html
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
    <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8">
            <title>Hello World Form</title>
            <style type="text/css">
                    h1 {
                            color: #779dce;
                            font-size: 14pt;
                    }
                    #main {
                            background-color: #D7D7D7;
                            width: 90%;
                            min-width: 250px;
                            margin: 0px auto;
                            padding: 5ex 2ex;
                    }
                    #username {
                            font-weight: bold;
                    }
            </style>
    </head>
    <body>
            <div id="main">
                    <h1>Hello World Form!</h1>
                    <p>Welcome, <span id="username">nobody</span></p>
                    <p>How do you feel today?</p>
                    <div>
                            <input type="text" id="answer" value="Fine!"/>
                            <input type="button" id="send" value="send" />
                    </div>
            </div>
    </body>
    </html>
<div class="caption">__Listing 3.__ The hello world form</div>

As you can see, it is an standard HTML file including CSS rules as well. The
form visual contents are inside the `"main"` div and the style inside the CSS
tag. Regarding the CSS, there are no special rules for designing forms, but, as
they are going to be executed in different target platforms (with different
gadget size, for instance), the best approach is using relative positions,
control minimum and maximum width, etc. so the form will be displayed
appropriately in any platform. Note that we have chosen to place the CSS inside
the file. We could also have placed in an external file, but the form is going
to be deployed in several platforms, so the CSS and other external resources
(images, javascript files...) should be stored in external web servers, and
referenced from the HTML tag using the absolute path. 

When we have created the user interface for the form, if we wanted it to be a
form with no inputs or outputs (which is not the common case), this code would
be ready to deploy in the GVS. Next subsection will cover the next steps to do
so.

### Creating the meta-data and sharing the form ###

Once we have created the form, we are going to share it with the community, so
it can be used by anyone.

To do so, we have to go to our GVS (if we have one installed locally) or to the
public installation to share it with the whole FAST community.  Once we have
logged in, we can create a new building block from the application menu or from
the welcome screen by clicking in __Add building block from sources... ->
Form__, as we can see in the image below.

!![New building block dialog][1](figures/Newbuildingblock.png)

We then will choose the form name and version and two editors will appear. The
first one contains all the meta information of the building block in edition,
and the second one the actual source code of the building block.

!![Building block editor][2](figures/Buildingblockedition.png)

Given that we have already created our code, the only thing we have to do is
paste the form code into the appropriate area and fill in its metadata. To do
so we can either edit the JSON manually or access to the building block
properties clicking in the blue button in the toolbar area.

!![Building block properties][3](figures/Buildingblockproperties.png)

In this first step, we will only fill the building block non-functional
properties, such as description, tags, homepage, screenshot, etc. We will
discuss about other properties (actions, postconditions, triggers, etc.) later
on.

Once we have edited the building block properties, the resulting JSON should
look like the following code.

    :::json
    {
        "type":"form",
        "name":"Hello World Form",
        "creator":"admin",
        "description":{
            "en-gb":"This form salutes the user"
        },
        "tags":[],
        "user":"admin",
        "homepage":"http://demo.fast.morfeo-project.org/helloworld",
        "icon":"http://demo.fast.morfeo-project.org/gvsdata/images/catalogue/buildingblock.png",
        "label":{
            "en-gb":"Hello World Form"
        },
        "rights":"http://creativecommons.org/",
        "screenshot":"http://demo.fast.morfeo-project.org/gvsdata/images/screenshots/buildingblock.png",
        "version":"1.0",
        "libraries":[],
        "actions":[],
        "postconditions":[],
        "triggers":[]
    }
<div class="caption">__Listing 4.__ The hello world JSON</div>

After checking that everything is correct, we could share the building block
with the community by simply clicking in the share button located in the
toolbar area.

### Adding the presentation logic. Actions ###

The first version of our form is fine, but it does not do anything useful. If
we want to create a form that can be composed with other building blocks, it
must offer inputs and outputs (that is, pre- and post-conditions). The form
will need to define them and handle them within the source code. To do so, we
must add some JavaScript to the form HTML code. First of all, it is important
to notice that we must follow a very specific syntax and organize the form's
code in a [Prototype](http://prototypejs.org)-based class. Moreover, the syntax
of the variable that represents the class does not follow the JavaScript rules
for variables and the name is fixed and can not be changed, but do not worry,
when compiled, the form will be able to be executed. The basic structure of
the JavaScript of the form will be as follows.

    :::html
    <script type="text/javascript">
    var {{buildingblockid}} = Class.create(BuildingBlock, {
        /* method_name : function(pre1, pre2){
                 method_code
        }, */
    });
    </script>
<div class="caption">__Listing 5.__ BuildingBlock javascript code template</div>

As this class is Prototype-based, you can figure out that the library is
automatically added into the building block when compiling. Therefore, we can
use all Prototype methods and classes when writing the building block's code
(for a deeper understanding of what offers Prototype, have a look at its
[API](http://api.prototypejs.org).

<div class="info">
<div class="title">NOTE</div>
Prototype method <code>toJSON()</code> applied to arrays does not work in
Google environments (Google Gadgets, Orkut ...), so if you want to create
standard and reusable building blocks, you should not use that method. Instead,
it is possible to use <code>FastAPI.JSON.toJSON()</code>, provided by the
FAST API which will be detailed later on.
</div>


Now we have the code structure, we are going to create the form logic. To do
so, we must refresh the concept of action:

>  A set of actions can be defined for any building block being developed. They
>  can be seen as high-level operations that the building block carries out.
>  Every action has its own set of preconditions.   Therefore, we can say that a
>  building block is defined by its actions.

When developing a building block, we must think about the actions we are going
to implement. For instance, in our example, we could decide to create two
actions for the form, one for initializing all the user interface, arming the
event handlers and creating the data structures (if any) and another one for
getting the user fact and show the data in the user interface. To add an
action, we must fulfil two different tasks:

* Create the action information in the meta-data properties of the building
block. This will include state the action name and the action pre-conditions
(we will see in detail in our example). This can be done either by adding the
metainformation to the JSON structure or visually by adding the pre or post
condition to the appropriate area, as next figure depicts.
* Implement the action by adding a method to the building block class using the
action name as the method name, and the set of preconditions as the parameter
list.  Note that not every method of the building block class must be an
action, only the ones that are stated as action in the building block
properties. We can see the actions as the public methods of the class, and the
rest of methods as the private ones.

!![Adding a new action visually][4](figures/NewAction.png)

Following our example, we are going to create an initializing action, that we
are going to call `init` (we can choose any name for the action that does not
contain spaces or other invalid JavaScript characters for variables.  Reserved
JavaScript names plus `initialize` are also forbidden for action names). The
first thing to do is to create the action meta-data, adding a new item to the
action list. The item is a JSON object containing a name attribute (the action
name, which will be the same as the method name implementing the action), a
preconditions list and another list called `uses`, which represents optional
pre-conditions (that is, facts that will be used if they exist, but they are
not necessary for the action to execute). The init action does not need any
data as it only initialize the user interface, so it will not have any
precondition.

    :::json
    "actions":[
            {
                "name":"init",
                "preconditions":[
                ],
                "uses":[
                ]
            }
    ]
<div class="caption">__Listing 6.__ Action structure</div>

Once the action is defined, we must implement it. We are going to change a
little bit the original HTML, so make the init action useful. If you have a
look to the snippet below, note that we have remove the initial content in the
username and in the input field, to let the JavaScript to fulfil them.

    :::html
    <div id="main">
        <h1>Hello World Form!</h1>
        <p>Welcome, <span id="username"></span></p>
        <p>How do you feel today?</p>
        <div>
            <input type="text" id="answer" />
            <input type="button" id="send" value="Send" />
        </div>
    </div>
<div class="caption">__Listing 7.__ Part of form HTML</div>

We then add an init method without parameters (remember that the parameters of
the method are its preconditions) to our class, that updates the user interface
with the initial data:

    :::javascript
    var {{buildingblockid}} = Class.create(BuildingBlock, {
        init: function() {
            $("username").update("nobody");
            $("answer").value = "Fine!";
        },
    });
<div class="caption">__Listing 8.__ Init form method</div>

<div class="info">
<div class="title">NOTE</div>
The <code>$</code> function is a Prototype function to shortcut
<code>document.getElementById</code>. As we have stated before, inside a
building block it is possible to take advantage of all the Prototype API.
</div>

Once we have finish with our first action, we are going to create the most
useful action, the one that fulfils the user information, taking a user fact as
the precondition. As aforementioned, we must create the meta-information of the
action:

    :::json
     "actions":[
            {
                "name":"init",
                "preconditions":[
                ],
                "uses":[
                ]
            },
            {
                "name":"showUser",
                "preconditions":[
                    {
                        "id":"user",
                        "label":{
                            "en-gb":"A user"
                        },
                        "pattern":"?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://xmlns.com/foaf/0.1/Person",
                        "positive":"true"
                    }
                ],
                "uses":[
                ]
            }
     ],
<div class="caption">__Listing 9.__ Action with preconditions</div>

As you can see, we have added a new action called `showUser` with a list of one
precondition (the method will only have one input parameter). Each precondition
of an action is composed by several properties:

id
:   It represents the unique identifier of the precondition. It is the same
    name as the parameter of the action method

label
:   Human readable representation of the precondition. It can be internationalized.

pattern
:   SPARQL sentence that represents the precondition. For most of the cases,
    following the above syntax is enough. That syntax represents: "There is a fact
    that is a Person from the ontology `http://xmlns.com/foaf/0.1/`" (the [FOAF](http://www.foaf-project.org/) ontology). Right now, the GVS does not allow more complex 
    syntaxes. The ontology in which the concept is defined must be stored in 
    the FAST Catalogue.

positive
:   Boolean added due to the shortcomings of the SPARQL syntax, which does not
    allow to have negative statements(for instance, "there is not a user"). If
    positive is set to false, the precondition will be treated as negative.

Now that we have defined the action, we have to create the code for the action.

    :::javascript
    var {{buildingblockid}} = Class.create(BuildingBlock, {
        init: function() {
            $("username").update("nobody");
            $("answer").value = "Fine!";
        },
        showUser: function(user) {
            /* user = {
                "uri": "factUri",
                "data": {
                    "username": "...",
                    "email": "..."
                }
            }*/
            if (user.data && user.data.username) {
                $("username").update(user.data.username);
            }
        }
    });
<div class="caption">__Listing 10.__ showUser method</div>

As you can see, we have added a new method to our class. The method `showUser`
receives a parameter, called `user`, which represents the precondition fact of
the type `User` coming from the ontology defined in meta-data. 

Every fact received as a precondition is an object with two fields: `uri`, which
contains the uri of the concept in the ontology, and `data`, which contains the
actual information of the instance of the fact. Note that the internal
organization of the data attribute depends on the fact definition in the
ontology (which must state which is the internal datatype structure for every
fact), and it is responsibility of developers to follow that definition. In our
case, we suppose that the User fact contains a string called `"username"` and
other string called `"email"`. At execution time, the code will receive the data
property filled with the appropriate structure and information.

The action code only takes the user information from the precondition and
updates the user interface to show it.

### Producing post-conditions. The manageData method ###

Right now, our form is fully functional, taking data input and showing it to
the user. But we can also take data from the user and output it, so another
building block can use it. To do so, we must add post-conditions to the
building block.

If you remember the initial user interface, we added an input field and a
button. We can take the information filled in this text field and produce a
postcondition. The first thing we have to do is to add the post-condition or
post-conditions into the meta-data. In our example, we are going to create one
post-condition for the message coming from the user.

    :::json
    "postconditions":[{ 
        "id":"message", 
        "label":{ 
            "en-gb":"A message telling something" 
        }, 
        "pattern":"?Message a http://yourdomain.com/FASTCatalogue/concepts/Message", 
        "positive":"true" 
    }]
<div class="caption">__Listing 10.__ Postcondition definition</div>


For every post-condition, the information is the same than in the
pre-conditions. The main difference is in the positive pattern. A false value
states that the related fact will be removed from the knowledge base.

Once we have filled the meta-data for the post-condition, we must write the
code that creates that postcondition. We are going to produce the
post-condition when the user clicks in the `Send` button, so we need to add an
event handler to the button. The best place to do so is in the init method, so
we are going to extend it by adding the event handling registration:

    :::javascript
    init: function() {
         $("username").update("nobody");
         $("answer").value = "Fine!";
         $("send").observe("click", this._onClick.bind(this));
    },
<div class="caption">__Listing 11.__ init method</div>


Note that we are referencing a method that does not exist yet (`_onClick`), but
we are going to create it right now. We use the Prototype's `bind` function,
which set the context for the execution of that function (it is a common
practice when adding class methods as event handlers).`onClick` method will be
a "private" method of the class and not an action (a good way for identifying
private methods in JavaScript is to start them with an underline), but we add
it to the class following the same procedure than previously:

    :::javascript
    _onClick: function(e) {
          var message = {
               'id': 'message',
               'data': {
                   'message': $("answer").value
                }
          };
          this.manageData([], [message], []);
    }
<div class="caption">__Listing 12.__ onClick method</div>

The method is very simple. We create a new fact, following a similar structure
than the preconditions. It is an object with an id attribute that refers to the
id of the postcondition in the meta-data file, and a data attribute with the
actual data of the fact (in our case, a message that contains the value of the
input field). After creating the fact, it is time to produce the
post-condition. To do so, we must called the method `manageData`, which is
inherited from the BuildingBlock class. This method receives three parameters:
the first parameter is a list of triggers produced by the building block (we
will explain the trigger functionality later on). The second one is the list of
post-condition facts that will be added to the Knowledge Base (all the
post-conditions with `positive:true`) and the latest one is the list of
post-conditions that will be removed from the Knowledge Base (all the
post-conditions with `positive:false`). After calling the manage data function,
the post-conditions are created, and other building blocks will be informed and
will be able to use the produced information.

### Testing the form ###

TODO

### Event propagation. Triggers ###

TODO

Service (Resource) development
------------------------------

Now we have created our first form, it is time to see how to create service
wrappings or resources in the context of FAST.

Create building blocks that access to services is very similar to create forms.
The main difference is that a resource does not include user interface, so the
HTML part is not needed. The only thing we have to code is the JavaScript part
that will access to the actual service. As we rely only in JavaScript
technology, we cannot access to non-HTTP services. On the opposite, REST-based
services are the most suitable ones to be wrapped as FAST resources.

To demonstrate how to create resources we are going to use the
[Twitter API](http://apiwiki.twitter.com/Twitter-API-Documentation) for querying
tweets from Twitter. This service offer a REST-based interface with JSON for
data interchange, so it is very suitable for learning purposes.


In this section, we are going to focus in the main differences between form and
resource development, taking some things from granted. For instance, action and
post-condition management is done exactly the same than in form development, so
we will not stop in explaining them again.

### Creating the Service functionality ###

Once we have identified a service that we want to wrap (in our case, Twitter
search service), we must define the resource boundaries, that is, pre- and
post-conditions. Normally only one action is defined per resource, in order to
decouple functionality (if a resource carries out two actions, why don't you
split into two different resources?). In this example, we are going to create
only one action, called "search", that will have only one pre-condition, a
search criteria composed of the search keys. This action will produce one
postcondition, the list of tweets. The meta-data file of the resource could be
as follows:

    :::json
    { 
        "type": "resource",
        "name":"Twitter search service", 
        "creator":"admin", 
        "description":{ 
            "en-gb":"This service returns a list of tweets for a given query" 
        }, 
        "tags":[], 
        "user":"admin", 
        "homepage":"http://demo.fast.morfeo-project.org/twittersearch", 
        "icon":"http://demo.fast.morfeo-project.org/gvsdata/images/catalogue/buildingblock.png", 
        "label":{ 
            "en-gb":"Twitter search service" 
        }, 
        "rights":"http://creativecommons.org/", 
        "screenshot":"http://demo.fast.morfeo-project.org/gvsdata/images/screenshots/buildingblock.png", 
        "version":"1.0", 
        "libraries":[], 
        "actions":[ 
            { 
                "name":"search", 
                "preconditions":[ 
                    { 
                        "id":"searchCriteria", 
                        "label":{ 
                            "en-gb":"A search criteria in form of keywords" 
                        }, 
                        "pattern":"?x a http://ourdomain.com/FASTCatalogue/concepts/SearchCriteria", 
                        "positive":"true" 
                    } 
                ],
                "uses":[
                ]
            }
        ],
        "postconditions":[
            [
                {
                    "id":"tweetList",
                    "label":{
                        "en-gb":"A list of tweets that matches the search criteria"
                    },
                    "pattern":"?x a http://yourdomain.com/FASTCatalogue/concepts/TweetList",
                    "positive":"true"
                }
            ]
        ],
        "triggers": []
    } 
<div class="caption">__Listing 13.__ Twitter List resource metainformation</div>

As you can see, we have declared one action called `search`, and a
postcondition called `tweetList`.

The source code of resources does not include any HTML tags. It is only a file
with the actions and auxiliary methods for the resource. It does not even
declare the class, as it is automatically added when compiling the resource.
Therefore, the resource code is not valid JavaScript as it is, but we discuss
later on how to test our resources.

So let's start coding. We are going to create the search action, which receives
a `searchCriteria` as its input pre-condition and calls the Twitter search
service with the data inside the `searchCriteria` pre-condition. 

It is important to notice that resources must called the services through the
`XMLHttpRequest` of JavaScript (AJAX calls), which does not allow to invoke URLs
located outside the same domain as the application. Therefore, it is necessary
to use a proxy to bypass this issue. Most of the mash-up platforms provide a
proxy, but using different APIs. For that reason, FAST provides the FAST API
which avoid the developer to deal with the different APIs by offering a common
interface for invoke remote URLs and other features we will see later. This
way, the developer only uses the FAST API, and the platform takes care of
providing the specific implementation of the API for the target mashup platform
when deploying a gadget. Our code for the Twitter search service will use the
AJAX features of the FAST API.

    :::javascript
    /**     
     * Search action
     */     
    search: function(searchCriteria) {
        var serviceURL = "http://search.twitter.com/search.json";
            
        var resultsPerPage = searchCriteria.data.resultsPerPage ?
                                searchCriteria.data.resultsPerPage : 15;
        var pageNumber = searchCriteria.data.pageNumber ?
                            searchCriteria.data.pageNumber : 1;
            
        var parameters = new Hash({
            "q" : searchCriteria.data.keywords, // query keywords
            "rpp" : resultsPerPage, // tweets per page
            "page" : pageNumber // page from results
        });         
        var url = serviceURL + "?" + parameters.toQueryString();
        new FastAPI.Request(url , {
            'method':       'get',
            'content':      'json',
            'context':      this,
            'onSuccess':    this._createList.bind(this)
        }); 
    },  

    /**
     * Create the tweetlist
     */
    _createList: function(responseJSON) {
        var tweetList = [];
        for (var i = 0; i < responseJSON.results.length; i++) {
            var tweet= responseJSON.results[i];
            tweetList.push(tweet);
        };

        var list = {
            "id": "tweetList",
            "data": tweetList
        };
        this.manageData([], [list], []);
    }
<div class="caption">__Listing 14.__ Twitter List resource implementation</div>

The code above show the whole implementation of the resource. First of all,
note that it is not necessary to declare the class that extends from building
block, but only the required methods following the aforementioned syntax. 

The action method (search) receives the `searchCriteria` which contains several
attributes, most of them optional. For instance, the attribute keywords
contains the set of keywords to search, and the `resultsPerPage` attribute, the
number of items that will be available when the searching process is carried
out. After building the service URL, we call it using the FAST API method
called `FastAPI.Request`, which performs an AJAX called to the passed URL,
returning results to the callback method specified in the `onSuccess`
attribute. Here, we are also telling to the request method that the expected
result will be in JSON format, so it can process the result and return the
parsed object to the callback method. 

Once the query to the service is done, `createList` will be called, passing
the service invocation results to the method. This method only cares about
building the post-condition of the building block, going through the object
returned by the service (whose internal structure is further explained
[here](http://apiwiki.twitter.com/Return-Values). 

And that's it! With these few lines of JavaScript code we have wrapped a
service that can be published and shared with the community to build screens.

### Testing the resource ###

Testing resources is not easy, as they rely mostly in the existence of a proxy
that redirects their service invocations. Moreover, developers only write the
relevant parts of the code, so it lacks of some pieces of code that are
mandatory for the resource to execute. Even more, resources are building blocks
without user interface, so everything gets more complicated. 

TODO

### Exploring the FAST API ###

Apart from the Request method already seen, there are a bunch of useful classes
and utilities to take advantage of the mashup platforms features. However, not
every platform covers the feature provided by the API, so the developer must be
aware that some of the features of her building block will not be fully
available in all the mashup platforms.

The API has a Javadoc-like documentation attached to its source code. It is
very complete and, for avoiding repetitions, we are not going to cover it in
this tutorial. For a deeper understanding of all the methods, the API
documentation can be found at
<http://demo.fast.morfeo-project.org/fast/gadget/doc/fastAPI/index.html>.

### Using external libraries ###

As we have discussed before, for creating resources, it is not necessary (and
not possible) to declare an HTML file, limiting the resource code scope to the
JavaScript part. Therefore, it is not possible to reference external JavaScript
libraries, which can be necessary at some point. In such cases, you can force
the building block to have the wanted libraries only by adding the references
to their absolute path in the meta-data properties of the building block, under
the "libraries" attribute.

    :::json
    "libraries": [
          {
              "language": "JavaScript",
              "source": "http://somedomain.com/js/mylibrary.js"
          }
    ]
<div class="caption">__Listing 15.__ Adding libraries.</div>

Creating an Operator
--------------------

Create an operator is as easy as creating a resource. It does not have any user
interface and the action and post-condition issues are exactly the same as in
other building blocks. The main difference between operators and resources is
their intended functionality. Operators are mainly designed for data
transformation or filtering, without accessing to any service or external
resource. Let's see it with an example.

We are going to create an operator that takes a list of elements and returns
the same list but ordered alphabetically. We will call it order.

The list of elements passed as pre-condition fact will be as generic as
possible. The unique restriction will be that every element of the list must
have an attribute called `name`.

The operator meta-data is similar to the ones we have been working with.

    :::json
    {
        "name":"Order operator",
        "creator":"admin",
        "type": "operator",
        "description":{
            "en-gb":"This operator takes a list of elements as pre-condition and
            returns the same list, but alphabetically ordered"
        },
        "tags":[],
        "user":"admin",
        "homepage":"http://demo.fast.morfeo-project.org/twittersearch",
        "icon":"http://demo.fast.morfeo-project.org/gvsdata/images/catalogue/buildingblock.png",
        "label":{
            "en-gb":"Order operator"
        },
        "rights":"http://creativecommons.org/",
        "screenshot":"http://demo.fast.morfeo-project.org/gvsdata/images/screenshots/buildingblock.png",
        "version":"1.0",
        "libraries":[],
        "actions":[
            {
                "name":"order",
                "preconditions":[
                    {
                        "id":"list",
                        "label":{
                            "en-gb":"A list of elements"
                        },
                        "pattern":"?List
                        http://www.w3.org/1999/02/22-rdf-syntax-ns#type
                        http://ourdomain.com/FASTCatalogue/concepts/List",
                        "positive":"true"
                    }
                ],
                "uses":[
                ]
            }
        ],
        "postconditions":[
            [
                {
                    "id":"orderedlist",
                    "label":{ 
                        "en-gb":"An ordered list of elements"
                    },
                    "pattern":"?List
                    http://www.w3.org/1999/02/22-rdf-syntax-ns#type
                    http://yourdomain.com/FASTCatalogue/concepts/List",
                    "positive":"true" 
                } 
            }]
        ],
        "triggers": [] 
    }
<div class="caption">__Listing 16.__ Operator metainformation</div>

On the other hand, the operator implementation is similar to the previous
resource but even simpler.

    :::javascript
    /**
     * Order action
     */ 
    order: function(list) {
        var unordered = list.data;
        var ordered = unordered.sort(function(element1, element2) {
            if (element1.name != null && element2.name != null) {
                return element1.name > element2.name;
            } else {
                return 0;
            }
        });
        var outputList = {
            "id": "orderedList",
            "data": ordered
        };
        this.manageData([], [outputList], []);
    }
<div class="caption">__Listing 17.__ Order operator implementation</div>

As you can see, takes an input list an return it ordered by its name parameter,
taking advantage of the JavaScript order function. To test this operator we
could use the same testing environment as the resource one.

### Building block parameterization ###

The operator we have created is useful, but very rigid. Imagine that we wanted
an operator for order reversely the list. We should have to create a new
operator which is very similar to this one. Why don't we use the
parameterization functionality that the GVS provides?

In the GVS there is a possibility to add some parameters to the building block,
which will be applied when deploying it. For a building block developer, it is
very easy to access to those parameters when writing the building block's code.

TODO

Building a screen outside the GVS
---------------------------------
TODO
