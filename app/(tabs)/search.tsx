"use client"

import { useState } from "react"
import { Image, ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, Chip, Menu, Text, TextInput } from "react-native-paper"
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"

export default function SearchScreen() {
  const { userProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [genderMenuVisible, setGenderMenuVisible] = useState(false)
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

      <View style={styles.filtersSection}>
        <Text style={styles.filtersTitle}>Select your Preferences</Text>

        <Menu
          visible={genderMenuVisible}
          onDismiss={() => setGenderMenuVisible(false)}
          anchor={
            <TextInput
              label="Gender"
              value={selectedGender}
              mode="outlined"
              style={styles.filterInput}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setGenderMenuVisible(true)} />}
              onFocus={() => setGenderMenuVisible(true)}
              showSoftInputOnFocus={false}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedGender("Male")
              setGenderMenuVisible(false)
            }}
            title="Male"
          />
          <Menu.Item
            onPress={() => {
              setSelectedGender("Female")
              setGenderMenuVisible(false)
            }}
            title="Female"
          />
          <Menu.Item
            onPress={() => {
              setSelectedGender("Everyone")
              setGenderMenuVisible(false)
            }}
            title="Everyone"
          />
        </Menu>
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
})
