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