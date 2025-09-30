"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { Channel, User } from '@/types/chat';

const ChannelsPage = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');
    const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [userToAdd, setUserToAdd] = useState('');

    useEffect(() => {
        fetchChannels();
        fetchUsers();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await api.get<Channel[]>('/chat/channels');
            if (response.data) {
                setChannels(response.data);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get<User[]>('/chat/users');
            if (response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const createChannel = async () => {
        try {
            await api.post('/chat/channels', {
                name: newChannelName,
                description: newChannelDescription,
                type: newChannelType,
            });
            setNewChannelName('');
            setNewChannelDescription('');
            fetchChannels();
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };

    const deleteChannel = async (channelId: number) => {
        try {
            await api.delete(`/chat/channels/${channelId}`);
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    };

    const addUserToChannel = async () => {
        if (!selectedChannel || !userToAdd) return;
        try {
            await api.post(`/chat/channels/${selectedChannel.id}/users`, { user_id: userToAdd });
            setUserToAdd('');
            fetchChannels();
        } catch (error) {
            console.error('Error adding user to channel:', error);
        }
    };

    const removeUserFromChannel = async (userId: number) => {
        if (!selectedChannel) return;
        try {
            await api.delete(`/chat/channels/${selectedChannel.id}/users/${userId}`);
            fetchChannels();
        } catch (error) {
            console.error('Error removing user from channel:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Channels</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Channel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Channel Name"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                />
                                <Input
                                    placeholder="Channel Description"
                                    value={newChannelDescription}
                                    onChange={(e) => setNewChannelDescription(e.target.value)}
                                />
                                <select
                                    value={newChannelType}
                                    onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private')}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                                <Button onClick={createChannel} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Channel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Channels</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul>
                                {channels.map((channel) => (
                                    <li
                                        key={channel.id}
                                        className={`p-2 cursor-pointer ${selectedChannel?.id === channel.id ? 'bg-gray-200' : ''}`}
                                        onClick={() => setSelectedChannel(channel)}
                                    >
                                        {channel.name} ({channel.type})
                                        <Button variant="destructive" size="sm" className="float-right" onClick={() => deleteChannel(channel.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-2">
                    {selectedChannel && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users in {selectedChannel.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex space-x-2 mb-4">
                                    <select
                                        value={userToAdd}
                                        onChange={(e) => setUserToAdd(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select User to Add</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    <Button onClick={addUserToChannel}>
                                        <UserPlus className="mr-2 h-4 w-4" /> Add User
                                    </Button>
                                </div>
                                <ul>
                                    {selectedChannel.users?.map((user) => (
                                        <li key={user.id} className="p-2 flex justify-between items-center">
                                            {user.name}
                                            <Button variant="destructive" size="sm" onClick={() => removeUserFromChannel(user.id)}>
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChannelsPage;
