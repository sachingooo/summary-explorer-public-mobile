import { Box } from '@mantine/core';

type GradientOverlaysProps = {
    computedColorScheme: 'light' | 'dark';
};

export function GradientOverlays({ computedColorScheme }: GradientOverlaysProps) {
    return (
        <>
            <Box
                style={{
                    position: 'fixed',
                    top: 132,
                    left: 0,
                    right: 0,
                    height: 28,
                    zIndex: 10,
                    pointerEvents: 'none',
                    background:
                        computedColorScheme === 'light'
                            ? 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))'
                            : 'linear-gradient(to bottom, rgba(20,21,23,1), rgba(20,21,23,0))',
                }}
            />

            <Box
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 44,
                    zIndex: 10,
                    pointerEvents: 'none',
                    background:
                        computedColorScheme === 'light'
                            ? 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))'
                            : 'linear-gradient(to top, rgba(20,21,23,1), rgba(20,21,23,0))',
                }}
            />
        </>
    );
}