import * as React from "react";
import { Text, StyleSheet, View, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';

interface RescueeHistory {
  name: string;
  macAddress: string;
  timestamp: string;
}

const RescueHistory = () => {
  const [historyData, setHistoryData] = React.useState<RescueeHistory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const response = await fetch('http://192.168.43.130:8000/rescuee', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }

      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.rescueHistory, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.rescueHistory, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchHistoryData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.rescueHistory}>
      <Pressable style={styles.closeIcon}>
        <Link href="/">
          <Image resizeMode="cover" source={require("../../assets/images/Close.png")} />
        </Link>
      </Pressable>
      <Text style={styles.historyTitle}>History</Text>
      <ScrollView contentContainerStyle={styles.historyScrollContainer}>
        <View style={styles.historyContainer}>
          {historyData.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.nameText}>{`${item.name}`}</Text>
              <Text style={styles.detailText}>{item.macAddress}</Text>
              <Text style={styles.detailText}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
          {historyData.length === 0 && (
            <Text style={styles.noDataText}>No history data available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rescueHistory: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
  },
  historyTitle: {
    marginTop: 20,
    fontSize: 36,
    fontFamily: "Inter-Regular",
    color: "#000",
    textAlign: "center",
  },
  historyScrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 40, // Add extra padding at bottom for better scrolling
  },
  historyContainer: {
    width: 350,
    backgroundColor: "rgba(169, 172, 169, 0.5)",
    borderRadius: 25,
    padding: 20,
    gap: 10,
    minHeight: 'auto', // Allow container to grow with content
  },
  historyItem: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
    color: "#000",
  },
  detailText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#000",
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    zIndex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
});

export default RescueHistory;
