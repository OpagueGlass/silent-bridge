import Gradient from "@/components/ui/Gradient";
import { signCategories as allSignCategories } from "@/constants/data/signLanguageData";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, MD3Theme, Searchbar } from "react-native-paper";
import { useAppTheme } from "../../hooks/useAppTheme";

const originalCategories = allSignCategories.map((cat) => cat.title);
const categories = ["All", ...originalCategories];

export default function SignLanguageScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData = useMemo(() => {
    let data = [];
    if (selectedCategory === "All") {
      data = allSignCategories.flatMap((cat) =>
        cat.data.map((item) => ({ ...item, category: cat.title }))
      );
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
  }, [searchQuery, selectedCategory]);

  return (
    <ScrollView style={styles.container}>
      <Gradient style={styles.header}>
        <Searchbar
          placeholder="Search signs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
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
      </Gradient>

      <View style={styles.listContentContainer}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
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
const contentWidth = Math.min(width - 32, 500);
const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    searchbar: {
      borderRadius: 12,
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
      alignItems: "center",
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
      backgroundColor: theme.colors.surfaceVariant,
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