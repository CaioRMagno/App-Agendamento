import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import Config from 'react-native-config';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: "AIzaSyDS5hBUXYI4nw55qT-FqEUvZAqdLyXtaRM",
  authDomain: "agendamento-2ee56.firebaseapp.com",
  projectId: "agendamento-2ee56",
  storageBucket: "agendamento-2ee56.appspot.com",
  messagingSenderId: "1038770177663",
  appId: "1:1038770177663:web:92f59f309d23279a41e14a",
  measurementId: "G-D8EZXW1KTV",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as instâncias para uso no projeto
export { app, auth, db, firebaseConfig };
