
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("training.adminDashboard.controller.App", {

        onInit: function () {
            var oDashboardModel = new JSONModel({
                totalSessions: 0,
                activeEnrolments: 0,
                totalEmployees: 0,
                availableSeats: 0,
                loading: true
            });

            var oTrainersModel = new JSONModel({
                items: []
            });

            this.getView().setModel(oDashboardModel, "dashboard");
            this.getView().setModel(oTrainersModel, "trainers");

            this.loadDashboardStats();
            this.loadTrainerProfiles();
        },

        onRefresh: function () {
            this.loadDashboardStats();
            this.loadTrainerProfiles();
            MessageToast.show("Refreshing dashboard...");
        },

        onRefreshTrainers: function () {
            this.loadTrainerProfiles();
            MessageToast.show("Refreshing trainer profiles...");
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
                        throw new Error(
                            "Access denied. Admin privileges are required."
                        );
                    }

                    if (!response.ok) {
                        throw new Error(
                            "Unable to load dashboard statistics."
                        );
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
        },

        
loadTrainerProfiles: function () {
    var oTrainerModel = this.getView().getModel("trainers");

    function getCollection(url) {
        return fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin"
        }).then(function (response) {
            if (!response.ok) {
                throw new Error(
                    "Unable to load trainer information: " + url
                );
            }

            return response.json();
        }).then(function (data) {
            return data.value || [];
        });
    }

    Promise.all([
        getCollection("/training/Trainers?$select=ID,fullName,email,phone"),
        getCollection("/training/Courses?$select=ID,title,trainer_ID"),
        getCollection("/training/Sessions?$select=ID,course_ID"),
        getCollection("/training/Enrolments?$select=session_ID,status")
    ])
        .then(function (results) {
            var aTrainers = results[0];
            var aCourses = results[1];
            var aSessions = results[2];
            var aEnrolments = results[3];

            var mTrainerByID = {};
            var mSessionByID = {};
            var mCourseStats = {};

            aTrainers.forEach(function (trainer) {
                mTrainerByID[trainer.ID] = trainer;
            });

            aCourses.forEach(function (course) {
                mCourseStats[course.ID] = {
                    activeEnrolments: 0
                };
            });

            aSessions.forEach(function (session) {
                mSessionByID[session.ID] = session;
            });

            aEnrolments.forEach(function (enrolment) {
                if (
                    String(enrolment.status).toUpperCase() !== "ACTIVE"
                ) {
                    return;
                }

                var session = mSessionByID[enrolment.session_ID];

                if (!session || !session.course_ID) {
                    return;
                }

                var courseStats = mCourseStats[session.course_ID];

                if (courseStats) {
                    courseStats.activeEnrolments++;
                }
            });

            var aItems = aCourses.map(function (course) {
                var trainer = mTrainerByID[course.trainer_ID] || {};
                var stats = mCourseStats[course.ID];

                return {
                    fullName: trainer.fullName || "Unknown",
                    email: trainer.email || "",
                    phone: trainer.phone || "",
                    courseTitle: course.title,
                    activeEnrolments: stats.activeEnrolments
                };
            });

            oTrainerModel.setProperty("/items", aItems);
        })
        .catch(function (error) {
            MessageToast.show(
                "Unable to load trainer profiles."
            );
            console.error("Trainer profiles loading error:", error);
        });
}
    });
});
