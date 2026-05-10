import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, apiUrl } = useAuth();

  const submit = async () => {
    setLoading(true);
    try {
      const body = mode === 'login' ? { email, password } : { username, email, password };
      const { data } = await axios.post(`${apiUrl}/auth/${mode}`, body);
      await login(data.token, data.user);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.c} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Logo */}
      <View style={s.logoWrap}>
        <Image source={require('../../assets/splash.png')} style={s.logo} resizeMode="contain"/>
      </View>
      <Text style={s.tag}>Cloud IDE for Developers</Text>

      {/* Tabs */}
      <View style={s.tabs}>
        {['login','register'].map(m => (
          <TouchableOpacity key={m} style={[s.tab, mode===m&&s.tabA]} onPress={() => setMode(m)}>
            <Text style={[s.tabT, mode===m&&s.tabTA]}>{m==='login'?'Sign In':'Sign Up'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode==='register' && (
        <TextInput style={s.inp} placeholder="Username" placeholderTextColor="#555"
          value={username} onChangeText={setUsername} autoCapitalize="none"/>
      )}
      <TextInput style={s.inp} placeholder="Email" placeholderTextColor="#555"
        value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
      <TextInput style={s.inp} placeholder="Password" placeholderTextColor="#555"
        value={password} onChangeText={setPassword} secureTextEntry/>

      <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff"/>
          : <Text style={s.btnT}>{mode==='login'?'Sign In':'Create Account'}</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c:       { flex:1, backgroundColor:'#0d0d1a', padding:32, justifyContent:'center' },
  logoWrap:{ alignItems:'center', marginBottom:8 },
  logo:    { width:260, height:100 },
  tag:     { fontSize:13, color:'#6a6a8a', textAlign:'center', marginBottom:32 },
  tabs:    { flexDirection:'row', marginBottom:24, borderBottomWidth:1, borderColor:'#2a2a45' },
  tab:     { flex:1, padding:12, alignItems:'center' },
  tabA:    { borderBottomWidth:2, borderColor:'#00bfff' },
  tabT:    { color:'#6a6a8a', fontSize:14 },
  tabTA:   { color:'#00bfff' },
  inp:     { backgroundColor:'#16162a', borderWidth:1, borderColor:'#2a2a45', color:'#d4d4d4', borderRadius:8, padding:12, marginBottom:14, fontSize:14 },
  btn:     { background:'#007acc', backgroundColor:'#007acc', borderRadius:8, padding:14, alignItems:'center', marginTop:8 },
  btnT:    { color:'#fff', fontWeight:'700', fontSize:15 },
});
