"use client"

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Chip, RadioButton, Text, TextInput } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";

import { useRouter } from 'expo-router';
import DatePickerInput from '../../components/DatePickerInput';
import TimePickerInput from '../../components/TimePickerInput';
import { interpreters } from '../data/mockData';

export default function SearchScreen() {
  const router = useRouter();
  const { userProfile } = useAuth()

  const today = new Date();
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [searchQuery, setSearchQuery] = useState("")
  const [appointmentDate, setAppointmentDate] = useState(formatDate(today));
  const [appointmentTime, setAppointmentTime] = useState(formatTime(today));
  const [selectedGender, setSelectedGender] = useState("Any");
  const [ageRange, setAgeRange] = useState("Any");
  const [minRating, setMinRating] = useState(5);

  const [hasSearched, setHasSearched] = useState(false);
  const [displayedInterpreters, setDisplayedInterpreters] = useState<typeof interpreters>([]);
  const handleSearch = () => {
      if (!appointmentDate || !appointmentTime || !selectedGender || !ageRange) {
        alert("Please fill in date, time, gender, and age range before searching.");
        return;
      }

      const results = interpreters.filter((interpreter) => {
      const cleanedQuery = searchQuery.trim().toLowerCase();
      const nameWords = interpreter.name.toLowerCase().split(' ');
      const queryWords = cleanedQuery.split(' ');
      const nameMatch = cleanedQuery === "" || queryWords.every(queryWord => nameWords.includes(queryWord));

      const dateAndTimeMatch = () => {
        if (!appointmentDate || !appointmentTime) {
          return true;
        }

        const dayAvailability = interpreter.availability?.find(
          (day) => day.date === appointmentDate
        );

        if (dayAvailability) {
          return dayAvailability.slots.includes(appointmentTime);
        }

        return false;
      };

      const genderMatch = selectedGender === "" || selectedGender === "Any" || interpreter.gender === selectedGender;

      const ageMatch = (() => {
        if (ageRange === "Any") return true;
        const [min, max] = ageRange.split("-").map(Number);
        return interpreter.age >= min && interpreter.age <= max;
      })();

      const ratingMatch = interpreter.rating >= minRating;

      return nameMatch && dateAndTimeMatch() && genderMatch && ageMatch && ratingMatch;
    });

    setDisplayedInterpreters(results);
    setHasSearched(true);
  };

  const theme = useAppTheme()

  const isInterpreter = userProfile?.userType === "interpreter"

  // Mock requests for interpreters
  const requests = [
    {
      id: 1,
      clientName: "Alice Wong",
      date: "20/05/2024",
      time: "10:00 - 11:00",
      type: "Medical Appointment",
      status: "Pending",
    },
    {
      id: 2,
      clientName: "David Lee",
      date: "22/05/2024",
      time: "14:00 - 15:30",
      type: "Legal Consultation",
      status: "Pending",
    },
  ]

  if (isInterpreter) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Appointment Requests</Text>
        </View>

        <View style={styles.section}>
          {requests.map((request) => (
            <Card key={request.id} style={styles.requestCard}>
              <Card.Content>
                <View style={styles.requestHeader}>
                  <Image source={{ uri: "/placeholder.svg?height=50&width=50" }} style={styles.clientAvatar} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.clientName}>{request.clientName}</Text>
                    <Text style={styles.requestType}>{request.type}</Text>
                    <Text style={styles.requestDateTime}>
                      {request.date} • {request.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Button mode="outlined" style={[styles.actionButton, styles.rejectButton]} textColor="#F44336">
                    Reject
                  </Button>
                  <Button mode="contained" style={styles.actionButton}>
                    Accept
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* TEMPORARY VIEW AND STYLE */}
      <View style={styles.header}>
        <Text style={styles.title}>Interpreter Discovery</Text>

        {/* --- SEARCH BY NAME --- */}
        <View style={styles.filterBlock}>
          <TextInput
            label="Search interpreters..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
          />
        </View>
        
        {/* --- SEARCH BY DATE AND TIME --- */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeField}>
            <Text style={styles.filterLabel}>Appointment Date</Text>
            <DatePickerInput
              label=""
              value={appointmentDate}
              onChange={setAppointmentDate}
              style={styles.dateTimeInput}
            />
          </View>
          <View style={styles.dateTimeField}>
            <Text style={styles.filterLabel}>Appointment Time</Text>
            <TimePickerInput
              label=""
              value={appointmentTime}
              onChange={setAppointmentTime}
              style={styles.dateTimeInput}
            />
          </View>
        </View>

        {/* --- GENDER --- */}
        <Text style={styles.filterLabel}>Gender</Text>
        <View style={styles.genderRow}>
          {[
            { value: 'Any', icon: <MaterialCommunityIcons name="account-group" size={22} />, label: 'Any' },
            { value: 'Male', icon: <MaterialCommunityIcons name="face-man" size={22} />, label: 'Male' },
            { value: 'Female', icon: <MaterialCommunityIcons name="face-woman" size={22} />, label: 'Female' },
          ].map(option => {
            const isSelected = selectedGender === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  isSelected && styles.genderOptionSelected
                ]}
                onPress={() => setSelectedGender(option.value)}
                activeOpacity={0.9}
              >
                <Text style={styles.genderIcon}>{option.icon}</Text>
                <Text style={[
                  styles.genderLabel,
                  isSelected && styles.genderLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        {/* --- AGE --- */}
        <Text style={styles.filterLabel}>Age</Text>
        <View style={styles.genderRow}>
          {[
            { value: "Any", label: "Any" },
            { value: "18-24", label: "18 - 24" },
            { value: "25-44", label: "25 - 44" },
            { value: "45-60", label: "45 - 60" },
          ].map(option => {
            const isSelected = ageRange === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  isSelected && styles.genderOptionSelected
                ]}
                onPress={() => setAgeRange(option.value)}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.genderLabel,
                  isSelected && styles.genderLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- Rating --- */}
        <View style={styles.sliderContainer}>
          <Text style={styles.filterLabel}>Ratings</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i} 
                onPress={() => setMinRating(i)} 
              >
                <MaterialCommunityIcons
                  name={i <= minRating ? 'star' : 'star-outline'}
                  size={32}
                  color={i <= minRating ? '#f8d706db' : '#64748B'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          mode="contained" 
          onPress={handleSearch} 
          style={styles.searchButton} 
          buttonColor="#E0E0E0"
          textColor="#000000" 
        >
          Search
        </Button>

      </View>
      
      {/* --- SEARCH --- */}
      {hasSearched && (
        <View style={styles.section}>

          {displayedInterpreters.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Top Matches</Text>
              
              {displayedInterpreters.slice(0, 5).map((interpreter) => (
                <Card key={interpreter.id} style={styles.interpreterCard}>
                  <Card.Content>
                    <View style={styles.interpreterHeader}>
                      <Image source={{ uri: interpreter.avatar }} style={styles.interpreterAvatar} />
                      <View style={styles.interpreterInfo}>
                        <Text style={styles.interpreterName}>{interpreter.name}</Text>
                        <Text style={styles.interpreterSpecialisation}>{interpreter.specialisation}</Text>
                        <View style={styles.interpreterMeta}>
                          <Text style={styles.interpreterRating}>⭐ {interpreter.rating}</Text>
                        </View>
                        <View style={styles.interpreterTags}>
                          <Chip style={styles.tag} textStyle={styles.tagText}>
                            {interpreter.gender}
                          </Chip>
                          <Chip style={styles.tag} textStyle={styles.tagText}>
                            {interpreter.age}
                          </Chip>
                        </View>
                      </View>
                    </View>

                    <View style={styles.interpreterActions}>
                      <Button
                        mode="outlined"
                        style={styles.profileButton}
                        onPress={() => {
                          if (!appointmentDate || !appointmentTime) {
                            alert("Please select a date and time first.");
                            return;
                          }
                          
                          router.push({
                            pathname: "/interpreter/[id]",
                            params: { 
                              id: interpreter.id,
                              date: appointmentDate,
                              time: appointmentTime 
                            }
                          });
                        }}
                      >
                        Profile
                      </Button>

                      <Button mode="contained" style={styles.bookButton}>
                        Book Now
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          ) : (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              No interpreters found matching your criteria. 
            </Text>
          )}
        </View>
      )}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#2196F3",
    paddingTop: 60,
    overflow: 'visible', 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  filterBlock: {
    marginBottom: 16, 
  },
  searchInput: {
    backgroundColor: "#ffffff",
    height: 50
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 10, 
    marginBottom: 10,
  },
  dateTimeField: {
    flex: 1, 
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  dateTimeInput: {
    height: 50,
    justifyContent: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    height: 50
  },
  genderOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  genderIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  genderLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  genderLabelSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row', 
  },
  searchButton: {
    marginTop: 32, 
    paddingVertical: 6, 
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  interpreterCard: {
    marginBottom: 15,
  },
  interpreterHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  interpreterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  interpreterInfo: {
    flex: 1,
  },
  interpreterName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  interpreterSpecialisation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  interpreterMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  interpreterRating: {
    fontSize: 14,
    color: "#333",
  },
  interpreterTags: {
    flexDirection: "row",
    gap: 5,
  },
  tag: {
    backgroundColor: "#E3F2FD",
    height: 25,
  },
  tagText: {
    fontSize: 12,
    color: "#2196F3",
  },
  interpreterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileButton: {
    flex: 0.48,
  },
  bookButton: {
    flex: 0.48,
  },
  thumbContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbHalo: { 
    height: 40, 
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    position: 'absolute', 
  },
  thumbCore: { 
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#000000ff',
  },
  requestCard: {
    marginBottom: 15,
  },
  requestHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  requestInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  requestType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  requestDateTime: {
    fontSize: 14,
    color: "#333",
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 0.48,
  },
  rejectButton: {
    borderColor: "#F44336",
  },
});
