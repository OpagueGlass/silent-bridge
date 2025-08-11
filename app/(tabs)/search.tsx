"use client"

import { useState, useRef } from "react"
import { TouchableOpacity, Image, ScrollView, StyleSheet, View } from "react-native"
import { RadioButton, Button, Card, Chip, Menu, Text, TextInput } from "react-native-paper"
import { Slider } from "@miblanchard/react-native-slider";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"

import { interpreters } from '../data/mockData';
import { Link } from 'expo-router';
import DatePickerInput from '../../components/DatePickerInput';
import TimePickerInput from '../../components/TimePickerInput';

// // Mock interpreter data
// const interpreters = [
//   {
//     id: 1,
//     name: "John Smith",
//     specialisation: "Medical Interpretation",
//     rating: 4.8,
//     pricePerHour: "RM 50",
//     gender: "Male",
//     age: 30,
//     avatar: "/placeholder.svg?height=80&width=80",
//     availability: [
//       { date: '17/08/2025', slots: ['09:00', '10:00', '14:30'] },
//       { date: '18/08/2025', slots: ['11:00', '15:00'] }
//     ]
//   },
//   {
//     id: 2,
//     name: "Sarah Johnson",
//     specialisation: "Legal Interpretation",
//     rating: 4.9,
//     pricePerHour: "RM 60",
//     gender: "Female",
//     age: 25,
//     avatar: "/placeholder.svg?height=80&width=80",
//     availability: [
//       { date: '17/08/2025', slots: ['09:00', '10:00', '14:30'] },
//       { date: '18/08/2025', slots: ['11:00', '15:00'] }
//     ]
//   },
//   {
//     id: 3,
//     name: "Mike Chen",
//     specialisation: "Educational Interpretation",
//     rating: 4.7,
//     pricePerHour: "RM 45",
//     gender: "Male",
//     age: 35,
//     avatar: "/placeholder.svg?height=80&width=80",
//     availability: [
//       { date: '17/08/2025', slots: ['09:00', '10:00', '14:30'] },
//       { date: '18/08/2025', slots: ['11:00', '15:00'] }
//     ]
//   },
// ]

export default function SearchScreen() {
  const { userProfile } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [ageRange, setAgeRange] = useState([25, 45]);
  const [activeAgeThumb, setActiveAgeThumb] = useState(-1);
  const ageRangeRef = useRef(ageRange);
  const [minRating, setMinRating] = useState(5);

  const [hasSearched, setHasSearched] = useState(false);
  const [displayedInterpreters, setDisplayedInterpreters] = useState<typeof interpreters>([]);
  const handleSearch = () => {
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

      const genderMatch = selectedGender === "" || interpreter.gender === selectedGender;

      const ageMatch = interpreter.age >= ageRange[0] && interpreter.age <= ageRange[1];

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
        <TextInput
          label="Search interpreters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />

        {/* --- SEARCH BY DATE --- */}
        <Text style={styles.filterLabel}>Appointment Date</Text>
        <DatePickerInput
          label="Select a date"
          value={appointmentDate}
          onChange={setAppointmentDate}
        />

        {/* --- SEARCH BY TIME --- */}
        <Text style={styles.filterLabel}>Appointment Time</Text>
        <TimePickerInput
          label="Select a time"
          value={appointmentTime}
          onChange={setAppointmentTime}
        />

        {/* --- GENDER --- */}
        <Text style={styles.filterLabel}>Gender</Text>
        <RadioButton.Group
          value={selectedGender}
          onValueChange={newValue => setSelectedGender(newValue)}
        >
          <View style={styles.radioButtonContainer}>
            <RadioButton.Item label="Male" value="Male" />
            <RadioButton.Item label="Female" value="Female" />
          </View>
        </RadioButton.Group>

        {/* --- AGE --- */}
        <View style={styles.sliderContainer}>
          <Text style={styles.filterLabel}>Age</Text>
          <Text style={styles.filterValue}>{ageRange[0]} - {ageRange[1]}</Text>
        </View>
        <Slider
          value={ageRange}
          onValueChange={newRange => {
            if (newRange[0] !== ageRangeRef.current[0]) {
              setActiveAgeThumb(0);
            } else if (newRange[1] !== ageRangeRef.current[1]) {
              setActiveAgeThumb(1);
            }
            ageRangeRef.current = newRange;
            setAgeRange(newRange);
          }}
          renderThumbComponent={thumbIndex => {
            const isActive = activeAgeThumb === thumbIndex; 
            return (
              <View style={styles.thumbContainer}>
                {isActive && <View style={styles.thumbHalo} />}
                <View style={styles.thumbCore} />
              </View>
            );
          }}
          onSlidingComplete={() => setActiveAgeThumb(-1)}
          minimumValue={18}
          maximumValue={60}
          step={1}
        />

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
                      {/* <Button mode="outlined" style={styles.profileButton}>
                        Profile
                      </Button> */}

                      <Link
                        href={{
                          pathname: "/interpreter/[id]",
                          params: { id: interpreter.id }
                        }}
                        asChild
                      >
                        <Button mode="outlined" style={styles.profileButton}>
                          Profile
                        </Button>
                      </Link>
                      
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#ffffff",
  },
  filtersSection: {
    padding: 20,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  filterInput: {
    marginBottom: 10,
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

  radioButtonContainer: {
    // Achieve horizontal arrangement
    flexDirection: 'row', 
    // Evenly distribute items with space around
    justifyContent: 'space-around',
    fontSize: 16,
    fontWeight: '500',
  },

  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  starContainer: {
    flexDirection: 'row', 
  },

  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  star: {
    fontSize: 18,
    color: '#F59E0B', 
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
  searchButton: {
    marginTop: 32, 
    paddingVertical: 6, 
  },
})
