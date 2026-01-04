import { logger } from './logger';
import { ENV } from '@/config/env';

// BuildShip API Types
export type BuildShipIntent = 
  | 'OPEN_SETTINGS'
  | 'GO_HOME'
  | 'OPEN_ROUTINES'
  | 'START_ROUTINE'
  | 'STOP_LISTENING'
  | 'START_LISTENING'
  | 'SHOW_COMMAND_LOG'
  | 'LOG_NOTE'
  | 'WHAT_CAN_YOU_DO'
  | 'HELP'
  | 'SIGN_OUT'
  | 'UNKNOWN';

export interface BuildShipRequest {
  user_id: string;
  session_id: string;
  transcript: string;
  context: {
    screen: string;
    timezone: string;
    app_mode: 'web' | 'mobile';
    recent_commands: string[];
  };
}

export interface BuildShipEntities {
  routine_name?: string | null;
  note?: string | null;
}

export interface BuildShipClientAction {
  type: 'NAVIGATE' | 'RUN_ROUTINE' | 'SAVE_NOTE' | 'NONE';
  payload: Record<string, any>;
}

export interface BuildShipResponse {
  intent: BuildShipIntent;
  confidence: number;
  entities: BuildShipEntities;
  assistant_reply: string;
  client_action: BuildShipClientAction;
}

class BuildShipService {
  private apiUrl: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    // Get BuildShip API URL from environment
    this.apiUrl = import.meta.env.VITE_BUILDSHIP_API_URL?.trim() || null;
    
    if (!this.apiUrl) {
      logger.log('⚠️ BuildShip API URL not configured. Voice commands will use fallback processing.');
    } else {
      logger.log('✅ BuildShip API URL configured:', this.apiUrl);
    }
  }

  /**
   * Generate or retrieve session ID for tracking command context
   */
  getSessionId(): string {
    if (!this.sessionId) {
      // Generate a session ID and store it
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Store in sessionStorage to persist across page reloads
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('speakeasy_session_id', this.sessionId);
      }
    }
    return this.sessionId;
  }

  /**
   * Reset session ID (useful for new user sessions)
   */
  resetSession(): void {
    this.sessionId = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('speakeasy_session_id');
    }
  }

  /**
   * Process a voice command through BuildShip API
   */
  async processCommand(
    userId: string,
    transcript: string,
    context: {
      screen: string;
      app_mode: 'web' | 'mobile';
      recent_commands?: string[];
    }
  ): Promise<BuildShipResponse | null> {
    if (!this.apiUrl) {
      logger.log('⚠️ BuildShip API URL not configured, skipping API call');
      return null;
    }

    try {
      const sessionId = this.getSessionId();
      
      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const request: BuildShipRequest = {
        user_id: userId,
        session_id: sessionId,
        transcript: transcript.trim(),
        context: {
          screen: context.screen || 'Home',
          timezone,
          app_mode: context.app_mode,
          recent_commands: context.recent_commands || [],
        },
      };

      logger.log('📤 Sending command to BuildShip:', {
        transcript: request.transcript,
        intent: 'processing...',
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.log('❌ BuildShip API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`BuildShip API error: ${response.status} ${response.statusText}`);
      }

      const data: BuildShipResponse = await response.json();
      
      logger.log('✅ BuildShip response received:', {
        intent: data.intent,
        confidence: data.confidence,
        assistant_reply: data.assistant_reply,
        client_action: data.client_action.type,
      });

      // Validate response structure
      if (!data.intent || typeof data.confidence !== 'number') {
        throw new Error('Invalid BuildShip response structure');
      }

      return data;
    } catch (error: any) {
      logger.log('❌ BuildShip API call failed:', error.message || error);
      return null;
    }
  }

  /**
   * Check if BuildShip is configured and available
   */
  isAvailable(): boolean {
    return this.apiUrl !== null && this.apiUrl.trim() !== '';
  }
}

// Export singleton instance
export const buildShipService = new BuildShipService();

