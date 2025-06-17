// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TextInput, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
// import mqtt from 'mqtt';

// export default function App() {
//   const [device, setDevice] = useState('');
//   const [status, setStatus] = useState('Connecting to MQTT...');
//   const [powerStates, setPowerStates] = useState({
//     relay1: 'OFF',
//     relay2: 'OFF',
//     relay3: 'OFF',
//     relay4: 'OFF'
//   });
//   const [partyMode, setPartyMode] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState(false);

//   const clientRef = useRef(null);
//   const partyIntervalRef = useRef(null);

//   // MQTT Connection Setup
//   useEffect(() => {
//     const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt', {
//       clientId: 'tasmota_ctrl_' + Math.random().toString(16).substr(2, 8),
//       protocol: 'ws',
//       reconnectPeriod: 5000
//     });

//     client.on('connect', () => {
//       setStatus('✅ Connected to broker');
//       setConnectionStatus(true);
//     });

//     client.on('error', (err) => {
//       setStatus(`❌ Error: ${err.message}`);
//       setConnectionStatus(false);
//     });

//     client.on('message', (topic, message) => {
//       const msg = message.toString();
//       if (topic.includes('/POWER')) setPowerStates(p => ({ ...p, relay1: msg }));
//       if (topic.includes('/POWER2')) setPowerStates(p => ({ ...p, relay2: msg }));
//       if (topic.includes('/POWER3')) setPowerStates(p => ({ ...p, relay3: msg }));
//       if (topic.includes('/POWER4')) setPowerStates(p => ({ ...p, relay4: msg }));
//     });

//     clientRef.current = client;

//     return () => {
//       client.end();
//       stopPartyMode();
//     };
//   }, []);

//   // Party Mode Effect (Relay 1 only)
//   useEffect(() => {
//     if (partyMode) {
//       partyIntervalRef.current = setInterval(() => {
//         toggleRelay(1); // Only toggle Relay 1
//       }, 500);
//     } else {
//       stopPartyMode();
//     }

//     return () => stopPartyMode();
//   }, [partyMode]);

//   const toggleRelay = (relayNumber) => {
//     if (!device.trim()) return setStatus('⚠️ Enter device name');
    
//     const topic = `cmnd/${device}/Power${relayNumber > 1 ? relayNumber : ''}`;
//     if (clientRef.current?.connected) {
//       clientRef.current.publish(topic, 'TOGGLE');
//       setStatus(`🔄 Toggled Relay ${relayNumber}`);
//       clientRef.current.subscribe(`stat/${device}/POWER${relayNumber > 1 ? relayNumber : ''}`);
//     }
//   };

//   const setRelay = (relayNumber, state) => {
//     if (!device.trim()) return setStatus('⚠️ Enter device name');
    
//     const topic = `cmnd/${device}/Power${relayNumber > 1 ? relayNumber : ''}`;
//     if (clientRef.current?.connected) {
//       clientRef.current.publish(topic, state);
//       setStatus(`⚡ Set Relay ${relayNumber} ${state}`);
//       clientRef.current.subscribe(`stat/${device}/POWER${relayNumber > 1 ? relayNumber : ''}`);
//     }
//   };

//   const stopPartyMode = () => {
//     if (partyIntervalRef.current) {
//       clearInterval(partyIntervalRef.current);
//       partyIntervalRef.current = null;
//     }
//   };

//   const RelayCard = ({ number, showPartyToggle = false }) => (
//     <View style={styles.relayCard}>
//       <View style={styles.relayHeader}>
//         <Text style={styles.relayTitle}>RELAY {number}</Text>
//         <View style={[
//           styles.statusLight,
//           { backgroundColor: powerStates[`relay${number}`] === 'ON' ? '#4CAF50' : '#F44336' }
//         ]}/>
//       </View>
      
//       {showPartyToggle && (
//         <View style={styles.partyToggleContainer}>
//           <Text style={styles.partyModeText}>PARTY MODE</Text>
//           <Switch
//             value={partyMode}
//             onValueChange={setPartyMode}
//             trackColor={{ false: "#B39DDB", true: "#7E57C2" }}
//             thumbColor="#FFFFFF"
//           />
//         </View>
//       )}
      
//       <View style={styles.buttonGroup}>
//         <TouchableOpacity 
//           style={[styles.button, styles.onButton]}
//           onPress={() => setRelay(number, 'ON')}>
//           <Text style={styles.buttonText}>ON</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[styles.button, styles.offButton]}
//           onPress={() => setRelay(number, 'OFF')}>
//           <Text style={styles.buttonText}>OFF</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[styles.button, styles.toggleButton]}
//           onPress={() => toggleRelay(number)}>
//           <Text style={styles.buttonText}>TOGGLE</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>TASMOTA RELAY CONTROLLER</Text>
//         <View style={[styles.connectionDot, connectionStatus && styles.connectedDot]}/>
//       </View>

//       {/* Device Input */}
//       <TextInput
//         placeholder="Device name (e.g., tasmota_1234)"
//         placeholderTextColor="#9575CD"
//         value={device}
//         onChangeText={setDevice}
//         style={styles.input}
//       />

//       {/* Relay Cards */}
//       <RelayCard number={1} showPartyToggle={true} />
//       <RelayCard number={2} />
//       <RelayCard number={3} />
//       <RelayCard number={4} />

//       {/* Status Bar */}
//       <View style={styles.statusBar}>
//         <Text style={styles.statusText}>{status}</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 25,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#5E35B1',
//     marginRight: 10,
//   },
//   connectionDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#F44336',
//   },
//   connectedDot: {
//     backgroundColor: '#4CAF50',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#B39DDB',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20,
//     backgroundColor: '#FFFFFF',
//     color: '#5E35B1',
//     fontSize: 16,
//   },
//   relayCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   relayHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   relayTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#5E35B1',
//   },
//   statusLight: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//   },
//   partyToggleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     padding: 8,
//     backgroundColor: '#EDE7F6',
//     borderRadius: 8,
//   },
//   partyModeText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#5E35B1',
//   },
//   buttonGroup: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   button: {
//     flex: 1,
//     marginHorizontal: 4,
//     paddingVertical: 12,
//     borderRadius: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   onButton: {
//     backgroundColor: '#7E57C2',
//   },
//   offButton: {
//     backgroundColor: '#B39DDB',
//   },
//   toggleButton: {
//     backgroundColor: '#5E35B1',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   statusBar: {
//     backgroundColor: '#D1C4E9',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   statusText: {
//     color: '#5E35B1',
//     textAlign: 'center',
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import mqtt from 'mqtt';

const MQTT_BROKER = 'ws://broker.emqx.io:8083/mqtt';
const TOPIC = 'relay/control';

export default function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [relayStates, setRelayStates] = useState({
    r1: 'OFF',
    r2: 'OFF',
    r3: 'OFF',
    r4: 'OFF',
  });

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER, {
      connectTimeout: 4000,
      clientId: 'ReactNativeClient_' + Math.random().toString(16).substr(2, 8),
    });

    mqttClient.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to MQTT broker');
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT error:', err);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const toggleRelay = (relay, newState) => {
    const updatedStates = { ...relayStates, [relay]: newState };
    setRelayStates(updatedStates);

    if (client && isConnected) {
      client.publish(TOPIC, JSON.stringify(updatedStates));
      console.log('📤 Published:', updatedStates);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MQTT Relay Controller</Text>
      <Text style={styles.status}>
        MQTT: {isConnected ? '✅ Connected' : '⏳ Connecting...'}
      </Text>

      {Object.entries(relayStates).map(([relay, state]) => (
        <View key={relay} style={styles.relayBox}>
          <Text style={styles.relayText}>{relay.toUpperCase()} - {state}</Text>
          <Button
            title={state === 'ON' ? 'Turn OFF' : 'Turn ON'}
            onPress={() => toggleRelay(relay, state === 'ON' ? 'OFF' : 'ON')}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  status: { marginBottom: 20, fontSize: 16 },
  relayBox: {
    marginBottom: 20,
    padding: 20,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  relayText: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '600',
  },
});
