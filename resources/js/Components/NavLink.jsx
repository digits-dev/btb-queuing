import { Link } from '@inertiajs/react';
import clsx from 'clsx';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={clsx(
                'inline-flex items-center px-1 pt-1 text-sm font-medium transition duration-150 ease-in-out',
                active
                    ? 'text-black bg-white '
                    : 'text-gray-600 hover:bg-gray-100',
                className
            )}
        >
            {children}
        </Link>
    );
}
