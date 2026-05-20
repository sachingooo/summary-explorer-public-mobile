import { Button, Group, Modal, NumberInput, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

type PositionJumpModalProps = {
    opened: boolean;
    onClose: () => void;
    totalVisible: number;
    form: UseFormReturnType<{ userNumber: number }>;
    handleSubmit: (values: { userNumber: number }) => void;
};

export function PositionJumpModal({
    opened,
    onClose,
    totalVisible,
    form,
    handleSubmit,
}: PositionJumpModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} withCloseButton={false}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <NumberInput
                        label={`Index (0 to ${totalVisible - 1})`}
                        placeholder="Index to jump to"
                        key={form.key('userNumber')}
                        {...form.getInputProps('userNumber')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Jump to index</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}