import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    CopyButton,
    Divider,
    Group,
    Modal,
    Paper,
    Radio,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    ThemeIcon,
} from '@mantine/core';
import {
    IconCheck,
    IconCopy,
    IconFlag,
    IconList,
    IconPlus,
    IconRefresh,
    IconX,
} from '@tabler/icons-react';

type FlagModalProps = {
    opened: boolean;
    onClose: () => void;
};

type SaveMode = 'add' | 'replace';

function parseFlaggedItemsFromStorage(): number[] {
    if (typeof window === 'undefined') return [];

    try {
        const parsed = JSON.parse(localStorage.getItem('flaggedItems') || '[]');

        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((value): value is number => Number.isInteger(value))
            .sort((a, b) => a - b);
    } catch {
        return [];
    }
}

function parsePastedIds(value: string): { ids: number[]; error: string | null } {
    try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
            return { ids: [], error: 'Input must be an array of numbers.' };
        }

        if (parsed.some((item) => !Number.isInteger(item))) {
            return { ids: [], error: 'Every value must be an integer.' };
        }

        return {
            ids: Array.from(new Set(parsed as number[])).sort((a, b) => a - b),
            error: null,
        };
    } catch {
        return {
            ids: [],
            error: 'Input must be valid JSON, for example [1, 5, 10].',
        };
    }
}

export function FlagModal({ opened, onClose }: FlagModalProps) {
    const [currentFlaggedItems, setCurrentFlaggedItems] = useState<number[]>([]);
    const [pastedValue, setPastedValue] = useState('');
    const [mode, setMode] = useState<SaveMode>('add');
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!opened) return;

        setCurrentFlaggedItems(parseFlaggedItemsFromStorage());
        setPastedValue('');
        setMode('add');
        setError(null);
        setSaved(false);
    }, [opened]);

    const formattedCurrentValue = useMemo(
        () => JSON.stringify(currentFlaggedItems),
        [currentFlaggedItems]
    );

    const helperMessage =
        mode === 'add'
            ? 'Adds new IDs to the existing list. Duplicates are removed.'
            : 'Replaces the current list with the pasted array.';

    const handleSave = () => {
        setSaved(false);

        const { ids: pastedIds, error: parseError } = parsePastedIds(pastedValue);

        if (parseError) {
            setError(parseError);
            return;
        }

        const nextFlaggedItems =
            mode === 'replace'
                ? pastedIds
                : Array.from(new Set([...currentFlaggedItems, ...pastedIds])).sort((a, b) => a - b);

        localStorage.setItem('flaggedItems', JSON.stringify(nextFlaggedItems));

        setCurrentFlaggedItems(nextFlaggedItems);
        setError(null);
        setSaved(true);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            radius="lg"
            padding="md"
            centered
            title={null}
            withCloseButton={false}
        >
            <Stack gap="md">
                <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <ThemeIcon size={40} radius="md" variant="light">
                            <IconFlag size={22} />
                        </ThemeIcon>

                        <Stack gap={0}>
                            <Text fw={700} size="lg">
                                Manage flagged items
                            </Text>
                            <Text size="xs" c="dimmed">
                                Copy or update browser-stored flagged item IDs.
                            </Text>
                        </Stack>
                    </Group>

                    <Button
                        variant="subtle"
                        color="gray"
                        size="compact-sm"
                        px={6}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <IconX size={18} />
                    </Button>
                </Group>

                <Paper withBorder radius="md" p="sm">
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" verticalSpacing="sm">
                        <Group gap="sm" wrap="nowrap">
                            <ThemeIcon size={38} radius="xl" variant="light">
                                <IconList size={21} />
                            </ThemeIcon>

                            <Stack gap={0}>
                                <Text fw={800} size="lg">
                                    {currentFlaggedItems.length}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    flagged items
                                </Text>
                            </Stack>
                        </Group>

                        <Paper
                            withBorder
                            radius="sm"
                            px="sm"
                            py={6}
                            style={{
                                overflowX: 'auto',
                                whiteSpace: 'nowrap',
                                fontFamily: 'monospace',
                            }}
                        >
                            <Text size="xs" ff="monospace">
                                {formattedCurrentValue}
                            </Text>
                        </Paper>

                        <CopyButton value={formattedCurrentValue}>
                            {({ copied, copy }) => (
                                <Button
                                    fullWidth
                                    size="sm"
                                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                >
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            )}
                        </CopyButton>
                    </SimpleGrid>
                </Paper>

                <Divider />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Stack gap="xs">
                        <Textarea
                            label="Paste array of numbers"
                            placeholder="[1, 5, 10, 20]"
                            value={pastedValue}
                            onChange={(event) => {
                                setPastedValue(event.currentTarget.value);
                                setError(null);
                                setSaved(false);
                            }}
                            autosize
                            minRows={4}
                            maxRows={7}
                            error={error}
                        />

                        <Text size="xs" c="dimmed">
                            Must be valid JSON and contain integers only.
                        </Text>

                        <Button size="sm" fullWidth leftSection={<IconCheck size={16} />} onClick={handleSave}>
                            Save to local storage
                        </Button>
                    </Stack>

                    <Stack gap="xs">
                        <Radio.Group
                            label="How to apply"
                            value={mode}
                            onChange={(value) => {
                                setMode(value as SaveMode);
                                setSaved(false);
                            }}
                        >
                            <Stack gap={6} mt={6}>
                                <Paper
                                    withBorder
                                    radius="md"
                                    p="xs"
                                    style={{
                                        borderColor: mode === 'add' ? 'var(--mantine-color-blue-6)' : undefined,
                                    }}
                                >
                                    <Radio
                                        value="add"
                                        label="Add only"
                                        description="Merge with current IDs"
                                        icon={IconPlus}
                                    />
                                </Paper>

                                <Paper
                                    withBorder
                                    radius="md"
                                    p="xs"
                                    style={{
                                        borderColor: mode === 'replace' ? 'var(--mantine-color-blue-6)' : undefined,
                                    }}
                                >
                                    <Radio
                                        value="replace"
                                        label="Replace"
                                        description="Overwrite current IDs"
                                        icon={IconRefresh}
                                    />
                                </Paper>
                            </Stack>
                        </Radio.Group>

                        <Alert
                            color={saved ? 'green' : 'blue'}
                            variant="light"
                            icon={<IconCheck size={16} />}
                            radius="md"
                            py={8}
                        >
                            <Text size="xs">
                                {saved
                                    ? `Saved. Current total: ${currentFlaggedItems.length}.`
                                    : helperMessage}
                            </Text>
                        </Alert>
                    </Stack>
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}