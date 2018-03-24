window.onload = execute();

function execute() {
    firebase.auth().signInWithEmailAndPassword("srs.shaan@gmail.com", "shantanu123").catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });
    
    firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    alert(uid);
    // ...
  } else {
    // User is signed out.
    // ...
  }
});
}