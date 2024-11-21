import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Pressable, TextInput, Image } from "react-native";
import { Link, useRouter } from "expo-router"; 
import * as Animatable from 'react-native-animatable';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseconfig';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    console.log("Login iniciado...");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Usuário retornado:", user); // Verificar se o usuário foi retornado
  
      if (user) {
        if (user.emailVerified) {
          console.log("Usuário autenticado com sucesso!");
          
          // Verifica se o usuário é administrador
          if (user.uid === "CMZHZjjXCxNbVwywO1anTjM2XCx1") {
            console.log("Administrador autenticado!");
            router.push('/(auth)/admin'); // Redireciona para a página de administração
          } else {
            console.log("Usuário comum autenticado!");
            router.push('/(auth)/home'); // Redireciona para a página home
          }
          
          setIsLoggedIn(true); // Atualiza o estado para indicar login bem-sucedido
        } else {
          console.log("Por favor, verifique seu email.");
        }
      }
    } catch (error:any) {
      console.log("Erro ao autenticar:", error.message); // Exibe erro se houver falha na autenticação
    }
  }
  

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1000}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      </Animatable.View>
      <Text style={styles.title}>Acessar Conta</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Digite seu email..."
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="Digite sua senha..."
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Acessar"
        color="#121212"
        onPress={handleSignIn} // Verificar se a função está sendo chamada corretamente
      />

      <Link href="/register" asChild>
        <Pressable style={styles.button}>
          <Text>Ainda não possui uma conta? Cadastre-se</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 14,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#121212',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    margin: 8,
    alignItems: 'center',
  },
});