"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsData {
  guestAccessEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      setSettings(data.data);
    } else {
      toast.error(data.message || "设置加载失败");
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateGuestAccess = async (guestAccessEnabled: boolean) => {
    if (!settings || saving) return;

    const previous = settings;
    setSettings({ guestAccessEnabled });
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guestAccessEnabled }),
      });
      const data = await res.json();
      if (data.code === 0) {
        setSettings(data.data);
        toast.success("设置已保存");
      } else {
        setSettings(previous);
        toast.error(data.message || "设置保存失败");
      }
    } catch {
      setSettings(previous);
      toast.error("设置保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-muted-foreground">加载中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">系统设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">访问控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="guest-access">游客访问</Label>
              <p className="text-sm text-muted-foreground">
                开启后小程序可按游客身份访问文章详情。
              </p>
            </div>
            <Switch
              id="guest-access"
              checked={settings.guestAccessEnabled}
              disabled={saving}
              onCheckedChange={updateGuestAccess}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
