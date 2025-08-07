import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy Policy for SpeakEasy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Voice Data:</strong> Audio recordings for voice command processing (processed locally when possible)</p>
                <p>• <strong>Account Information:</strong> Email address and profile data for authentication</p>
                <p>• <strong>Usage Data:</strong> Command history and app usage statistics for improving functionality</p>
                <p>• <strong>Device Information:</strong> Device type and capabilities for optimization</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Process voice commands and provide app functionality</p>
                <p>• Improve voice recognition accuracy and app performance</p>
                <p>• Sync your data across devices</p>
                <p>• Provide customer support when requested</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Data Security</h3>
              <p className="text-sm text-muted-foreground">
                We implement industry-standard security measures to protect your data. Voice processing
                is performed locally when possible, and all data transmissions are encrypted.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Third-Party Services</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Supabase:</strong> Database and authentication services</p>
                <p>• <strong>Web Speech API:</strong> Voice recognition on web platforms</p>
                <p>• <strong>Native Speech Services:</strong> Device-native voice recognition on mobile</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Request access to your personal data</p>
                <p>• Request correction of inaccurate data</p>
                <p>• Request deletion of your data</p>
                <p>• Opt-out of data collection features</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at privacy@speakeasy.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;