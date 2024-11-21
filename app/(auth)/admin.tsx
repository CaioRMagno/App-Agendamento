import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, TextInput, Button, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { router } from 'expo-router';



const logout = async () => {
  try {
    await auth.signOut();
    router.replace('/login');
  } catch (error) {
    console.error("Erro ao sair:", error);
    Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
  }
};

export default function AdminPage() {
  const [appointments, setAppointments] = useState<{ id: string; date: any; time: any }[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ id: string; date: any; time: any, isBooked: any }[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Função para carregar os agendamentos
  const loadAppointments = async () => {
    try { 
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const appointmentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          time: data.time,
        };
      });
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
    }
  };

  // Função para carregar os horários disponíveis
  const loadAvailableSlots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "availableSlots"));
      const slotsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          time: data.time,
          isBooked: data.isBooked,
        };
      });
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error("Erro ao carregar horários disponíveis:", error);
      Alert.alert('Erro', 'Não foi possível carregar os horários disponíveis.');
    }
  };

  // Criar novo horário
  const handleAddSlot = async () => {
    if (!date || !time) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "availableSlots"), {
        date,
        time,
        isBooked: false,
      });
      Alert.alert('Sucesso', 'Horário adicionado com sucesso!');
      setDate('');
      setTime('');
      loadAvailableSlots(); // Recarregar slots após adicionar
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o horário.');
    }
  };

  // Função para remover um agendamento
  const removeAppointment = async (appointmentId : any) => {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      Alert.alert('Sucesso', 'Agendamento removido com sucesso!');
      loadAppointments(); // Recarregar os agendamentos após remoção
    } catch (error) {
      console.error("Erro ao remover agendamento:", error);
      Alert.alert('Erro', 'Não foi possível remover o agendamento.');
    }
  };

  // Função para marcar como agendado
  const markAsBooked = async (slotId: any) => {
    try {
      const slotRef = doc(db, "availableSlots", slotId);
      await updateDoc(slotRef, { isBooked: true });
      Alert.alert('Sucesso', 'Horário agendado com sucesso!');
      loadAvailableSlots(); // Recarregar slots após agendamento
      loadAppointments(); // Recarregar agendamentos após marcar como agendado
    } catch (error) {
      console.error("Erro ao agendar horário:", error);
      Alert.alert('Erro', 'Não foi possível agendar o horário.');
    }
  };

  // Função para remover um horário disponível
  const removeAvailableSlot = async (slotId: any) => {
    try {
      await deleteDoc(doc(db, "availableSlots", slotId));
      Alert.alert('Sucesso', 'Horário excluído com sucesso!');
      loadAvailableSlots(); // Recarregar os slots após remoção
    } catch (error) {
      console.error("Erro ao remover horário disponível:", error);
      Alert.alert('Erro', 'Não foi possível remover o horário disponível.');
    }
  };

  // Função para marcar como "concluído" (excluir o horário)
  const markAsCompleted = async (slotId: any) => {
    try {
      const slotRef = doc(db, "availableSlots", slotId);
      await deleteDoc(slotRef);  // Excluir o horário após ser concluído
      Alert.alert('Sucesso', 'Horário concluído e excluído com sucesso!');
      loadAvailableSlots(); // Recarregar os slots após exclusão
    } catch (error) {
      console.error("Erro ao concluir horário:", error);
      Alert.alert('Erro', 'Não foi possível concluir o horário.');
    }
  };

  // Carregar agendamentos e horários disponíveis ao carregar o componente
  useEffect(() => {
    loadAppointments();
    loadAvailableSlots();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Painel de Administração</Text>

      {/* Adicionar novo horário */}
      <Text style={styles.subHeader}>Adicionar Horário</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Data (DD/MM/YYYY)"
      />
      <TextInput
        style={styles.input}
        placeholder="Hora"
        value={time}
        onChangeText={setTime}
      />
      <Button title="Criar Horário" onPress={handleAddSlot} />

      {/* Exibir agendamentos */}
      <Text style={styles.subHeader}>Agendamentos</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text><Text style={styles.bold}>Data:</Text> {item.date}</Text>
            <Text><Text style={styles.bold}>Hora:</Text> {item.time}</Text>
            <Pressable style={styles.removeButton} onPress={() => removeAppointment(item.id)}>
              <Text style={styles.removeText}>Agendamento Concluído</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Exibir horários disponíveis */}
      <Text style={styles.subHeader}>Horários Disponíveis</Text>
      <FlatList
        data={availableSlots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slotItem}>
            <Text><Text style={styles.bold}>Data:</Text> {item.date}</Text>
            <Text><Text style={styles.bold}>Hora:</Text> {item.time}</Text>
            {item.isBooked ? (
              <Text style={styles.bookedText}>Agendado</Text>
            ) : (
              <>
                <Pressable style={styles.removeButton} onPress={() => removeAvailableSlot(item.id)}>
                  <Text style={styles.removeText}>Excluir</Text>
                </Pressable>
                <Pressable style={styles.removeButton} onPress={() => markAsCompleted(item.id)}>
                  <Text style={styles.removeText}>Concluído</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      />

      {/* Botão de logout */}
      <Pressable style={styles.logoutButton} onPress={() => logout()}>
        <Feather name="log-out" size={18} color="#FFF" />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
  },
  appointmentItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  slotItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ff4c4c',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  removeText: {
    color: '#fff',
  },
  bookedText: {
    color: 'green',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
  },
});
