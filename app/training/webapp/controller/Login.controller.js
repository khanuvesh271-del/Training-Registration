
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("training.training.controller.Login", {

        onLogin: async function () {
            const username = this.byId("username").getValue().trim();
            const password = this.byId("password").getValue();
            const errorMessage = this.byId("errorMessage");

            errorMessage.setVisible(false);

            if (!username || !password) {
                errorMessage.setText("Enter both username and password.");
                errorMessage.setVisible(true);
                return;
            }

            try {
                const response = await fetch("/demo-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    errorMessage.setText("Invalid username or password.");
                    errorMessage.setVisible(true);
                    return;
                }

                MessageToast.show("Login successful");

               window.location.replace(
    "/training.training/index.html#/sessions"
);

            } catch (error) {
                MessageBox.error("Unable to connect to the server.");
            }
        }
    });
});
