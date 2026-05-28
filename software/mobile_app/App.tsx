import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import {
  Lock,
  Unlock,
  Battery,
  Zap,
  Compass,
  Navigation,
  Shield,
  Thermometer,
  Eye,
  Settings,
  User,
  Power
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [isArmed, setIsArmed] = useState(false);
  const [soc, setSoc] = useState(84.5);
  const [solar, setSolar] = useState(0);
  const [cabinTemp, setCabinTemp] = useState(21.5);
  const [sentryActive, setSentryActive] = useState(true);

  // Simple telemetry tick simulation
  useEffect(() => {
    if (isArmed) {
      const interval = setInterval(() => {
        setSoc(prev => Math.max(0, prev - 0.01));
        setSolar(2800 + Math.cos(Date.now() / 10000) * 150);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSolar(0);
    }
  }, [isArmed]);

  const handleArmToggle = () => {
    if (isLocked) {
      Alert.alert("Action Required", "Please unlock the cabin doors first.");
      return;
    }
    setIsArmed(!isArmed);
    Alert.alert(
      isArmed ? "Propulsion Disarmed" : "Propulsion Armed",
      isArmed ? "Motors shut down safely." : "Pre-flight diagnostics passed. Ready for VTOL."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>A E R O S W I F T</Text>
          <Text style={styles.model}>Aegis One (AS-1/2)</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Settings color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main 3D Drone Visual Placeholder */}
        <View style={styles.visualContainer}>
          <View style={styles.statusPill}>
            <View style={[styles.pulseDot, { backgroundColor: isArmed ? '#10B981' : '#6B7280' }]} />
            <Text style={styles.statusText}>{isArmed ? 'ARMED & READY' : 'SHUTDOWN'}</Text>
          </View>
          <Image
            source={{ uri: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iUGsM9jiQeWwfgF6pBu2iF/aeroswift_hero-3g92oijFbxcRD4FAKnKqeo.webp' }}
            style={styles.droneImage}
            resizeMode="contain"
          />
        </View>

        {/* Primary Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Battery color="#10B981" size={20} />
            <Text style={styles.statVal}>{soc.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>BATTERY SOC</Text>
          </View>

          <View style={styles.statCard}>
            <Zap color="#00F2FE" size={20} />
            <Text style={styles.statVal}>{solar > 0 ? `${(solar / 1000).toFixed(1)} kW` : '0 W'}</Text>
            <Text style={styles.statLabel}>SOLAR HARVEST</Text>
          </View>

          <View style={styles.statCard}>
            <Compass color="#4FACFE" size={20} />
            <Text style={styles.statVal}>{isArmed ? '180 km/h' : '0 km/h'}</Text>
            <Text style={styles.statLabel}>AIRSPEED</Text>
          </View>

          <View style={styles.statCard}>
            <Navigation color="#A855F7" size={20} />
            <Text style={styles.statVal}>{isArmed ? '1,200 m' : '0 m'}</Text>
            <Text style={styles.statLabel}>ALTITUDE</Text>
          </View>
        </View>

        {/* Tesla-Style Controls List */}
        <View style={styles.controlsList}>
          {/* Lock / Unlock */}
          <TouchableOpacity
            style={styles.controlRow}
            onPress={() => setIsLocked(!isLocked)}
          >
            <View style={styles.controlLeft}>
              {isLocked ? <Lock color="#EF4444" size={22} /> : <Unlock color="#10B981" size={22} />}
              <Text style={styles.controlTitle}>{isLocked ? 'Cabin Doors Locked' : 'Cabin Doors Unlocked'}</Text>
            </View>
            <Text style={[styles.controlStatus, { color: isLocked ? '#EF4444' : '#10B981' }]}>
              {isLocked ? 'LOCKED' : 'UNLOCKED'}
            </Text>
          </TouchableOpacity>

          {/* Arm / Disarm */}
          <TouchableOpacity
            style={styles.controlRow}
            onPress={handleArmToggle}
          >
            <View style={styles.controlLeft}>
              <Power color={isArmed ? '#10B981' : '#6B7280'} size={22} />
              <Text style={styles.controlTitle}>Propulsion System</Text>
            </View>
            <Text style={[styles.controlStatus, { color: isArmed ? '#10B981' : '#6B7280' }]}>
              {isArmed ? 'ARMED' : 'DISARMED'}
            </Text>
          </TouchableOpacity>

          {/* Sentry Mode */}
          <TouchableOpacity
            style={styles.controlRow}
            onPress={() => setSentryActive(!sentryActive)}
          >
            <View style={styles.controlLeft}>
              <Eye color={sentryActive ? '#00F2FE' : '#6B7280'} size={22} />
              <Text style={styles.controlTitle}>Sentry Security Mode</Text>
            </View>
            <Text style={[styles.controlStatus, { color: sentryActive ? '#00F2FE' : '#6B7280' }]}>
              {sentryActive ? 'ACTIVE' : 'OFF'}
            </Text>
          </TouchableOpacity>

          {/* Cabin Temperature */}
          <View style={styles.controlRow}>
            <View style={styles.controlLeft}>
              <Thermometer color="#F59E0B" size={22} />
              <Text style={styles.controlTitle}>Cabin Climate</Text>
            </View>
            <View style={styles.tempControls}>
              <TouchableOpacity onPress={() => setCabinTemp(t => t - 0.5)} style={styles.tempBtn}>
                <Text style={styles.tempBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.tempText}>{cabinTemp.toFixed(1)}°C</Text>
              <TouchableOpacity onPress={() => setCabinTemp(t => t + 0.5)} style={styles.tempBtn}>
                <Text style={styles.tempBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Summon / Auto-Fly Button */}
        <TouchableOpacity style={styles.summonBtn}>
          <Shield color="#00F2FE" size={20} />
          <Text style={styles.summonText}>ACTIVATE AUTOPILOT SUMMON</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#161D30',
  },
  brand: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  model: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161D30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  visualContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  droneImage: {
    width: width * 0.85,
    height: 180,
  },
  statusPill: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161D30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#161D30',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 1,
  },
  controlsList: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161D30',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  controlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  controlStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tempControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tempText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  summonBtn: {
    marginHorizontal: 15,
    backgroundColor: '#161D30',
    borderWidth: 1,
    borderColor: '#00F2FE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summonText: {
    color: '#00F2FE',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
});
