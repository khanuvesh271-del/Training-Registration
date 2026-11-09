
using TrainingService as service from '../../srv/training-service';

annotate service.Enrolments with @(
    Capabilities.DeleteRestrictions : {
        Deletable : false
    },

    UI.HeaderInfo : {
        TypeName : 'Enrolment',
        TypeNamePlural : 'Enrolments',
        Title : {
            $Type : 'UI.DataField',
            Value : session.title,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : employeeID,
        },
    },

    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Training Title',
                Value : session.title,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Employee ID',
                Value : employeeID,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Enrolment Date',
                Value : enrolledAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status,
            },
        ],
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'Enrolment Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Training Title',
            Value : session.title,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Employee ID',
            Value : employeeID,
        },
        {
    $Type : 'UI.DataField',
    Label : 'Employee Name',
    Value : employeeName,
},
{
    $Type : 'UI.DataField',
    Label : 'Created By',
    Value : createdByName,
},
{
    $Type : 'UI.DataField',
    Label : 'Modified By',
    Value : modifiedByName,
},
        {
            $Type : 'UI.DataField',
            Label : 'Enrolment Date',
            Value : enrolledAt,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status,
        },
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'TrainingService.cancel',
            Label : 'Cancel Enrolment',
        },
    ],
);

annotate service.Enrolments with {
    session @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Sessions',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : session_ID,
                ValueListProperty : 'ID',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'title',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'trainer',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'startDate',
            },
        ],
    }
};
annotate service.Enrolments with {
    employeeID @(
        Common.Label : 'Employee ID',
        cds.search
    );

    status @Common.Label : 'Enrolment Status';
};

annotate service.Enrolments with @(
    Capabilities.SearchRestrictions.Searchable : true,

    UI.SelectionFields : [
        employeeID,
        status
    ]
);
annotate service.Enrolments with {
    createdBy @UI.Hidden : true;
    modifiedBy @UI.Hidden : true;
};