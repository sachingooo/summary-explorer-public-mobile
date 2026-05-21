export type EducationalObjectiveData = {
    qid: number;
    text: string;
    title: string;
    subject: string;
    secondarySubject: string;
    topic: string;
    topicAttribute: string;
    exhibits: string[];
    searchableText?: string; // Optional property for searchable text
};

export type SavedSessionState = {
    currentTest: TestName;
    currentSearch: string;
    currentIndex: number;
}

export const TEST_NAMES = ['Step 1', 'Step 2', 'Step 3'] as const;
export type TestName = (typeof TEST_NAMES)[number];