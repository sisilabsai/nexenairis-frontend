import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, breadcrumbs }) => {
    return (
        <div className="mb-8">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex mb-4" aria-label="Breadcrumb">
                    <ol role="list" className="flex items-center space-x-4">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={index}>
                                <div className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                    )}
                                    {breadcrumb.href ? (
                                        <Link href={breadcrumb.href} className={`${index > 0 ? 'ml-4 ' : ''}text-sm font-medium text-gray-500 hover:text-gray-700`}>
                                            {breadcrumb.label}
                                        </Link>
                                    ) : (
                                        <span className={`${index > 0 ? 'ml-4 ' : ''}text-sm font-medium text-gray-500`}>
                                            {breadcrumb.label}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                </div>
                <div className="flex space-x-3">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
