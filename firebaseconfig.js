import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Variáveis de ambiente
import { 
  REACT_APP_FIREBASE_API_KEY, 
  REACT_APP_FIREBASE_AUTH_DOMAIN, 
  REACT_APP_FIREBASE_PROJECT_ID, 
  REACT_APP_FIREBASE_STORAGE_BUCKET, 
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID, 
  REACT_APP_FIREBASE_APP_ID, 
  REACT_APP_FIREBASE_MEASUREMENT_ID 
} from 'react-native-dotenv';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: "AIzaSyDS5hBUXYI4nw55qT-FqEUvZAqdLyXtaRM",
  authDomain: "agendamento-2ee56.firebaseapp.com",
  projectId: "agendamento-2ee56",
  storageBucket: "agendamento-2ee56.appspot.com", // Corrigido
  messagingSenderId: "1038770177663",
  appId: "1:1038770177663:web:92f59f309d23279a41e14a",
  measurementId: "G-D8EZXW1KTV",
};

// Inicializa o Firebase apenas uma vez
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase
const auth = getAuth(app);         // Instância do Firebase Auth
const db = getFirestore(app);      // Instância do Firestore

// Exporta as instâncias para uso no projeto
export { app, auth, db, firebaseConfig };
