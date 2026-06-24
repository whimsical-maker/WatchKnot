import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "watchknot",
  });
}

export default admin;
