// app/(tabs)/search.tsx

"use client";

import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { scheduleMeetLinkViaEdge } from "@/utils/helper";
import { supabase } from "@/utils/supabase";
import { showError, showSuccess } from "@/utils/alert";

// Define a type for our interpreter data for better type safety
interface InterpreterProfile {
    id: string; // This is a UUID
    name: string;
    email: string;
    // Add other fields like specialization, avatar_url etc. as you expand
}

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const [interpreters, setInterpreters] = useState<InterpreterProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { profile: currentUser, session } = useAuth();

    // Fetch real interpreter profiles from the database when the component loads
    useEffect(() => {
        const fetchInterpreters = async () => {
            try {
                // Fetch all profiles that have an entry in the 'interpreter_profile' table.
                // This ensures we only get users who have registered as interpreters.
                const { data, error } = await supabase
                    .from('profile')
                    .select(`
                        id,
                        name,
                        email,
                        interpreter_profile!inner(*)
                    `);

                if (error) {
                    throw error;
                }
                
                setInterpreters(data || []);
            } catch (error: any) {
                showError("Failed to load interpreters: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterpreters();
    }, []);

    const handleBookNow = async (interpreter: InterpreterProfile) => {
        if (!currentUser || !session) {
            showError("You must be logged in to book an appointment.");
            return;
        }

        setIsBooking(interpreter.id);

        try {
            // Step 1: Create the initial appointment record in the database
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

            const { data: newAppointment, error: insertError } = await supabase
                .from('appointment')
                .insert({
                    deaf_user_id: currentUser.id,
                    interpreter_id: interpreter.id,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'pending_confirmation', // Default status
                })
                .select()
                .single();
            
            if (insertError) {
                // This could fail due to RLS policies or other database constraints
                throw insertError;
            }

            // Step 2: Call the Edge Function to create the Google Meet and update the appointment
            const meetLink = await scheduleMeetLinkViaEdge({
                appointmentId: newAppointment.id,
                title: `Interpretation Session: ${currentUser.name} & ${interpreter.name}`,
                description: `A session scheduled for ${startTime.toLocaleString()}`,
                startTime: startTime,
                endTime: endTime,
                attendees: [currentUser.email, interpreter.email],
            });

            if (meetLink) {
                showSuccess(`Booking complete! The Google Meet link has been created and saved.`);
                console.log(`Booking complete for appointment ID: ${newAppointment.id}. Link: ${meetLink}`);
            }

        } catch (error: any) {
            console.error("Full booking process failed:", error);
            showError(error.message || "An unexpected error occurred during the booking process.");
        } finally {
            setIsBooking(null); // Reset booking state
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" />
                <Text style={styles.loadingText}>Loading Interpreters...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Find an Interpreter</Text>
                <TextInput
                    placeholder="Search by name, language, etc."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Interpreters</Text>
                {interpreters.length > 0 ? interpreters.map((interpreter) => (
                    <Card key={interpreter.id} style={styles.interpreterCard}>
                        <Card.Title
                            title={interpreter.name || 'Interpreter'}
                            subtitle={interpreter.email}
                        />
                        <Card.Actions>
                            <Button onPress={() => { /* Navigate to full profile */ }}>Profile</Button>
                            <Button 
                                mode="contained" 
                                onPress={() => handleBookNow(interpreter)}
                                loading={isBooking === interpreter.id}
                                disabled={isBooking !== null} // Disable all booking buttons while one is in progress
                            >
                                {isBooking === interpreter.id ? 'Booking...' : 'Book Now'}
                            </Button>
                        </Card.Actions>
                    </Card>
                )) : (
                    <Text>No interpreters are available at this time.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10 },
    header: { padding: 20, backgroundColor: "#2196F3", paddingTop: 60 },
    title: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 15 },
    searchInput: { backgroundColor: "#ffffff" },
    section: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#333" },
    interpreterCard: { marginBottom: 15 },
});

