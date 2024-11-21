import { StyleSheet, Text, View, Button, Image, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import * as Animatable from 'react-native-animatable';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../firebaseconfig';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Estado para armazenar mensagens de erro

  // Função para criar o usuário
  async function handleSignUp() {
    try {
      // Verificar se o e-mail já está em uso
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        setErrorMessage("Este e-mail já está em uso. Tente outro.");
        return; // Se o e-mail estiver em uso, não tenta criar a conta
      }

      // Criar usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Conta criada com sucesso:", user.email);
    } catch (error: any) {
      console.log(error.message);
      setErrorMessage("Erro ao criar conta. Tente novamente.");
    }
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1000}>
        {/* Logo */}
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      </Animatable.View>
      <Text style={styles.title}>Criar uma Conta</Text>

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : null}

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
        title="Criar conta"
        color="#121212"
        onPress={handleSignUp}
      />

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          <Text>Já possui uma conta? Faça o LogIn</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 300,     // Largura da logo
    height: 300,    // Altura da logo
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
