import React from 'react';

type PageContainerProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function PageContainer({ title, subtitle, action, children }: PageContainerProps) {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-500 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="mt-4 sm:mt-0 ml-4 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
