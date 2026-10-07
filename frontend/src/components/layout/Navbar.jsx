import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiUser, FiBookOpen } from 'react-icons/fi';
import { logoutUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <FiBookOpen className="text-xl" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                Library Management
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider hidden sm:block">
                College Central Portal
              </span>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 pl-3 py-1 pr-3 bg-slate-50 border border-slate-200 rounded-full">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <div className="text-left text-xs leading-none">
              <span className="font-semibold text-slate-800 block">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'Librarian'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out of system"
            aria-label="Log out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
          >
            <FiLogOut className="text-sm" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
