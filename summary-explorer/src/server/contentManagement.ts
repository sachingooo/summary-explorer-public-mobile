import CryptoJS from "crypto-js";
import type { EducationalObjectiveData } from "../types";

const EXPLORER_KEY_1 = "explorerKey1";
const EXPLORER_KEY_2 = "explorerKey2";
const SESSION_PASS_KEY = "sessionPass";

const getExplorerKey = (storageKey: string): string => {
    const storedKey = localStorage.getItem(storageKey);
    if (storedKey) return storedKey;

    const enteredKey = prompt(`Enter the password for key ${storageKey}:`);
    if (!enteredKey) {
        throw new Error(`${storageKey} is required.`);
    }

    localStorage.setItem(storageKey, enteredKey);
    return enteredKey;
};

const explorerKey1 = getExplorerKey(EXPLORER_KEY_1);
const explorerKey2 = getExplorerKey(EXPLORER_KEY_2);
const sessionPass = getExplorerKey(SESSION_PASS_KEY);

const cleanText = (text: string): string => {
    if (!text) return text;
    const replacer = {
        '&nbsp;': ' ',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
    }

    const replacerString = Object.keys(replacer).join('|');
    return text.replace(new RegExp(`(${replacerString})`, 'g'), (match) => replacer[match as keyof typeof replacer]);
}

const cleanEducationalObjective = (
    eo: EducationalObjectiveData
): EducationalObjectiveData => ({
    ...eo,
    text: cleanText(eo.text.replace(/<[^>]*>?/gm, "")),
    subject: cleanText(eo.subject),
    secondarySubject: cleanText(eo.secondarySubject),
    topicAttribute: cleanText(eo.topicAttribute),
    topic: cleanText(eo.topic),
    title: cleanText(eo.title),
});

export const decryptStr = (encryptedData: string): EducationalObjectiveData[] => {
    let decryptedSrc = encryptedData;
    decryptedSrc = CryptoJS.AES.decrypt(decryptedSrc, sessionPass).toString(CryptoJS.enc.Utf8);
    decryptedSrc = CryptoJS.AES.decrypt(decryptedSrc, explorerKey2).toString(CryptoJS.enc.Utf8);
    decryptedSrc = CryptoJS.AES.decrypt(decryptedSrc, explorerKey1).toString(CryptoJS.enc.Utf8);

    decryptedSrc = String.raw`${decryptedSrc}`;
    const decryptedObj = JSON.parse(decryptedSrc) as EducationalObjectiveData[];

    return decryptedObj.map(cleanEducationalObjective);
}