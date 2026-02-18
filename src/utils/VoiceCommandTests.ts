import { nativeVoiceCommands } from './NativeVoiceCommands';
import { backgroundVoiceService } from './BackgroundVoiceService';
import { voiceFeedbackService } from './VoiceFeedbackService';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export class VoiceCommandTests {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Voice Command Tests...');
    this.results = [];

    // Test command parsing
    await this.testCommandParsing();
    
    // Test wake phrase detection
    await this.testWakePhraseDetection();
    
    // Test voice feedback
    await this.testVoiceFeedback();
    
    // Test battery optimization
    await this.testBatteryOptimization();
    
    // Test error handling
    await this.testErrorHandling();

    this.printResults();
    return this.results;
  }

  private async testCommandParsing(): Promise<void> {
    const testCases = [
      { input: 'hey speakeasy open chrome', expectedType: 'open_app' },
      { input: 'type hello world', expectedType: 'type_text' },
      { input: 'search for weather', expectedType: 'search' },
      { input: 'play music', expectedType: 'media_control' },
      { input: 'take screenshot', expectedType: 'screenshot' },
      { input: 'help', expectedType: 'help' },
      { input: 'volume up', expectedType: 'system_action' },
    ];

    for (const testCase of testCases) {
      const startTime = Date.now();
      try {
        const command = nativeVoiceCommands.parseVoiceCommand(testCase.input);
        const passed = command?.type === testCase.expectedType;
        
        this.results.push({
          testName: `Parse: ${testCase.input}`,
          passed,
          error: passed ? undefined : `Expected ${testCase.expectedType}, got ${command?.type}`,
          duration: Date.now() - startTime
        });
      } catch (error) {
        this.results.push({
          testName: `Parse: ${testCase.input}`,
          passed: false,
          error: String(error),
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testWakePhraseDetection(): Promise<void> {
    const testPhrases = [
      'hey speakeasy',
      'hey speak easy',
      'speakeasy',
      'okay speakeasy',
      'random text',
      'hello world'
    ];

    for (const phrase of testPhrases) {
      const startTime = Date.now();
      try {
        // Since containsWakePhrase is private, we'll test through the service
        const service = (backgroundVoiceService as any);
        const detected = service.containsWakePhrase ? service.containsWakePhrase(phrase) : false;
        
        const shouldDetect = phrase.toLowerCase().includes('speakeasy') || phrase.toLowerCase().includes('voice command');
        const passed = detected === shouldDetect;
        
        this.results.push({
          testName: `Wake phrase: ${phrase}`,
          passed,
          error: passed ? undefined : `Expected ${shouldDetect}, got ${detected}`,
          duration: Date.now() - startTime
        });
      } catch (error) {
        this.results.push({
          testName: `Wake phrase: ${phrase}`,
          passed: false,
          error: String(error),
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testVoiceFeedback(): Promise<void> {
    const startTime = Date.now();
    try {
      const status = voiceFeedbackService.getStatus();
      const passed = status.isSupported && typeof status.isEnabled === 'boolean';
      
      this.results.push({
        testName: 'Voice Feedback Service',
        passed,
        error: passed ? undefined : 'Voice feedback service not properly initialized',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Voice Feedback Service',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private async testBatteryOptimization(): Promise<void> {
    const startTime = Date.now();
    try {
      const status = backgroundVoiceService.getListeningStatus();
      const passed = typeof status.batteryOptimizationEnabled === 'boolean' && 
                    typeof status.isPowerSavingMode === 'boolean';
      
      this.results.push({
        testName: 'Battery Optimization',
        passed,
        error: passed ? undefined : 'Battery optimization not properly configured',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Battery Optimization',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test with invalid command
      const command = nativeVoiceCommands.parseVoiceCommand('invalid command that should not match');
      const passed = command === null;
      
      this.results.push({
        testName: 'Error Handling: Invalid Command',
        passed,
        error: passed ? undefined : 'Should return null for invalid commands',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Error Handling: Invalid Command',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Test Results:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`⏱️  Total Duration: ${this.results.reduce((sum, r) => sum + r.duration, 0)}ms`);
    
    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.testName} (${result.duration}ms)`);
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  // Quick sanity check for development
  async quickTest(): Promise<boolean> {
    try {
      const command = nativeVoiceCommands.parseVoiceCommand('hey speakeasy open chrome');
      const status = voiceFeedbackService.getStatus();
      const listeningStatus = backgroundVoiceService.getListeningStatus();
      
      return command !== null && status.isSupported && listeningStatus.hasRecognition;
    } catch (error) {
      console.error('Quick test failed:', error);
      return false;
    }
  }
}

export const voiceCommandTests = new VoiceCommandTests();
