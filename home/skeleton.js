window.onload = execute();


let scanner;
var scanPatient;
var previewContainer;
var otpContainer;
var retrievePatientInfo;
var stopScanning;

function execute() {

    scanPatient = document.getElementById('scan-patient');
    previewContainer = document.getElementById('preview-container');
    otpContainer = document.getElementById('otp-container');
    retrievePatientInfo = document.getElementById('retrieve-patient-info');
    stopScanning = document.getElementById('stop-scanning');
    
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
                    document.getElementById('container').style.opacity = '1';
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

function setFocus(obj) {
    obj.value = obj.value.slice(0, obj.maxLength);
    if (obj.value.length == 1) {
        var currentElementId = document.activeElement.id;
        if (currentElementId.charAt(3) != '5') {
            var index = parseInt(currentElementId.charAt(3)) + 1;
            var nextElementId = "otp" + index;
            document.getElementById(nextElementId).focus();
        } else {
            document.getElementById("retrieve-patient-info").focus();
        }
    }
}

function startCamera() {
    scanner = new Instascan.Scanner({
        video: document.getElementById('preview')
    });
    scanner.addListener('scan', function (content) {
        alert(content);
    });
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    });
}

function startScanning() {
    startCamera();

    scanPatient.setAttribute("style",
        "top : 25%;" +
        "left : 71%;" +
        "background : none;" +
        "color : rgb(200, 100, 209);" +
        "box-shadow : 0px 0px  0px 0px rgba(0,0,0,0);" +
        "border-bottom : 3px solid rgb(200, 100, 209);"
    );

    setTimeout(function () {
        previewContainer.setAttribute("style",
            "top: 35%;" +
            "opacity : 1;"
        );
    }, 500);

    otpContainer.setAttribute("style",
        "top:80%;" +
        "opacity:1;"
    );
    
    retrievePatientInfo.setAttribute("style",
        "top:90%;" +
        "opacity:1;"
    );
    
    
     stopScanning.setAttribute("style",
        "top:22%;" +
        "left: 88%;" + 
        "opacity:1;"
    );
}

function stopScanningInfo() {
    scanPatient.setAttribute("style",
        "top : 50%;" +
        "left : 75%;" +
        "background : #ff7043;" +
        "color : white;" +
        "box-shadow : 0px 0px 10px 1px rgba(0,0,0,0.5);" +
        "border : none;"
    );

    previewContainer.setAttribute("style",
        "top: -40%;" +
        "opacity : 0;"
    );

    otpContainer.setAttribute("style",
        "top:-20%;" +
        "opacity:1;"
    );
    
        retrievePatientInfo.setAttribute("style",
        "top:-10%;" +
        "opacity:0;"
    );
    
     stopScanning.setAttribute("style",
        "top:-20%;" +
        "left: 25%;" + 
        "opacity:0;"
    );

}
