import { Button } from "@mantine/core";

export const Tag = (props: { tag: string; setCurrentSearch: (search: string) => void }) => {
    const { tag, setCurrentSearch } = props;
    if (!tag) return null;

    return (
        <Button variant="light" size="xs" style={{ height: "25px", padding: "4px 8px" }} onClick={() => setCurrentSearch(tag)}>
            {tag}
        </Button>
    );
};