'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/context/translation-context";

export function Settings() {
  const { autoTranslate, setAutoTranslate } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-translate"
            checked={autoTranslate}
            onCheckedChange={setAutoTranslate}
          />
          <Label htmlFor="auto-translate">Auto Translate</Label>
        </div>
      </CardContent>
    </Card>
  );
} 