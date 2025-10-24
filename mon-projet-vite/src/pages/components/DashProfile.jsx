import React from 'react';
import MenuComponent from './MenuComponent';
import UserProfile from './UserProfile';

export default function DashProfile() {
  return (
    <>
      <MenuComponent contenue={<UserProfile />} />
    </>
  );
}
