import React, { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Upload', href: '/', current: true },
  { name: 'View Files', href: '/#files', current: false },
  { name: 'Share', href: '/share', current: false },
  { name: 'Alerts', href: '/alerts', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function scrollToSection() {
  const element = document.getElementById('files');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

const Navigation = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Disclosure as="nav" className="theme-bg-card border-b theme-border-subtle sticky top-0 z-50 theme-shadow transition-colors duration-300">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-[1600px] px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 theme-text-muted hover:theme-bg-surface hover:theme-accent focus:outline-none focus:ring-2 focus:ring-inset transition-colors duration-300" style={{ '--tw-ring-color': 'var(--color-accent)' }}>
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md theme-accent-bg flex items-center justify-center accent-glow transition-all duration-300">
                      <span className="font-bold text-white dark:text-[#131313] font-['Space_Grotesk'] text-xl">S</span>
                    </div>
                    <span className="text-xl font-bold font-['Space_Grotesk'] theme-text hidden sm:block tracking-tight transition-colors duration-300">Sentinel Drive</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:items-center">
                  <div className="flex space-x-1">
                    {navigation.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={item.href.includes('#') ? scrollToSection : undefined}
                        className="theme-text-secondary hover:theme-accent rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-2 sm:gap-3">

                {/* Theme Toggle — polished pill button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative rounded-full p-2 theme-bg-surface border theme-border hover:scale-110 active:scale-95 transition-all duration-200 group"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Moon className="h-[18px] w-[18px] text-blue-300 group-hover:text-blue-200 transition-colors" />
                  ) : (
                    <Sun className="h-[18px] w-[18px] text-amber-500 group-hover:text-amber-600 transition-colors" />
                  )}
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  className="relative rounded-full p-2 theme-bg-surface border theme-border theme-text-muted hover:theme-accent transition-colors duration-200"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <BellIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                    <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 dark:bg-[#ffb4ab] ring-2 ring-[var(--color-bg-secondary)]" />
                  </div>
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-1">
                  <div>
                    <Menu.Button className="relative flex rounded-full theme-bg-surface border theme-border text-sm focus:outline-none focus:ring-2 transition-colors duration-300" style={{ '--tw-ring-color': 'var(--color-accent)' }}>
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 dark:from-[#2f7e33] dark:to-[#88d982] p-[2px]">
                        <div className="h-full w-full rounded-full theme-bg-card flex items-center justify-center transition-colors duration-300">
                          <span className="theme-accent text-xs font-bold">0x</span>
                        </div>
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg theme-bg-card py-1 theme-shadow-elevated border theme-border focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'theme-bg-surface theme-accent' : 'theme-text-secondary', 'block px-4 py-2 text-sm transition-colors duration-200')}
                          >
                            Disconnect Wallet
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden border-t theme-border theme-bg-surface transition-colors duration-300">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="theme-text-secondary hover:theme-accent block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation;
