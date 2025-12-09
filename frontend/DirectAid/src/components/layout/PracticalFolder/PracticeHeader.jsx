import React from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PracticeHeader() {
    const [isOpen, setIsopen] = useState(false);

    return(
        <header className='fixed inset-x-0 top-0 bg-[#0B1221] border border-b top-0 z-50'>
            <nav className='container mx-auto flex items-center justify-between'>
                <a href="#">DirectAid</a>

                {/* desktop navigation */}
                <div className='hidden md:flex items-center justify-around flex-1 text-[#E0E0E0] text-lg'>
                    <div className='flex'>
                        <a href="#">Home</a>
                        <a href="#">Campaigns</a>
                        <a href="#">How it Works</a>
                        <a href="#">Faq</a>
                    </div>
                    <div className='flex'>
                        <a href="#">Login</a>
                        <a href="#">Get Started</a>
                    </div>
                </div>

                {/* conditional toggle button */}
                <button onClick={() => setIsopen(!isOpen)} className='text-[#E0E0E0]'>
                    {isOpen ? <X /> : <Menu />}
                </button>

                {/* mobile navigation */}
                <div className={`md:hidden fixed inset-0 z-40 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className='flex flex-col items-center justify-center gap-12 md:hidden'>
                        <div className='flex flex-col gap-8'>
                            <a href="#">Home</a>
                            <a href="#">Campaigns</a>
                            <a href="#">How it Works</a>
                            <a href="#">Faq</a>
                        </div>
                        <div className='flex flex-col gap-8'>
                            <a href="#">Login</a>
                            <a href="#">Get Started</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}