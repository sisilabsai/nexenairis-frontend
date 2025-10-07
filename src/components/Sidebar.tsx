'use client';

import { Fragment, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleNotifications } from '@/contexts/NotificationContext';
import { Dialog, Transition, Popover } from '@headlessui/react';
import {
  HomeIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
  BellIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// --- TYPES ---
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  name: string;
  icon: React.ElementType;
  children: Omit<NavItem, 'icon'>[];
}

type NavigationLink = NavItem | NavGroup;

// --- CONFIGURATION ---
// In a real-world app, this would likely live in a separate config file.
const navigation: NavigationLink[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Finance', href: '/finance', icon: CurrencyDollarIcon },
    { name: 'Assets', href: '/assets', icon: BuildingOfficeIcon },
    { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
    { name: 'Sales', href: '/sales', icon: BuildingStorefrontIcon },
    {
      name: 'Inventory',
      icon: CubeIcon,
      children: [
        { name: 'Overview', href: '/inventory' },
        { name: 'AI Inventory', href: '/ai-inventory' },
        { name: 'Barcode Management', href: '/barcode' },
        { name: 'Supplier Management', href: '/suppliers' },
        { name: 'Units of Measure', href: '/inventory/units-of-measure' },
        { name: 'Mobile Pairing', href: '/inventory/mobile-pairing' },
        { name: 'Mobile Scan', href: '/mobile-scan' },
      ],
    },
    {
      name: 'CRM',
      icon: UsersIcon,
      children: [
        { name: 'Dashboard', href: '/crm' },
        { name: 'Pipeline', href: '/crm/pipeline' },
      ],
    },
    { name: 'HR', href: '/hr', icon: UserGroupIcon },
    { name: 'Projects', href: '/projects', icon: DocumentTextIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    {
      name: 'Settings',
      icon: CogIcon,
      children: [
        { name: 'General', href: '/settings' },
        { name: 'Permissions', href: '/settings/permissions' },
        { name: 'Branches', href: '/settings/branches' },
      ],
    },
    { name: 'API Test', href: '/test', icon: CogIcon },
];

const LOGO_URL = "https://res.cloudinary.com/dc0uiujvn/image/upload/v1757896917/logo_g2mak4.png";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wecrafttech.com/api';

// Enhanced theme colors and gradients
const THEME_COLORS = {
  primary: 'from-indigo-600 to-purple-600',
  secondary: 'from-gray-700 to-gray-800',
  accent: 'from-emerald-500 to-teal-600',
  warning: 'from-amber-500 to-orange-600',
};

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// Notification component for enhanced user experience
const NotificationBadge = ({ count, isCollapsed }: { count: number; isCollapsed: boolean }) => {
  if (!count) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={classNames(
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center min-w-[1.25rem] h-5 px-1",
        isCollapsed ? "text-[10px]" : "text-xs"
      )}
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  );
};

// Enhanced tooltip component
const Tooltip = ({ children, content, isVisible }: { children: React.ReactNode; content: string; isVisible: boolean }) => {
  if (!isVisible) return <>{children}</>;
  
  return (
    <div className="group relative">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {content}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavLink = ({ item, isCollapsed, currentPath }: { item: NavItem; isCollapsed: boolean; currentPath: string }) => {
  const isActive = item.href && currentPath === item.href;
  const [isHovered, setIsHovered] = useState(false);
  
  // Get real notification count from context
  const { count: notificationCount, markAsRead } = useModuleNotifications(item.name);

  // Mark as read when user clicks on the link (if it has notifications)
  const handleClick = () => {
    if (notificationCount > 0) {
      markAsRead(notificationCount);
    }
  };

  return (
    <Tooltip content={item.name} isVisible={isCollapsed}>
      <motion.div
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={item.href}
          onClick={handleClick}
          className={classNames(
            'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out relative overflow-hidden',
            isActive 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
              : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white hover:shadow-md',
            isCollapsed && 'justify-center'
          )}
        >
          {/* Animated background for active state */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-75"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            />
          )}
          
          {/* Hover glow effect */}
          {isHovered && !isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}

          <div className="relative z-10 flex items-center w-full">
            <div className="relative">
              <item.icon 
                className={classNames(
                  'h-5 w-5 shrink-0 transition-all duration-300',
                  !isCollapsed && 'mr-3',
                  isActive ? 'text-white drop-shadow-sm' : 'text-gray-300 group-hover:text-white'
                )} 
              />
              <NotificationBadge count={notificationCount} isCollapsed={isCollapsed} />
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden relative z-10"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </motion.div>
    </Tooltip>
  );
};

const CollapsibleNavLink = ({ item, isCollapsed, currentPath }: { item: NavGroup; isCollapsed: boolean; currentPath: string }) => {
  const isChildActive = useMemo(() => item.children.some(child => child.href && currentPath.startsWith(child.href)), [item.children, currentPath]);
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (isCollapsed) {
    return (
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                'group flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
                isChildActive || open ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              title={item.name}
            >
              <item.icon className="h-5 w-5 shrink-0" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-full top-0 z-10 ml-2 w-48 rounded-xl bg-gray-800 border border-gray-700 p-2 shadow-lg">
                <div className="space-y-1">
                  {item.children.map(child => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={classNames(
                        'block px-3 py-2 rounded-md text-sm font-medium',
                        currentPath.startsWith(child.href) ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
          isChildActive ? 'text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        )}
      >
        <item.icon className="mr-3 h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{item.name}</span>
        <ChevronDownIcon
          className={classNames(
            'h-5 w-5 shrink-0 transition-transform duration-200 ease-in-out',
            isOpen ? 'transform rotate-180' : ''
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-8 mt-1 space-y-1">
              {item.children.map(child => (
                <Link
                  key={child.name}
                  href={child.href}
                  className={classNames(
                    'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    currentPath.startsWith(child.href) ? 'text-white' : 'text-gray-400 hover:text-white'
                  )}
                >
                  <span className="mr-3 h-1.5 w-1.5 rounded-full bg-gray-500 group-hover:bg-indigo-400 transition-colors duration-200" />
                  {child.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserProfile = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user, logout } = useAuth();
  const [showStatus, setShowStatus] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'busy' | 'away'>('online');
  
  if (!user) return null;

  const logoUrl = user.tenant?.logo ? `${API_BASE_URL}/storage/${user.tenant.logo}` : null;

  const statusColors = {
    online: 'bg-green-400',
    busy: 'bg-red-400',
    away: 'bg-yellow-400'
  };

  return (
    <div className="p-2">
      <motion.div 
        className={classNames(
          "rounded-xl border border-gray-700/30 transition-all duration-300 backdrop-blur-sm",
          isCollapsed ? 'p-2' : 'p-3 bg-gradient-to-br from-gray-900/80 to-gray-800/80'
        )}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${user.tenant.company_name} Logo`} 
                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-600 shadow-lg" 
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-2 border-gray-600 shadow-lg">
                  <BuildingStorefrontIcon className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </motion.div>
            
            {/* Status indicator */}
            <motion.div
              className={classNames(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800",
                statusColors[userStatus]
              )}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {user.tenant?.company_name || 'Your Company'}
                </p>
                <p className="text-xs text-gray-400 truncate flex items-center">
                  <span className={classNames("w-2 h-2 rounded-full mr-1.5", statusColors[userStatus])} />
                  {user.name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-700/30 space-y-2">
                {/* Status selector */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Status:</span>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="away">Away</option>
                  </select>
                </div>
                
                <motion.button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-300 bg-gradient-to-r from-gray-700/60 to-gray-600/60 hover:from-red-700/60 hover:to-red-600/60 rounded-lg transition-all duration-300 backdrop-blur-sm border border-gray-600/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};


// --- MAIN SIDEBAR CONTENT ---

const SidebarContent = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (collapsed: boolean) => void; }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredNavigation = useMemo(() => {
    const userModules = user?.modules || [];
    const baseFiltered = navigation.filter(item => {
      if (!user?.modules) return true; // Show all if no modules defined
      return userModules.includes(item.name);
    });

    if (!searchTerm) return baseFiltered;

    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return baseFiltered.map(item => {
      if ('children' in item) {
        const filteredChildren = item.children.filter(child => child.name.toLowerCase().includes(lowerCaseSearch));
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
      } else if (item.name.toLowerCase().includes(lowerCaseSearch)) {
        return item;
      }
      return null;
    }).filter(Boolean) as NavigationLink[];

  }, [user, searchTerm]);

  return (
    <div className="flex flex-col flex-grow bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-full border-r border-gray-700/30 backdrop-blur-xl">
      {/* Enhanced Header */}
      <div className={classNames(
        "flex items-center justify-between h-20 flex-shrink-0 transition-all duration-300 border-b border-gray-700/30",
        isCollapsed ? 'px-2' : 'px-4'
      )}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Link href="/dashboard">
                <motion.img 
                  src={LOGO_URL} 
                  alt="NEXEN AIRIS Logo" 
                  className="h-12 w-auto rounded-lg shadow-lg" 
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center space-x-2">
          {/* Time display when collapsed */}
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-400 font-mono"
            >
              {currentTime.getHours().toString().padStart(2, '0')}:
              {currentTime.getMinutes().toString().padStart(2, '0')}
            </motion.div>
          )}
          
          <motion.button
            onClick={() => setCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isCollapsed ? <Bars3Icon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className={classNames("px-2 pt-4 pb-2 transition-all duration-300", isCollapsed ? 'px-1' : 'px-2')}>
        <motion.div 
          className="relative"
          animate={{ scale: searchFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <MagnifyingGlassIcon className={classNames(
            "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
            searchFocused ? 'text-indigo-400' : 'text-gray-400'
          )} />
          
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-600/50 transition-colors"
            >
              <XMarkIcon className="h-3 w-3 text-gray-400" />
            </motion.button>
          )}
          
          <input
            type="text"
            placeholder={isCollapsed ? "..." : "Search modules..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={classNames(
              "w-full bg-gray-700/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm",
              isCollapsed ? 'pl-3 pr-3 py-2 text-center text-sm' : 'pl-10 pr-8 py-2.5 text-sm',
              searchFocused && 'bg-gray-700/50 shadow-lg shadow-indigo-500/10'
            )}
          />
          
          {/* Search suggestions indicator */}
          {searchTerm && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-400 px-3"
            >
              {filteredNavigation.length} result{filteredNavigation.length !== 1 ? 's' : ''}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Enhanced Navigation */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-2 pb-4 pt-2">
        <motion.nav 
          className="flex-1 space-y-1"
          layout
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredNavigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                {'children' in item ? (
                  <CollapsibleNavLink item={item} isCollapsed={isCollapsed} currentPath={pathname} />
                ) : (
                  <NavLink item={item as NavItem} isCollapsed={isCollapsed} currentPath={pathname} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* No results message */}
          {searchTerm && filteredNavigation.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <LightBulbIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No modules found</p>
              <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
            </motion.div>
          )}
        </motion.nav>
        
        {/* Quick actions when collapsed */}
        {isCollapsed && !searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-gray-700/30"
          >
            <div className="flex flex-col space-y-2">
              <Tooltip content="AI Assistant" isVisible={true}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-600/30 hover:to-teal-600/30 transition-all duration-300"
                >
                  <SparklesIcon className="h-5 w-5" />
                </motion.button>
              </Tooltip>
              
              <Tooltip content="Notifications" isVisible={true}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 hover:from-blue-600/30 hover:to-indigo-600/30 transition-all duration-300 relative"
                >
                  <BellIcon className="h-5 w-5" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <UserProfile isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

// --- EXPORTED COMPONENT ---

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900 bg-opacity-80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* For mobile, we don't use the collapsed state */}
                <SidebarContent isCollapsed={false} setCollapsed={() => {}} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <motion.div 
        className={classNames(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out shadow-2xl",
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
        animate={{ 
          width: isCollapsed ? 80 : 256,
          boxShadow: isCollapsed 
            ? '8px 0 24px rgba(0, 0, 0, 0.15)' 
            : '12px 0 32px rgba(0, 0, 0, 0.2)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <SidebarContent isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      </motion.div>
    </>
  );
}
