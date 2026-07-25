import { NavLink } from 'react-router-dom';
import {
  Home, BookOpen, PenTool, Folder,
  Calendar, BarChart2, Settings, BrainCircuit, PenLine
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Knowledge Base', icon: BookOpen, to: '/knowledge' },
  { label: 'AI Workspace', icon: PenTool, to: '/workspace' },
  { label: 'Writing Studio', icon: PenLine, to: '/studio' },
  { label: 'Content Library', icon: Folder, to: '/library' },
  { label: 'Calendar', icon: Calendar, to: '/calendar' },
  { label: 'Analytics', icon: BarChart2, to: '/analytics' },
];

const bottomItems = [
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full hidden md:flex flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <BrainCircuit className="w-6 h-6 text-indigo-600 mr-2" />
        <span className="font-bold text-lg text-neutral-900">CreatorMind AI</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-neutral-200 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        {/* User Profile Hook */}
        <NavLink
          to="/profile"
          className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors mt-2"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
            GK
          </div>
          <span className="ml-3 text-sm font-medium text-neutral-700">Gowtham K</span>
        </NavLink>
      </div>
    </aside>
  );
}

function NavItem({ label, icon: Icon, to }: { label: string; icon: any; to: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "flex items-center px-3 py-2 rounded-md transition-colors font-medium text-sm",
        isActive
          ? "bg-indigo-50 text-indigo-700 font-semibold"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      {label}
    </NavLink>
  );
}
