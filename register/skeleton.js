window.onload = execute();

function execute() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
//            setTimeout(function() {
//                window.location = "../main.html";
//            },5000);
//            
            
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
//            alert(uid);
            // ...
            var hospitalsRef = firebase.database().ref('hospitals');
            hospitalsRef.on('value',function(snapshot) {
                if(snapshot.hasChild(uid)) {
                    window.location = "../home";
                }
            });
            
        } else {
            // User is signed out.
            // ...
        }
    });
}

function registerUser() {
    var name = document.getElementById("name").value;
    var address = document.getElementById("address").value;
    var phone = document.getElementById("phone").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (name.length == 0 ||
        address.length == 0 ||
        phone.length == 0 ||
        email.length == 0 ||
        password.length == 0) {
        alert("Fields cannot be left empty");
        return;
    } else {
        // data is valid
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function () {
                writeUserData(firebase.auth().currentUser.uid, name, address, phone, email);
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("Registration Failed : " + errorCode + " : " + errorMessage);
                alert("Registration Failed : " + errorCode + " : " + errorMessage);
            });
    }

}

function writeUserData(userId, name, address, phone, email) {
    firebase.database().ref('hospitals/' + userId).set({
        name: name,
        address: address,
        phone: phone,
        email: email
    });
}

function redirectToLogin() {
    window.location = "../login/"
}

function logout() {
    firebase.auth().signOut().then(function () {
        alert('Signed Out');
    }, function (error) {
        console.error('Sign Out Error', error);
    });

}
