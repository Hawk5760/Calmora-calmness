import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Key, Smartphone, AlertTriangle, CheckCircle, Copy } from "lucide-react";

interface TwoFactorProps {
  className?: string;
}

export const TwoFactor = ({ className }: TwoFactorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;

    try {
      // Use edge function instead of direct table access to avoid exposing secrets
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: undefined }
      });

      if (error) {
        console.error('Error checking 2FA status:', error);
        return;
      }

      setIsEnabled(data?.is_enabled || false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!user) return;

    setIsEnabling(true);
    try {
      // Call backend to generate secret and QR code
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'generate' }
      });

      if (error) {
        throw new Error('Failed to generate 2FA setup');
      }

      if (!data?.otpauthUrl) {
        throw new Error('Failed to generate 2FA setup');
      }

      // Generate QR code URL from the otpauth URL
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauthUrl)}`;
      setQrCodeUrl(qrCode);
      if (data.backup_codes) {
        setBackupCodes(data.backup_codes);
      }
      setShowSetup(true);

      toast({
        title: "Setup started",
        description: "Scan the QR code with your authenticator app",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "Failed to start 2FA setup",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!user || !verificationCode) return;

    try {
      // Validate input format
      if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      // Call backend TOTP function to verify code
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { 
          action: 'verify',
          code: verificationCode 
        }
      });

      if (error) {
        throw new Error('Verification failed. Please try again.');
      }

      if (!data?.valid) {
        throw new Error('Invalid verification code. Please check your authenticator app and try again.');
      }

      setIsEnabled(true);
      // Backup codes were returned during 'generate' action and stored in state
      // The generate response already included backup_codes - no need to query table
      
      setShowSetup(false);
      setVerificationCode('');
      
      toast({
        title: "2FA enabled successfully!",
        description: "Your account is now more secure. Save your backup codes.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;

    setIsDisabling(true);
    try {
      // Call backend TOTP function to disable
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'disable' }
      });

      if (error) {
        throw new Error('Failed to disable 2FA');
      }

      setIsEnabled(false);
      setBackupCodes([]);
      
      toast({
        title: "2FA disabled",
        description: "Two-factor authentication has been disabled for your account",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to disable 2FA",
        description: error.message,
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Backup codes copied",
      description: "Store these codes in a safe place",
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">
                  2FA is {isEnabled ? 'enabled' : 'disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled 
                    ? 'Your account is protected with two-factor authentication'
                    : 'Enable 2FA to secure your account'
                  }
                </p>
              </div>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Setup Flow */}
          {!isEnabled && !showSetup && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <Smartphone className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Secure Your Account</h3>
                <p className="text-muted-foreground">
                  Use an authenticator app like Google Authenticator or Authy to generate secure codes
                </p>
              </div>
              <Button 
                onClick={enableTwoFactor} 
                disabled={isEnabling}
                className="w-full"
              >
                {isEnabling ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </Button>
            </div>
          )}

          {/* QR Code Setup */}
          {showSetup && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Scan QR Code</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Scan this QR code with your authenticator app, then enter the 6-digit code to complete setup
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={verifyAndEnable} 
                    disabled={verificationCode.length !== 6}
                    className="flex-1"
                  >
                    Verify & Enable
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSetup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Backup Codes</h3>
                <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Save these backup codes in a secure place. Each can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-background p-2 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Disable 2FA */}
          {isEnabled && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Disabling two-factor authentication will make your account less secure
                </p>
                <Button 
                  variant="destructive" 
                  onClick={disableTwoFactor}
                  disabled={isDisabling}
                >
                  {isDisabling ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Disabling...
                    </>
                  ) : (
                    'Disable Two-Factor Authentication'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};