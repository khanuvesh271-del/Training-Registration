
sap.ui.define(
    [
        "sap/ui/core/mvc/ControllerExtension",
        "sap/ui/model/json/JSONModel"
    ],
    function (ControllerExtension, JSONModel) {
        "use strict";

        return ControllerExtension.extend(
            "training.training.ext.controller.Navigation",
            {
                override: {
                    onInit: function () {
                        const oAuthModel = new JSONModel({
                            isAdmin: false
                        });

                        this.base.getView().setModel(
                            oAuthModel,
                            "auth"
                        );

                        fetch("/demo-session", {
                            credentials: "same-origin"
                        })
                            .then(function (response) {
                                if (!response.ok) {
                                    throw new Error(
                                        "Unable to check user role"
                                    );
                                }

                                return response.json();
                            })
                            .then(function (data) {
                                oAuthModel.setProperty(
                                    "/isAdmin",
                                    data.isAdmin === true
                                );
                            })
                            .catch(function (error) {
                                console.error(
                                    "Role check failed:",
                                    error
                                );

                                oAuthModel.setProperty(
                                    "/isAdmin",
                                    false
                                );
                            });
                    }
                },

                onOpenEnrolments: function () {
                    window.location.assign(
                        "/training.enrolments/index.html"
                    );
                },

                onOpenAdminDashboard: function () {
                    window.location.assign(
                        "/training-admin-dashboard/index.html"
                    );
                }
            }
        );
    }
);
