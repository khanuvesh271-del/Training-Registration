
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("training.adminDashboard.controller.App", {

        onInit: function () {
            var oModel = new JSONModel({
                totalSessions: 0,
                activeEnrolments: 0,
                totalEmployees: 0,
                availableSeats: 0,
                loading: true
            });

            this.getView().setModel(oModel, "dashboard");

            this.loadDashboardStats();
        },
            onRefresh: function () {
    this.loadDashboardStats();
    MessageToast.show("Refreshing dashboard statistics...");
},
        loadDashboardStats: function () {
            var oModel = this.getView().getModel("dashboard");

            fetch("/training/getDashboardStats()", {
    method: "GET",
    headers: {
        "Accept": "application/json"
    },
    credentials: "same-origin"
})
                .then(function (response) {
                    if (response.status === 403) {
                        throw new Error("Access denied. Admin privileges are required.");
                    }

                    if (!response.ok) {
                        throw new Error("Unable to load dashboard statistics.");
                    }

                    return response.json();
                })
                .then(function (data) {
                    data.loading = false;
                    oModel.setData(data);
                })
                .catch(function (error) {
                    oModel.setProperty("/loading", false);
                    MessageToast.show(error.message);
                    console.error("Dashboard loading error:", error);
                });
        }

    });
});
