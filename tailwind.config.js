import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                pump: {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                },
            },
            animation: {
                pump: 'pump 1s ease-in-out infinite',
            },
        },
    },

    plugins: [forms],
};
