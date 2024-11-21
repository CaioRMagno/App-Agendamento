import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Button, Alert } from 'react-native';

const LogoutButton = () => {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Desloga o usuário
      Alert.alert("Sucesso", "Você saiu da sua conta.");
      router.replace('/login'); // Redireciona para a tela de login
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair da conta.");
      console.error("Erro ao deslogar:", error);
    }
  };

  return <Button title="Sair" onPress={handleLogout} color="#FFF" />;
};

export default function StackPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const router = useRouter();

  // Verifica o status de autenticação do usuário
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false); // O estado de carregamento é alterado após o verificação de autenticação
      if (user) {
        setIsSignedIn(true); // Usuário autenticado
      } else {
        setIsSignedIn(false); // Usuário não autenticado
      }
    });

    return () => unsubscribe(); // Limpa o listener de autenticação
  }, []);

  // Redireciona para login caso o usuário não esteja autenticado, mas só depois que o carregamento for concluído
  useEffect(() => {
    if (!loading) {
      if (!isSignedIn) {
        router.replace('/login'); // Redireciona para o login
      }
    }
  }, [isSignedIn, router, loading]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#FFF',
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          headerTitle: 'Home',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: 'Minha Conta',
          headerRight: () => <LogoutButton />, // Renderiza o botão de logout
        }}
      />
    </Stack>
  );
}
