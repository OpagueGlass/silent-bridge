import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, MD3Theme, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { signCategories as allSignCategories } from "../data/signLanguageData";

const originalCategories = allSignCategories.map((cat) => cat.title);
const categories = ["All", "Favorites", ...originalCategories];

export default function SignLanguageScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>(["1.2", "2.1"]);

  const filteredData = useMemo(() => {
    let data = [];
    if (selectedCategory === "All") {
      data = allSignCategories.flatMap((cat) =>
        cat.data.map((item) => ({ ...item, category: cat.title }))
      );
    } else if (selectedCategory === "Favorites") {
      data = allSignCategories
        .flatMap((cat) =>
          cat.data.map((item) => ({ ...item, category: cat.title }))
        )
        .filter((item) => favorites.includes(item.id));
    } else {
      const category = allSignCategories.find(
        (cat) => cat.title === selectedCategory
      );
      data = category
        ? category.data.map((item) => ({ ...item, category: category.title }))
        : [];
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      return data.filter((item) =>
        item.word.toLowerCase().includes(lowercasedQuery)
      );
    }
    return data;
  }, [searchQuery, selectedCategory, favorites]);

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites((prev) => prev.filter((favId) => favId !== id));
    } else {
      setFavorites((prev) => [...prev, id]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sign Dictionary</Text>
        <View style={styles.searchBarContainer}>
          <TextInput
            label="Search signs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            style={{ backgroundColor: theme.colors.surface }}
          />
        </View>
        <View style={styles.categoryBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollViewContent}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.listContentContainer}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const isFavorited = favorites.includes(item.id);
            return (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.gifContainer}>
                  <Image
                    source={item.image}
                    style={styles.gif}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.textContainer}>
                    <Text style={styles.word}>{item.word}</Text>
                    <Text style={styles.categorySubtext}>
                      {item.category}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(item.id)}
                  >
                    <MaterialCommunityIcons
                      name={isFavorited ? "heart" : "heart-outline"}
                      size={28}
                      color={
                        isFavorited
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        ) : (
          <View style={styles.listEmptyComponent}>
            <Text style={styles.listEmptyText}>No signs found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");
const contentWidth = width - 32;
const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingTop: 80,       
      paddingBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.surface,
      marginBottom: 16,
    },
    searchBarContainer: {
      backgroundColor: "transparent",
    },
    categoryBarContainer: {
      backgroundColor: "transparent",
      marginTop: 12,
    },
    categoryScrollViewContent: {},
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.surface,
    },
    categoryText: {
      fontWeight: "500",
      color: "rgba(255, 255, 255, 0.9)",
    },
    categoryTextSelected: {
      color: theme.colors.primary,
    },
    listContentContainer: {
      padding: 16,
    },
    itemCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      width: contentWidth,
      overflow: "hidden",
    },
    gifContainer: {
      width: "100%",
      aspectRatio: 1.77,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: "hidden",
    },
    gif: {
      width: "100%",
      height: "100%",
    },
    cardInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    textContainer: {
      flex: 1,
      marginRight: 12,
    },
    word: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    categorySubtext: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    favoriteButton: {
      padding: 8,
    },
    listEmptyComponent: {
      flex: 1,
      paddingTop: 100,
      alignItems: "center",
    },
    listEmptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
  });