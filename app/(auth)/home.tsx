import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Pressable, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router"; 
import RNPickerSelect from 'react-native-picker-select'; 
import { Feather } from '@expo/vector-icons'; 
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';


interface AvailableSlot {
  date: any;
  times: any[];
}
interface UserAppointment {
  id: string;
  service: string;
  date: string;
  time: string;
}
const Home = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userName, setUserName] = useState(""); 
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>([]); // Estado para armazenar os agendamentos do usuário

  
  const router = useRouter();
  const services = [
    { label: "Corte", value: "Corte" },
    { label: "Barba", value: "Barba" },
    { label: "Corte e Barba", value: "Corte e Barba" }
  ];

  const fetchAvailableSlots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "availableSlots"));
      const slots = querySnapshot.docs.map(doc => doc.data());
      const available = slots.filter(slot => !slot.isBooked);
      const uniqueDates = [...new Set(available.map(slot => slot.date))];
      const availableSlotsData = uniqueDates.map(date => {
        const times = available.filter(slot => slot.date === date).map(slot => slot.time);
        return { date, times };
      });
      setAvailableSlots(availableSlotsData);
    } catch (error) {
      console.error("Erro ao buscar slots disponíveis:", error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar os slots disponíveis.");
    }
  };

  const fetchUserAppointments = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userAppointmentsQuery = query(
          collection(db, "appointments"),
          where("username", "==", user.displayName)
        );
        const querySnapshot = await getDocs(userAppointmentsQuery);
  
        const appointments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          service: doc.data().service,
          date: doc.data().date,
          time: doc.data().time
        }));
  
        setUserAppointments(appointments); // Sem erros
      } else {
        Alert.alert("Erro", "Usuário não autenticado.");
      }
    } catch (error) {
      console.error("Erro ao buscar os agendamentos do usuário:", error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar os agendamentos do usuário.");
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
    fetchUserAppointments();

    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "Usuário");
    }
  }, []);

  const handleAgendamento = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    handleSaveAppointment(selectedService, selectedDate, selectedTime);
  };

  const handleSaveAppointment = async (service: any, date: any, time: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const username = user.displayName;
        const phoneNumber = user.phoneNumber || "Não informado";

        // Salvar o agendamento na coleção "appointments"
        const docRef = await addDoc(collection(db, "appointments"), {
          username,
          phoneNumber,
          service,
          date,
          time,
          timestamp: new Date(),
        });

        // Atualizar o slot selecionado para marcado como "isBooked: true"
        const slotRef = query(
          collection(db, "availableSlots"),
          where("date", "==", date),
          where("time", "==", time)
        );

        const slotSnapshot = await getDocs(slotRef);
        const slotDoc = slotSnapshot.docs[0]; // Assumindo que a combinação data/hora é única

        if (slotDoc) {
          await updateDoc(slotDoc.ref, {
            isBooked: true,
          });
        }

        Alert.alert("Sucesso", "Agendamento salvo com sucesso!");
        fetchUserAppointments(); // Atualiza a lista de agendamentos
        fetchAvailableSlots(); // Atualiza os slots disponíveis
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar o agendamento.");
    }
  };

  const handleCancelAgendamento = async (id : any, service : any , date : any, time : any) => {
    try {
      // Exclui o agendamento da coleção "appointments"
      await deleteDoc(doc(db, "appointments", id));
      setUserAppointments(userAppointments.filter(appointment => appointment.id !== id)); // Atualiza a lista de agendamentos
  
      // Atualiza o slot no banco de dados, setando "isBooked: false"
      const slotRef = query(
        collection(db, "availableSlots"),
        where("date", "==", date),
        where("time", "==", time)
      );
  
      const slotSnapshot = await getDocs(slotRef);
      const slotDoc = slotSnapshot.docs[0]; // Assumindo que a combinação data/hora é única
  
      if (slotDoc) {
        await updateDoc(slotDoc.ref, {
          isBooked: false, // Marca o slot como disponível novamente
        });
      }
  
      Alert.alert("Cancelado", "O agendamento foi cancelado com sucesso!");
      fetchAvailableSlots(); // Atualiza os slots disponíveis após o cancelamento
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      Alert.alert("Erro", "Ocorreu um erro ao cancelar o agendamento.");
    }
  };
  const logout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        {/* Botão de logout */}
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={18} color="#070000" />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>

        {/* Título e boas-vindas */}
        <Text style={styles.title}>Agendamento de Barbeiro</Text>

        {/* Saudação com nome do cliente */}
        <Text style={styles.greeting}>Olá, {userName}</Text>

        <Text style={styles.email}>Bem-vindo ao sistema de agendamento</Text>

        {/* Formulário de agendamento */}
        <View style={styles.form}>
          <Text style={styles.label}>Data do Agendamento:</Text>
          <RNPickerSelect
            value={selectedDate}
            onValueChange={setSelectedDate}
            items={availableSlots.map(slot => ({
              label: slot.date,
              value: slot.date,
            }))} 
            placeholder={{ label: 'Escolha a data', value: null }}
            style={pickerStyles}
          />

          <Text style={styles.label}>Hora do Agendamento:</Text>
          <RNPickerSelect
            value={selectedTime}
            onValueChange={setSelectedTime}
            items={availableSlots
              .find(slot => slot.date === selectedDate)?.times.map(time => ({
                label: time,
                value: time,
              })) || []}
            placeholder={{ label: 'Escolha o horário', value: null }}
            style={pickerStyles}
          />

          <Text style={styles.label}>Serviço:</Text>
          <RNPickerSelect
            value={selectedService}
            onValueChange={setSelectedService}
            items={services} 
            placeholder={{ label: 'Escolha o serviço', value: null }}
            style={pickerStyles}
          />
        </View>
        
        {/* Botões de ação */}
        <View style={styles.buttonContainer}>
          <Button title="Confirmar Agendamento" onPress={handleAgendamento} color="#070b0f" />
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/profile">
            <View style={styles.buttonStyle}>
              <Text style={styles.buttonText}>Ir para o perfil</Text>
            </View>
          </Link>
        </View>

        {/* Exibir lista de agendamentos do usuário */}
        <View style={styles.agendamentoContainer}>
          <Text style={styles.agendamentoText}>Meus Agendamentos:</Text>
          {userAppointments.length > 0 ? (
            userAppointments.map(appointment => (
              <View key={appointment.id} style={styles.agendamentoItem}>
                <Text style={styles.agendamentoText}>Serviço: {appointment.service}</Text>
                <Text style={styles.agendamentoText}>Data: {appointment.date}</Text>
                <Text style={styles.agendamentoText}>Hora: {appointment.time}</Text>
                <Pressable
                    onPress={() => handleCancelAgendamento(appointment.id, appointment.service, appointment.date, appointment.time)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                                </View>
            ))
          ) : (
            <Text style={styles.agendamentoText}>Você ainda não tem agendamentos.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: { paddingVertical: 20 },
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#070b0f", marginBottom: 10 },
  greeting: { fontSize: 18, color: "#070b0f" },
  email: { fontSize: 16, color: "#070b0f", marginBottom: 20 },
  form: { marginBottom: 20 },
  label: { fontSize: 16, color: "#070b0f", marginBottom: 10 },
  buttonContainer: { marginVertical: 10 },
  buttonStyle: { backgroundColor: "#070b0f", padding: 10, borderRadius: 5 },
  buttonText: { color: "#FFF", fontSize: 18, textAlign: "center" },
  agendamentoContainer: { marginTop: 20 },
  agendamentoText: { fontSize: 16, color: "#070b0f", marginBottom: 10 },
  agendamentoItem: {
    flexDirection: "row", // Coloca os itens em linha
    alignItems: "center", // Centraliza verticalmente
    justifyContent: "space-between", // Distribui o texto e o botão nas extremidades
    marginBottom: 15,
    borderWidth: 1, // Adiciona uma borda para parecer uma caixa
    borderColor: "#ccc",
    borderRadius: 8, // Deixa os cantos arredondados
    padding: 10, // Espaçamento interno
    backgroundColor: "#f9f9f9", // Cor de fundo
  },
  cancelButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10, // Deixa o botão mais largo
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
  },
  logoutButton: { color: "#070b0f", flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logoutText: { color: "#070b0f", marginLeft: 5, fontSize: 16 },
});

const pickerStyles = {
  inputIOS: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
  inputAndroid: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
};

export default Home;
