import { Button } from "@mantine/core";

export const Tag = (props: { tag: string; setCurrentSearch: (search: string) => void }) => {
    const { tag, setCurrentSearch } = props;
    if (!tag) return null;

    return (
        <Button variant="light" size="xs" onClick={() => setCurrentSearch(tag)}>
            {tag}
        </Button>
    );
};