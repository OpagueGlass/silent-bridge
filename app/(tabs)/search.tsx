"use client"

import { useState, useRef } from "react"
import { TouchableOpacity, Image, ScrollView, StyleSheet, View } from "react-native"
import { RadioButton, Button, Card, Chip, Menu, Text, TextInput } from "react-native-paper"
import { Slider } from "@miblanchard/react-native-slider";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"

export default function SearchScreen() {
  const { userProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedGender, setSelectedGender] = useState("")
  // --- Slider ---
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [ageRange, setAgeRange] = useState([25, 45]);
  const [minRating, setMinRating] = useState(5);
  // --- Slider State ---
  // -1 non activate, 0 left, 1 right
  const [activePriceThumb, setActivePriceThumb] = useState(-1);
  const [activeAgeThumb, setActiveAgeThumb] = useState(-1);
  const priceRangeRef = useRef(priceRange);
  const ageRangeRef = useRef(ageRange);

  const [displayedInterpreters, setDisplayedInterpreters] = useState<typeof interpreters>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    const results = interpreters.filter((interpreter) => {
      const genderMatch = selectedGender === "" || interpreter.gender === selectedGender;

      const price = Number(interpreter.pricePerHour.replace(/[^\d.]/g, ''));
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      const [minAge, maxAge] = interpreter.age.split('-').map(Number);
      const ageMatch = maxAge >= ageRange[0] && minAge <= ageRange[1];

      const ratingMatch = interpreter.rating >= minRating;

      return genderMatch && priceMatch && ageMatch && ratingMatch;
    });

    setDisplayedInterpreters(results);
    setHasSearched(true);
  };

  const theme = useAppTheme()

  const isInterpreter = userProfile?.userType === "interpreter"

  // Mock interpreter data
  const interpreters = [
    {
      id: 1,
      name: "John Smith",
      specialisation: "Medical Interpretation",
      rating: 4.8,
      pricePerHour: "RM 50",
      gender: "Male",
      age: "30-35",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      specialisation: "Legal Interpretation",
      rating: 4.9,
      pricePerHour: "RM 60",
      gender: "Female",
      age: "25-30",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Mike Chen",
      specialisation: "Educational Interpretation",
      rating: 4.7,
      pricePerHour: "RM 45",
      gender: "Male",
      age: "35-40",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

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
      <View style={styles.header}>
        <Text style={styles.title}>Interpreter Discovery</Text>

        <TextInput
          label="Search interpreters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {/* TEMPORARY VIEW AND TEXT STYLE */}
      {/* --- GENDER --- */}
      <View style={styles.section}>
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

        {/* --- PRICE --- */}
        <View style={styles.sliderContainer}>
          <Text style={styles.filterLabel}>Price per hour</Text>
          <Text style={styles.filterValue}>RM{priceRange[0]} - RM{priceRange[1]}</Text>
        </View>
        <Slider
          value={priceRange}
          onValueChange={newRange => {
            if (newRange[0] !== priceRangeRef.current[0]) {
              setActivePriceThumb(0); 
            } else if (newRange[1] !== priceRangeRef.current[1]) {
              setActivePriceThumb(1); 
            }
            priceRangeRef.current = newRange;
            // Achieve real-time change on the value displayed
            setPriceRange(newRange); 
          }}   
          renderThumbComponent={thumbIndex => {
            const isActive = activePriceThumb === thumbIndex; 
            return (
              <View style={styles.thumbContainer}>
                {isActive && <View style={styles.thumbHalo} />}
                <View style={styles.thumbCore} />
              </View>
            );
          }}
          onSlidingComplete={() => setActivePriceThumb(-1)}     
          minimumValue={0}   
          maximumValue={200} 
          step={5}    
        />

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
          onPress={() => console.log("Search button pressed!")} 
          style={styles.searchButton} 
          buttonColor="#E0E0E0"
          textColor="#000000" 
        >
          Search
        </Button>

      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Matches</Text>

        {interpreters.map((interpreter) => (
          <Card key={interpreter.id} style={styles.interpreterCard}>
            <Card.Content>
              <View style={styles.interpreterHeader}>
                <Image source={{ uri: interpreter.avatar }} style={styles.interpreterAvatar} />
                <View style={styles.interpreterInfo}>
                  <Text style={styles.interpreterName}>{interpreter.name}</Text>
                  <Text style={styles.interpreterSpecialisation}>{interpreter.specialisation}</Text>
                  <View style={styles.interpreterMeta}>
                    <Text style={styles.interpreterRating}>⭐ {interpreter.rating}</Text>
                    <Text style={styles.interpreterPrice}>{interpreter.pricePerHour}/hour</Text>
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
                <Button mode="outlined" style={styles.profileButton}>
                  Profile
                </Button>
                <Button mode="contained" style={styles.bookButton}>
                  Book Now
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
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
  interpreterPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
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
