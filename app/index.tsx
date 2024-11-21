import { ActivityIndicator, Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={40} color="#121212" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#121212",
  },
});
