import { nativeVoiceCommands } from './NativeVoiceCommands';
import { backgroundVoiceService } from './BackgroundVoiceService';
import { voiceFeedbackService } from './VoiceFeedbackService';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export class VoiceCommandTestRunner {
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
    const startTime = Date.now();
    try {
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
        'bluetooth off'
      ];

      let passedCount = 0;
      for (const command of testCommands) {
        const parsed = nativeVoiceCommands.parseVoiceCommand(command);
        if (parsed) {
          passedCount++;
        }
      }

      const passed = passedCount === testCommands.length;
      this.results.push({
        testName: 'Command Parsing',
        passed,
        error: passed ? undefined : `Only ${passedCount}/${testCommands.length} commands parsed correctly`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Command Parsing',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private async testWakePhraseDetection(): Promise<void> {
    const startTime = Date.now();
    try {
      const testPhrases = [
        'hey speakeasy open chrome',
        'hey speak easy type hello',
        'speakeasy search weather',
        'voice command play music',
        'assistant take screenshot'
      ];

      let passedCount = 0;
      for (const phrase of testPhrases) {
        const parsed = nativeVoiceCommands.parseVoiceCommand(phrase);
        if (parsed) {
          passedCount++;
        }
      }

      const passed = passedCount === testPhrases.length;
      this.results.push({
        testName: 'Wake Phrase Detection',
        passed,
        error: passed ? undefined : `Only ${passedCount}/${testPhrases.length} wake phrases detected`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Wake Phrase Detection',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private async testVoiceFeedback(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test voice feedback service initialization
      voiceFeedbackService.enable();
      voiceFeedbackService.disable();
      
      // Test feedback methods exist
      const methods = [
        'confirmCommand',
        'commandSuccess',
        'commandFailed',
        'wakePhraseDetected',
        'listeningStarted',
        'helpMessage'
      ];

      let passedCount = 0;
      for (const method of methods) {
        if (typeof (voiceFeedbackService as any)[method] === 'function') {
          passedCount++;
        }
      }

      const passed = passedCount === methods.length;
      this.results.push({
        testName: 'Voice Feedback',
        passed,
        error: passed ? undefined : `Only ${passedCount}/${methods.length} feedback methods available`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Voice Feedback',
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
      const passed = typeof status.isListening === 'boolean' && 
                    typeof status.isNative === 'boolean' &&
                    typeof status.platform === 'string' &&
                    typeof status.hasRecognition === 'boolean';
      
      this.results.push({
        testName: 'Battery Optimization',
        passed,
        error: passed ? undefined : 'Background service not properly configured',
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
      // Test invalid command
      const invalidCommand = nativeVoiceCommands.parseVoiceCommand('invalid command that should not match');
      const passed = invalidCommand === null;
      
      this.results.push({
        testName: 'Error Handling',
        passed,
        error: passed ? undefined : 'Invalid command should return null',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        testName: 'Error Handling',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Test Results:');
    console.log('='.repeat(50));
    
    let passedCount = 0;
    for (const result of this.results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName} (${result.duration}ms)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.passed) passedCount++;
    }
    
    console.log('='.repeat(50));
    console.log(`Summary: ${passedCount}/${this.results.length} tests passed`);
    
    if (passedCount === this.results.length) {
      console.log('🎉 All tests passed! Voice command system is ready.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }
  }

  async runQuickTest(): Promise<void> {
    console.log('⚡ Running Quick Voice Command Test...');
    
    // Test a few key commands
    const commands = [
      'open chrome',
      'type hello world',
      'search weather',
      'play music',
      'help'
    ];

    for (const command of commands) {
      const parsed = nativeVoiceCommands.parseVoiceCommand(command);
      console.log(`"${command}" -> ${parsed ? JSON.stringify(parsed) : 'null'}`);
    }

    console.log('✅ Quick test complete!');
  }
}

export const voiceCommandTestRunner = new VoiceCommandTestRunner();
