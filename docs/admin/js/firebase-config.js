// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn4w6YiLXHEVu2Wb28QjjnENSzhadoGrc",
  authDomain: "webflare-design-co.firebaseapp.com",
  projectId: "webflare-design-co",
  storageBucket: "webflare-design-co.firebasestorage.app",
  messagingSenderId: "872383680352",
  appId: "1:872383680352:web:d808214063d21a2ae41805",
  measurementId: "G-MCHBYN6E33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence);

export { auth, db };



<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCiiw2Vz-KOvYsA4iTakmi8cu0WBc5d10g",
    authDomain: "login-51ae7.firebaseapp.com",
    projectId: "login-51ae7",
    storageBucket: "login-51ae7.firebasestorage.app",
    messagingSenderId: "843400288249",
    appId: "1:843400288249:web:0909a0b03c94ace9c64f28"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>