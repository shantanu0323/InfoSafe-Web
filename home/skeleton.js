window.onload = execute();

function execute() {

    firebase.auth().onAuthStateChanged(function (user) {
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
            var hospitalRef = firebase.database().ref('hospitals/' + uid);
            hospitalRef.once('value').then(function (snapshot) {
                //                alert(snapshot.val().name);
                document.getElementById('hospital-name').textContent = snapshot.val().name;
                document.getElementById('hospital-address').textContent = snapshot.val().address;
                document.getElementById('hospital-phone').textContent = snapshot.val().phone;
                document.getElementById('hospital-email').textContent = snapshot.val().email;

                setTimeout(function () {
                    document.getElementById('hospital-details').style.opacity = '1';
                }, 100);
            });

        } else {
            window.location = "../login/";
            // User is signed out.
            // ...
        }
    });
}

function loginUser() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });

}

function redirectToRegister() {
    window.location = "../register/";
}

function logout() {
    firebase.auth().signOut().then(function () {
        alert('Signed Out');
    }, function (error) {
        console.error('Sign Out Error', error);
    });

}
