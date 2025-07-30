import '../css/app.css';
import './bootstrap';
import FullscreenWrapper from './Components/FullscreenWrapper';
import './echo.js';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${appName} - ${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            //<FullscreenWrapper>
                <App {...props} />
            //</FullscreenWrapper>
      );
    },
    progress: {
        color: '#4B5563',
    },
});
