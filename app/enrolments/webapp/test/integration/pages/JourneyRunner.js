sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"training/enrolments/test/integration/pages/EnrolmentsList.gen",
	"training/enrolments/test/integration/pages/EnrolmentsObjectPage.gen"
], function (JourneyRunner, EnrolmentsListGenerated, EnrolmentsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('training/enrolments') + '/test/flp.html#app-preview',
        pages: {
			onTheEnrolmentsListGenerated: EnrolmentsListGenerated,
			onTheEnrolmentsObjectPageGenerated: EnrolmentsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

