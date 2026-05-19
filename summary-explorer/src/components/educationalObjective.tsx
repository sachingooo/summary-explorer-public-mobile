import { useDisclosure } from "@mantine/hooks";
import type { EducationalObjectiveData } from "../types";
import { Tag } from "./tag";
import {
    Group,
    Text,
    Card,
    Modal,
    ActionIcon,
    Box,
} from '@mantine/core';
import {
    IconFlag,
    IconFlagFilled,
    IconPhotoAlt
} from '@tabler/icons-react';
import { memo } from "react";


type EducationalObjectiveProps = {
    eo: EducationalObjectiveData;
    setCurrentSearch: (search: string) => void;
    toggleFlaggedItem?: (qid: number) => void;
    initialFlaggedState?: Set<number>;
};

export const EducationalObjective = (props: EducationalObjectiveProps) => {
    const { eo, setCurrentSearch, toggleFlaggedItem, initialFlaggedState } = props;

    const tags = [eo.subject, eo.secondarySubject, eo.topicAttribute, eo.topic, eo.title];
    const uniqueTags = [...new Set(tags)];

    const [opened, { open, close }] = useDisclosure(false);
    const hasExhibits = eo.exhibits && eo.exhibits.length > 0;

    return (
        <>
            <Card w="100%">
                <Text>{eo.text}</Text>

                <Group mt="sm" mb="sm" gap="sm" wrap="wrap">
                    {uniqueTags.map((tag) => (
                        <Tag
                            key={tag}
                            tag={tag}
                            setCurrentSearch={setCurrentSearch}
                        />
                    ))}
                    <ActionIcon
                        variant="subtle"
                        size="md"
                        radius="md"
                        onClick={() => toggleFlaggedItem && toggleFlaggedItem(eo.qid)}
                        c="var(--eo-chip-text)"
                        bg="var(--eo-chip-bg)"
                        style={{
                            border: "1px solid var(--eo-chip-border)",
                        }}
                    >
                        {initialFlaggedState && initialFlaggedState.has(eo.qid) ?
                            <IconFlagFilled size={16} /> :
                            <IconFlag size={16} />}
                    </ActionIcon>
                    {hasExhibits && (
                        <ActionIcon
                            variant="subtle"
                            size="md"
                            radius="md"
                            onClick={open}
                            c="var(--eo-chip-text)"
                            bg="var(--eo-chip-bg)"
                            style={{
                                border: "1px solid var(--eo-chip-border)",
                            }}
                        >
                            <IconPhotoAlt size={16} />
                        </ActionIcon>
                    )}
                </Group>
                {hasExhibits && (
                    <Modal opened={opened} onClose={close} size="lg" withCloseButton={false} centered style={{ fontSize: 12 }}>
                        {eo.exhibits?.map((exhibit, index) => {
                            if (exhibit.includes("<img")) {
                                // resize the image so that it fits within the modal
                                const resizedExhibit = exhibit.replace(/<img /g, '<img style="max-width: 100%; height: auto;" ');
                                return <div key={index} dangerouslySetInnerHTML={{ __html: resizedExhibit }} />;
                            }
                            return <div key={"exhibit-" + index}>
                                <div dangerouslySetInnerHTML={{ __html: exhibit }} />
                            </div>
                        })}
                    </Modal>
                )}
            </Card>
        </>
    );
}




type VirtualEducationalObjectiveProps = {
    item: EducationalObjectiveData;
    setCurrentSearch: (search: string) => void;
    toggleFlaggedItem?: (qid: number) => void;
    initialFlaggedState?: Set<number>;
};

export const VirtualEducationalObjective = memo(
    ({ item, setCurrentSearch, toggleFlaggedItem, initialFlaggedState }: VirtualEducationalObjectiveProps) => {
        return (
            <Box pb="sm">
                <EducationalObjective
                    eo={item}
                    setCurrentSearch={setCurrentSearch}
                    toggleFlaggedItem={toggleFlaggedItem}
                    initialFlaggedState={initialFlaggedState}
                />
            </Box>
        );
    }
);

VirtualEducationalObjective.displayName = "VirtualEducationalObjective";