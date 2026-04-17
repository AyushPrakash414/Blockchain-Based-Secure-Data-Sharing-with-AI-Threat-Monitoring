import React from 'react'
import Navigation from './Navigation'
import { Outlet } from 'react-router-dom'
import AlertToast from './security/AlertToast'

const Layout = () => {
    return (
        <div className="min-h-screen theme-bg theme-text font-['Inter'] transition-colors duration-300">
            <Navigation />
            <div className='min-h-[500px]'>
                <Outlet />
            </div>
            
            {/* Global Toasts rendering via portal or top-level component */}
            <AlertToast />
        </div>
    );
}

export default Layout;
