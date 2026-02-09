// Quick voice command system test
import { nativeVoiceCommands } from './src/utils/NativeVoiceCommands.js';

console.log('🧪 Testing Voice Command System...\n');

// Test commands
const testCommands = [
  'open chrome',
  'type hello world',
  'search for weather',
  'play music',
  'take screenshot',
  'help',
  'copy',
  'paste',
  'delete',
  'brightness up',
  'wifi on',
  'bluetooth off',
  'hey speakeasy open chrome',
  'volume up',
  'scroll down',
  'go home'
];

let passed = 0;
let total = testCommands.length;

testCommands.forEach(command => {
  const parsed = nativeVoiceCommands.parseVoiceCommand(command);
  if (parsed) {
    console.log(`✅ "${command}" → ${JSON.stringify(parsed)}`);
    passed++;
  } else {
    console.log(`❌ "${command}" → null`);
  }
});

console.log(`\n📊 Results: ${passed}/${total} commands parsed successfully`);
console.log(passed === total ? '🎉 All tests passed!' : '⚠️ Some tests failed');
