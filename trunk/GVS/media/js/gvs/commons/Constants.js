var Constants = {
    BuildingBlock: {
        SCREEN: 'screen',
        SCREENFLOW: 'screenflow',
        DOMAIN_CONCEPT: 'domainConcept',
        FORM: 'form',
        OPERATOR: 'operator',
        RESOURCE: 'resource'
    },
    BuildingBlockNames: {
        'screen': 'Screens',
        'domainConcept': 'Domain Concepts',
        'form': 'Forms',
        'operator': 'Operators',
        'resource': 'Services & Resources'
    },
    CatalogueCopies: {
        'screen': 'screens',
        'form': 'forms',
        'operator': 'operators',
        'resource': 'backendservices'
    }
};
Constants.CatalogueRelationships =  {
    "backendservices": Constants.BuildingBlock.RESOURCE,
    "forms": Constants.BuildingBlock.FORM,
    "operators": Constants.BuildingBlock.OPERATOR
};


