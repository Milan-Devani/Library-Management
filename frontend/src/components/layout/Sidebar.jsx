import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiUserCheck,
  FiLayers,
  FiShare2,
  FiCornerDownLeft,
  FiDollarSign,
  FiSettings,
  FiX
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome },
  { name: 'Books', path: '/books', icon: FiBook },
  { name: 'Members', path: '/members', icon: FiUsers },
  { name: 'Authors', path: '/authors', icon: FiUserCheck },
  { name: 'Categories', path: '/categories', icon: FiLayers },
  { name: 'Issue Book', path: '/issues', icon: FiShare2 },
  { name: 'Returns', path: '/returns', icon: FiCornerDownLeft },
  { name: 'Fines', path: '/fines', icon: FiDollarSign },
  { name: 'Settings', path: '/settings', icon: FiSettings },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header with Close button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500 text-center">
            <p className="font-semibold text-slate-700">LMS College Portal</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Version 1.0.0 (Final Year)</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
