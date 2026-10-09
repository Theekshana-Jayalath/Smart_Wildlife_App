const fs = require('fs');
let code = fs.readFileSync('src/app/(manager)/danger-zones.tsx', 'utf8');

const modalJSX = `
      <Modal visible={promptVisible} transparent animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
          <View style={{backgroundColor: theme.cardBg, padding: 20, borderRadius: 12, width: '85%'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 10}}>New Danger Zone</Text>
            <Text style={{color: theme.textSecondary, marginBottom: 15}}>Enter a name for this geofence (e.g., North Village Boundary):</Text>
            <TextInput 
              style={{borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.textPrimary, marginBottom: 20}}
              placeholder="Zone Name"
              placeholderTextColor={theme.textSecondary}
              value={newZoneName}
              onChangeText={setNewZoneName}
              autoFocus
            />
            <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 10}}>
              <TouchableOpacity onPress={handleCancelPrompt} style={{padding: 10}}><Text style={{color: theme.textSecondary}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveZone} style={{padding: 10, backgroundColor: theme.primary, borderRadius: 8}}><Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
`;

code = code.replace('    </SafeAreaView>\n  );\n}\n\nconst styles', modalJSX + '    </SafeAreaView>\n  );\n}\n\nconst styles');

fs.writeFileSync('src/app/(manager)/danger-zones.tsx', code, 'utf8');
