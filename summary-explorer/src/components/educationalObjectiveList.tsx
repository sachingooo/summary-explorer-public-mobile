import {
    Center,
    Container,
    Loader,
    Stack,
    Text,
    Box,
    Transition
} from '@mantine/core';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import VirtualScroller from 'virtual-scroller/react';
import { VirtualEducationalObjective } from './educationalObjective';
import type { EducationalObjectiveData, TestName } from '../types';

export const scrollToIndex = (
    index: number,
    itemsContainerRef: RefObject<HTMLDivElement | null>
) => {
    if (!itemsContainerRef.current) return;

    const linearRegression = (
        data: { x: number; y: number }[]
    ): { slope: number; intercept: number } => {
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    };

    const itemElements = itemsContainerRef.current?.children;
    console.log(itemElements);

    const indexToPositionMap: { x: number; y: number }[] = [];
    if (itemElements) {
        for (let i = 0; i < itemElements.length; i++) {
            const el = itemElements[i];
            indexToPositionMap.push({
                x: i,
                y: el.getBoundingClientRect().top,
            });
        }
    }

    const { slope, intercept } = linearRegression(indexToPositionMap);
    const estimatedScrollY = slope * index + intercept;

    window.scrollTo({
        top: Math.max(estimatedScrollY - 132, 0),
        behavior: 'instant',
    });
};

type EducationalObjectiveListProps = {
    dataLoaded: boolean;
    computedColorScheme: 'light' | 'dark';
    currentTest: TestName;
    currentVisibleEos: EducationalObjectiveData[];
    itemsContainerRef: RefObject<HTMLDivElement | null>;
    setCurrentSearch: Dispatch<SetStateAction<string>>;
    toggleFlaggedItem: (qid: number) => void;
    flaggedItemQids: Set<number>;
    setFirstVisibleIndex: Dispatch<SetStateAction<number>>;
    setLastVisibleIndex: Dispatch<SetStateAction<number>>;
};

export function EducationalObjectiveList({
    dataLoaded,
    computedColorScheme,
    currentTest,
    currentVisibleEos,
    itemsContainerRef,
    setCurrentSearch,
    toggleFlaggedItem,
    flaggedItemQids,
    setFirstVisibleIndex,
    setLastVisibleIndex,
}: EducationalObjectiveListProps) {
    if (!dataLoaded) {
        return (
            <Container fluid px={{ base: 12, sm: 24, md: 32 }} py={24}>
                <Center h="100%">
                    <Stack align="center">
                        <Text>Loading data</Text>
                        <Loader
                            type="dots"
                            color={computedColorScheme === 'light' ? '#1a1a1a' : '#ffffff'}
                        />
                    </Stack>
                </Center>
            </Container>
        );
    }

    return (
        <Transition
            key={currentTest}
            mounted={dataLoaded}
            transition="fade"
            duration={250}
            timingFunction="ease"
        >
            {(styles) => (
                <Box style={styles}>
                    {currentVisibleEos.length === 0 ? (
                        <Box style={{ display: 'flex', justifyContent: 'center', paddingTop: 50 }}>
                            <Text size="md" c="dimmed">
                                No matching educational objectives found
                            </Text>
                        </Box>
                    ) : (
                        <Container fluid px={{ base: 12, sm: 24, md: 32 }} py={24}>
                            <VirtualScroller
                                items={currentVisibleEos}
                                itemComponent={VirtualEducationalObjective}
                                itemComponentProps={{
                                    setCurrentSearch,
                                    toggleFlaggedItem,
                                    initialFlaggedState: flaggedItemQids,
                                }}
                                getItemId={(eo: EducationalObjectiveData) => eo.qid}
                                itemsContainerRef={itemsContainerRef}
                                onStateChange={(state: {
                                    firstShownItemIndex: number;
                                    lastShownItemIndex: number;
                                }) => {
                                    setFirstVisibleIndex(state.firstShownItemIndex ?? 0);
                                    setLastVisibleIndex(state.lastShownItemIndex ?? 0);
                                }}
                            />
                        </Container>
                    )}
                </Box>
            )}
        </Transition>
    );
}