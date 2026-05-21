import {
  AppShell,
  Box,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useState, useEffect, useCallback, useRef } from 'react';
import '@mantine/core/styles.css';
import './index.css';
import { decryptStr, saveSessionState, loadSessionState } from './server/contentManagement';
import type { EducationalObjectiveData, TestName } from './types';
import { AppHeader } from './components/appHeader';
import { GradientOverlays } from './components/gradientOverlays';
import { EducationalObjectiveList, scrollToIndex } from './components/educationalObjectiveList';

export default function App() {
  const [flaggedMode, setFlaggedMode] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentTest, setCurrentTest] = useState<TestName>('Step 1');
  const [cont, setCont] = useState<{ [key: string]: any }>({});
  const [currentVisibleEos, setCurrentVisibleEos] = useState<EducationalObjectiveData[]>([]);
  const [firstVisibleIndex, setFirstVisibleIndex] = useState(0);
  const [lastVisibleIndex, setLastVisibleIndex] = useState(0);
  const [flaggedItemQids, setFlaggedItemQids] = useState<Set<number>>(() => {
    const storedFlaggedQids = localStorage.getItem('flaggedItems');
    return storedFlaggedQids ? new Set(JSON.parse(storedFlaggedQids)) : new Set();
  });

  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [openedPositionModal, { open: openPositionModal, close: closePositionModal }] =
    useDisclosure(false);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    const urls = [
      'https://cdn.jsdelivr.net/gh/sachingooo/objs/oe/s1.js',
      'https://cdn.jsdelivr.net/gh/sachingooo/objs/oe/s2.js',
      'https://cdn.jsdelivr.net/gh/sachingooo/objs/oe/s3.js',
    ];

    async function loadScripts() {
      try {
        const codes = await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url);

            if (!res.ok) {
              throw new Error(`Failed to fetch ${url}: ${res.status}`);
            }

            return res.text();
          })
        );

        const encryptedContent: { [key: string]: any } = {};

        for (const code of codes) {
          new Function('cont', code)(encryptedContent);
        }

        const decryptedContent: { [key: string]: any } = {};
        for (const key in encryptedContent) {
          console.log(`Decrypting content for key: ${key}`);
          decryptedContent[key] = decryptStr(encryptedContent[key]);
        }

        const exEl = document.createElement('div');
        for (const key in decryptedContent) {
          for (const eo of decryptedContent[key]) {
            const searchTerms = [
              eo['subject'],
              eo['secondarySubject'],
              eo['topicAttribute'],
              eo['topic'],
              eo['title'],
              eo['text'],
            ];

            for (const ex of eo['exhibits']) {
              if (ex.includes('.com')) {
                continue;
              }

              exEl.innerHTML = ex;
              const exText = exEl.textContent;
              searchTerms.push(exText);
            }

            const searchTermsJoined = searchTerms
              .map((s) => (s ? s.toLowerCase() : ''))
              .join(' ');

            eo.searchableText = searchTermsJoined;
          }
        }

        exEl.remove();

        setCont(decryptedContent);
      } catch (err) {
        console.error('Failed to load scripts:', err);
      }
    }

    loadScripts();
  }, []);

  const updateSearchResults = useCallback(() => {
    const currentTestContent = cont[
      currentTest === 'Step 1' ? 's1' : currentTest === 'Step 2' ? 's2' : 's3'
    ] as EducationalObjectiveData[] | undefined;

    if (!currentTestContent) {
      setCurrentVisibleEos([]);
      return;
    }

    let filteredEos: EducationalObjectiveData[] = [];
    if (currentSearch.trim() === '') {
      filteredEos = currentTestContent;
    } else {
      filteredEos = currentTestContent.filter((eo) => {
        const searchLower = currentSearch.toLowerCase();
        return eo.searchableText?.includes(searchLower) || false;
      });
    }

    if (flaggedMode) {
      filteredEos = filteredEos.filter((eo) => flaggedItemQids.has(eo.qid));
    }

    setCurrentVisibleEos(filteredEos);
  }, [currentSearch, currentTest, cont, flaggedMode, flaggedItemQids]);

  const dataLoaded = Array.isArray(cont.s1) && Array.isArray(cont.s2) && Array.isArray(cont.s3);

  const updateSelectedTest = useCallback((test: TestName | null) => {
    //check if test is included in the TestName type
    if (test === 'Step 1' || test === 'Step 2' || test === 'Step 3') {
      setCurrentTest(test);
      setFirstVisibleIndex(0);
      setLastVisibleIndex(0);

      requestAnimationFrame(() => {
        scrollToIndex(0, itemsContainerRef);
      });
    }
  }, []);

  const updateCurrentSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentSearchValue = event.target.value;
    setCurrentSearch(currentSearchValue);
    setFirstVisibleIndex(0);
    setLastVisibleIndex(0);

    requestAnimationFrame(() => {
      scrollToIndex(0, itemsContainerRef);
    });
  }, []);

  const toggleFlaggedItem = useCallback((qid: number) => {
    setFlaggedItemQids((prevFlaggedItemQids) => {
      const newFlaggedItemQids = new Set(prevFlaggedItemQids);

      if (newFlaggedItemQids.has(qid)) {
        newFlaggedItemQids.delete(qid);
      } else {
        newFlaggedItemQids.add(qid);
      }

      localStorage.setItem('flaggedItems', JSON.stringify(Array.from(newFlaggedItemQids)));
      return newFlaggedItemQids;
    });
  }, []);

  const toggleFlaggedMode = useCallback(() => {
    setFlaggedMode((prevFlaggedMode) => !prevFlaggedMode);
  }, []);

  useEffect(() => {
    updateSearchResults();
  }, [currentSearch, currentTest, cont, updateSearchResults]);

  const totalVisible = currentVisibleEos?.length || 0;
  const clampedFirstVisibleIndex = totalVisible
    ? Math.max(0, Math.min(firstVisibleIndex, totalVisible - 1))
    : 0;
  const clampedLastVisibleIndex = totalVisible
    ? Math.max(0, Math.min(lastVisibleIndex, totalVisible - 1))
    : 0;
  const visibleWindowSize = totalVisible
    ? Math.max(1, clampedLastVisibleIndex - clampedFirstVisibleIndex + 1)
    : 0;

  const isAtTop = totalVisible > 0 && clampedFirstVisibleIndex === 0;
  const isAtBottom = totalVisible > 0 && clampedLastVisibleIndex >= totalVisible - 1;

  const useLastVisibleForPosition =
    totalVisible < 10
      ? isAtBottom
      : clampedFirstVisibleIndex + visibleWindowSize / 2 >= totalVisible / 2;

  const currentPosition = totalVisible
    ? isAtBottom
      ? totalVisible
      : useLastVisibleForPosition
        ? clampedLastVisibleIndex + 1
        : clampedFirstVisibleIndex + 1
    : 0;

  const progressPercent = totalVisible
    ? isAtTop
      ? 0
      : isAtBottom
        ? 100
        : ((clampedFirstVisibleIndex + visibleWindowSize / 2) / totalVisible) * 100
    : 0;

  const form = useForm({
    initialValues: {
      userNumber: 0,
    },

    validate: {
      userNumber: (value) =>
        value < 0 || value >= totalVisible
          ? `Number must be between 0 and ${totalVisible - 1}`
          : null,
    },
  });

  const handleSubmit = (values: { userNumber: number }) => {
    requestAnimationFrame(() => {
      scrollToIndex(values.userNumber, itemsContainerRef);
    });
    closePositionModal();
    form.reset();
  };

  // on initial launch, load the saved session state and apply it
  useEffect(() => {
    const reinstateSavedState = async () => {
      const savedState = loadSessionState();
      if (savedState) {
        setCurrentTest(savedState.currentTest);
        setCurrentSearch(savedState.currentSearch);

        // delay by 500ms to ensure content is loaded and rendered before scrolling
        await new Promise((resolve) => setTimeout(resolve, 500));

        requestAnimationFrame(() => {
          scrollToIndex(savedState.currentIndex, itemsContainerRef);
        });
      }
    }

    reinstateSavedState();
  }, []);

  // whenever currentTest, currentSearch, or the first visible index changes, save the session state
  useEffect(() => {
    const stateToSave = {
      currentTest,
      currentSearch,
      currentIndex: firstVisibleIndex,
    };
    saveSessionState(stateToSave);
  }, [currentTest, currentSearch, firstVisibleIndex]);

  return (
    <AppShell header={{ height: 132 }}>
      <AppHeader
        currentSearch={currentSearch}
        setCurrentSearch={setCurrentSearch}
        currentTest={currentTest}
        updateSelectedTest={updateSelectedTest}
        updateCurrentSearch={updateCurrentSearch}
        flaggedMode={flaggedMode}
        toggleFlaggedMode={toggleFlaggedMode}
        computedColorScheme={computedColorScheme}
        setColorScheme={setColorScheme}
        currentPosition={currentPosition}
        totalVisible={totalVisible}
        progressPercent={progressPercent}
        openedPositionModal={openedPositionModal}
        openPositionModal={openPositionModal}
        closePositionModal={closePositionModal}
        form={form}
        handleSubmit={handleSubmit}
      />

      <AppShell.Main>
        <Box
          style={{
            position: 'relative',
          }}
        >
          <GradientOverlays computedColorScheme={computedColorScheme} />
          <EducationalObjectiveList
            dataLoaded={dataLoaded}
            currentTest={currentTest}
            computedColorScheme={computedColorScheme}
            currentVisibleEos={currentVisibleEos}
            itemsContainerRef={itemsContainerRef}
            setCurrentSearch={setCurrentSearch}
            toggleFlaggedItem={toggleFlaggedItem}
            flaggedItemQids={flaggedItemQids}
            setFirstVisibleIndex={setFirstVisibleIndex}
            setLastVisibleIndex={setLastVisibleIndex}
          />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}