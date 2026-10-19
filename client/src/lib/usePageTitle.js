import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? title + ' | DevOps Path' : 'DevOps Path | Backend and DevOps roadmap';
  }, [title]);
}
