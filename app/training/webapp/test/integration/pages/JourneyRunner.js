sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"training/training/test/integration/pages/SessionsList.gen",
	"training/training/test/integration/pages/SessionsObjectPage.gen"
], function (JourneyRunner, SessionsListGenerated, SessionsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('training/training') + '/test/flp.html#app-preview',
        pages: {
			onTheSessionsListGenerated: SessionsListGenerated,
			onTheSessionsObjectPageGenerated: SessionsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

