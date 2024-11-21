import { StyleSheet, Text, View, TextInput, Button, Alert, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { app } from "../../firebaseconfig"; // Certifique-se de que `app` está inicializado corretamente
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Profile() {
  const auth = getAuth(app); // Obtém a instância do Firebase Auth
  const [user, setUser] = useState(auth.currentUser); // Estado do usuário atual
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] ?? ""); // Primeiro nome
  const [lastName, setLastName] = useState(user?.displayName?.split(' ')[1] ?? ""); // Sobrenome
  const [Cellphone, setCellphone] = useState(""); // Telefone
  const [isUpdating, setIsUpdating] = useState(false); // Controle do botão de atualização
  const logout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
    }
  };
  useEffect(() => {
    // Atualiza o estado do usuário sempre que a autenticação muda
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  async function handleUpdateProfile() {
    if (!firstName || !lastName || !Cellphone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return; // Impede a atualização se os campos estiverem vazios
    }
  
    // Verifica se o usuário atual não é nulo
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Erro", "Nenhum usuário autenticado.");
      return; // Interrompe a execução se não houver usuário
    }
  
    try {
      setIsUpdating(true); // Desabilita o botão enquanto a atualização ocorre
  
      // Atualiza o perfil do usuário com o nome completo
      await updateProfile(currentUser, {
        displayName: `${firstName} ${lastName} ${Cellphone}`,
      });
  
      console.log("Perfil atualizado:", currentUser);
      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
    } catch (err) {
      console.log("Erro ao atualizar:", err);
      Alert.alert("Erro", "Houve um problema ao atualizar seu perfil.");
    } finally {
      setIsUpdating(false); // Reabilita o botão após a atualização
    }
  }

  return (
    <View style={styles.container}>
      {user?.displayName && (
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Bem-vindo: {user.displayName}
        </Text>
      )}
      {/* Botão de logout */}
      <Pressable style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={18} color="#FFF" />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Digite seu primeiro nome..."
        style={styles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Digite seu sobrenome..."
        style={styles.input}
      />
      <TextInput
        value={Cellphone}
        onChangeText={setCellphone}
        placeholder="Digite seu Telefone..."
        style={styles.input}
      />

      <Button
        title={isUpdating ? "Atualizando..." : "Atualizar perfil"}
        onPress={handleUpdateProfile}
        color="#121212"
        disabled={isUpdating} // Desabilita o botão enquanto atualiza
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
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
  logoutButton: {
    backgroundColor: '#070b0f',
    padding: 10, // Aumentando o tamanho do botão para tornar mais fácil de clicar
    borderRadius: 50, // Mantendo o botão redondo
    position: 'absolute', // Para fixar o botão no canto
    top: 20, // Distância do topo da tela
    right: 20, // Distância da borda direita da tela
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999, // Garantir que o botão fique acima de outros componentes
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
});
