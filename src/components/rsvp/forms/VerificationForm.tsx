
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface VerificationFormProps {
  identifier: string;
  setIdentifier: (value: string) => void;
  verifyAttendee: (value?: string) => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  identifier,
  setIdentifier,
  verifyAttendee,
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          RSVP to our Event
        </CardTitle>
        <CardDescription className="text-center">
          Please verify your invitation to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">
            Enter your email or WhatsApp Number
          </Label>
          <Input
            id="email"
            placeholder="johndoe@example.com or 1234567890"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => verifyAttendee()}>
          Verify Invitation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationForm;
