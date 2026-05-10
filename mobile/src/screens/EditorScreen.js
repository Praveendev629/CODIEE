import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../context/AuthContext';

export default function EditorScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const { apiUrl } = useAuth();
  const socketUrl  = apiUrl.replace('/api', '');

  const [files,      setFiles]      = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [content,    setContent]    = useState('');
  const [aiInput,    setAiInput]    = useState('');
  const [aiReply,    setAiReply]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const socketRef  = useRef(null);
  const saveRef    = useRef(null);

  const hdrs = async () => ({ Authorization: `Bearer ${await AsyncStorage.getItem('codiee_token')}` });

  useEffect(() => {
    loadFiles();
    connectSocket();
    return () => { socketRef.current?.disconnect(); clearInterval(saveRef.current); };
  }, []);

  const loadFiles = async () => {
    const { data } = await axios.get(`${apiUrl}/files/${projectId}`, { headers: await hdrs() });
    setFiles(data);
  };

  const connectSocket = async () => {
    const t = await AsyncStorage.getItem('codiee_token');
    const s = io(socketUrl, { auth: { token: t } });
    socketRef.current = s;
    s.emit('join:project', projectId);
    s.on('code:change', ({ fileId, content: c }) => {
      if (activeFile?._id === fileId) setContent(c);
    });
  };

  const openFile = async (file) => {
    const { data } = await axios.get(`${apiUrl}/files/${projectId}/${file._id}`, { headers: await hdrs() });
    setActiveFile(data); setContent(data.content);
    clearInterval(saveRef.current);
    saveRef.current = setInterval(async () => {
      await axios.put(`${apiUrl}/files/${projectId}/${data._id}`, { content }, { headers: await hdrs() });
    }, 5000);
  };

  const onChange = (val) => {
    setContent(val);
    socketRef.current?.emit('code:change', { projectId, fileId: activeFile?._id, content: val });
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${apiUrl}/ai/chat/${projectId}`, {
        message: aiInput, codeSnippet: content.slice(0, 500), action: 'chat',
      }, { headers: await hdrs() });
      setAiReply(data.reply); setAiInput('');
    } catch (e) { Alert.alert('AI Error', e.message); }
    finally { setLoading(false); }
  };

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled) return;
    const { uri, name } = res.assets[0];
    const text = await FileSystem.readAsStringAsync(uri);
    const { data } = await axios.post(`${apiUrl}/files/${projectId}`, { name, content: text }, { headers: await hdrs() });
    setFiles(f => [...f, data]);
  };

  return (
    <View style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={s.back}><Text style={s.backT}>{'<'}</Text></TouchableOpacity>
        <Text style={s.htitle} numberOfLines={1}>{activeFile?.name || projectName}</Text>
        <TouchableOpacity onPress={pick}><Text style={s.upload}>Upload</Text></TouchableOpacity>
      </View>

      <View style={s.body}>
        <ScrollView style={s.fileList}>
          {files.map(f => (
            <TouchableOpacity key={f._id} style={[s.fi, activeFile?._id===f._id&&s.fia]} onPress={()=>openFile(f)}>
              <Text style={s.fn} numberOfLines={1}>{f.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={s.ea}>
          {activeFile ? (
            <TextInput style={s.editor} multiline value={content} onChangeText={onChange} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top"/>
          ) : (
            <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ color:'#555', fontSize:13 }}>Select a file to edit</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.ai}>
        <Text style={s.aiT}>AI Assistant</Text>
        {!!aiReply && <ScrollView style={{ maxHeight:70, marginBottom:6 }}><Text style={s.aiR}>{aiReply}</Text></ScrollView>}
        <View style={{ flexDirection:'row', gap:8 }}>
          <TextInput style={s.aiI} value={aiInput} onChangeText={setAiInput} placeholder="Ask AI about your code..." placeholderTextColor="#555"/>
          <TouchableOpacity style={s.aiS} onPress={askAI} disabled={loading}>
            <Text style={s.aiST}>{loading?'...':'Ask'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor:'#1e1e1e' },
  h: { flexDirection:'row', alignItems:'center', padding:12, paddingTop:48, backgroundColor:'#252526', borderBottomWidth:1, borderColor:'#3c3c3c' },
  back: { padding:4, marginRight:8 }, backT: { color:'#007acc', fontSize:20 },
  htitle: { flex:1, color:'#d4d4d4', fontWeight:'600', fontSize:14 },
  upload: { color:'#007acc', fontSize:13 },
  body:   { flex:1, flexDirection:'row' },
  fileList: { width:110, backgroundColor:'#252526', borderRightWidth:1, borderColor:'#3c3c3c' },
  fi:  { padding:10, borderBottomWidth:1, borderColor:'#2d2d30' },
  fia: { backgroundColor:'#094771' },
  fn:  { color:'#d4d4d4', fontSize:11 },
  ea:  { flex:1 },
  editor: { flex:1, color:'#d4d4d4', fontFamily:'monospace', fontSize:12, padding:12, backgroundColor:'#1e1e1e', textAlignVertical:'top' },
  ai:  { backgroundColor:'#252526', borderTopWidth:1, borderColor:'#3c3c3c', padding:10 },
  aiT: { color:'#9d9d9d', fontSize:11, fontWeight:'600', marginBottom:6 },
  aiR: { color:'#d4d4d4', fontSize:11, lineHeight:17 },
  aiI: { flex:1, backgroundColor:'#1e1e1e', borderWidth:1, borderColor:'#3c3c3c', color:'#d4d4d4', borderRadius:4, padding:8, fontSize:12 },
  aiS: { backgroundColor:'#007acc', paddingHorizontal:14, borderRadius:4, justifyContent:'center' },
  aiST:{ color:'#fff', fontSize:12, fontWeight:'600' },
});
