'use client';

import { Fragment, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- SUB-COMPONENTS ---

const NavLink = ({ item, isCollapsed, currentPath }: { item: NavItem; isCollapsed: boolean; currentPath: string }) => {
  const isActive = item.href && currentPath === item.href;
  return (
    <Link
      href={item.href}
      className={classNames(
        'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
        isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
        isCollapsed && 'justify-center'
      )}
      title={isCollapsed ? item.name : undefined}
    >
      <item.icon className={classNames('h-5 w-5 shrink-0', !isCollapsed && 'mr-3')} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
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
  if (!user) return null;

  const logoUrl = user.tenant?.logo ? `${API_BASE_URL}/storage/${user.tenant.logo}` : null;

  return (
    <div className="p-2">
      <div className={classNames(
        "rounded-lg border border-gray-700/50 transition-all duration-300",
        isCollapsed ? 'p-2' : 'p-3 bg-gray-900/50'
      )}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={`${user.tenant.company_name} Logo`} className="h-10 w-10 rounded-full object-cover border-2 border-gray-600" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
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
                <p className="text-xs text-gray-400 truncate">
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
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


// --- MAIN SIDEBAR CONTENT ---

const SidebarContent = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (collapsed: boolean) => void; }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="flex flex-col flex-grow bg-gray-800 text-white h-full border-r border-gray-700/50">
      <div className={classNames(
        "flex items-center justify-between h-20 px-4 flex-shrink-0 transition-all duration-300",
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
                <img src={LOGO_URL} alt="NEXEN AIRIS Logo" className="h-12 w-auto rounded-md" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Bars3Icon className="h-6 w-6" /> : <ChevronDoubleLeftIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className={classNames("px-2 transition-all duration-300", isCollapsed ? 'px-1' : 'px-2')}>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classNames(
              "w-full bg-gray-700/50 border-0 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm py-2",
              isCollapsed ? 'pl-3 pr-3' : 'pl-10'
            )}
          />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-2 pb-4 mt-4">
        <nav className="flex-1 space-y-1">
          {filteredNavigation.map((item) =>
            'children' in item ? (
              <CollapsibleNavLink key={item.name} item={item} isCollapsed={isCollapsed} currentPath={pathname} />
            ) : (
              <NavLink key={item.name} item={item as NavItem} isCollapsed={isCollapsed} currentPath={pathname} />
            )
          )}
        </nav>
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
      <div className={classNames(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      )}>
        <SidebarContent isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      </div>
    </>
  );
}
