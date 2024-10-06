import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo, push, onValue, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { firebaseConf, apiUrl } from './config.js';


const url = apiUrl;

let name;
let db;
let app;
let myDBID;
let appName = "collaborative-grid";
let userColor = generateRandomColor();

const firebaseConfig = firebaseConf;

init(); //same as setup but we call it ourselves


function init() {
    console.log("init");
    app = initializeApp(firebaseConfig);
    db = getDatabase();
    const analytics = getAnalytics(app);
    connectToFirebaseAuth();
}

function generateRandomColor(){
    let randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    return randomColor;
}



function subscribeToUsers() {
    const commentsRef = ref(db, appName + '/users/');
    onChildAdded(commentsRef, (data) => {


    });
    onChildChanged(commentsRef, (data) => {
        let container = document.getElementById(data.key);
        if (!container) {
            container = addDiv(data.key, data);
        }
    });

    onChildRemoved(commentsRef, (data) => {
        console.log("removed", data.key, data.val());
    });
}


//____________________________________________________________________________________
//GRID STUFF
const gridContainer = document.getElementById("grid-container");
const blurSlider = document.getElementById("blur-slider");
const scaleSlider = document.getElementById("scale-slider");

document.addEventListener("DOMContentLoaded", () => {
    createGrid(7, 7);
    let cells = Array.from(document.getElementsByClassName("cell"));

    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            console.log("clicked", cell.id);
            const cellRef = ref(db, `${appName}/cells/${cell.id}`);
            get(cellRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let cellData = snapshot.val();
                    if (cellData.currentColor === "white") {
                        cell.style.backgroundColor = "rgb(0, 0, 0)";
                        cellData.blackCount += 1;
                        cellData.currentColor = "black";
                    } else {
                        cell.style.backgroundColor = "rgb(255, 255, 255)";
                        cellData.whiteCount += 1;
                        cellData.currentColor = "white";
                    }
                    set(cellRef, cellData);
                }
            });
        });
    });

    blurSlider.value = blurSlider.defaultValue;
    gridContainer.style.filter = `blur(${blurSlider.value}px)`;
    

    blurSlider.addEventListener("input", (event) => {
        const blurValue = event.target.value;
        gridContainer.style.filter = `blur(${blurValue}px)`;
    });

    scaleSlider.addEventListener("input", (event) => {
        const scaleValue = event.target.value;
        gridContainer.style.transform = `scale(${scaleValue})`;
    });
});


function createGrid(x, y) {
    gridContainer.style.gridTemplateColumns = `repeat(${x}, 48px)`;
    gridContainer.style.gridTemplateRows = `repeat(${y}, 48px)`;

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            const div = document.createElement("div");
            div.classList.add("cell");
            div.id = i + "-" + j;
            gridContainer.appendChild(div);

            const cellRef = ref(db, `${appName}/cells/${div.id}`);
            get(cellRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let cellData = snapshot.val();
                    if (cellData.blackCount > cellData.whiteCount) {
                        div.style.backgroundColor = "rgb(0, 0, 0)";
                        cellData.currentColor = "black";
                    } else if (cellData.whiteCount > cellData.blackCount) {
                        div.style.backgroundColor = "rgb(255, 255, 255)";
                        cellData.currentColor = "white";
                    } else {
                        // If counts are equal, choose randomly
                        const randomColor = Math.random() < 0.5 ? "black" : "white";
                        div.style.backgroundColor = randomColor === "black" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
                        cellData.currentColor = randomColor;
                    }
                    // Update the database with the currentColor
                    set(cellRef, cellData);
                } else {
                    // Initialize cell data in the database if it doesn't exist
                    set(cellRef, {
                        blackCount: 0,
                        whiteCount: 0,
                        currentColor: "white"
                    });
                    div.style.backgroundColor = "rgb(255, 255, 255)";
                }
            });
        }
    }
}




//____________________________________________________________________________________
/////AUTH STUFF
//the ui for firebase authentication doesn't use the modular syntax
let authUser;

let uiConfig;
let loggedIn = false;

let localUserEmail = "no email";

uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            authUser = authResult;
            console.log("succesfuly logged in", authResult.user.email);
            if (loggedIn) location.reload(); //reboot if this is a change.
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return false;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    tosUrl: '<your-tos-url>',
    privacyPolicyUrl: '<your-privacy-policy-url>'
};

function connectToFirebaseAuth() {
    firebase.initializeApp(firebaseConfig);
    //this allowed seperate tabs to have seperate logins
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    firebase.auth().onAuthStateChanged((firebaseAuthUser) => {
        console.log("my goodness there has been an auth change");
        document.getElementById("signOut").display = "block";
        if (!firebaseAuthUser) {
            document.getElementById("name").display = "none";
            document.getElementById("signOut").style.display = "none";
            console.log("no valid login, sign in again?");
            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            ui.start('#firebaseui-auth-container', uiConfig);

        } else {
            console.log("we have a user", firebaseAuthUser);
            authUser = firebaseAuthUser

            document.getElementById("signOut").style.display = "block";
            localUserEmail = authUser.multiFactor.user.email;
            myDBID = authUser.multiFactor.user.uid;
            console.log("authUser", authUser, "myDBID", myDBID);
            document.getElementById("name").innerHTML = authUser.multiFactor.user.displayName;
            // if (authUser.multiFactor.user.photoURL != null)
            //     document.getElementById("profile-image").src = authUser.multiFactor.user.photoURL;
            checkForUserInRegularDB(authUser.multiFactor.user);
            subscribeToUsers();

            let authWrapper = document.getElementById("firebaseui-auth-wrapper");
            let authContainer = document.getElementById("firebaseui-auth-container");
            authWrapper.classList.add("logged-in");
            authContainer.classList.add("logged-in");
        }
    });
}


//// ALL THE UI AUTH STUFF IS DONE IN THE OLD WEB PAGE NAME SPACE STYLE, NOT MODULAR
document.getElementById("signOut").addEventListener("click", function () {
    firebase.auth().signOut().then(function () {
        console.log("User signed out");
        location.reload();
    }).catch(function (error) {
        console.log("Error:", error);
    });
});


function checkForUserInRegularDB(user) {
    //write a firebase query to do look for a uid in the database
    console.log("checkForUserInDB", user.uid);
    db = getDatabase();
    let UIDRef = ref(db, appName + '/users/' + user.uid + "/");

    onValue(UIDRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let data = snapshot.val();

            console.log("someone by that id in db", myDBID, data);
        } else {
            giveAuthUserRegularDBEntry(authUser);
        }
    });

}


function giveAuthUserRegularDBEntry(authUser) {
    let testUserTemplate = {
        email: "dan@example.com",
        displayName: "Test User",
        photoURL: "emptyProfile.png",
        color: "#000000",
    };
    console.log("Authuser but no user info in DB yet", authUser, testUserTemplate);
    let email = authUser.email ?? testUserTemplate.email;
    let displayName = authUser.displayName ?? email.split("@")[0] ?? testUserTemplate.displayName;


    const db = getDatabase();
    set(ref(db, appName + '/users/' + authUser.uid + "/"), {
        'uid': authUser.uid,
        'email': authUser.email,
        'displayName': displayName,
        'color': userColor,
        'onlineStatus': "available",
    });

}


