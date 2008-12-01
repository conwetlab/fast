var ScreenFactory = Class.create(ResourceFactory,
    /** @lends ScreenFactory.prototype */ {

    /**
     * Factory of screen resources.
     * @constructs
     * @extends ResouceFactory
     */
    initialize: function($super) {
        $super();
        var cataloguePath = 'images/catalogue/';

        this._resourceType = 'screen';
        this._resourceName = 'Screens';
        this._resourceDescriptions = [
            new ScreenDescription ({
                uri: 'http://TODO/amazonSearch',
                name: 'Product Search',
                desc: 'This screen allows users to look for a product in Amazon, providing a ' + 
                    'keyword search interface. It produces a search criteria or filter fact',
                pre: null,
                post: ['http://TODO/amazon#filter'],
                image: cataloguePath + 'amazonSearch.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonList',
                name: 'Product List',
                desc: 'his screen shows the results of a given search in Amazon.' +  
                    ' It allows users to choose a product to see its details',
                pre: ['http://TODO/amazon#filter'],
                post:['http://TODO/amazon#item'],
                image: cataloguePath + 'amazonList.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonProduct',
                name: 'Product Details',
                desc:'This screen shows the details for a given product selled ' +
                    'by Amazon. It allows users to add it to their shopping carts',
                pre: ['http://TODO/amazon#item'],
                post:['http://TODO/amazon#shoppingCart'],
                image: cataloguePath + 'amazonProduct.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonShopping',
                name: 'Shopping Cart',
                desc: 'This screen shows the list of products added to the user ' +
                    'shopping cart. It allows users to update product quantity ' +
                    'and clear the cart', 
                pre: ['http://TODO/amazon#shoppingCart'],
                post:['http://TODO/amazon#purchase'],
                image: cataloguePath + 'amazonShopping.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonOrder',
                name: 'Order',
                desc: 'This screen allows users to purchase their shopping cart. ' + 
                    'It shows an Amazon interface to fulfill the required data to ' +
                    'purchase the shopping cart',
                pre: ['http://TODO/amazon#purchase'],
                post: null,
                image: cataloguePath + 'amazonOrder.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonSuggestion',
                name: 'Suggestion List',
                desc: 'This screen shows the list of products related to a given one. ' +
                    'It allows users select a new product from this list',
                pre: ['http://TODO/amazon#item'],
                post:['http://TODO/amazon#item'],
                image: cataloguePath + 'amazonSuggestion.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/amazonPrice',
                name: 'P. Comparative',
                desc: 'This screen shows a price comparative for a given product',
                pre: ['http://TODO/amazon#item'],
                post:['http://TODO/amazon#shoppingCart'],
                image: cataloguePath + 'amazonPrice.png'
            }),
            new ScreenDescription ({
                uri: 'http://TODO/eBayList',
                name: 'eBay List',
                desc: 'This screen shows a list of products related to a given (amazon) item',
                pre: ['http://TODO/amazon#item'],
                post:['http://TODO/ebay#item'],
                image: cataloguePath + 'eBayList.png'
            })          
        ];  
    }
});

// vim:ts=4:sw=4:et: 
