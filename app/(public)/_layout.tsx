import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#121212", // Cor de fundo do cabeçalho
        },
        headerTintColor: "#FFF", // Cor do texto do cabeçalho
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Login",
          headerShown: false, // Oculta o cabeçalho para a tela de login
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          headerTitle: "Criar Conta", // Título do cabeçalho
        }}
      />
    </Stack>
  );
}
