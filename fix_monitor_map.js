const fs = require('fs');
let code = fs.readFileSync('src/app/(manager)/monitor.tsx', 'utf8');

// Move rangersMapHtml outside of useEffect!
const htmlScopeRegex = /const rangersMapHtml = `[\s\S]*?console\.error\(e\);\n    \}\n  \};\n/;
const match = code.match(htmlScopeRegex);
if (match) {
    let block = match[0];
    code = code.replace(block, '');
    code = code.replace('  return (', block + '\n  return (');
}

// Now replace the placeholder tab
const tabRegex = /<View style=\{\[styles\.stateCard, \{ backgroundColor: theme\.cardBg, borderWidth: 1, borderColor: theme\.border \}\]\}>\s*<View style=\{styles\.stateIcon\}>\s*<Ionicons name="people-outline" size=\{25\} color=\{COLORS\.slate\} \/>\s*<\/View>\s*<Text style=\{\[styles\.stateTitle, \{ color: theme\.textPrimary \}\]\}>Ranger Tracking<\/Text>\s*<Text style=\{styles\.stateText\}>Live ranger tracking map will appear here\.<\/Text>\s*<\/View>/;

const newTab = `<View style={{ height: 400, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
              <WebView 
                originWhitelist={['*']}
                source={{ html: rangersMapHtml }}
                onMessage={handleWebViewMessage}
                style={{ flex: 1 }}
                scrollEnabled={false}
              />
            </View>
            {rangers.filter(r => r.isSOS).length > 0 && (
              <View style={[styles.stateCard, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', borderWidth: 1, marginTop: 10 }]}>
                <Ionicons name="warning" size={30} color="#D32F2F" />
                <Text style={{color: '#D32F2F', fontWeight: 'bold', fontSize: 16, marginTop: 10}}>
                  {rangers.filter(r => r.isSOS).length} Ranger(s) need immediate assistance!
                </Text>
                <Text style={{color: '#C62828', textAlign: 'center', marginTop: 5}}>
                  Click the red blinking marker on the map to resolve.
                </Text>
              </View>
            )}`;

code = code.replace(tabRegex, newTab);

fs.writeFileSync('src/app/(manager)/monitor.tsx', code, 'utf8');
