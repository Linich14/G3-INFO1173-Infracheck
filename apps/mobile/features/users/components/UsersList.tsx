import React from 'react';
import { View, ScrollView } from 'react-native';
import UserCard from './UserCard';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

interface UsersListProps {
  users: User[];
  onDeleteUser: (user: User) => void;
}

export default function UsersList({ users, onDeleteUser }: UsersListProps) {
  return (
    <ScrollView>
      <View className='px-5 pb-5' style={{ gap: 12 }}>
        {users.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            onDelete={onDeleteUser}
          />
        ))}
      </View>
    </ScrollView>
  );
}