import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';

const TenantSettings = () => {
    const [settings, setSettings] = useState({ use_branches: false });
    const { get, put } = useApi();

    useEffect(() => {
        const fetchSettings = async () => {
            const response: unknown = await get('/tenant/settings');
            if (response && typeof response === 'object' && 'use_branches' in response) {
                setSettings({ use_branches: (response as { use_branches: boolean }).use_branches || false });
            }
        };
        fetchSettings();
    }, [get]);

    const handleSettingChange = async (key: 'use_branches', value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await put('/tenant/settings', { [key]: value });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="use_branches">Use Branches</Label>
                <Switch
                    id="use_branches"
                    checked={settings.use_branches}
                    onCheckedChange={(value) => handleSettingChange('use_branches', value)}
                />
            </div>
        </div>
    );
};

export default TenantSettings;
