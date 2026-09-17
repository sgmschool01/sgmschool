import 'react';

declare module 'react' {
    interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
        jsx?: boolean | string;
        global?: boolean | string;
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement> & {
                jsx?: boolean | string;
                global?: boolean | string;
            }, HTMLStyleElement>;
        }
    }
}

