import React from 'react';
import MenuComponent from './MenuComponent';
import Settings from './Settings';

export default function DashSettings() {
  return (
    <>
      <MenuComponent contenue={<Settings />} />
    </>
  );
}
