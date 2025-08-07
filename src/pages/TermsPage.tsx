import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsPage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Terms of Service for SpeakEasy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground">
                By using SpeakEasy, you agree to be bound by these Terms of Service. If you do not agree 
                to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Service Description</h3>
              <p className="text-sm text-muted-foreground">
                SpeakEasy is a voice-controlled assistant application that allows users to interact with 
                their devices using voice commands for improved accessibility and productivity.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">User Responsibilities</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Use the service in compliance with applicable laws and regulations</p>
                <p>• Maintain the confidentiality of your account credentials</p>
                <p>• Use voice commands responsibly and respect others' privacy</p>
                <p>• Report any security vulnerabilities or issues promptly</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Prohibited Uses</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Using the service for illegal or harmful activities</p>
                <p>• Attempting to reverse engineer or compromise the service</p>
                <p>• Sharing inappropriate or offensive content through voice commands</p>
                <p>• Interfering with the service's operation or other users' experience</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
              <p className="text-sm text-muted-foreground">
                While we strive to maintain high service availability, we cannot guarantee uninterrupted 
                access. The service may be temporarily unavailable for maintenance, updates, or due to 
                technical issues.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground">
                SpeakEasy is provided "as is" without warranties. We are not liable for any damages 
                arising from the use or inability to use the service, including but not limited to 
                data loss or privacy breaches.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Changes to Terms</h3>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms of Service, contact us at legal@speakeasy.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;