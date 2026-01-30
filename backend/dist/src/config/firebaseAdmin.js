"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAuth = getFirebaseAuth;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let firebaseAuth = null;
function getFirebaseAuth() {
    if (firebaseAuth)
        return firebaseAuth;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    if (firebase_admin_1.default.apps.length === 0) {
        if (projectId && clientEmail && privateKeyRaw) {
            const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.applicationDefault(),
            });
        }
        else {
            throw new Error('Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS).');
        }
    }
    firebaseAuth = firebase_admin_1.default.auth();
    return firebaseAuth;
}
