window.onload = execute();


let scanner;
var scanPatient;
var previewContainer;
var otpContainer;
var retrievePatientInfo;
var stopScanning;

var indexOfKey = null;
var encryptedKey = null;
var patientUserId = null;
var n = null;
var keyToEncryptKey = null;
var OTP = "";
var inverseKey = null;
var originalKey = null;
var uid = null;

var characters = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ' ', '@', '.', '+', '-',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');

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
            uid = user.uid;
            var providerData = user.providerData;
            //            alert(uid);
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
        processQRData(content);
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

function registerPatientToHospital() {
    var hospitalPatientRef = firebase.database();
    hospitalPatientRef.ref("hospitals/" + uid + "/patients").once('value').then(function (snapshot) {
        if (snapshot.hasChild(patientUserId)) {
            hospitalPatientRef.ref("hospitals/" + uid + "/patients/" + patientUserId).set(null);
        } else {
            // Add Patient to the Hospital's Database
            var patientRef = firebase.database().ref("users/" + patientUserId);
            patientRef.once('value').then(function (snapshot) {
                hospitalPatientRef.ref("hospitals/" + uid + "/patients/" + patientUserId).set(snapshot.val());
            });
        }
    });
}

function processQRData(content) {
    resetAllValues();
    var root = JSON.parse(content);
    encryptedKey = parseInt(root.encrypted_key);
    console.log('encryptedKey = ' + encryptedKey);
    patientUserId = root.user_id;
    console.log("patientUserId = " + patientUserId);
    n = parseInt(root.n);
    console.log("n = " + n);

    indexOfKey = n % 10;
    n = parseInt(n / 10);
    document.getElementById("otp0").focus();


}

function startRetrieving() {

    var elementId = "otp";
    OTP = "";
    for (i = 0; i < 6; i++) {
        otpValue = document.getElementById(elementId + i).value;
        if (otpValue.length == 0) {
            alert('Please provide the OTP');
            return;
        } else {
            OTP += otpValue;
        }
    }
    console.log('OTP = ' + OTP);
    if (indexOfKey == null) {
        alert("Please scan the QR code");
    } else {
        keyToEncryptKey = OTP.substr(indexOfKey, 2);
        console.log("keyToEncryptKey = " + keyToEncryptKey);
        console.log("modInverse(" + keyToEncryptKey + "," + n + ")");
        inverseKey = modInverse(keyToEncryptKey, n);
        console.log("inverseKey = " + inverseKey);

        originalKey = (encryptedKey * inverseKey) % n;
        console.log("originalKey = " + originalKey);
        startDecrypting();
    }
}

function startDecrypting() {

    console.log("patientUserId = " + patientUserId);
    var patientRef = firebase.database().ref("users/" + patientUserId);
    patientRef.once('value').then(function (snapshot) {
        if (snapshot.hasChild("name")) {
            console.log("TRUE");
        } else {
            console.log("FALSE");
        }
        decryptDetails(
            snapshot.val().name,
            snapshot.val().age,
            snapshot.val().bloodgroup,
            snapshot.val().gender,
            snapshot.val().email,
            snapshot.val().phone
        );
    });


}

function decryptDetails(name, age, bloodgroup, gender, email, phone) {
    var dName, dAge, dBloodgroup, dGender, dEmail, dPhone;
    dName = decryptText(name);
    dAge = decryptText(age);
    dBloodgroup = decryptText(bloodgroup);
    dGender = decryptText(gender);
    dEmail = decryptText(email);
    dPhone = decryptText(phone);

    updateRegisterButton();
    showDecryptedDetails(dName, dAge, dBloodgroup, dGender, dEmail, dPhone);
}

function updateRegisterButton() {
    var registerPatient = document.getElementById("register-patient");
    var hospitalPatientRef = firebase.database();
    hospitalPatientRef.ref("hospitals/" + uid + "/patients").on('value', function (snapshot) {
        if (snapshot.hasChild(patientUserId)) {
            registerPatient.setAttribute("style",
                "background-color : #aa0000;" +
                "top : 85%;" +
                "left : 73%;" +
                "opacity : 1;"
            );
            registerPatient.value = "Remove Patient";
        } else {
            registerPatient.setAttribute("style",
                "background-color : #33ee77;" +
                "top : 85%;" +
                "left : 73%;" +
                "opacity : 1;"
            );
            registerPatient.value = "Register Patient";
        }

    });
}

function showDecryptedDetails(dName, dAge, dBloodgroup, dGender, dEmail, dPhone) {
    var nameField = document.getElementById("patient-name");
    var ageField = document.getElementById("patient-age");
    var bloodgroupField = document.getElementById("patient-bloodgroup");
    var genderField = document.getElementById("patient-gender");
    var emailField = document.getElementById("patient-email");
    var phoneField = document.getElementById("patient-phone");

    nameField.innerHTML = dName;
    ageField.innerHTML = dAge;
    bloodgroupField.innerHTML = dBloodgroup;
    genderField.innerHTML = dGender;
    emailField.innerHTML = dEmail;
    phoneField.innerHTML = dPhone;

    stopScanningAndShowPatientDetails();
}

function decryptText(text) {
    var originalText = "";
    var p;
    var c;
    var inverseOriginalKey = modInverse(originalKey, characters.length);
    for (var i = 0; i < text.length; i++) {
        c = getIndex(text.charAt(i));
        p = (c * inverseOriginalKey) % characters.length;
        originalText += characters[p];
    }
    return originalText.toString();
}

function getIndex(c) {
    var i;
    for (i = 0; i < characters.length; i++) {
        if (c == characters[i]) {
            break;
        }
    }
    return i;
}

function modInverse(a, m) {
    a = a % m;
    for (var x = 1; x < m; x++)
        if ((a * x) % m == 1)
            return x;
    return 1;
}

function startScanning() {
    startCamera();

    scanPatient.setAttribute("style",
        "top : 25%;" +
        "left : 71%;" +
        "opacity: 1;" +
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

function resetAllValues() {
    indexOfKey = null;
    encryptedKey = null;
    patientUserId = null;
    n = null;
    keyToEncryptKey = null;

    OTP = "";
    inverseKey = null;
    originalKey = null;
    for (var i = 0; i < 6; i++) {
        document.getElementById("otp" + i).value = "";
    }
}

function stopScanningAndReset() {
    resetAllValues();
    stopScanningInfo();
    var patientInfoContainer = document.getElementById("patient-info-container");
    var registerPatient = document.getElementById("register-patient");
    var stopRegisteringPatient = document.getElementById("stop-registering-patient");

    patientInfoContainer.setAttribute("style",
        "top : -60%;" +
        "left : 75%;" +
        "opacity : 0;"
    );

    registerPatient.setAttribute("style",
        "top : 85%;" +
        "left : -10%;" +
        "opacity : 0;"
    );

    stopRegisteringPatient.setAttribute("style",
        "top : -20%;" +
        "left : 25%;" +
        "opacity : 1;"
    );


}


function stopScanningInfo() {

    scanPatient.setAttribute("style",
        "top : 50%;" +
        "left : 75%;" +
        "opacity: 1;" +
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

function stopScanningAndShowPatientDetails() {

    stopScanningInfo();

    var patientInfoContainer = document.getElementById("patient-info-container");
    var registerPatient = document.getElementById("register-patient");
    var stopRegisteringPatient = document.getElementById("stop-registering-patient");

    patientInfoContainer.setAttribute("style",
        "top : 20%;" +
        "left : 75%;" +
        "opacity : 1;"
    );

    registerPatient.setAttribute("style",
        "top : 85%;" +
        "left : 73%;" +
        "opacity : 1;"
    );

    stopRegisteringPatient.setAttribute("style",
        "top : 85%;" +
        "left : 82%;" +
        "opacity : 1;"
    );

    scanPatient.setAttribute("style",
        "top : -30%;" +
        "opacity : 0;" +
        "left : 75%;" +
        "background : #ff7043;" +
        "color : white;" +
        "box-shadow : 0px 0px 10px 1px rgba(0,0,0,0.5);" +
        "border : none;"
    );


}
