import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import MobileNav from './MobileNav'

const MainLayout = () => {
  const { dark, setDark } = useTheme();
  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <LeftSidebar/>
      <main className="flex-1 flex flex-col items-center h-full">
        <button
          aria-label="Toggle dark mode"
          className="fixed top-4 right-4 p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black shadow-md z-50"
          onClick={() => setDark(d => !d)}
        >
          {dark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
        </button>
        <Outlet/>
      </main>
      <RightSidebar/>
      <MobileNav />
    </div>
  )
}

export default MainLayout