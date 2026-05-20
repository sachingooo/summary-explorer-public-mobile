import {
    ActionIcon,
    AppShell,
    Box,
    Group,
    Select,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconFlag,
    IconFlagFilled,
    IconSearch,
    IconX,
    IconMoon,
    IconSun,
} from '@tabler/icons-react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import type { UseFormReturnType } from '@mantine/form';
import { PositionJumpModal } from './positionJumpModal';
import { type TestName, TEST_NAMES } from '../types';

type AppHeaderProps = {
    currentSearch: string;
    setCurrentSearch: Dispatch<SetStateAction<string>>;
    currentTest: TestName;
    updateSelectedTest: (test: TestName | null) => void;
    updateCurrentSearch: (event: ChangeEvent<HTMLInputElement>) => void;
    flaggedMode: boolean;
    toggleFlaggedMode: () => void;
    computedColorScheme: 'light' | 'dark';
    setColorScheme: (colorScheme: 'light' | 'dark' | 'auto') => void;
    currentPosition: number;
    totalVisible: number;
    progressPercent: number;
    openedPositionModal: boolean;
    openPositionModal: () => void;
    closePositionModal: () => void;
    form: UseFormReturnType<{ userNumber: number }>;
    handleSubmit: (values: { userNumber: number }) => void;
};

export function AppHeader({
    currentSearch,
    setCurrentSearch,
    currentTest,
    updateSelectedTest,
    updateCurrentSearch,
    flaggedMode,
    toggleFlaggedMode,
    computedColorScheme,
    setColorScheme,
    currentPosition,
    totalVisible,
    progressPercent,
    openedPositionModal,
    openPositionModal,
    closePositionModal,
    form,
    handleSubmit,
}: AppHeaderProps) {
    return (
        <AppShell.Header withBorder py={16}>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}
            >
                <Box px={24}>
                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Title
                            order={3}
                            style={{
                                fontSize: 22,
                                lineHeight: 1.05,
                                fontWeight: 800,
                                letterSpacing: -0.5,
                            }}
                        >
                            Explorer
                        </Title>

                        <Group gap={10} wrap="nowrap">
                            <Select
                                value={currentTest}
                                data={TEST_NAMES}
                                allowDeselect={false}
                                w={132}
                                size="md"
                                radius="xl"
                                styles={{
                                    input: {
                                        border: 0,
                                    },
                                }}
                                onChange={updateSelectedTest}
                            />

                            <ActionIcon
                                style={{
                                    border: 'none',
                                }}
                                variant="default"
                                size="xl"
                                radius="md"
                                aria-label="Flag"
                                onClick={toggleFlaggedMode}
                            >
                                {flaggedMode ? (
                                    <IconFlagFilled size={22} stroke={2.2} />
                                ) : (
                                    <IconFlag size={22} stroke={2.2} />
                                )}
                            </ActionIcon>

                            <ActionIcon
                                style={{
                                    border: 'none',
                                }}
                                onClick={() =>
                                    setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
                                }
                                variant="default"
                                size="xl"
                                radius="md"
                                aria-label="Toggle color scheme"
                            >
                                {computedColorScheme === 'light' ? (
                                    <IconSun size={23} stroke={2.2} />
                                ) : (
                                    <IconMoon size={23} stroke={2.2} />
                                )}
                            </ActionIcon>
                        </Group>
                    </Group>
                </Box>

                <Box px={24}>
                    <Group align="center" wrap="nowrap" gap={12}>
                        <TextInput
                            placeholder="Search content"
                            leftSection={<IconSearch size={18} stroke={2} />}
                            rightSection={
                                currentSearch ? (
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size={28}
                                        radius="xl"
                                        aria-label="Clear search"
                                        onClick={() => setCurrentSearch('')}
                                    >
                                        <IconX size={18} stroke={2.3} />
                                    </ActionIcon>
                                ) : null
                            }
                            rightSectionWidth={currentSearch ? 40 : 0}
                            variant="filled"
                            radius="xl"
                            size="md"
                            style={{
                                flex: '1 1 auto',
                                minWidth: 0,
                            }}
                            styles={{
                                input: {
                                    height: 44,
                                    border: '1px solid transparent',
                                    fontSize: 15,
                                    fontWeight: 400,
                                    paddingRight: currentSearch ? 42 : undefined,
                                },
                            }}
                            value={currentSearch}
                            onChange={updateCurrentSearch}
                        />

                        <>
                            <Text
                                style={{
                                    flex: '0 0 86px',
                                    textAlign: 'right',
                                    fontSize: 16,
                                    lineHeight: 1,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                                onClick={() => openPositionModal()}
                            >
                                {currentPosition.toLocaleString()} / {totalVisible.toLocaleString()}
                            </Text>

                            <PositionJumpModal
                                opened={openedPositionModal}
                                onClose={closePositionModal}
                                totalVisible={totalVisible}
                                form={form}
                                handleSubmit={handleSubmit}
                            />
                        </>
                    </Group>
                </Box>

                <Box
                    style={{
                        height: 3,
                        width: '100vw',
                        marginLeft: 'calc(50% - 50vw)',
                        marginRight: 'calc(50% - 50vw)',
                        background: computedColorScheme === 'light' ? '#e9ecef' : '#2c2e33',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        style={{
                            height: '100%',
                            width: `${progressPercent}%`,
                            background: '#228be6',
                            transition: 'width 120ms linear',
                        }}
                    />
                </Box>
            </Box>
        </AppShell.Header>
    );
}