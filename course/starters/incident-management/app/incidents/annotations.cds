using IncidentsService as service from '../../srv/incidents-service';

annotate service.Incidents with @(
    UI.HeaderInfo : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : 'Incident',
        TypeNamePlural : 'Incidents',
        Title          : {
            $Type : 'UI.DataField',
            Value : title,
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : status,
        },
    },
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Title',
                Value : title,
            },
            {
                $Type       : 'UI.DataField',
                Label       : 'Urgency',
                Value       : urgency,
                Criticality : criticality,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Business Partner',
                Value : businessPartner_ID,
            },
        ],
    },
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'GeneratedFacet1',
            Label  : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'ConversationFacet',
            Label  : 'Conversation',
            Target : 'messages/@UI.LineItem',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Title',
            Value : title,
        },
        {
            $Type       : 'UI.DataField',
            Label       : 'Urgency',
            Value       : urgency,
            Criticality : criticality,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Business Partner',
            Value : businessPartner.name,
        },
    ],
);

annotate service.ConversationMessages with @(
    UI.HeaderInfo : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : 'Message',
        TypeNamePlural : 'Messages',
        Title          : {
            $Type : 'UI.DataField',
            Value : author,
        },
    },
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Author',
            Value : author,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Message',
            Value : message,
        },
    ],
);

annotate service.Incidents with {
    businessPartner
        @Common.Text            : businessPartner.name
        @Common.TextArrangement : #TextOnly
        @Common.ValueList       : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'BusinessPartners',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : businessPartner_ID,
                    ValueListProperty : 'ID',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'businessPartnerId',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'name',
                },
            ],
        };
};
