import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { user, logout, apiUrl } = useAuth();

  const hdrs = async () => {
    const t = await AsyncStorage.getItem('codiee_token');
    return { Authorization: `Bearer ${t}` };
  };

  const load = async () => {
    const h = await hdrs();
    const { data } = await axios.get(`${apiUrl}/projects`, { headers: h });
    setProjects(data); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const newProject = () => {
    Alert.prompt('New Project', 'Enter project name:', async (name) => {
      if (!name) return;
      const h = await hdrs();
      const { data } = await axios.post(`${apiUrl}/projects`, { name }, { headers: h });
      setProjects(p => [data, ...p]);
    });
  };

  return (
    <View style={s.c}>
      {/* Header */}
      <View style={s.h}>
        <Image source={require('../../assets/splash.png')} style={s.logo} resizeMode="contain"/>
        <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
          <Text style={s.user}>{user?.username}</Text>
          <TouchableOpacity onPress={logout}><Text style={s.logout}>Logout</Text></TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#007acc" style={{ marginTop:60 }}/>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding:16 }}
          ListEmptyComponent={<Text style={s.empty}>No projects yet. Tap + to create one.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card}
              onPress={() => navigation.navigate('Editor', { projectId:item._id, projectName:item.name })}>
              <Text style={s.cname}>{item.name}</Text>
              <Text style={s.cdesc}>{item.description || 'No description'}</Text>
              <Text style={s.cdate}>{new Date(item.lastOpened).toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={s.fab} onPress={newProject}>
        <Text style={s.fabT}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c:     { flex:1, backgroundColor:'#0d0d1a' },
  h:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:12, backgroundColor:'#16162a', borderBottomWidth:1, borderColor:'#2a2a45' },
  logo:  { width:120, height:36 },
  user:  { color:'#8a8aaa', fontSize:13 },
  logout:{ color:'#ff6b6b', fontSize:13 },
  card:  { backgroundColor:'#16162a', borderRadius:10, padding:18, marginBottom:14, borderWidth:1, borderColor:'#2a2a45' },
  cname: { fontSize:16, fontWeight:'700', color:'#e0e0ff', marginBottom:6 },
  cdesc: { fontSize:13, color:'#6a6a8a', marginBottom:8 },
  cdate: { fontSize:11, color:'#4a4a6a' },
  empty: { color:'#6a6a8a', textAlign:'center', marginTop:80, fontSize:14 },
  fab:   { position:'absolute', bottom:32, right:24, width:56, height:56, borderRadius:28, backgroundColor:'#007acc', alignItems:'center', justifyContent:'center', elevation:8, shadowColor:'#007acc', shadowOpacity:.5, shadowRadius:12 },
  fabT:  { color:'#fff', fontSize:28, lineHeight:32 },
});
