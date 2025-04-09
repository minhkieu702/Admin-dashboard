importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAtAbV6sMft_doFAjrLp774VZWhEavz6MQ",
  authDomain: "fir-realtime-database-49344.firebaseapp.com",
  projectId: "fir-realtime-database-49344",
  storageBucket: "fir-realtime-database-49344.appspot.com",
  messagingSenderId: "423913316379",
  appId: "1:423913316379:web:201871eb6ae9dd2a0198be"
});

const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png"
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
