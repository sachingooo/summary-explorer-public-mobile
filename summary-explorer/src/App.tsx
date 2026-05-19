import {
  ActionIcon,
  AppShell,
  Box,
  Group,
  Select,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  Loader,
  Container,
  Stack,
  Center,
} from '@mantine/core';
import {
  IconFlag,
  IconFlagFilled,
  IconSearch,
  IconX,
  IconMoon,
  IconSun
} from '@tabler/icons-react';
import { useState, useEffect, useCallback } from 'react';
import '@mantine/core/styles.css';
import './index.css';
import { decryptStr } from './server/contentManagement';
import { VirtualEducationalObjective } from './components/educationalObjective';
import type { EducationalObjectiveData } from './types';
import VirtualScroller from "virtual-scroller/react";

export default function App() {
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentTest, setCurrentTest] = useState<'Step 1' | 'Step 2' | 'Step 3'>('Step 3');
  const [flaggedMode, setFlaggedMode] = useState(false);
  const [cont, setCont] = useState<{ [key: string]: any }>({});
  const [currentVisibleEos, setCurrentVisibleEos] = useState<EducationalObjectiveData[]>([]);
  const [firstVisibleIndex, setFirstVisibleIndex] = useState(0);
  const [lastVisibleIndex, setLastVisibleIndex] = useState(0);
  const [flaggedItemQids, setFlaggedItemQids] = useState<Set<number>>(() => {
    const storedFlaggedQids = localStorage.getItem('flaggedItems');
    return storedFlaggedQids ? new Set(JSON.parse(storedFlaggedQids)) : new Set();
  });

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  // load the data
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

        const exEl = document.createElement("div");
        for (const key in decryptedContent) {
          for (const eo of decryptedContent[key]) {
            const searchTerms = [eo['subject'], eo['secondarySubject'], eo['topicAttribute'], eo['topic'], eo['title'], eo['text']];
            for (const ex of eo['exhibits']) {
              if (ex.includes(".com")) {
                continue;
              }
              exEl.innerHTML = ex;
              const exText = exEl.textContent;
              searchTerms.push(exText);
            }
            const searchTermsJoined = searchTerms.map((s) => s ? s.toLowerCase() : "").join(" ");
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
    const currentTestContent = cont[currentTest === 'Step 1' ? 's1' : currentTest === 'Step 2' ? 's2' : 's3'] as EducationalObjectiveData[];

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

  }, [currentSearch, currentTest, cont, flaggedMode]);

  const dataLoaded = cont?.s1?.length && cont?.s2?.length && cont?.s3?.length;

  const updateSelectedTest = useCallback((test: string | null) => {
    if (test === 'Step 1' || test === 'Step 2' || test === 'Step 3') {
      setCurrentTest(test);
    }
  }, []);

  const updateCurrentSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentSearchValue = event.target.value;
    setCurrentSearch(currentSearchValue);
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

  useEffect(() => {
    setFirstVisibleIndex(0);
    setLastVisibleIndex(0);
  }, [currentVisibleEos]);

  const totalVisible = currentVisibleEos?.length || 0;
  const clampedFirstVisibleIndex = totalVisible ? Math.max(0, Math.min(firstVisibleIndex, totalVisible - 1)) : 0;
  const clampedLastVisibleIndex = totalVisible ? Math.max(0, Math.min(lastVisibleIndex, totalVisible - 1)) : 0;
  const visibleWindowSize = totalVisible ? Math.max(1, clampedLastVisibleIndex - clampedFirstVisibleIndex + 1) : 0;

  const isAtTop = totalVisible > 0 && clampedFirstVisibleIndex === 0;
  const isAtBottom = totalVisible > 0 && clampedLastVisibleIndex >= totalVisible - 1;

  const useLastVisibleForPosition = totalVisible < 10 ? isAtBottom : clampedFirstVisibleIndex + visibleWindowSize / 2 >= totalVisible / 2;
  const currentPosition = totalVisible ? isAtBottom ? totalVisible : useLastVisibleForPosition ? clampedLastVisibleIndex + 1 : clampedFirstVisibleIndex + 1 : 0;
  const progressPercent = totalVisible ? isAtTop ? 0 : isAtBottom ? 100 : ((clampedFirstVisibleIndex + visibleWindowSize / 2) / totalVisible) * 100 : 0;

  return (
    <AppShell header={{ height: 132 }}>
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
                  data={['Step 1', 'Step 2', 'Step 3']}
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
              >
                {currentPosition.toLocaleString()} / {totalVisible.toLocaleString()}
              </Text>
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

      <AppShell.Main>
        <Box
          style={{
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'fixed',
              top: 132,
              left: 0,
              right: 0,
              height: 28,
              zIndex: 10,
              pointerEvents: 'none',
              background:
                computedColorScheme === 'light'
                  ? 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))'
                  : 'linear-gradient(to bottom, rgba(20,21,23,1), rgba(20,21,23,0))',
            }}
          />

          <Box
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: 44,
              zIndex: 10,
              pointerEvents: 'none',
              background:
                computedColorScheme === 'light'
                  ? 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))'
                  : 'linear-gradient(to top, rgba(20,21,23,1), rgba(20,21,23,0))',
            }}
          />

          <Container fluid px={{ base: 12, sm: 24, md: 32 }} py={24}>
            { }
            {dataLoaded ? (
              <ContentScroller
                currentVisibleEos={currentVisibleEos}
                setCurrentSearch={setCurrentSearch}
                toggleFlaggedItem={toggleFlaggedItem}
                flaggedItemQids={flaggedItemQids}
                setFirstVisibleIndex={setFirstVisibleIndex}
                setLastVisibleIndex={setLastVisibleIndex}
              />
            ) : (
              <Center h="100%">
                <Stack align="center">
                  <Text>Loading data</Text>
                  <Loader
                    type="dots"
                    color={computedColorScheme === 'light' ? '#1a1a1a' : '#ffffff'}
                  />
                </Stack>
              </Center>
            )}
          </Container>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

const ContentScroller = (props: {
  currentVisibleEos: EducationalObjectiveData[];
  setCurrentSearch: (search: string) => void;
  toggleFlaggedItem: (qid: number) => void;
  flaggedItemQids: Set<number>;
  setFirstVisibleIndex: (index: number) => void;
  setLastVisibleIndex: (index: number) => void;
}) => {
  const { currentVisibleEos, setCurrentSearch, toggleFlaggedItem, flaggedItemQids, setFirstVisibleIndex, setLastVisibleIndex } = props;

  if (!currentVisibleEos || currentVisibleEos.length === 0) {
    return (
      <Box
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>No results found</Text>
      </Box>
    );
  }

  return <VirtualScroller
    items={currentVisibleEos}
    itemComponent={VirtualEducationalObjective}
    itemComponentProps={{
      setCurrentSearch: setCurrentSearch,
      toggleFlaggedItem: toggleFlaggedItem,
      initialFlaggedState: flaggedItemQids,
    }}
    getItemId={(eo: EducationalObjectiveData) => eo.qid}
    onStateChange={(state: {
      firstShownItemIndex: number;
      lastShownItemIndex: number;
    }) => {
      setFirstVisibleIndex(state.firstShownItemIndex ?? 0);
      setLastVisibleIndex(state.lastShownItemIndex ?? 0);
    }}
  />
}