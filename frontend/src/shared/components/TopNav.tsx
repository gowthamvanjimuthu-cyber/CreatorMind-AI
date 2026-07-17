import { Bell, Menu, Search } from 'lucide-react';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        <button className="md:hidden p-2 -ml-2 mr-2 text-neutral-500 hover:bg-neutral-100 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        {/* Command Palette Placeholder */}
        <div className="hidden sm:flex relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-neutral-100 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            placeholder="Search documents, commands... (⌘K)"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
