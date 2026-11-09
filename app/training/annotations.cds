
using TrainingService as service from '../../srv/training-service';

annotate service.Sessions with {
    title @(
        cds.search,
        Common.Label : 'Training Title'
    );

    trainer @(
        cds.search,
        Common.Label : 'Trainer'
    );

    status @Common.Label : 'Session Status';
};

annotate service.Sessions with @(
    Capabilities.SearchRestrictions.Searchable : true,
   UI.SelectionFields : [
    status,
    title,
    trainer
],
    UI.HeaderInfo : {
        TypeName : 'Training Session',
        TypeNamePlural : 'Training Sessions',
        Title : {
            $Type : 'UI.DataField',
            Value : title
        },
        Description : {
            $Type : 'UI.DataField',
            Value : trainer
        }
    },

    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Training Title',
                Value : title,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Description',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Trainer',
                Value : trainer,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Start Date',
                Value : startDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'End Date',
                Value : endDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Location',
                Value : location,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Capacity',
                Value : capacity,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Enrolled Employees',
                Value : enrolledCount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Available Seats',
                Value : availableSeats,
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
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Training Title',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : description,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Trainer',
            Value : trainer,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Start Date',
            Value : startDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'End Date',
            Value : endDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Enrolled Employees',
            Value : enrolledCount,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Available Seats',
            Value : availableSeats,
        },
    ],
UI.Identification : [
    {
        $Type : 'UI.DataFieldForAction',
        Action : 'TrainingService.registerForTraining',
        Label : 'Register for Training',
    },
    {
        $Type : 'UI.DataFieldForAction',
        Action : 'TrainingService.closeSession',
        Label : 'Close Session',
        ![@UI.Hidden] : (not isAdmin),
    },
    {
        $Type : 'UI.DataFieldForAction',
        Action : 'TrainingService.reopenSession',
        Label : 'Reopen Session',
        ![@UI.Hidden] : (not isAdmin),
    },
],

    Capabilities.DeleteRestrictions : {
        Deletable : false
    },
);
