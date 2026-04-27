import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePracticeStore } from '../store/practiceStore';
import { PracticeInterface } from '../components/practice/PracticeInterface';
import type { ModuleType } from '@calcura/shared';
import { DashboardPage } from './DashboardPage';

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const { activeModule, setActiveModule } = usePracticeStore();

  const moduleParam = searchParams.get('module') as ModuleType | null;

  useEffect(() => {
    if (moduleParam && moduleParam !== activeModule) {
      setActiveModule(moduleParam);
    }
  }, [moduleParam, activeModule, setActiveModule]);

  const currentModule = moduleParam ?? activeModule;

  if (!currentModule) {
    return <DashboardPage />;
  }

  return <PracticeInterface module={currentModule} />;
}
